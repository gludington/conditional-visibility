import * as Constants from '../Constants';
import { DefaultConditionalVisibilitySystem } from "./DefaultConditionalVisibilitySystem";

/**
 * Conditional visibility system for pf2e.  Uses only the built in pf2e invisibility.
 */
export class ConditionalVisibilitySystemPf2e extends DefaultConditionalVisibilitySystem {

    /**
     * Use the base conditions, plus set up the icon for the "hidden" condition
     */
    public effects(): Map<string, string> {
        return new Map<string, string> ([['systems/pf2e/icons/conditions-2/invisible.png', 'invisible']]);
    }

    public gameSystemId() {
        return "pf2e";
    }
}
