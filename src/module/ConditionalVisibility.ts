import { ConditionalVisibilitySystem5e } from './systems/ConditionalVisibilitySystem5e';
import { ConditionalVisibilitySystemPf2e } from './systems/ConditionalVisibilitySystemPf2e';
import { ConditionalVisibilitySystem } from './systems/ConditionalVisibilitySystem';
import { DefaultConditionalVisibilitySystem } from './systems/DefaultConditionalVisibilitySystem';
import { ConditionalVisibilityFacadeImpl } from './ConditionalVisibilityFacade';
import { i18n, log, warn } from '../conditional-visibility';
import {
  getCanvas,
  getGame,
  CONDITIONAL_VISIBILITY_MODULE_NAME,
  StatusEffectSightFlags,
  StatusEffectStatusFlags,
} from './settings';

export class ConditionalVisibility {
  static INSTANCE: ConditionalVisibility;
  static SOCKET;
  private _sightLayer: SightLayer;
  private _backgroundLayer: BackgroundLayer;
  private _tokenHud: any;
  private _conditionalVisibilitySystem: ConditionalVisibilitySystem;
  private _capabilities: any;
  private _defaultTokens: Array<Token>;

  public _getSrcTokens: () => Array<Token>;
  private _draw: () => void;

  public sceneUpdates;
  public actorUpdates;
  public debouncedUpdate;
  public restrictVisibility;
  public updateQueued;
  public tokensToUpdate: Array<{ token; visible; hidden; alpha }> = [];
  /**
   * Called from init hook to establish the extra status effects in the main list before full game initialization.
   */
  static onInit(): void {
    const system = ConditionalVisibility.newSystem();
    system.initializeStatusEffects();
  }

  isSemvarGreater(first: string, second: string): Boolean {
    const firstSemVar = this.splitOnDot(first);
    const secondSemVar = this.splitOnDot(second);
    if (firstSemVar.length != secondSemVar.length) {
      throw new Error('bad semvar first ' + first + ', second' + second);
    }
    for (let i = 0; i < firstSemVar.length; i++) {
      if (firstSemVar[i] > secondSemVar[i]) {
        return true;
      }
    }
    return false;
  }

  splitOnDot(toSplit: string): Number[] {
    return toSplit.split('.').map((str) => (isNaN(Number(str)) ? 0 : Number(str)));
  }

  /**
   * A static method that will be replaced after initialization with the appropriate system specific method.
   * @param token the token to test
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static canSee(token: Token, srcTokens = null, flags = null): Boolean {
    return false;
  }

  /**
   * Create a new ConditionalVisibilitySystem appropriate to the game system
   * @returns ConditionalVisibilitySystem
   */
  static newSystem(): ConditionalVisibilitySystem {
    let system;
    switch (getGame().system.id) {
      case 'dnd5e':
        system = new ConditionalVisibilitySystem5e();
        break;
      case 'pf2e':
        system = new ConditionalVisibilitySystemPf2e();
        break;
      default:
        system = new DefaultConditionalVisibilitySystem();
    }
    return system;
  }

  /**
   * Initializes the ConditionalVisibilitySystem.  Called from ready Hook.
   * @param sightLayer the slightlayer from the game system.
   * @param tokenHud the tokenHud to use.
   */
  static initialize(sightLayer: SightLayer, tokenHud: TokenHUD): void {
    ConditionalVisibility.INSTANCE = new ConditionalVisibility(sightLayer, tokenHud);
    ConditionalVisibility.SOCKET.register('refresh', () => {
      Hooks.callAll('sightRefresh');
    });
    const facade = new ConditionalVisibilityFacadeImpl(
      ConditionalVisibility.INSTANCE,
      ConditionalVisibility.INSTANCE._conditionalVisibilitySystem,
    );
    //@ts-ignore
    window.ConditionalVisibility = facade;
    ConditionalVisibility.INSTANCE._conditionalVisibilitySystem.initializeHooks(facade);
    //@ts-ignore
    this.INSTANCE._backgroundLayer = getCanvas().layers.find((layer) => {
      //@ts-ignore
      return layer.__proto__.constructor.name === 'BackgroundLayer';
    });
  }

