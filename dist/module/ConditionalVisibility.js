import { ConditionalVisibilitySystem5e } from "./systems/ConditionalVisibilitySystem5e.js";
import { ConditionalVisibilitySystemPf2e } from "./systems/ConditionalVisibilitySystemPf2e.js";
import { DefaultConditionalVisibilitySystem } from "./systems/DefaultConditionalVisibilitySystem.js";
import { ConditionalVisibilityFacadeImpl } from "./ConditionalVisibilityFacade.js";
import { i18n, log, warn } from "../conditional-visibility.js";
import { getCanvas, getGame, MODULE_NAME } from "./settings.js";
export class ConditionalVisibility {
    /**
     * Create a ConditionalVisibility with a given sightLayer and tokenHud.
     * @param sightLayer the sightLayer to use
     * @param tokenHud the tokenHud to use
     */
    constructor(sightLayer, tokenHud) {
        this._conditionalVisibilitySystem = ConditionalVisibility.newSystem();
        this._sightLayer = sightLayer;
        log(' starting against v0.7 or greater instance ' + getGame().data.version);
        this._getSrcTokens = () => {
            const srcTokens = [];
            if (this._sightLayer?.sources?.size ?? 0 > 0) {
                for (const key of this._sightLayer.sources.keys()) {
                    if (key.startsWith('Token.')) {
                        const tok = getCanvas().tokens?.placeables.find((tok) => tok.id === key.substring('Token.'.length));
                        if (tok) {
                            srcTokens.push(tok);
                        }
                    }
                }
            }
            else {
                if (getGame().user?.isGM === false) {
                    const activeTokenDocuments = getGame().user?.character?.getActiveTokens();
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
        ConditionalVisibility.canSee = (token, srcTokens = null, flags = null) => {
            const _srcTokens = this._getSrcTokens();
            let output = false;
            //GM CASE
            if ((_srcTokens.length ?? 0) == 0)
                return true;
            for (const sTok of _srcTokens) {
                const _flags = flags ?? this._conditionalVisibilitySystem.getVisionCapabilities(sTok);
                if (sTok)
                    output = this._conditionalVisibilitySystem.canSee(token, _flags);
                if (output)
                    return true;
            }
            return false;
        };
        const realRestrictVisibility = sightLayer.restrictVisibility;
        this.restrictVisibility = (timeout) => {
            warn('Restrict Calling');
            //realRestrictVisibility.call(this._sightLayer);
            //@ts-ignore
            let restricted = getCanvas().tokens.placeables.filter((token) => ((token.data.actorData?.flags ?? [MODULE_NAME])[MODULE_NAME]?.hasEffect ?? false) && token.visible);
            if (restricted && restricted.length > 0) {
                const srcTokens = this._getSrcTokens();
                if (srcTokens.length > 0) {
                    restricted = restricted.filter((t) => srcTokens.indexOf(t) < 0);
                    //In case a selected token is also hidden
                    for (const t of restricted) {
                        t.visible = false;
                    }
                    for (const sTok of srcTokens) {
                        const flags = this._conditionalVisibilitySystem.getVisionCapabilities(sTok);
                        for (const t of restricted) {
                            if (!t.visible) {
                                //@ts-ignore
                                t.visible = ConditionalVisibility.canSee(t, sTok, flags);
                                t.data.hidden = !t.visible;
                                //t.visible = this._conditionalVisibilitySystem.canSee(t, flags);
                            }
                        }
                        restricted = restricted.filter((t) => t.data.hidden);
                        this.tokensToUpdate = restricted;
                        if (!this.updateQueued) {
                            this.updateQueued = true;
                            setTimeout(() => {
                                for (const t of this.tokensToUpdate) {
                                    t.visible = false;
                                    t.data.hidden = false;
                                }
                                this.updateQueued = false;
                            }, timeout);
                        }
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
                return result?.flags?.[MODULE_NAME] || result?.actorData?.effects !== undefined;
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
            renderTemplate("modules/"+MODULE_NAME+"/templates/version_popup.html", {
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
    /**
     * Called from init hook to establish the extra status effects in the main list before full game initialization.
     */
    static onInit() {
        const system = ConditionalVisibility.newSystem();
        system.initializeStatusEffects();
    }
    isSemvarGreater(first, second) {
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
    splitOnDot(toSplit) {
        return toSplit.split('.').map((str) => (isNaN(Number(str)) ? 0 : Number(str)));
    }
    /**
     * A static method that will be replaced after initialization with the appropriate system specific method.
     * @param token the token to test
     */
    static canSee(token, srcTokens = null, flags = null) {
        return false;
    }
    /**
     * Create a new ConditionalVisibilitySystem appropriate to the game system
     * @returns ConditionalVisibilitySystem
     */
    static newSystem() {
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
    static initialize(sightLayer, tokenHud) {
        ConditionalVisibility.INSTANCE = new ConditionalVisibility(sightLayer, tokenHud);
        ConditionalVisibility.SOCKET.register('refresh', () => {
            Hooks.callAll('sightRefresh');
        });
        const facade = new ConditionalVisibilityFacadeImpl(ConditionalVisibility.INSTANCE, ConditionalVisibility.INSTANCE._conditionalVisibilitySystem);
        //@ts-ignore
        window.ConditionalVisibility = facade;
        ConditionalVisibility.INSTANCE._conditionalVisibilitySystem.initializeHooks(facade);
    }
    onRenderTokenConfig(tokenConfig, jQuery, data) {
        const visionTab = $('div.tab[data-tab="vision"]');
        renderTemplate('modules/' + MODULE_NAME + '/templates/extra_senses.html', tokenConfig.object.data.flags[MODULE_NAME] || {}).then((extraSenses) => {
            visionTab.append(extraSenses);
        });
    }
    onRenderTokenHUD(app, html, token) {
        const systemEffects = this._conditionalVisibilitySystem.effectsByIcon();
        html.find('img.effect-control').each((idx, icon) => {
            const src = icon.attributes.src.value;
            if (systemEffects.has(src)) {
                let title;
                if (systemEffects.get(src)?.visibilityId === 'hidden') {
                    title = i18n(systemEffects.get(src)?.label);
                    let tokenActorData;
                    if (!token.actorData?.flags) {
                        tokenActorData = getGame().actors?.get(token.actorId)?.data;
                    }
                    else {
                        tokenActorData = token.actorData;
                    }
                    if (tokenActorData &&
                        tokenActorData.flags &&
                        tokenActorData.flags[MODULE_NAME] &&
                        tokenActorData.flags[MODULE_NAME]._ste &&
                        !isNaN(parseInt(tokenActorData.flags[MODULE_NAME]._ste))) {
                        title += ' ' + i18n(MODULE_NAME + '.currentstealth') + ': ' + tokenActorData.flags[MODULE_NAME]._ste;
                    }
                }
                else {
                    title = i18n(systemEffects.get(src)?.label);
                }
                icon.setAttribute('title', title);
            }
        });
    }
    async onCreateEffect(effect, options, userId) {
        await this._conditionalVisibilitySystem.onCreateEffect(effect, options, userId);
        //this.refresh();
    }
    async onDeleteEffect(effect, options, userId) {
        await this._conditionalVisibilitySystem.onDeleteEffect(effect, options, userId);
        //this.refresh();
    }
    async applyChanges() {
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
    async draw() {
        this._draw();
    }
    async refresh() {
        await this._sightLayer.refresh();
    }
}
