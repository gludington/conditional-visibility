import { i18n } from '../../conditional-visibility';
import { MODULE_NAME } from '../settings';
import { DefaultConditionalVisibilitySystem } from "./DefaultConditionalVisibilitySystem";
// const MODULE_NAME = "conditional-visibility";
/**
 * Conditional visibility system for pf2e.  Uses only the built in pf2e invisibility.
 */
export class ConditionalVisibilitySystemPf2e extends DefaultConditionalVisibilitySystem {

    async onCreateEffect(effect, options, userId) {
        if (effect.type !== "condition") return;
        const status = this.getEffectByIcon(effect);
        if (status) {
            const actor = effect.parent;
            await actor.setFlag(MODULE_NAME, status.visibilityId, true);
        }
    }

    async onDeleteEffect(effect, options, userId) {
        if (effect.type !== "condition") return;
        const status = this.getEffectByIcon(effect);
        if (status) {
            const actor = effect.parent;
            await actor.unsetFlag(MODULE_NAME, status.visibilityId, true);
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
        effects.push(
            {
                id: MODULE_NAME + '.invisible',
                visibilityId: 'invisible',
                label: i18n(MODULE_NAME + '.invisible'),
                icon: 'systems/pf2e/icons/conditions/invisible.webp'
            }
        );
        return effects;
    }

    effectsFromUpdate(update) {
        return update.actorData?.items;
    }

    getEffectByIcon(effect) {
        //@ts-ignore
        return this.effectsByIcon().get(effect.data.img);

    }

    gameSystemId() {
        return "pf2e";
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
                return visionCapabilities.seeinvisible >= distance
            }
            return false;
        }
        return true;
    }
}
