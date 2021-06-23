import { i18n } from '../../conditional-visibility';
import { MODULE_NAME } from '../settings';
import { DefaultConditionalVisibilitySystem } from "./DefaultConditionalVisibilitySystem";
// const MODULE_NAME = "conditional-visibility";
/**
 * Conditional visibility system for pf2e.  Uses only the built in pf2e invisibility.
 */
export class ConditionalVisibilitySystemPf2e extends DefaultConditionalVisibilitySystem {

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
                icon: 'systems/pf2e/icons/conditions/invisible.png'
            }
        );
        return effects;
    }

    effectsFromUpdate(update) {
        return update.actorData?.items;
    }

    getEffectByIcon(effect) {
        //@ts-ignore
        return this.effectsByIcon().get(effect.img);

    }

    gameSystemId() {
        return "pf2e";
    }
    
    /**
     * Tests whether a token is invisible, and if it can be seen.
     * @param target the token being seen (or not)
     * @param visionCapabilities the sight capabilities of the sight layer
     */
    seeInvisible(target:Token, visionCapabilities:any): boolean {
        const invisible = this.hasStatus(target, 'invisible', 'invisible.png');
        if (invisible === true) {
            if (visionCapabilities.seeinvisible !== true) {
                return false;
            }
        }
        return true;
    }
}