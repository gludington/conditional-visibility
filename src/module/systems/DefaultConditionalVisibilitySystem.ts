import * as Constants from '../Constants';
import { ConditionalVisibilitySystem } from "./ConditionalVisibilitySystem";

/**
 * The DefaultConditionalVisibilitySystem, to use when no visibility system can be found for the game system.
 */
export class DefaultConditionalVisibilitySystem implements ConditionalVisibilitySystem {
    
    _effects:Map<String, String>;

    constructor() {
        this._effects = new Map<String, String> ([['modules/conditional-visibility/icons/unknown.svg', 'invisible'],
        ['modules/conditional-visibility/icons/foggy.svg', 'obscured'],
        ['modules/conditional-visibility/icons/moon.svg', 'indarkness']]);
    }

    gameSystemId(): string {
        return "default";
    }

    /**
     * Base effects are invisible, obscured, and indarkness
     */
    public effects():Map<String, String> {
        return this._effects;
    }

    public initializeStatusEffects():void {
        console.log(Constants.MODULE_NAME + " | Initializing visibility system effects " + this.gameSystemId() + " for game system " + game.system.id);
        for (const effect of this.effects().keys()) {
            //@ts-ignore
            CONFIG.statusEffects.push(effect);	
        }
    }

    /**
     * Default system does not have any reaction to a condition change.  Subclasses override this to add behavior.
     * @param tokenHud the tokenHud to use
     */
    public initializeOnToggleEffect(tokenHud: any) {

    }

    public recalculateVisibleStatus(token: any, update: any) {
        if (update.effects) {
            this._effects.forEach((value, key, map) => {
                if (!update.flags) {
                    update.flags = {};
                }
                if (!update.flags[Constants.MODULE_NAME]) {
                    update.flags[Constants.MODULE_NAME] = {};
                }
                if (!update.flags[Constants.MODULE_NAME][Constants.VISIBLE_STATUS_FIELD]) {
                    update.flags[Constants.MODULE_NAME][Constants.VISIBLE_STATUS_FIELD] = {};
                }
                //@ts-ignore
                update.flags[Constants.MODULE_NAME][Constants.VISIBLE_STATUS_FIELD][value] = update.effects.some(eff => eff === key);   
            });
            this.internalRecalculateVisibleStatus(token, update);
        }
    }

    protected internalRecalculateVisibleStatus(token, update) {

    }

    public getVisionCapabilities(srcTokens: Token[]) {
        const flags: any = {};
        flags.seeinvisible = srcTokens.some(sTok => {
            return sTok.data.flags[Constants.MODULE_NAME] &&
                (sTok.data.flags[Constants.MODULE_NAME].seeinvisible === true
                    || sTok.data.flags[Constants.MODULE_NAME].blindsight === true
                    || sTok.data.flags[Constants.MODULE_NAME].tremorsense === true
                    || sTok.data.flags[Constants.MODULE_NAME].truesight === true);
        });
        flags.seeobscured = srcTokens.some(sTok => {
            return sTok.data.flags[Constants.MODULE_NAME] &&
                (sTok.data.flags[Constants.MODULE_NAME].blindsight === true
                    || sTok.data.flags[Constants.MODULE_NAME].tremorsense === true);
        });
        flags.seeindarkness = srcTokens.some(sTok => {
            return sTok.data.flags[Constants.MODULE_NAME] &&
                (sTok.data.flags[Constants.MODULE_NAME].blindsight === true
                    || sTok.data.flags[Constants.MODULE_NAME].devilssight === true
                    || sTok.data.flags[Constants.MODULE_NAME].tremorsense === true
                    || sTok.data.flags[Constants.MODULE_NAME].truesight === true);
        });
        return flags;
    }

    /**
     * The base method comparing the capability flags from the sightLayer with the conditions of the token.
     * @param target the token whose visibility is being checked
     * @param flags the capabilities established by the sight layer
     */
    public canSee(target: Token, visionCapabilities: any): boolean {
        const visibleStatus = target.getFlag(Constants.MODULE_NAME, Constants.VISIBLE_STATUS_FIELD);
        if (this.seeInvisible(target, visibleStatus, visionCapabilities) === false) {
            return false;
        }

        if (this.seeObscured(target, visibleStatus, visionCapabilities) === false) {
            return false;
        }

        if (this.seeInDarkness(target, visibleStatus, visionCapabilities) === false) {
            return false;
        }

        if (this.seeContested(target, visibleStatus, visionCapabilities) === false) {
            return false;
        }
        return true;
        
    }

