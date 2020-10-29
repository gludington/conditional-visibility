import { ConditionalVisibility } from '../ConditionalVisibility';
import { ConditionalVisibilityFacade } from '../ConditionalVisibilityFacade';
import { StatusEffect } from '../Constants';
import * as Constants from '../Constants';
import { ConditionalVisibilitySystem } from "./ConditionalVisibilitySystem";
import { ConditionalVisibilitySystemPf2e } from './ConditionalVisibilitySystemPf2e';

/**
 * The DefaultConditionalVisibilitySystem, to use when no visibility system can be found for the game system.
 */
export class DefaultConditionalVisibilitySystem implements ConditionalVisibilitySystem {

    static BASE_EFFECTS = new Array<StatusEffect> (
        { 
            id: 'invisible',
            label: 'CONVIS.invisible',
            icon:'modules/conditional-visibility/icons/unknown.svg'
        }, {
            id: 'obscured',
            label: 'CONVIS.obscured',
            icon: 'modules/conditional-visibility/icons/foggy.svg',
         }, {
            id:'indarkness',
            label: 'CONVIS.indarkness',
            icon: 'modules/conditional-visibility/icons/moon.svg'
        }
    );
    
    _effectsByIcon: Map<string, StatusEffect>;
    _effectsByCondition: Map<string, StatusEffect>;

    hasStatus:(token:Token, id:string, icon:string) => boolean;

    constructor() {
        //yes, this is a BiMap but the solid TS BiMap implementaiton is GPLv3, so we will just fake what we need here
        this._effectsByIcon = new Map<string, StatusEffect>();
        this._effectsByCondition = new Map<string, StatusEffect>();
        this.effects().forEach(statusEffect => {
            this._effectsByIcon.set(statusEffect.icon, statusEffect);
            this._effectsByCondition.set(statusEffect.id, statusEffect);
        })
        if (ConditionalVisibility.ISV7) {
            this.hasStatus = (token:Token, id:string, icon:string) => {
                //@ts-ignore
                return token.data?.actorData?.effects?.some(eff => eff.flags?.core?.statusId === id);
                //return token.actor?.data?.data?.[Constants.MODULE_NAME]?.[id] === true;
            }
        } else {
            this.hasStatus = (token:Token, id:string, icon:string) => {
                return token.data.effects.some(eff => eff.endsWith(icon));
            }
        }
    }

    gameSystemId(): string {
        return "default";
    }

    /**
     * Base effects are invisible, obscured, and indarkness
     */
    protected effects():Array<StatusEffect> {
        return DefaultConditionalVisibilitySystem.BASE_EFFECTS;
    }


    public effectsByIcon(): Map<string, StatusEffect> {
        return this._effectsByIcon;
    }

    public effectsByCondition(): Map<string, StatusEffect> {
        return this._effectsByCondition;
    }

    public initializeStatusEffects():void {
        console.log(Constants.MODULE_NAME + " | Initializing visibility system effects " + this.gameSystemId() + " for game system " + game.system.id);
        if (ConditionalVisibility.ISV7) {
            this.effectsByIcon().forEach((value: StatusEffect, key: string) => {
                //@ts-ignore
                CONFIG.statusEffects.push({
                    id: value.id,
                    label: value.label,
                    icon: value.icon
                 });

            });
        } else {
            for (const effect of this.effectsByIcon().keys()) {
                //@ts-ignore
                CONFIG.statusEffects.push(effect);	
            }
        }
    }

    /**
     * For subclasses to set up systsem specific hooks.
     * @todo unify initializeOnToggleEffect if possible
     */
    public initializeHooks(facade:ConditionalVisibilityFacade): void {

    }

    /**
     * Default system does not have any reaction to a condition change.  Subclasses override this to add behavior.
     * @param tokenHud the tokenHud to use
     */
    public initializeOnToggleEffect(tokenHud: any) {

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
        if (this.seeInvisible(target, visionCapabilities) === false) {
            return false;
        }

        if (this.seeObscured(target, visionCapabilities) === false) {
            return false;
        }

        if (this.seeInDarkness(target, visionCapabilities) === false) {
            return false;
        }

        if (this.seeContested(target, visionCapabilities) === false) {
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
    protected seeInvisible(target:Token, visionCapabilities:any): boolean {
        const invisible = this.hasStatus(target, 'invisible', 'unknown.svg');
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
     * @param visionCapabilities the sight capabilities of the sight layer
     */
    protected seeObscured(target:Token, visionCapabilities:any): boolean {
        const obscured = this.hasStatus(target, 'obscured', 'foggy.svg');
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
    protected seeInDarkness(target:Token, visionCapabilities:any): boolean {
        const indarkness = this.hasStatus(target, 'indarkness', 'moon.svg');
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
    protected seeContested(target:Token, flags:any): boolean {
        return true;
    }

    public hasStealth():boolean {
        return false;
    }

    /**
     * Roll for the contested hiding check; override in subclass systems
     * @param token the token whose stats may create the roll.
     * @return a Roll
     */
    public rollStealth(token:Token):Roll {
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
                title: game.i18n.localize('CONVIS.hidden'),
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