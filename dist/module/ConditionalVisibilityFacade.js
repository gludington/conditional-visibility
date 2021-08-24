import { log } from "../conditional-visibility.js";
import { getGame, MODULE_NAME } from "./settings.js";
/**
 * A class to expose macro-friendly messages on the window object.
 */
export class ConditionalVisibilityFacadeImpl {
    constructor(mod, system) {
        this._mod = mod;
        this._system = system;
        this.toggleEffect = (token, condition) => {
            return token.toggleEffect(condition);
        };
    }
    help() {
        if (getGame().user?.isGM) {
            const conditions = [];
            this._system.effectsByCondition().forEach((value, key) => {
                conditions.push({ name: key, icon: value.icon });
            });
            renderTemplate('modules/' + MODULE_NAME + '/templates/help_dialog.html', {
                gamesystem: getGame().system.id,
                hasStealth: this._system.hasStealth(),
                autoStealth: getGame().settings.get(MODULE_NAME, 'autoStealth'),
                conditions: conditions,
            }).then((content) => {
                const d = new Dialog({
                    title: 'Conditional Visibility',
                    content: content,
                    buttons: {},
                    close: () => log('This always is logged no matter which option is chosen'),
                    default: '',
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
    setCondition(tokens, condition, value) {
        const status = this._system.effectsByCondition().get(condition);
        if (status) {
            const guard = new Map();
            tokens.forEach((token) => {
                if (token.owner) {
                    if (!this.actorAlreadyAdjusted(token, guard)) {
                        if (value !== true) {
                            if (this.has(token, status)) {
                                this.toggleEffect(token, status).then(() => { });
                            }
                        }
                        else {
                            if (!this.has(token, status)) {
                                this.toggleEffect(token, status).then(() => { });
                            }
                        }
                    }
                }
            });
        }
    }
    /**
     * Toggle a condition on a set of tokens.
     * @param tokens the tokens to affect
     * @param condition the string condition
     */
    toggleCondition(tokens, condition) {
        const status = this._system.effectsByCondition().get(condition);
        if (status) {
            const guard = new Map();
            tokens.forEach((token) => {
                if (token.owner) {
                    if (!this.actorAlreadyAdjusted(token, guard)) {
                        this.toggleEffect(token, status).then(() => { });
                    }
                }
            });
        }
    }
    actorAlreadyAdjusted(token, guard) {
        if (token.data.actorLink === true) {
            const actorId = token?.actor?.data?._id;
            if (actorId) {
                if (guard.has(actorId)) {
                    return true;
                }
                guard.set(actorId, true);
                return false;
            }
        }
        return false;
    }
    /**
     * Set the hide condition on the token, if the system supports it.
     * @param tokens the list of tokens to affect.
     * @param value an optional numeric value to set for all tokens.  If unsupplied, will roll the ability the system defines.
     */
    hide(tokens, value) {
        if (!this._system.hasStealth()) {
            ui.notifications?.error(getGame().i18n.format('conditional-visibility.stealth.not.supported', { sysid: getGame().system.id }));
            return;
        }
        if (this._system.effectsByCondition().has('hidden')) {
            const hidden = this._system.effectsByCondition().get('hidden');
            const guard = new Map();
            tokens.forEach((token) => {
                if (token.owner) {
                    if (!this.actorAlreadyAdjusted(token, guard)) {
                        let stealth;
                        if (value) {
                            stealth = value;
                        }
                        else {
                            stealth = this._system.rollStealth(token).roll().total;
                        }
                        const tokenActor = token.document.actor;
                        if (this.has(token, hidden) === true) {
                            const update = { 'conditional-visibility': {} };
                            update[MODULE_NAME]['_ste'] = stealth;
                            tokenActor.update({ flags: update });
                        }
                        else {
                            if (!tokenActor.data.flags) {
                                tokenActor.data.flags = {};
                            }
                            if (!tokenActor.data.flags[MODULE_NAME]) {
                                tokenActor.data.flags[MODULE_NAME] = {};
                            }
                            tokenActor.setFlag(MODULE_NAME, '_ste', stealth);
                            this.toggleEffect(token, hidden);
                        }
                    }
                }
            });
        }
    }
    /**
     * Removes the hide condition from the set of tokens.
     * @param tokens the list of tokens to affect
     */
    unHide(tokens) {
        if (this._system.hasStealth()) {
            const hidden = this._system.effectsByCondition().get('hidden');
            const guard = new Map();
            tokens.forEach((token) => {
                if (token.owner) {
                    if (!this.actorAlreadyAdjusted(token, guard)) {
                        if (this.has(token, hidden)) {
                            this.toggleEffect(token, hidden);
                        }
                    }
                }
            });
        }
    }
    /**
     * Toggle the hidden condition on systems that support it.
     * @param tokens the tokens to hide/unhide
     * @param value the optional value to use when hiding.  If ommitted, will roll stealth
     */
    toggleHide(tokens, value) {
        if (this._system.hasStealth()) {
            const hidden = this._system.effectsByCondition().get('hidden');
            const guard = new Map();
            tokens.forEach((token) => {
                if (token.owner) {
                    if (!this.actorAlreadyAdjusted(token, guard)) {
                        let stealth;
                        if (value) {
                            stealth = value;
                        }
                        else {
                            stealth = this._system.rollStealth(token).roll().total;
                        }
                        if (this.has(token, hidden) === true) {
                            this.toggleEffect(token, hidden);
                        }
                        else {
                            const tokenActor = token.document.actor;
                            if (!tokenActor.data.flags) {
                                tokenActor.data.flags = {};
                            }
                            if (!tokenActor.data.flags[MODULE_NAME]) {
                                tokenActor.data.flags[MODULE_NAME] = {};
                            }
                            tokenActor.setFlag(MODULE_NAME, '_ste', stealth);
                            this.toggleEffect(token, hidden);
                        }
                    }
                }
            });
        }
    }
    toggleEffect(token, condition) {
        return token.toggleEffect(condition);
    }
    has(token, condition) {
        const flags = token.data.actorLink ? token.actor?.data?.flags?.[MODULE_NAME] : token?.data?.flags?.[MODULE_NAME];
        if (flags) {
            return flags[condition.visibilityId] === true;
        }
        else {
            return false;
        }
    }
}
