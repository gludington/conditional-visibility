import { StatusEffect } from '../Constants';
import { ConditionalVisibilityFacade } from '../ConditionalVisibilityFacade';
import * as Constants from '../Constants';
import { DefaultConditionalVisibilitySystem } from "./DefaultConditionalVisibilitySystem";

/**
 * Conditional visibility system for dnd5e.  Uses the same base conditions, plus adds hidden, which compares
 * stealth with passive perception.
 */
export class ConditionalVisibilitySystem5e extends DefaultConditionalVisibilitySystem {

    /**
     * Use the base conditions, plus set up the icon for the "hidden" condition
     */
    protected effects(): Array<StatusEffect> {
        const effects:Array<StatusEffect> = super.effects();
        effects.push({
            id: 'conditional-visibility.hidden',
            visibilityId: 'hidden',
            label: 'CONVIS.hidden',
            icon: 'modules/conditional-visibility/icons/newspaper.svg'
        });
        return effects;
    }

    public gameSystemId() {
        return "dnd5e";
    }

    public initializeHooks(facade:ConditionalVisibilityFacade) {
        Hooks.on('createChatMessage', (message, jQuery, speaker) => {
            if (game.settings.get(Constants.MODULE_NAME, "autoStealth") === true && message.data.flags.dnd5e
                && message.data.flags.dnd5e.roll
                && message.data.flags.dnd5e.roll.skillId === 'ste') {
                    if (message.data.speaker.token) {
                        const tokenId = message.data.speaker.token;
                        const token = canvas.tokens.placeables.find(tok => tok.id === tokenId);
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
    public getVisionCapabilities(srcTokens: Token[]):any {
        const flags = super.getVisionCapabilities(srcTokens);
         //@ts-ignore
         flags.prc = Math.max(srcTokens.map(sTok => {
            if (sTok.actor && sTok.actor.data && sTok.actor.data.data.skills.prc.passive) {
                return sTok.actor.data.data.skills.prc.passive;
            }
            return -1;
        }));
        return flags;
    }

    /**
     * Override seeContested to compare any available stealth with the passive perception calculated in getVisionCapabilities
     * @param target the toekn to try and see
     * @param flags the flags calculated from getVisionCapabilities
     */
    protected seeContested(target: Token, visionCapabilities: any): boolean {
        const hidden = this.hasStatus(target, 'hidden', 'newspaper.svg');
        if (hidden === true) {
            console.error("CONTEST");
            if (target.data.flags[Constants.MODULE_NAME] && target.data.flags[Constants.MODULE_NAME]._ste) {
                const stealth = target.data.flags[Constants.MODULE_NAME]._ste;
                if (visionCapabilities.prc < stealth) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }

    public initializeOnToggleEffect(tokenHud:any) {
    
        const realOnToggleEffect = tokenHud._onToggleEffect.bind(tokenHud);

        tokenHud._onToggleEffect = (event, opts) => {
            const icon = event.currentTarget;
            if (icon.src.endsWith('newspaper.svg') && icon.className.indexOf('active') < 0) {
                const object = tokenHud.object;
                this.stealthHud(object).then(result => {
                    if (!object.data.flags) {
                        object.data.flags = {};
                    }
                    if (!object.data.flags[Constants.MODULE_NAME]) {
                        object.data.flags[Constants.MODULE_NAME] = {};
                    }
                    object.data.flags[Constants.MODULE_NAME]._ste = result;
                    return realOnToggleEffect(event, opts);
                });
                return false;
            } else {
                return realOnToggleEffect(event, opts);
            }
        }
    }

    public hasStealth() {
        return true;
    }

    public rollStealth(token:Token):Roll {
        if (token && token.actor) {
            return new Roll("1d20 + (" + token.actor.data.data.skills.ste.total + ")");
        } else {
            return super.rollStealth(token);
        }
        
    }
}
