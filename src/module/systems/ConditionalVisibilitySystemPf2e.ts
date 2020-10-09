import * as Constants from '../Constants';
import { DefaultConditionalVisibilitySystem } from "./DefaultConditionalVisibilitySystem";

/**
 * Conditional visibility system for pf2e.  Uses only the built in pf2e invisibility.
 */
export class ConditionalVisibilitySystemPf2e extends DefaultConditionalVisibilitySystem {

    /**
     * Use the base conditions, plus set up the icon for the "hidden" condition
     */
    public effects(): Map<String, String> {
        return new Map<String, String> ([['systems/pf2e/icons/conditions-2/invisible.png', 'invisible']]);
    }

    public gameSystemId() {
        return "pf2e";
    }

    /**
     * Tests whether a token is invisible, and if it can be seen.
     * @param target the token being seen (or not)
     * @param effects the effects of that token
     * @param visionCapabilities the sight capabilities of the sight layer
     */
    protected seeInvisible(target:Token, effects:any, visionCapabilities:any): boolean {
        const invisible = effects.some(eff => eff.endsWith('invisible.png'));
        if (invisible === true) {
            if (visionCapabilities.seeinvisible !== true) {
                return false;
            }
        }
        return true;
    }
}
