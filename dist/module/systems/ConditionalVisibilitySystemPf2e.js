import { i18n } from "../../conditional-visibility.js";
import { CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectStatusFlags } from "../settings.js";
import { DefaultConditionalVisibilitySystem } from "./DefaultConditionalVisibilitySystem.js";
import { ConditionalVisibility } from "../ConditionalVisibility.js";
// const MODULE_NAME = "conditional-visibility";
/**
 * Conditional visibility system for pf2e.  Uses only the built in pf2e invisibility.
 */
export class ConditionalVisibilitySystemPf2e extends DefaultConditionalVisibilitySystem {
    async onCreateEffect(effect, options, userId) {
        if (effect.type !== 'condition')
            return;
        const status = this.getEffectByIcon(effect);
        if (status) {
            //const actor = effect.parent;
            //await actor.setFlag(MODULE_NAME, status.visibilityId, true);
            const baseflag = 'flags.' + CONDITIONAL_VISIBILITY_MODULE_NAME + '.';
            if (effect.parent.isToken) {
                ConditionalVisibility.INSTANCE.sceneUpdates.push({
                    _id: effect.parent.parent.id,
                    ['actorData.' + baseflag + status.visibilityId]: true
                });
                ConditionalVisibility.INSTANCE.sceneUpdates.push({
                    _id: effect.parent.parent.id,
                    ['actorData.' + baseflag + 'hasEffect']: true,
                });
            }
            else if (effect.parent.isOwner) {
                ConditionalVisibility.INSTANCE.actorUpdates.push({
                    _id: effect.parent.id,
                    [baseflag + status.visibilityId]: true
                });
                ConditionalVisibility.INSTANCE.actorUpdates.push({
                    _id: effect.parent.id,
                    [baseflag + 'hasEffect']: true,
                });
            }
            ConditionalVisibility.INSTANCE.debouncedUpdate();
        }
    }
    async onDeleteEffect(effect, options, userId) {
        if (effect.type !== 'condition')
            return;
        const status = this.getEffectByIcon(effect);
        if (status) {
            //const actor = effect.parent;
            //await actor.unsetFlag(MODULE_NAME, status.visibilityId, true);
            const baseflag = 'flags.' + CONDITIONAL_VISIBILITY_MODULE_NAME + '.';
            if (effect.parent.isToken) {
                ConditionalVisibility.INSTANCE.sceneUpdates.push({
                    _id: effect.parent.parent.id,
                    ['actorData.' + baseflag + status.visibilityId]: false
                });
                //Check if its the last effect that causes hidden status
                if (Array.from(this.effectsByCondition().values()).filter((e) => effect.parent.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, e.visibilityId) ?? false).length == 1) {
                    ConditionalVisibility.INSTANCE.sceneUpdates.push({
                        _id: effect.parent.parent.id,
                        ['actorData.' + baseflag + 'hasEffect']: false,
                    });
                    setTimeout(() => { effect.parent.parent._object.alpha = 1; effect.parent.parent._object.visible = true; effect.parent.parent._object.data.hidden = false; }, 350);
                }
            }
            else {
                if (effect.parent.isOwner) {
                    ConditionalVisibility.INSTANCE.actorUpdates.push({
                        _id: effect.parent.id,
                        [baseflag + status.visibilityId]: false
                    });
                }
                if (Array.from(this.effectsByCondition().values()).filter((e) => effect.parent.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, e.visibilityId) ?? false).length == 1) {
                    if (effect.parent.isOwner) {
                        ConditionalVisibility.INSTANCE.actorUpdates.push({
                            _id: effect.parent.id,
                            [baseflag + 'hasEffect']: false,
                        });
                    }
                    setTimeout(() => { effect.parent.getActiveTokens().forEach((e) => { e.alpha = 1; e.visible = true; e.data.hidden = false; }); }, 350);
                }
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
            id: CONDITIONAL_VISIBILITY_MODULE_NAME + '.invisible',
            visibilityId: 'invisible',
            label: i18n(CONDITIONAL_VISIBILITY_MODULE_NAME + '.invisible'),
            icon: 'systems/pf2e/icons/conditions/invisible.webp',
        });
        return effects;
    }
    effectsFromUpdate(update) {
        return update.actorData?.items;
    }
    getEffectByIcon(effect) {
        return this.effectsByIcon().get(effect.data.img);
    }
    gameSystemId() {
        return 'pf2e';
    }
    /**
     * Tests whether a token is invisible, and if it can be seen.
     * @param target the token being seen (or not)
     * @param visionCapabilities the sight capabilities of the sight layer
     */
    seeInvisible(target, visionCapabilities, distance) {
        const invisible = this.hasStatus(target, StatusEffectStatusFlags.INVISIBLE); // 'invisible'
        if (invisible === true) {
            if (visionCapabilities.seeinvisible > 0) {
                return visionCapabilities.seeinvisible >= distance;
            }
            return false;
        }
        return true;
    }
}
