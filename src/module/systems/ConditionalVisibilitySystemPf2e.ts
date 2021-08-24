import { i18n } from '../../conditional-visibility';
import { MODULE_NAME, StatusEffect } from '../settings';
import { DefaultConditionalVisibilitySystem } from './DefaultConditionalVisibilitySystem';
import { ConditionalVisibility } from '../ConditionalVisibility';
// const MODULE_NAME = "conditional-visibility";
/**
 * Conditional visibility system for pf2e.  Uses only the built in pf2e invisibility.
 */
export class ConditionalVisibilitySystemPf2e extends DefaultConditionalVisibilitySystem {
  async onCreateEffect(effect, options, userId) {
    if (effect.type !== 'condition') return;
    const status = this.getEffectByIcon(effect);
    if (status) {
      //const actor = effect.parent;
      //await actor.setFlag(MODULE_NAME, status.visibilityId, true);
      const flag = 'flags.conditional-visibility.' + status.visibilityId;
      if (effect.parent.isToken) {
        ConditionalVisibility.INSTANCE.sceneUpdates.push({ _id: effect.parent.parent.id, ['actorData.' + flag]: true });
        ConditionalVisibility.INSTANCE.sceneUpdates.push({
          _id: effect.parent.parent.id,
          ['actorData.flags.conditional-visibility.hasEffect']: true,
        });
      } else {
        ConditionalVisibility.INSTANCE.actorUpdates.push({ _id: effect.parent.id, [flag]: true });
      }
      ConditionalVisibility.INSTANCE.debouncedUpdate();
    }
  }

  async onDeleteEffect(effect, options, userId) {
    if (effect.type !== 'condition') return;
    const status = this.getEffectByIcon(effect);
    if (status) {
      //const actor = effect.parent;
      //await actor.unsetFlag(MODULE_NAME, status.visibilityId, true);
      const flag = 'flags.conditional-visibility.' + status.visibilityId;
      if (effect.parent.isToken) {
        ConditionalVisibility.INSTANCE.sceneUpdates.push({
          _id: effect.parent.parent.id,
          ['actorData.' + flag]: false,
        });
        //Check if its the last effect that causes hidden status
        if (
          Array.from(this.effectsByCondition().values()).filter(
            (e) => effect.parent.getFlag(MODULE_NAME, e.visibilityId) ?? false,
          ).length == 1
        ) {
          ConditionalVisibility.INSTANCE.sceneUpdates.push({
            _id: effect.parent.parent.id,
            ['actorData.flags.conditional-visibility.hasEffect']: false,
          });
        }
      } else {
        ConditionalVisibility.INSTANCE.actorUpdates.push({ _id: effect.parent.id, [flag]: false });
      }
      ConditionalVisibility.INSTANCE.debouncedUpdate();
    }
  }

  // static PF2E_BASE_EFFECTS = new Array (
  //     // {
  //     //     id: MODULE_NAME + '.invisible',
  //     //     visibilityId: 'invisible',
  //     //     label: i18n(MODULE_NAME+'.invisible'),
  //     //     icon:'systems/pf2e/icons/conditions/invisible.png'
  //     // }
  // )

  /**
   * Use the base conditions, plus set up the icon for the "hidden" condition
   */
  effects() {
    //return ConditionalVisibilitySystemPf2e.PF2E_BASE_EFFECTS;
    const effects = super.effects();
    effects.push({
      id: MODULE_NAME + '.invisible',
      visibilityId: 'invisible',
      label: i18n(MODULE_NAME + '.invisible'),
      icon: 'systems/pf2e/icons/conditions/invisible.webp',
    });
    return effects;
  }

  effectsFromUpdate(update) {
    return update.actorData?.items;
  }

  getEffectByIcon(effect): StatusEffect {
    return <StatusEffect>this.effectsByIcon().get(effect.data.img);
  }

  gameSystemId() {
    return 'pf2e';
  }

  /**
   * Tests whether a token is invisible, and if it can be seen.
   * @param target the token being seen (or not)
   * @param visionCapabilities the sight capabilities of the sight layer
   */
  seeInvisible(target: Token, visionCapabilities: any, distance: any): boolean {
    const invisible = this.hasStatus(target, 'invisible');
    if (invisible === true) {
      if (visionCapabilities.seeinvisible > 0) {
        return visionCapabilities.seeinvisible >= distance;
      }
      return false;
    }
    return true;
  }
}
