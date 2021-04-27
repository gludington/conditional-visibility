import { MODULE_NAME, StatusEffect } from '../Constants';
import { DefaultConditionalVisibilitySystem } from "./DefaultConditionalVisibilitySystem";

/**
 * Conditional visibility system for pf2e.  Uses only the built in pf2e invisibility.
 */
export class ConditionalVisibilitySystemPf2e extends DefaultConditionalVisibilitySystem {

    static PF2E_BASE_EFFECTS = new Array<StatusEffect> (
        { 
            id: MODULE_NAME + '.invisible',
            visibilityId: 'invisible',
            label: 'conditional-visibility.invisible',
            icon:'systems/pf2e/icons/conditions/invisible.png'
        }
    );

    /**
     * Use the base conditions, plus set up the icon for the "hidden" condition
     */
    protected effects(): Array<StatusEffect> {
        return ConditionalVisibilitySystemPf2e.PF2E_BASE_EFFECTS;
    }


    public effectsFromUpdate(update: any):any {
        return update.actorData?.items;
    }

    public getEffectByIcon(effect:StatusEffect|string):StatusEffect {
        //@ts-ignore
        return this.effectsByIcon().get(effect.img);

    }

    public gameSystemId() {
        return "pf2e";
    }
    
    /**
     * Tests whether a token is invisible, and if it can be seen.
     * @param target the token being seen (or not)
     * @param visionCapabilities the sight capabilities of the sight layer
     */
    protected seeInvisible(target:Token, visionCapabilities:any): boolean {
        const invisible = this.hasStatus(target, 'invisible', 'invisible.png');
        if (invisible === true) {
            if (visionCapabilities.seeinvisible !== true) {
                return false;
            }
        }
        return true;
    }
}