  /**
   * Create a ConditionalVisibility with a given sightLayer and tokenHud.
   * @param sightLayer the sightLayer to use
   * @param tokenHud the tokenHud to use
   */
  constructor(sightLayer: SightLayer, tokenHud: TokenHUD) {
    this._conditionalVisibilitySystem = ConditionalVisibility.newSystem();
    this._sightLayer = sightLayer;

    log(' starting against v0.7 or greater instance ' + getGame().data.version);
    this._getSrcTokens = () => {
      const srcTokens: Token[] = [];
      if (this._sightLayer?.sources?.size ?? 0 > 0) {
        for (const key of this._sightLayer.sources.keys()) {
          if (key.startsWith('Token.')) {
            const tok = getCanvas().tokens?.placeables.find((tok) => tok.id === key.substring('Token.'.length));
            if (tok) {
              srcTokens.push(tok);
            }
          }
        }
      } else {
        if (getGame().user?.isGM === false) {
          const activeTokenDocuments = <TokenDocument[]>getGame().user?.character?.getActiveTokens();
          for (const tokenDocument of activeTokenDocuments) {
            const tok = getCanvas().tokens?.placeables.find((tok) => tok.id === tokenDocument.id);
            if (tok) {
              srcTokens.push(tok);
            }
          }
        }
      }
      return srcTokens;
    };
    this._defaultTokens = this._getSrcTokens();
    this.actorUpdates = [];
    this.sceneUpdates = [];
    this.debouncedUpdate = debounce(async () => await this.applyChanges(), 300);
    this._draw = async () => {
      await this._sightLayer.initialize();
      await this._sightLayer.refresh();
    };
    ConditionalVisibility.canSee = (token: Token, srcTokens: Token[] | null = null, flags = null) => {
      let _srcTokens;
      if (srcTokens instanceof Token) {
        _srcTokens = [srcTokens];
      } else {
        _srcTokens = srcTokens ?? this._getSrcTokens();
      }
      let output = false;
      //GM CASE
      if ((_srcTokens.length ?? 0) == 0) return true;
      for (const sTok of _srcTokens) {
        const _flags = flags ?? this._conditionalVisibilitySystem.getVisionCapabilities(sTok);
        if (sTok) output = this._conditionalVisibilitySystem.canSee(token, _flags);
        if (output) return true;
      }
      return false;
    };
    this.restrictVisibility = (timeout) => {
      warn('Restrict Calling');
      //@ts-ignore
      let restricted = getCanvas().tokens.placeables.filter(
        (token) =>
          ((token?.actor ? token.actor.data.flags : token.data.actorData?.flags) ?? [
            CONDITIONAL_VISIBILITY_MODULE_NAME,
          ])[CONDITIONAL_VISIBILITY_MODULE_NAME]?.hasEffect ?? false,
      );

      if (restricted && restricted.length > 0) {
        const srcTokens = this._getSrcTokens();

        if (srcTokens.length > 0) {
          restricted = <Token[]>restricted.filter((t) => srcTokens.indexOf(t) < 0);
          //@ts-ignore
          restricted = <Token[]>restricted.filter((t) => !t._controlled);
          const preTokenUpdate: Array<{ token; visible; hidden; alpha }> = [];
          for (const t of restricted) {
            preTokenUpdate[t.id] = { token: t, visible: false, hidden: t.data.hidden, alpha: t.alpha };
            t.alpha = 0.0;
            t.visible = false;
          }
          for (const sTok of srcTokens) {
            const flags = this._conditionalVisibilitySystem.getVisionCapabilities(sTok);
            for (const t of restricted) {
              if (!preTokenUpdate[t.id].visible) {
                //@ts-ignore
                preTokenUpdate[t.id].visible = ConditionalVisibility.canSee(t, sTok, flags);
                if (preTokenUpdate[t.id].visible) {
                  t.visible = true;
                  //@ts-ignore
                  t.ConditionalVisibilityVisible = true;
                  t.alpha = 1.0;
                } else {
                  //@ts-ignore
                  t.ConditionalVisibilityVisible = false;
                }
                // t.data.hidden = !t.visible;
                // t.alpha = t.visible ? t.alpha : 0.0;
              }
            }
          }
          for (const key in preTokenUpdate) {
            const ptu = preTokenUpdate[key];
            if (ptu.visible !== undefined && !ptu.visible) {
              this.tokensToUpdate = this.tokensToUpdate.filter((t) => t.token.id !== ptu.token.id);
              this.tokensToUpdate.push(ptu);
            }
          }
          if (!this.updateQueued) {
            this.updateQueued = true;
            setTimeout(() => {
              for (const ptu of this.tokensToUpdate) {
                ptu.token.visible = false;
                ptu.token.isVisible = false;
                ptu.token.data.hidden = ptu.hidden;
                ptu.token.alpha = ptu.alpha;
                //this.removeTokenOnLayer(this._backgroundLayer, ptu.token);
              }
              this.updateQueued = false;
              this.tokensToUpdate = [];
            }, timeout);
          }
          for (const t of srcTokens) {
            //Show all selected Tokens from player or all of them if none selected
            t.alpha = 1.0;
            t.visible = true;
            //@ts-ignore
            t.ConditionalVisibilityVisible = true;
          }
        } else {
          //GM CASE
          for (const t of restricted) {
            t.alpha = 1.0;
            t.visible = true;
            //@ts-ignore
            t.ConditionalVisibilityVisible = true;
          }
        }
      }
    };
    const realTestVisiblity = sightLayer.testVisibility;
    this._sightLayer.testVisibility = (point, options) => {
      return realTestVisiblity.call(this._sightLayer, point, options);
    };

    this._tokenHud = tokenHud;
    this._conditionalVisibilitySystem.initializeOnToggleEffect(this._tokenHud);

    getGame().socket?.on('modifyEmbeddedDocument', async (message) => {
      const result = message.result.some((result) => {
        return result?.flags?.[CONDITIONAL_VISIBILITY_MODULE_NAME] || result?.actorData?.effects !== undefined;
      });
      if (result) {
        await this.draw();
      }
    });
    // update sight layer, as custom decisons will not be executed the
    // first time through, and cannot be forced in setup
    this.draw();

    // REMOVED
    /*
        const popupVersion = getGame().settings.get(MODULE_NAME, "popup-version");
        const currentVersion = getGame().modules.get(MODULE_NAME).data.version === "v0.2.0" ? "0.0.9" : getGame().modules.get(MODULE_NAME).data.version;

        if (this.isSemvarGreater(currentVersion, popupVersion)) {
        renderTemplate(`modules/${MODULE_NAME}/templates/version_popup.html`, {
            version: currentVersion,
        }).then(content => {
            let d = new Dialog({
                title: "Conditional Visibility",
                content: content,
                buttons: {
                    one: {
                        icon: '<i class="fas fa-check"></i>',
                        label: getGame().i18n.localize(MODULE_NAME+'.popup.dismissuntilupdated'),
                        callback: () => getGame().settings.set(MODULE_NAME, 'popup-version', currentVersion)
                       },
                       two: {
                        icon: '<i class="fas fa-times"></i>',
                        label: getGame().i18n.localize(MODULE_NAME+'.popup.close')
                       }
                },
                default: ""
               });
               d.render(true);
            });
        }
        */
  }

