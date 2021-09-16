import { i18n, log, warn } from "../../conditional-visibility.js";
import { CONDITIONAL_VISIBILITY_DEFAULT_STEALTH, getCanvas, getGame, CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectSightFlags, StatusEffectStatusFlags, } from "../settings.js";
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
            await actor.setFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, status.visibilityId, true);
        }
    }
    async onDeleteEffect(effect, options, userId) {
        const status = this.getEffectByIcon(effect);
        if (status) {
            const actor = effect.parent;
            await actor.unsetFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, status.visibilityId, true);
        }
    }
    hasStatus(token, id) {
        return (token.actor?.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, id) === true ||
            token.document?.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, id) === true);
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
            id: CONDITIONAL_VISIBILITY_MODULE_NAME + '.invisible',
            visibilityId: StatusEffectStatusFlags.INVISIBLE,
            label: i18n(CONDITIONAL_VISIBILITY_MODULE_NAME + '.invisible'),
            icon: 'modules/' + CONDITIONAL_VISIBILITY_MODULE_NAME + '/icons/unknown.svg',
        }, {
            id: CONDITIONAL_VISIBILITY_MODULE_NAME + '.obscured',
            visibilityId: StatusEffectStatusFlags.OBSCURED,
            label: i18n(CONDITIONAL_VISIBILITY_MODULE_NAME + '.obscured'),
            icon: 'modules/' + CONDITIONAL_VISIBILITY_MODULE_NAME + '/icons/foggy.svg',
        }, {
            id: CONDITIONAL_VISIBILITY_MODULE_NAME + '.indarkness',
            visibilityId: StatusEffectStatusFlags.IN_DARKNESS,
            label: i18n(CONDITIONAL_VISIBILITY_MODULE_NAME + '.indarkness'),
            icon: 'modules/' + CONDITIONAL_VISIBILITY_MODULE_NAME + '/icons/moon.svg',
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
        log(' Initializing visibility system effects ' + this.gameSystemId() + ' for game system ' + getGame().system.id);
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
        const flags = new VisionCapabilities();
        let _seeinvisible = (srcToken?.data?.document?.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectSightFlags.SEE_INVISIBLE)) ?? 0; // 'seeinvisible'
        let _blindsight = (srcToken?.data?.document?.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectSightFlags.BLIND_SIGHT)) ?? 0; // 'blindsight'
        let _tremorsense = (srcToken?.data?.document?.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectSightFlags.TREMOR_SENSE)) ?? 0; // 'tremorsense'
        let _truesight = (srcToken?.data?.document?.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectSightFlags.TRUE_SIGHT)) ?? 0; // 'truesight'
        let _devilssight = (srcToken?.data?.document?.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectSightFlags.DEVILS_SIGHT)) ?? 0; // 'devilssight'
        _seeinvisible = _seeinvisible < 0 ? 100000 : _seeinvisible;
        _blindsight = _blindsight < 0 ? 100000 : _blindsight;
        _tremorsense = _tremorsense < 0 ? 100000 : _tremorsense;
        _truesight = _truesight < 0 ? 100000 : _truesight;
        _devilssight = _devilssight < 0 ? 100000 : _devilssight;
        flags.seeinvisible = Math.max(_seeinvisible, _blindsight, _tremorsense, _truesight, _devilssight);
        flags.seeobscured = Math.max(_blindsight, _tremorsense);
        flags.seeindarkness = Math.max(_blindsight, _devilssight, _tremorsense, _truesight);
        //@ts-ignore
        if (srcToken._movement !== null) {
            //@ts-ignore
            flags.visionfrom = srcToken._movement.B;
        }
        else {
            flags.visionfrom = srcToken?.position ?? { x: 0, y: 0 };
        }
        return flags;
    }
    /**
     * The base method comparing the capability flags from the sightLayer with the conditions of the token.
     * @param target the token whose visibility is being checked
     * @param flags the capabilities established by the sight layer
     */
    canSee(target, visionCapabilities) {
        let distance;
        //@ts-ignore
        if (target._movement !== null) {
            //@ts-ignore
            distance = this.distanceBeetweenTokens(visionCapabilities.visionfrom, target._movement.B);
        }
        else {
            distance = this.distanceBeetweenTokens(visionCapabilities.visionfrom, target.position);
        }
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
        return getCanvas().grid?.measureDistances([{ ray: segment }], { gridSpaces: true })[0] ?? 0;
    }
    /**
     * Tests whether a token is invisible, and if it can be seen.
     * @param target the token being seen (or not)
     * @param effects the effects of that token
     * @param visionCapabilities the sight capabilities of the sight layer
     */
    seeInvisible(target, visionCapabilities, distance) {
        const invisible = this.hasStatus(target, StatusEffectStatusFlags.INVISIBLE); // 'invisible'
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
        const obscured = this.hasStatus(target, StatusEffectStatusFlags.OBSCURED); // 'obscured'
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
        const indarkness = this.hasStatus(target, StatusEffectStatusFlags.IN_DARKNESS); //'indarkness'
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
    seeContested(target, visionCapabilities) {
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
            //@ts-ignore
            initialValue = parseInt(token.document.getFlag(CONDITIONAL_VISIBILITY_MODULE_NAME, StatusEffectSightFlags.PASSIVE_STEALTH));
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
                result = CONDITIONAL_VISIBILITY_DEFAULT_STEALTH;
            }
        }
        const content = await renderTemplate('modules/' + CONDITIONAL_VISIBILITY_MODULE_NAME + '/templates/stealth_hud.html', {
            initialValue: result,
        });
        return new Promise((resolve, reject) => {
            const hud = new Dialog({
                title: i18n(CONDITIONAL_VISIBILITY_MODULE_NAME + '.hidden'),
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
export class VisionCapabilities {
}