    /**
     * Tests whether a token is invisible, and if it can be seen.
     * @param target the token being seen (or not)
     * @param effects the effects of that token
     * @param visionCapabilities the sight capabilities of the sight layer
     */
    protected seeInvisible(target:Token, visibleStatus:any, visionCapabilities:any): boolean {
        const invisible = visibleStatus && visibleStatus.invisible === true;
        if (invisible === true) {
            if (visionCapabilities.seeinvisible !== true) {
                return false;
            }
        }
        return true;
    }

    /**
     * Tests whether a token is obscured, and if it can be seen.
     * @param target the token being seen (or not)
     * @param effects the effects of that token
     * @param visionCapabilities the sight capabilities of the sight layer
     */
    protected seeObscured(target:Token, visibleStatus:any, visionCapabilities:any): boolean {
        const obscured = visibleStatus && visibleStatus.obscured === true;
        if (obscured === true) {
            if (visionCapabilities.seeobscured !== true) {
                return false;
            }
        }
        return true;
    }

    /**
     * Tests whether a token is in darkness, and if it can be seen.
     * @param target the token being seen (or not)
     * @param effects the effects of that token
     * @param flags the sight capabilities of the sight layer
     */
    protected seeInDarkness(target:Token, visibleStatus:any, visionCapabilities:any): boolean {
        const indarkness = visibleStatus && visibleStatus.indarkness === true;
        if (indarkness === true) {
            if (visionCapabilities.seeindarkness !== true) {
                return false;
            }
        }
        return true;
    }

    /**
     * Tests whether a token has some contested (hidden) condition, and if it can be seen.  The most likely
     * candidate to be overridden by sublass systems.
     * @param target the token being seen (or not)
     * @param effects the effects of that token
     * @param visionCapabilities the sight capabilities of the sight layer
     */
    protected seeContested(target:Token, visibleStatus:any, flags:any): boolean {
        return true;
    }

    /**
     * Roll for the contested hiding check; override in subclass systems
     * @param token the token whose stats may create the roll.
     * @return a Roll
     */
    protected rollStealth(token:Token):Roll {
        return new Roll("1d20");
    }

    /**
     * Renders a dialog window pre-filled with the result of a system-dependent roll, which can be changed in an input field.  Subclasses can use this
     * as is, see ConditionalVisibilitySystem5e for an example
     * @param token the actor to whom this dialog refers
     * @returns a Promise<number> containing the value of the result, or -1 if unintelligble
     */
    protected async stealthHud(token:any):Promise<number> {
        let initialValue;
        try {
            initialValue = parseInt(token.data.flags[Constants.MODULE_NAME]._ste);
        } catch (err) {
            
        }
        let result = initialValue;
        if (initialValue === undefined || isNaN(parseInt(initialValue))) {
             try {
                 result = this.rollStealth(token).roll().total;
             } catch (err) {
                 console.warn("Error rolling stealth, check formula for system");
                 result = Constants.DEFAULT_STEALTH;
             }
        }

        const content = await renderTemplate("modules/conditional-visibility/templates/stealth_hud.html", { initialValue: result });
        return new Promise((resolve, reject) => {   
            let hud = new Dialog({
                title: game.i18n.format('CONVIS.hidden', {}),
                content: content,
                buttons: {
                    one: {
                        icon: '<i class="fas fa-check"></i>',
                        label: 'OK',
                        callback: (html) => {
                            //@ts-ignore
                            const val = parseInt(html.find('div.form-group').children()[1].value);
                            if (isNaN(val)) {
                                resolve(-1);
                            } else {
                                resolve(val);
                            }
                        }
                    }
                },
                close: (html) => {
                    //@ts-ignore
                    const val = parseInt(html.find('div.form-group').children()[1].value);
                        if (isNaN(val)) {
                            resolve(-1);
                        } else {
                            resolve(val);
                        }
                }
            });
            hud.render(true);
        });
    }
}