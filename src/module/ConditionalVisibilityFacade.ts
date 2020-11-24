import * as Constants from './Constants';
import { ConditionalVisibility } from "./ConditionalVisibility";
import { ConditionalVisibilitySystem } from "./systems/ConditionalVisibilitySystem";
import { ConditionalVisibilitySystemPf2e } from './systems/ConditionalVisibilitySystemPf2e';

export interface ConditionalVisibilityFacade {

    help(): void,
    setCondition(tokens:Array<Token>, condition:string, value:boolean): void,
    hide(tokens:Array<Token>, value?: number): void,
    unHide(tokens:Array<Token>): void
}

/**
 * A class to expose macro-friendly messages on the window object.
 */
export class ConditionalVisibilityFacadeImpl implements ConditionalVisibilityFacade {

    readonly _mod:ConditionalVisibility;
    readonly _system: ConditionalVisibilitySystem;

    constructor(mod:ConditionalVisibility, system: ConditionalVisibilitySystem) {
        this._mod = mod;
        this._system = system;
        this.toggleEffect = (token, condition) => {
            //@ts-ignore
            return token.toggleEffect(condition);
        }
    }

    public help():void {
        if (game.user.isGM) {
            let conditions = [];
            this._system.effectsByCondition().forEach((value, key) => {
                conditions.push({ name: key, icon: value.icon});
            })
            renderTemplate("modules/conditional-visibility/templates/help_dialog.html", {
                gamesystem: game.system.id,
                hasStealth: this._system.hasStealth(),
                autoStealth: game.settings.get(Constants.MODULE_NAME, "autoStealth"),
                conditions: conditions
            })
                .then(content => {
                    let d = new Dialog({
                        title: "Conditional Visibility",
                        content: content,
                        buttons: {},
                        close: () => console.log("This always is logged no matter which option is chosen")
                       });
                       d.render(true);
                });
        }
    }

    /**
     * Sets a true false condition on tokens.  Will toggle the status effect on the token.
     * @param tokens the list of tokens to affect
     * @param condition the name of the condition
     * @param value true or false
     */
    public setCondition(tokens:Array<Token>, condition:string, value:boolean) {       
        let status = this._system.effectsByCondition().get(condition);
        if (status) {
            tokens.forEach(token => {
                if (token.owner) {
                    if (value !== true) {
                        if (this.has(token, status)) {
                            this.toggleEffect(token, status).then(() => {});
                        }
                    } else {
                        if (!this.has(token, status)) {
                            this.toggleEffect(token, status).then(() => {});
                        }
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
            let hidden = this._system.effectsByCondition().get('hidden');
            tokens.forEach(token => {    
                if (token.owner) {
                    let stealth;
                    if (value) {
                        stealth = value;
                    } else {
                        stealth = this._system.rollStealth(token).roll().total;
                    }
                    if (this.has(token, hidden) === true) {
                        const update = { 'conditional-visibility': {}};
                        update[Constants.MODULE_NAME]._ste = stealth;
                        token.update({flags: update });
                    } else {
                        if (!token.data) {
                            token.data = {};
                        }
                        if (!token.data.flags) {
                            token.data.flags = {};
                        }
                        if (!token.data.flags[Constants.MODULE_NAME]) {
                            token.data.flags[Constants.MODULE_NAME] = {};
                        }
                        token.data.flags[Constants.MODULE_NAME]._ste = stealth;
                        this.toggleEffect(token, hidden);
                    }
                }
            })
        }
    }

    /**
     * Removes the hide condition from the set of tokens.
     * @param tokens the list of tokens to affect
     */
    public unHide(tokens:Array<Token>) {
        if (this._system.hasStealth()) {
            let hidden = this._system.effectsByCondition().get('hidden');
            tokens.forEach(token => {
                if (token.owner) {
                    if (this.has(token, hidden)) {
                        this.toggleEffect(token, hidden);
                    }
                }
            })
        }
    }

    private toggleEffect(token, condition):Promise<any> {
        //@ts-ignore
        return token.toggleEffect(condition);
    }

    private has(token, condition):boolean {
        console.error("OKdddd");
            console.error(condition);
            let flags = token?.data?.flags?.[Constants.MODULE_NAME];
            if (flags) {
                return flags[condition.visibilityId] === true;
            } else {
                return false;
            }
    }
}