  removeTokenOnLayer(layer: PIXI.DisplayObject | BackgroundLayer, token: Token): void {
    //@ts-ignore
    if (layer.children == null || layer.children.length == 0) {
      if (layer.name == token.id) {
        layer.parent.removeChild(layer);
      }
    }
    if (layer instanceof BackgroundLayer) {
      layer.children.forEach((e) => this.removeTokenOnLayer(e, token));
    } else {
      //@ts-ignore
      if (layer.children !== null) {
        //@ts-ignore
        layer.children.forEach((e) => this.removeTokenOnLayer(e, token));
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRenderTokenConfig(tokenConfig: TokenConfig, jQuery: JQuery, data: object): void {
    const visionTab = $('div.tab[data-tab="vision"]');
    renderTemplate(
      `modules/${CONDITIONAL_VISIBILITY_MODULE_NAME}/templates/extra_senses.html`,
      //@ts-ignore
      tokenConfig.object.data.flags[CONDITIONAL_VISIBILITY_MODULE_NAME] ?? {},
    ).then((extraSenses) => {
      visionTab.append(extraSenses);
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  onRenderTokenHUD(app: TokenHUD, html: JQuery, token: any): void {
    const systemEffects = this._conditionalVisibilitySystem.effectsByIcon();
    html.find('img.effect-control').each((idx, icon) => {
      //@ts-ignore
      const src = icon.attributes.src.value;
      if (systemEffects.has(src)) {
        let title;
        if (systemEffects.get(src)?.visibilityId === StatusEffectStatusFlags.HIDDEN) {
          // 'hidden'
          title = i18n(systemEffects.get(src)?.label ?? '');
          let tokenActorData;
          if (!token.actorData?.flags) {
            tokenActorData = getGame().actors?.get(token.actorId)?.data;
          } else {
            tokenActorData = token.actorData;
          }
          const _ste =
            tokenActorData?.document?.getFlag(
              CONDITIONAL_VISIBILITY_MODULE_NAME,
              StatusEffectSightFlags.PASSIVE_STEALTH,
            ) ??
            tokenActorData.flags[CONDITIONAL_VISIBILITY_MODULE_NAME][StatusEffectSightFlags.PASSIVE_STEALTH] ??
            NaN;
          if (tokenActorData && !isNaN(parseInt(_ste))) {
            title += ' ' + i18n(`${CONDITIONAL_VISIBILITY_MODULE_NAME}.currentstealth`) + ': ' + _ste;
          }
        } else {
          title = i18n(systemEffects.get(src)?.label ?? '');
        }
        icon.setAttribute('title', title);
      }
    });
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async onCreateEffect(effect: any, options: any, userId: string): Promise<void> {
    await this._conditionalVisibilitySystem.onCreateEffect(effect, options, userId);
    //this.refresh();
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async onDeleteEffect(effect: any, options: any, userId: string): Promise<void> {
    await this._conditionalVisibilitySystem.onDeleteEffect(effect, options, userId);
    //this.refresh();
  }

  async applyChanges(): Promise<void> {
    if (ConditionalVisibility.INSTANCE.sceneUpdates.length) {
      await getCanvas().scene?.updateEmbeddedDocuments('Token', ConditionalVisibility.INSTANCE.sceneUpdates);
      ConditionalVisibility.INSTANCE.sceneUpdates.length = 0;
    }
    if (ConditionalVisibility.INSTANCE.actorUpdates.length) {
      await Actor.updateDocuments(ConditionalVisibility.INSTANCE.actorUpdates);
      ConditionalVisibility.INSTANCE.actorUpdates.length = 0;
    }
    //socketLib library
    //@ts-ignore
    await ConditionalVisibility.SOCKET.executeForEveryone('refresh');
  }

  async draw(): Promise<void> {
    this._draw();
  }

  async refresh(): Promise<void> {
    await this._sightLayer.refresh();
  }
}
