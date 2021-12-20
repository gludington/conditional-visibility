import { DefaultConditionalVisibilitySystem, VisionCapabilities } from './DefaultConditionalVisibilitySystem';
import {
  getCanvas,
  getGame,
  CONDITIONAL_VISIBILITY_MODULE_NAME,
  StatusEffectStatusFlags,
  StatusEffectSightFlags,
  StatusEffect,
} from '../settings';
import { i18n } from '../../conditional-visibility';
import { ConditionalVisibility } from '../ConditionalVisibility';
import { ConditionalVisibilityFacade } from '../ConditionalVisibilityFacade';

/**
 * Conditional visibility system for dnd5e.  Uses the same base conditions, plus adds hidden, which compares
 * stealth with passive perception.
 */
export class ConditionalVisibilitySystem5e extends DefaultConditionalVisibilitySystem {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async onCreateEffect(effect: any, options: any, userId: string): Promise<void> {
    const status = this.getEffectByIcon(effect);
    if (status) {
      //const actor = effect.parent;
      //await actor.setFlag(MODULE_NAME, status.visibilityId, true);
      const baseflag = 'flags.' + CONDITIONAL_VISIBILITY_MODULE_NAME + '.';
      if (effect.parent.isToken) {
        ConditionalVisibility.INSTANCE.sceneUpdates.push({
          _id: effect.parent.parent.id,
          ['actorData.' + baseflag + status.visibilityId]: true,
        });
        ConditionalVisibility.INSTANCE.sceneUpdates.push({
          _id: effect.parent.parent.id,
          ['actorData.' + baseflag + 'hasEffect']: true,
        });
      } else if (effect.parent.isOwner) {
        ConditionalVisibility.INSTANCE.actorUpdates.push({
          _id: effect.parent.id,
          [baseflag + status.visibilityId]: true,
        });
        ConditionalVisibility.INSTANCE.actorUpdates.push({
          _id: effect.parent.id,
          [baseflag + 'hasEffect']: true,
        });
      }
      ConditionalVisibility.INSTANCE.debouncedUpdate();
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async onDeleteEffect(effect: any, options: any, userId: string): Promise<void> {
    const status = this.getEffectByIcon(effect);
    if (status) {
      //const actor = effect.parent;
      //await actor.unsetFlag(MODULE_NAME, status.visibilityId, true);
      const baseflag = 'flags.' + CONDITIONAL_VISIBILITY_MODULE_NAME + '.';
      if (effect.parent.isToken) {
        ConditionalVisibility.INSTANCE.sceneUpdates.push({
          _id: effect.parent.parent.id,
          ['actorData.' + baseflag + status.visibilityId]: false,
        });
        //Check if its the last effect that causes hidden status
        if (
          Array.from(this.effectsByCondition().values()).filter(
            (e) => effect.parent.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, e.visibilityId) ?? false,
          ).length == 1
        ) {
          ConditionalVisibility.INSTANCE.sceneUpdates.push({
            _id: effect.parent.parent.id,
            ['actorData.' + baseflag + 'hasEffect']: false,
          });
          setTimeout(() => {
            effect.parent.parent._object.alpha = 1;
            effect.parent.parent._object.visible = true;
            effect.parent.parent._object.data.hidden = false;
          }, 350);
        }
      } else {
        if (effect.parent.isOwner) {
          ConditionalVisibility.INSTANCE.actorUpdates.push({
            _id: effect.parent.id,
            [baseflag + status.visibilityId]: false,
          });
        }
        if (
          Array.from(this.effectsByCondition().values()).filter(
            (e) => effect.parent.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, e.visibilityId) ?? false,
          ).length == 1
        ) {
          if (effect.parent.isOwner) {
            ConditionalVisibility.INSTANCE.actorUpdates.push({
              _id: effect.parent.id,
              [baseflag + 'hasEffect']: false,
            });
          }
          setTimeout(() => {
            effect.parent.getActiveTokens()?.forEach((e) => {
              e.alpha = 1;
              e.visible = true;
              e.data.hidden = false;
            });
          }, 350);
        }
      }
      ConditionalVisibility.INSTANCE.debouncedUpdate();
    }
  }

  /**
   * Use the base conditions, plus set up the icon for the "hidden" condition
   */
  effects(): StatusEffect[] {
    const effects = super.effects();
    effects.push({
      id: CONDITIONAL_VISIBILITY_MODULE_NAME + '.hidden',
      visibilityId: 'hidden',
      label: i18n(CONDITIONAL_VISIBILITY_MODULE_NAME + '.hidden'),
      icon: 'modules/' + CONDITIONAL_VISIBILITY_MODULE_NAME + '/icons/newspaper.svg',
    });
    return effects;
  }

