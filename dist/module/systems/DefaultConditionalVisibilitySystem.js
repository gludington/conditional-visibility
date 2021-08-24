import { i18n, log, warn } from "../../conditional-visibility.js";
import { DEFAULT_STEALTH, getCanvas, getGame, MODULE_NAME } from "../settings.js";
// const MODULE_NAME = "conditional-visibility";
/**
 * The DefaultConditionalVisibilitySystem, to use when no visibility system can be found for the game system.
 */
export class DefaultConditionalVisibilitySystem {
    // hasStatus(token:Token, id:string, icon:string): boolean {
    //     return token.data.actorLink ? token.actor?.data?.flags?.[MODULE_NAME]?.[id] === true : token.data?.flags?.[MODULE_NAME]?.[id] === true;
    // }
    constructor() {
        //yes, this is a BiMap but the solid TS BiMap implementaiton is GPLv3, so we will just fake what we need here
        this._effectsByIcon = new Map();
        this._effectsByCondition = new Map();
        this.effects().forEach((statusEffect) => {
            this._effectsByIcon.set(statusEffect.icon, statusEffect);
            this._effectsByCondition.set(statusEffect.visibilityId, statusEffect);
        });
    }
    async onCreateEffect(effect, options, userId) {
        const status = this.getEffectByIcon(effect);
        if (status) {
            const actor = effect.parent;
            await actor.setFlag(MODULE_NAME, status.visibilityId, true);
        }
    }
    async onDeleteEffect(effect, options, userId) {
        const status = this.getEffectByIcon(effect);
        if (status) {
            const actor = effect.parent;
            await actor.unsetFlag(MODULE_NAME, status.visibilityId, true);
        }
    }
    hasStatus(token, id) {
        return token.actor?.getFlag(MODULE_NAME, id) === true || token.getFlag(MODULE_NAME, id) === true || token.document?.getFlag(MODULE_NAME, id) === true;
    }
    gameSystemId() {
        return 'default';
    }
    /**
     * Base effects are invisible, obscured, and indarkness
     */
    effects() {
        //return DefaultConditionalVisibilitySystem.BASE_EFFECTS;
        return new Array({
            id: MODULE_NAME + '.invisible',
            visibilityId: 'invisible',
            label: i18n(MODULE_NAME + '.invisible'),
            icon: 'modules/' + MODULE_NAME + '/icons/unknown.svg',
        }, {
            id: MODULE_NAME + '.obscured',
            visibilityId: 'obscured',
            label: i18n(MODULE_NAME + '.obscured'),
            icon: 'modules/' + MODULE_NAME + '/icons/foggy.svg',
        }, {
            id: MODULE_NAME + '.indarkness',
            visibilityId: 'indarkness',
            label: i18n(MODULE_NAME + '.indarkness'),
            icon: 'modules/' + MODULE_NAME + '/icons/moon.svg',
        });
    }
    effectsByIcon() {
        return this._effectsByIcon;
    }
    effectsByCondition() {
        return this._effectsByCondition;
    }
    effectsFromUpdate(update) {
        return update.actorData?.effects;
    }
    getEffectByIcon(effect) {
        if (!effect.data?.icon) {
            return this.effectsByIcon().get(effect.icon);
        }
        return this.effectsByIcon().get(effect.data?.icon);
    }
    initializeStatusEffects() {
        log(' Initializing visibility system effects ' +
            this.gameSystemId() +
            ' for game system ' +
            getGame().system.id);
        this.effectsByIcon().forEach((value, key) => {
            CONFIG.statusEffects.push({
                id: value.id,
                label: value.label,
                icon: value.icon,
            });
        });
    }
    /**
     * For subclasses to set up systsem specific hooks.
     * @todo unify initializeOnToggleEffect if possible
     */
    initializeHooks(facade) { }
    /**
     * Default system does not have any reaction to a condition change.  Subclasses override this to add behavior.
     * @param tokenHud the tokenHud to use
     */
    initializeOnToggleEffect(tokenHud) { }
    getVisionCapabilities(srcToken) {
        if (srcToken)
            //In case of sending an array only take the first element
            srcToken = srcToken instanceof Array ? srcToken[0] : srcToken;
        const flags = {};
        let _seeinvisible = srcToken?.data?.document?.getFlag(MODULE_NAME, 'seeinvisible') ?? 0;
        let _blindsight = srcToken?.data?.document?.getFlag(MODULE_NAME, 'blindsight') ?? 0;
        let _tremorsense = srcToken?.data?.document?.getFlag(MODULE_NAME, 'tremorsense') ?? 0;
        let _truesight = srcToken?.data?.document?.getFlag(MODULE_NAME, 'truesight') ?? 0;
        let _devilssight = srcToken?.data?.document?.getFlag(MODULE_NAME, 'devilssight') ?? 0;
        _seeinvisible = _seeinvisible < 0 ? 100000 : _seeinvisible;
        _blindsight = _blindsight < 0 ? 100000 : _blindsight;
        _tremorsense = _tremorsense < 0 ? 100000 : _tremorsense;
        _truesight = _truesight < 0 ? 100000 : _truesight;
        _devilssight = _devilssight < 0 ? 100000 : _devilssight;
        flags.seeinvisible = Math.max(_seeinvisible, _blindsight, _tremorsense, _truesight, _devilssight);
        flags.seeobscured = Math.max(_blindsight, _tremorsense);
        flags.seeindarkness = Math.max(_blindsight, _devilssight, _tremorsense, _truesight);
        flags.visionfrom = srcToken?.position ?? { x: 0, y: 0 };
        return flags;
    }
    /**
     * The base method comparing the capability flags from the sightLayer with the conditions of the token.
     * @param target the token whose visibility is being checked
     * @param flags the capabilities established by the sight layer
     */
    canSee(target, visionCapabilities) {
        const distance = this.distanceBeetweenTokens(visionCapabilities.visionfrom, target.position);
        if (this.seeInvisible(target, visionCapabilities, distance) === false) {
            return false;
        }
        if (this.seeObscured(target, visionCapabilities, distance) === false) {
            return false;
        }
        if (this.seeInDarkness(target, visionCapabilities, distance) === false) {
            return false;
        }
        if (this.seeContested(target, visionCapabilities) === false) {
            return false;
        }
        return true;
    }
    distanceBeetweenTokens(source, target) {
        const segment = new Ray(source, target);
        return getCanvas().grid?.measureDistances([{ ray: segment }], { gridSpaces: true });
    }
    /**
     * Tests whether a token is invisible, and if it can be seen.
     * @param target the token being seen (or not)
     * @param effects the effects of that token
     * @param visionCapabilities the sight capabilities of the sight layer
     */
    seeInvisible(target, visionCapabilities, distance) {
        const invisible = this.hasStatus(target, 'invisible');
        if (invisible === true) {
            if (visionCapabilities.seeinvisible > 0) {
                return visionCapabilities.seeinvisible >= distance;
            }
            return false;
        }
        return true;
    }
    /**
     * Tests whether a token is obscured, and if it can be seen.
     * @param target the token being seen (or not)
     * @param visionCapabilities the sight capabilities of the sight layer
     */
    seeObscured(target, visionCapabilities, distance) {
        const obscured = this.hasStatus(target, 'obscured');
        if (obscured === true) {
            if (visionCapabilities.seeobscured > 0) {
                return visionCapabilities.seeobscured >= distance;
            }
            return false;
        }
        return true;
    }
    /**
     * Tests whether a token is in darkness, and if it can be seen.
     * @param target the token being seen (or not)
     * @param effects the effects of that token
     * @param flags the sight capabilities of the sight layer
     */
    seeInDarkness(target, visionCapabilities, distance) {
        const indarkness = this.hasStatus(target, 'indarkness');
        if (indarkness === true) {
            if (visionCapabilities.seeindarkness > 0) {
                return visionCapabilities.seeindarkness >= distance;
            }
            return false;
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
    seeContested(target, flags) {
        return true;
    }
    hasStealth() {
        return false;
    }
    /**
     * Roll for the contested hiding check; override in subclass systems
     * @param token the token whose stats may create the roll.
     * @return a Roll
     */
    rollStealth(token) {
        return new Roll('1d20');
    }
    /**
     * Renders a dialog window pre-filled with the result of a system-dependent roll, which can be changed in an input field.  Subclasses can use this
     * as is, see ConditionalVisibilitySystem5e for an example
     * @param token the actor to whom this dialog refers
     * @returns a Promise<number> containing the value of the result, or -1 if unintelligble
     */
    async stealthHud(token) {
        let initialValue;
        try {
            initialValue = parseInt(token.data.flags[MODULE_NAME]._ste);
        }
        catch (err) {
            initialValue === undefined;
        }
        let result = initialValue;
        if (initialValue === undefined || isNaN(parseInt(initialValue))) {
            try {
                result = this.rollStealth(token).roll().total;
            }
            catch (err) {
                warn('Error rolling stealth, check formula for system');
                result = DEFAULT_STEALTH;
            }
        }
        const content = await renderTemplate('modules/' + MODULE_NAME + '/templates/stealth_hud.html', {
            initialValue: result,
        });
        return new Promise((resolve, reject) => {
            const hud = new Dialog({
                title: i18n(MODULE_NAME + '.hidden'),
                content: content,
                buttons: {
                    one: {
                        icon: '<i class="fas fa-check"></i>',
                        label: 'OK',
                        callback: (html) => {
                            //@ts-ignore
                            const val = parseInt(html.find('div.form-group').children()[1]?.value);
                            if (isNaN(val)) {
                                resolve(-1);
                            }
                            else {
                                resolve(val);
                            }
                        },
                    },
                },
                close: (html) => {
                    //@ts-ignore
                    const val = parseInt(html.find('div.form-group').children()[1]?.value);
                    if (isNaN(val)) {
                        resolve(-1);
                    }
                    else {
                        resolve(val);
                    }
                },
                default: '',
            });
            hud.render(true);
        });
    }
}
