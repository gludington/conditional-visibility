import * as Constants from './Constants';
import { ConditionalVisibility } from "./ConditionalVisibility";
import { ConditionalVisibilitySystem } from "./systems/ConditionalVisibilitySystem";

/**
 * A class to expose macro-friendly messages on the window object.
 */
export class ConditionalVisibilityFacade {

    readonly _mod:ConditionalVisibility;
    readonly _system: ConditionalVisibilitySystem;

    constructor(mod:ConditionalVisibility, system: ConditionalVisibilitySystem) {
        this._mod = mod;
        this._system = system;
    }

    /**
     * Sets a true false condition on tokens.  Will toggle the status effect on the token.
     * @param tokens the list of tokens to affect
     * @param condition the name of the condition
     * @param value true or false
     */
    public set(tokens:Array<Token>, condition:string, value:boolean) {       
        if (this._system.effectsByCondition().has(condition)) {
            let icon = this._system.effectsByCondition().get(condition);
            tokens.forEach(token => {
                let effects = token.data.effects;
                if (value !== true) {
                    if (this.has(effects, icon)) {
                        token.toggleEffect(icon).then(() => {});
                    }
                } else {
                    if (!this.has(effects, icon)) {
                        token.toggleEffect(icon).then(() => {});
                    }
                }
            });
        }
    }

    /**
     * Set the hide condition on the token, if the system supports it.
     * @param tokens the list of tokens to affect.
     * @param value an optional numeric value to set for all tokens.  If unsupplied, will roll the ability the system defines.
     */
    public hide(tokens:Array<Token>, value?: number) {
        if (!this._system.hasStealth()) {
            ui.notifications.error(game.i18n.format("CONVIS.stealth.not.supported", {sysid: game.system.id}));
            return;
        } 
        if (this._system.effectsByCondition().has('hidden')) {
            let icon = this._system.effectsByCondition().get('hidden');
            tokens.forEach(token => {    
                if (!token.data.flags) {
                    token.data.flags = {};
                }
                if (!token.data.flags[Constants.MODULE_NAME]) {
                    token.data.flags[Constants.MODULE_NAME] = {};
                }
                let stealth;
                if (value) {
                    stealth = value;
                } else {
                    stealth = this._system.rollStealth(token).roll().total;
                }
                token.data.flags[Constants.MODULE_NAME]._ste = stealth;
                if (this.has(token.data.effects, icon) === true) {
                    token.update({flags: token.data.flags});
                } else {
                    token.toggleEffect(icon);
                }
            })
        }
    }

    /**
     * Removes the hide condition from the set of tokens.
     * @param tokens the list of tokens to affect
     */
    public unhide(tokens:Array<Token>) {
        if (this._system.effectsByCondition().has('hidden')) {
            let icon = this._system.effectsByCondition().get('hidden');
            tokens.forEach(token => {
                if (this.has(token.data.effects, icon)) {
                    token.toggleEffect(icon);
                }
            })

        }
    }

    private has(effects, icon):boolean {
        return effects.some(eff => eff === icon);
    }
}