  gameSystemId(): string {
    return 'dnd5e';
  }

  initializeHooks(facade: ConditionalVisibilityFacade): void {
    Hooks.on('createChatMessage', (message, jQuery, speaker) => {
      if (
        getGame().settings.get(CONDITIONAL_VISIBILITY_MODULE_NAME, 'autoStealth') === true &&
        message.data.flags.dnd5e &&
        message.data.flags.dnd5e.roll &&
        message.data.flags.dnd5e.roll.skillId === 'ste'
      ) {
        if (message.data.speaker.token) {
          const tokenId = message.data.speaker.token;
          const token = getCanvas().tokens?.placeables.find((tok) => tok.id === tokenId);
          if (token && token.owner) {
            facade.hide([token], message._roll.total);
          }
        }
      }
    });
  }

  /**
   * Get the base vision capabilities, and add the maximum passive perception for any token in the list.
   * @param srcTokens tokens whos abilities to test
   */
  getVisionCapabilities(srcToken: Array<Token> | Token): any {
    if (srcToken ?? false) {
      const flags = super.getVisionCapabilities(srcToken);
      //@ts-ignore
      flags.prc = srcToken?.actor?.data?.data?.skills?.prc?.passive ?? -1;
      return flags;
    }
    return false;
  }
  /**
   * Override seeContested to compare any available stealth with the passive perception calculated in getVisionCapabilities
   * @param target the toekn to try and see
   * @param flags the flags calculated from getVisionCapabilities
   */
  seeContested(target: Token, visionCapabilities: VisionCapabilities): boolean {
    const hidden = this.hasStatus(target, StatusEffectStatusFlags.HIDDEN); // 'hidden'
    if (hidden === true) {
      const actor = target.actor;

      if (actor?.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectSightFlags.PASSIVE_STEALTH)) {
        const stealth = <number>(
          actor?.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectSightFlags.PASSIVE_STEALTH)
        );
        if (visionCapabilities.prc < stealth) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  initializeOnToggleEffect(tokenHud: TokenHUD): any {
    //@ts-ignore
    const realOnToggleEffect = tokenHud._onToggleEffect.bind(tokenHud);
    //@ts-ignore
    tokenHud._onToggleEffect = async (event, opts) => {
      const icon = event.currentTarget;
      if (icon.src.endsWith('newspaper.svg')) {
        const object: Token | undefined = tokenHud.object;
        if (object) {
          if (icon.className.indexOf('active') < 0) {
            this.stealthHud(object).then(async (result) => {
              if (!object.data.flags) {
                object.data.flags = {};
              }
              if (!object.data.flags[CONDITIONAL_VISIBILITY_MODULE_NAME]) {
                object.data.flags[CONDITIONAL_VISIBILITY_MODULE_NAME] = {};
              }
              //object.setFlag(MODULE_NAME, StatusEffectSightFlags.PASSIVE_STEALTH, result);
              if (object.actor) {
                if (!object.actor.data) {
                  //@ts-ignore
                  object.actor.data = {};
                }
                if (!object.actor.data.flags) {
                  object.actor.data.flags = {};
                }
                if (!object.actor.data.flags[CONDITIONAL_VISIBILITY_MODULE_NAME]) {
                  object.actor.data.flags[CONDITIONAL_VISIBILITY_MODULE_NAME] = {};
                }
                await object.actor.setFlag(
                  CONDITIONAL_VISIBILITY_MODULE_NAME,
                  StatusEffectSightFlags.PASSIVE_STEALTH,
                  result,
                );
              }
              return realOnToggleEffect(event, opts);
            });
          } else {
            // if (object.document.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectSightFlags.PASSIVE_STEALTH)) {
            //   await object?.document.unsetFlag(
            //     CONDITIONAL_VISIBILITY_MODULE_NAME,
            //     StatusEffectSightFlags.PASSIVE_STEALTH,
            //   );
            // }
            if (object.actor?.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectSightFlags.PASSIVE_STEALTH)) {
              await object.actor.unsetFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectSightFlags.PASSIVE_STEALTH);
            }
            return realOnToggleEffect(event, opts);
          }
        }
        return false;
      } else {
        return realOnToggleEffect(event, opts);
      }
    };
  }

  hasStealth(): boolean {
    return true;
  }

  rollStealth(token: Token): Roll {
    if (token && token.actor) {
      //@ts-ignore
      return new Roll('1d20 + (' + token.actor.data.data.skills.ste.total + ')');
    } else {
      return super.rollStealth(token);
    }
  }
}
