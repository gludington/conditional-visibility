import API from './api';
import { AtcvEffectSenseFlags, AtcvEffectConditionFlags, SenseData, AtcvEffect } from './conditional-visibility-models';
import CONSTANTS from './constants';
import Effect from './effects/effect';
import { EffectSupport } from './effects/effect-support';
import {
  debug,
  duplicateExtended,
  i18n,
  i18nFormat,
  info,
  isStringEquals,
  mergeByProperty,
  retrieveEffectChangeDataFromEffect,
  warn,
} from './lib/lib';

/**
 * Defines all of the effect definitions
 */
export class ConditionalVisibilityEffectDefinitions {
  constructor() {}

  /**
   * Get all effects
   *
   * @returns {Effect[]} all the effects
   */
  static async all(distance = 0, visionLevel = 0): Promise<Effect[]> {
    const effects: Effect[] = [];

    // EffectDefinitions.shadowEffect(distance),

    // SENSES
    const blinded = ConditionalVisibilityEffectDefinitions.blinded(distance, visionLevel);
    if (blinded) {
      blinded.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(blinded);
      effects.push(blinded);
    }
    const blindsight = ConditionalVisibilityEffectDefinitions.blindsight(distance, visionLevel);
    if (blindsight) {
      blindsight.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(blindsight);
      effects.push(blindsight);
    }
    const darkvision = ConditionalVisibilityEffectDefinitions.darkvision(distance, visionLevel);
    if (darkvision) {
      darkvision.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(darkvision);
      effects.push(darkvision);
    }
    const devilssight = ConditionalVisibilityEffectDefinitions.devilssight(distance, visionLevel);
    if (devilssight) {
      devilssight.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(devilssight);
      effects.push(devilssight);
    }
    const lowlightvision = ConditionalVisibilityEffectDefinitions.lowlightvision(distance, visionLevel);
    if (lowlightvision) {
      lowlightvision.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(lowlightvision);
      effects.push(lowlightvision);
    }
    const seeinvisible = ConditionalVisibilityEffectDefinitions.seeinvisible(distance, visionLevel);
    if (seeinvisible) {
      seeinvisible.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(seeinvisible);
      effects.push(seeinvisible);
    }
    const tremorsense = ConditionalVisibilityEffectDefinitions.tremorsense(distance, visionLevel);
    if (tremorsense) {
      tremorsense.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(tremorsense);
      effects.push(tremorsense);
    }
    const truesight = ConditionalVisibilityEffectDefinitions.truesight(distance, visionLevel);
    if (truesight) {
      truesight.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(truesight);
      effects.push(truesight);
    }
    // CONDITIONS
    const stealthed = ConditionalVisibilityEffectDefinitions.stealthed(visionLevel);
    if (stealthed) {
      stealthed.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(stealthed);
      effects.push(stealthed);
    }
    const hidden = ConditionalVisibilityEffectDefinitions.hidden(visionLevel);
    if (hidden) {
      hidden.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(hidden);
      effects.push(hidden);
    }
    const invisible = ConditionalVisibilityEffectDefinitions.invisible(visionLevel);
    if (invisible) {
      invisible.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(invisible);
      effects.push(invisible);
    }
    const obscured = ConditionalVisibilityEffectDefinitions.obscured(visionLevel);
    if (obscured) {
      obscured.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(obscured);
      effects.push(obscured);
    }
    const indarkness = ConditionalVisibilityEffectDefinitions.indarkness(visionLevel);
    if (indarkness) {
      indarkness.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(indarkness);
      effects.push(indarkness);
    }

    for (const effectExternal of API.EFFECTS) {
      let effectFounded = <Effect>effects.find((effect: Effect) => {
        return (
          isStringEquals(effect.name, effectExternal.name) || isStringEquals(effect.customId, effectExternal.customId)
        );
      });
      if (!effectFounded && effectExternal) {
        // Before launch error check dfred effects
        // Check for dfred convenient effect and retrieve the effect with the specific name
        // https://github.com/DFreds/dfreds-convenient-effects/issues/110
        //@ts-ignore
        if (game.modules.get('dfreds-convenient-effects')?.active && game.dfreds && game.dfreds.effectInterface) {
          let changesTmp: any[] = [];
          let effectToFoundByName = i18n(effectExternal.name);
          if (!effectToFoundByName.endsWith('(CV)')) {
            effectToFoundByName = effectToFoundByName + ' (CV)';
          }
          //@ts-ignore
          const dfredEffect = <Effect>await game.dfreds.effectInterface.findCustomEffectByName(effectToFoundByName);
          if (dfredEffect) {
            if (game.user?.isGM) {
              info(
                `ATTENTION the module 'DFreds Convenient Effects' has a effect with name '${effectToFoundByName}', so we use that, edit that effect if you want to apply a customize solution`,
              );
            }
            let foundedFlagVisionValue = false;
            if (!dfredEffect.atcvChanges) {
              dfredEffect.atcvChanges = [];
            }
            /*
            changesTmp = EffectSupport._handleIntegrations(dfredEffect);
            changesTmp = changesTmp.filter((c) => !c.key.startsWith(`data.`));
            if (distance && distance > 0) {
              changesTmp.push({
                key: 'ATCV.conditionDistance',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: `${distance}`,
                priority: 5,
              });
            }
            */
            changesTmp = retrieveEffectChangeDataFromEffect(dfredEffect);
            changesTmp = changesTmp.filter((c) => !c.key.startsWith(`data.`));
            for (const obj of changesTmp) {
              if (obj.key === 'ATCV.' + effectExternal.customId && obj.value != String(visionLevel)) {
                obj.value = String(visionLevel);
                foundedFlagVisionValue = true;
                break;
              }
            }
            if (!foundedFlagVisionValue) {
              for (const obj of changesTmp) {
                if (obj.key === 'ATCV.' + effectExternal.customId && obj.value != String(visionLevel)) {
                  obj.value = String(visionLevel);
                  foundedFlagVisionValue = true;
                  break;
                }
              }
            }
            if (!foundedFlagVisionValue) {
              changesTmp.push(<any>{
                key: 'ATCV.' + effectExternal.customId,
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: String(visionLevel),
                priority: 5,
              });
            }
            let foundedFlagVisionType = false;
            for (const obj of changesTmp) {
              if (obj.key === 'ATCV.conditionType' && obj.value) {
                foundedFlagVisionType = true;
                break;
              }
            }
            if (!foundedFlagVisionType) {
              changesTmp.push({
                key: 'ATCV.conditionType',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: 'sense',
                priority: 5,
              });
            }
            effectFounded = <Effect>duplicateExtended(dfredEffect);
            if (!effectFounded.name.endsWith('(CV)')) {
              effectFounded.name = effectFounded.name + ' (CV)';
            }
            if (effectFounded) {
              effectFounded.changes = duplicateExtended(changesTmp);
            } else {
              warn(`Found dfred active effect  ${effectToFoundByName} but can't clone...`);
            }
          }
        }
        if (effectFounded) {
          effects.push(effectFounded);
        } else {
          effects.push(effectExternal);
        }
      }
    }
    return effects;
  }

  static async effect(nameOrCustomId: string, distance = 0, visionLevel = 0): Promise<Effect | undefined> {
    const effectsToCheck = await ConditionalVisibilityEffectDefinitions.all(distance, visionLevel);
    const effect = effectsToCheck.find((effect: Effect) => {
      return isStringEquals(effect.name, nameOrCustomId) || isStringEquals(effect.customId, nameOrCustomId);
    });
    if (!effect) {
      warn(`Not founded effect with name ${nameOrCustomId}`, true);
      return undefined;
    }
    //const senses = await API.getAllDefaultSensesAndConditions();
    let allSensesAndConditions: SenseData[] = [];
    const senses = API.SENSES;
    const conditions = API.CONDITIONS;
    allSensesAndConditions = mergeByProperty(allSensesAndConditions, senses, 'id');
    allSensesAndConditions = mergeByProperty(allSensesAndConditions, conditions, 'id');
    let effectFounded: Effect | undefined = undefined;
    for (const senseData of allSensesAndConditions) {
      if (isStringEquals(effect?.customId, senseData.id) || isStringEquals(effect.name, senseData.name)) {
        effectFounded = effect;
        break;
      }
    }
    return effectFounded;
  }

  // ===========================================
  // The source effect
  // =============================================

  static darkvision(number: number, visionLevel) {
    const effectSight = API.SENSES.find((a: SenseData) => {
      return isStringEquals(a.id, AtcvEffectSenseFlags.DARKVISION);
    });
    if (!effectSight) {
      debug(
        `Cannot find for system '${game.system.id}' the active effect with id '${AtcvEffectSenseFlags.DARKVISION}'`,
      );
      return;
    }
    return new Effect({
      customId: AtcvEffectSenseFlags.DARKVISION,
      name:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.darkvision.name2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.darkvision.name`),
      description:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.darkvision.description2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.darkvision.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/evil-eye-red-1.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      changes: [
        // {
        //   key: 'ATCV.conditionPath',
        //   mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
        //   value: number && number > 0 ? `${number}` : `${effectSight.path}`,
        //   priority: 5,
        // },
      ],
      atlChanges: [
        {
          key: ConditionalVisibilityEffectDefinitions._createAtlEffectKey('ATL.light.dim'),
          mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
          value: `${number}`,
          priority: 5,
        },
      ],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectSenseFlags.DARKVISION,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${visionLevel}`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `sense`,
          priority: 5,
        },
      ],
      isTemporary: false,
    });
  }

  static blindsight(number: number, visionLevel) {
    const effectSight = API.SENSES.find((a: SenseData) => {
      return isStringEquals(a.id, AtcvEffectSenseFlags.BLIND_SIGHT);
    });
    if (!effectSight) {
      debug(
        `Cannot find for system '${game.system.id}' the active effect with id '${AtcvEffectSenseFlags.BLIND_SIGHT}'`,
      );
      return;
    }
    return new Effect({
      customId: AtcvEffectSenseFlags.BLIND_SIGHT,
      name:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.blindsight.name2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.blindsight.name`),
      description:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.blindsight.description2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.blindsight.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/green_18.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      changes: [
        // {
        //   key: 'ATCV.conditionPath',
        //   mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
        //   value: number && number > 0 ? `${number}` : `${effectSight.path}`,
        //   priority: 5,
        // },
      ],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectSenseFlags.BLIND_SIGHT,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${visionLevel}`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `sense`,
          priority: 5,
        },
      ],
      isTemporary: false,
    });
  }

  static tremorsense(number: number, visionLevel) {
    const effectSight = API.SENSES.find((a: SenseData) => {
      return isStringEquals(a.id, AtcvEffectSenseFlags.TREMOR_SENSE);
    });
    if (!effectSight) {
      debug(
        `Cannot find for system '${game.system.id}' the active effect with id '${AtcvEffectSenseFlags.TREMOR_SENSE}'`,
      );
      return;
    }
    return new Effect({
      customId: AtcvEffectSenseFlags.TREMOR_SENSE,
      name:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.tremorsense.name2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.tremorsense.name`),
      description:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.tremorsense.description2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.tremorsense.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/ice_15.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      changes: [
        // {
        //   key: 'ATCV.conditionPath',
        //   mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
        //   value: number && number > 0 ? `${number}` : `${effectSight.path}`,
        //   priority: 5,
        // },
      ],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectSenseFlags.TREMOR_SENSE,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${visionLevel}`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `sense`,
          priority: 5,
        },
      ],
      isTemporary: false,
    });
  }

  static truesight(number, visionLevel) {
    const effectSight = API.SENSES.find((a: SenseData) => {
      return isStringEquals(a.id, AtcvEffectSenseFlags.TRUE_SIGHT);
    });
    if (!effectSight) {
      debug(
        `Cannot find for system '${game.system.id}' the active effect with id '${AtcvEffectSenseFlags.TRUE_SIGHT}'`,
      );
      return;
    }
    return new Effect({
      customId: AtcvEffectSenseFlags.TRUE_SIGHT,
      name:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.truesight.name2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.truesight.name`),
      description:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.truesight.description2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.truesight.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/emerald_11.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      changes: [
        // {
        //   key: 'ATCV.conditionPath',
        //   mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
        //   value: number && number > 0 ? `${number}` : `${effectSight.path}`,
        //   priority: 5,
        // },
      ],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectSenseFlags.TRUE_SIGHT,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${visionLevel}`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `sense`,
          priority: 5,
        },
      ],
      isTemporary: false,
    });
  }

  static seeinvisible(number, visionLevel) {
    const effectSight = API.SENSES.find((a: SenseData) => {
      return isStringEquals(a.id, AtcvEffectSenseFlags.SEE_INVISIBLE);
    });
    if (!effectSight) {
      debug(
        `Cannot find for system '${game.system.id}' the active effect with id '${AtcvEffectSenseFlags.SEE_INVISIBLE}'`,
      );
      return;
    }
    return new Effect({
      customId: AtcvEffectSenseFlags.SEE_INVISIBLE,
      name:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.seeinvisible.name2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.seeinvisible.name`),
      description:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.seeinvisible.description2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.seeinvisible.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/shadow_11.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      changes: [
        // {
        //   key: 'ATCV.conditionPath',
        //   mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
        //   value: number && number > 0 ? `${number}` : `${effectSight.path}`,
        //   priority: 5,
        // },
      ],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectSenseFlags.SEE_INVISIBLE,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${visionLevel}`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `sense`,
          priority: 5,
        },
      ],
      isTemporary: false,
    });
  }

  static devilssight(number, visionLevel) {
    const effectSight = API.SENSES.find((a: SenseData) => {
      return isStringEquals(a.id, AtcvEffectSenseFlags.DEVILS_SIGHT);
    });
    if (!effectSight) {
      debug(
        `Cannot find for system '${game.system.id}' the active effect with id '${AtcvEffectSenseFlags.DEVILS_SIGHT}'`,
      );
      return;
    }
    return new Effect({
      customId: AtcvEffectSenseFlags.DEVILS_SIGHT,
      name:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.devilssight.name2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.devilssight.name`),
      description:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.devilssight.description2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.devilssight.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/blue_17.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      changes: [
        // {
        //   key: 'ATCV.conditionPath',
        //   mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
        //   value: number && number > 0 ? `${number}` : `${effectSight.path}`,
        //   priority: 5,
        // },
      ],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectSenseFlags.DEVILS_SIGHT,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${visionLevel}`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `sense`,
          priority: 5,
        },
      ],
      isTemporary: false,
    });
  }

  static lowlightvision(number, visionLevel) {
    const effectSight = API.SENSES.find((a: SenseData) => {
      return isStringEquals(a.id, AtcvEffectSenseFlags.LOW_LIGHT_VISION);
    });
    if (!effectSight) {
      debug(
        `Cannot find for system '${game.system.id}' the active effect with id '${AtcvEffectSenseFlags.LOW_LIGHT_VISION}'`,
      );
      return;
    }
    return new Effect({
      customId: AtcvEffectSenseFlags.LOW_LIGHT_VISION,
      name:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.lowlightvision.name2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.lowlightvision.name`),
      description:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.lowlightvision.description2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.lowlightvision.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/violet_09.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      changes: [
        // {
        //   key: 'ATCV.conditionPath',
        //   mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
        //   value: number && number > 0 ? `${number}` : `${effectSight.path}`,
        //   priority: 5,
        // },
      ],
      atlChanges: [
        // {
        //   key: EffectDefinitions._createAtlEffectKey('ATL.light.dim'),
        //   mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
        //   value: `data.token.dimSight`,
        //   priority: 5,
        // },
        {
          key: ConditionalVisibilityEffectDefinitions._createAtlEffectKey('ATL.light.bright'),
          mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
          value: `data.token.dimSight`,
          priority: 5,
        },
      ],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectSenseFlags.LOW_LIGHT_VISION,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${visionLevel}`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `sense`,
          priority: 5,
        },
      ],
      isTemporary: false,
    });
  }

  static blinded(number, visionLevel) {
    const effectSight = API.SENSES.find((a: SenseData) => {
      return isStringEquals(a.id, AtcvEffectSenseFlags.BLINDED);
    });
    if (!effectSight) {
      debug(`Cannot find for system '${game.system.id}' the active effect with id '${AtcvEffectSenseFlags.BLINDED}'`);
      return;
    }
    return new Effect({
      customId: AtcvEffectSenseFlags.BLINDED,
      name:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.blinded.name2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.blinded.name`),
      description:
        number && number > 0
          ? i18nFormat(`${CONSTANTS.MODULE_NAME}.effects.blinded.description2`, { number: number })
          : i18n(`${CONSTANTS.MODULE_NAME}.effects.blinded.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/affliction_24.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      changes: [],
      atlChanges: [
        {
          key: ConditionalVisibilityEffectDefinitions._createAtlEffectKey('ATL.light.dim'),
          mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
          value: `0`,
          priority: 5,
        },
        {
          key: ConditionalVisibilityEffectDefinitions._createAtlEffectKey('ATL.light.bright'),
          mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
          value: `0`,
          priority: 5,
        },
        {
          key: ConditionalVisibilityEffectDefinitions._createAtlEffectKey('ATL.light.animation'),
          mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
          value: '{ "type":"none"}',
          priority: 5,
        },
      ],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectSenseFlags.BLINDED,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${visionLevel}`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `sense`,
          priority: 5,
        },
      ],
      isTemporary: false,
    });
  }

  // =================================================
  // The target effect
  // =================================================

  static hidden(visionLevel = 0) {
    const effectSight = API.CONDITIONS.find((a: SenseData) => {
      return isStringEquals(a.id, AtcvEffectConditionFlags.HIDDEN);
    });
    if (!effectSight) {
      debug(`Cannot find for system '${game.system.id}' the status with id '${AtcvEffectConditionFlags.HIDDEN}'`);
      return;
    }
    return new Effect({
      customId: AtcvEffectConditionFlags.HIDDEN,
      name: i18n(`${CONSTANTS.MODULE_NAME}.effects.hidden.name`),
      description: i18n(`${CONSTANTS.MODULE_NAME}.effects.hidden.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/hidden.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      changes: [],
      atlChanges: [],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectConditionFlags.HIDDEN,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${visionLevel}`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `condition`,
          priority: 5,
        },
      ],
      isTemporary: true,
    });
  }

  static invisible(visionLevel = 0) {
    const effectSight = API.CONDITIONS.find((a: SenseData) => {
      return isStringEquals(a.id, AtcvEffectConditionFlags.INVISIBLE);
    });
    if (!effectSight) {
      debug(`Cannot find for system '${game.system.id}' the status with id '${AtcvEffectConditionFlags.INVISIBLE}'`);
      return;
    }
    return new Effect({
      customId: AtcvEffectConditionFlags.INVISIBLE,
      name: i18n(`${CONSTANTS.MODULE_NAME}.effects.invisible.name`),
      description: i18n(`${CONSTANTS.MODULE_NAME}.effects.invisible.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/invisible.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      changes: [],
      atlChanges: [],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectConditionFlags.INVISIBLE,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${visionLevel}`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `condition`,
          priority: 5,
        },
      ],
      isTemporary: true,
    });
  }

  static obscured(visionLevel = 0) {
    const effectSight = API.CONDITIONS.find((a: SenseData) => {
      return isStringEquals(a.id, AtcvEffectConditionFlags.OBSCURED);
    });
    if (!effectSight) {
      debug(`Cannot find for system '${game.system.id}' the status with id '${AtcvEffectConditionFlags.OBSCURED}'`);
      return;
    }
    return new Effect({
      customId: AtcvEffectConditionFlags.OBSCURED,
      name: i18n(`${CONSTANTS.MODULE_NAME}.effects.obscured.name`),
      description: i18n(`${CONSTANTS.MODULE_NAME}.effects.obscured.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/obscured.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      changes: [],
      atlChanges: [],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectConditionFlags.OBSCURED,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${visionLevel}`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `condition`,
          priority: 5,
        },
      ],
      isTemporary: true,
    });
  }

  static indarkness(visionLevel = 0) {
    const effectSight = API.CONDITIONS.find((a: SenseData) => {
      return isStringEquals(a.id, AtcvEffectConditionFlags.IN_DARKNESS);
    });
    if (!effectSight) {
      debug(`Cannot find for system '${game.system.id}' the status with id '${AtcvEffectConditionFlags.IN_DARKNESS}'`);
      return;
    }
    return new Effect({
      customId: AtcvEffectConditionFlags.IN_DARKNESS,
      name: i18n(`${CONSTANTS.MODULE_NAME}.effects.indarkness.name`),
      description: i18n(`${CONSTANTS.MODULE_NAME}.effects.indarkness.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/indarkness.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      changes: [],
      atlChanges: [],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectConditionFlags.IN_DARKNESS,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${visionLevel}`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `condition`,
          priority: 5,
        },
      ],
      isTemporary: true,
    });
  }

  static stealthed(visionLevel: number) {
    return new Effect({
      customId: AtcvEffectConditionFlags.STEALTHED,
      name: i18n(`${CONSTANTS.MODULE_NAME}.effects.stealthed.name`),
      description: i18n(`${CONSTANTS.MODULE_NAME}.effects.stealthed.description`),
      icon: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/blue_35.jpg`,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      changes: [],
      atlChanges: [],
      atcvChanges: [
        {
          key: 'ATCV.' + AtcvEffectConditionFlags.STEALTHED,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: visionLevel != 0 ? `${visionLevel}` : API.STEALTH_PASSIVE_SKILL, //`data.skills.ste.passive`,
          priority: 5,
        },
        {
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `condition`,
          priority: 5,
        },
      ],
      isTemporary: true,
    });
  }

  // ===========================================
  // Utility Effect
  // =============================================

  static _createAtlEffectKey(key) {
    let result = key;
    //@ts-ignore
    const version = (game.version ?? game.data.version).charAt(0);

    if (version == '9') {
      switch (key) {
        case 'ATL.preset':
          break;
        case 'ATL.brightSight':
          break;
        case 'ATL.light.dim':
          break;
        case 'ATL.height':
          break;
        case 'ATl.img':
          break;
        case 'ATL.mirrorX':
          break;
        case 'ATL.mirrorY':
          break;
        case 'ATL.rotation':
          break;
        case 'ATL.scale':
          break;
        case 'ATL.width':
          break;
        case 'ATL.dimLight':
          result = 'ATL.light.dim';
          break;
        case 'ATL.brightLight':
          result = 'ATL.light.bright';
          break;
        case 'ATL.lightAnimation':
          result = 'ATL.light.animation';
          break;
        case 'ATL.lightColor':
          result = 'ATL.light.color';
          break;
        case 'ATL.lightAlpha':
          result = 'ATL.light.alpha';
          break;
        case 'ATL.lightAngle':
          result = 'ATL.light.angle';
          break;
      }
    }
    return result;
  }

  // /**
  //  * This also includes automatic shadow creation for token elevation.
  //  * This section requires Token Magic Fx to function.
  //  * Changing the elevation of a token over 5ft will automatically set a shadow effect "below" the token,
  //  * this is change in distance based on the elevation value.
  //  * @param tokenInstance
  //  * @param elevation
  //  */
  // static async shadowEffect(tokenInstance: Token) {
  //   //const elevation: number = getProperty(tokenInstance.data, 'elevation');
  //   const elevation: number = getElevationToken(tokenInstance);
  //   //const tokenInstance = canvas.tokens?.get(tokenID);
  //   const tokenMagicEffectId = CONSTANTS.MODULE_NAME + '-Shadows';
  //   const twist = {
  //     filterType: 'transform',
  //     filterId: tokenMagicEffectId,
  //     twRadiusPercent: 100,
  //     padding: 10,
  //     animated: {
  //       twRotation: {
  //         animType: 'sinOscillation',
  //         val1: -(elevation / 10),
  //         val2: +(elevation / 10),
  //         loopDuration: 5000,
  //       },
  //     },
  //   };
  //   const shadow = {
  //     filterType: 'shadow',
  //     filterId: tokenMagicEffectId,
  //     rotation: 35,
  //     blur: 2,
  //     quality: 5,
  //     distance: elevation * 1.5,
  //     alpha: Math.min(1 / ((elevation - 10) / 10), 0.7),
  //     padding: 10,
  //     shadowOnly: false,
  //     color: 0x000000,
  //     zOrder: 6000,
  //     animated: {
  //       blur: {
  //         active: true,
  //         loopDuration: 5000,
  //         animType: 'syncCosOscillation',
  //         val1: 2,
  //         val2: 2.5,
  //       },
  //       rotation: {
  //         active: true,
  //         loopDuration: 5000,
  //         animType: 'syncSinOscillation',
  //         val1: 33,
  //         val2: 33 + elevation * 0.8,
  //       },
  //     },
  //   };
  //   //const shadowSetting = game.settings.get('condition-automation', 'shadows');
  //   // let params = [shadow];
  //   //if (shadowSetting === 'bulge'){
  //   // params = [shadow, twist];
  //   //}
  //   const params = [shadow, twist];
  //   const filter = elevation > 5 ? true : false;
  //   //@ts-ignore
  //   await tokenInstance.TMFXdeleteFilters(tokenMagicEffectId);
  //   if (filter) {
  //     //@ts-ignore
  //     await TokenMagic.addUpdateFilters(tokenInstance, params);
  //   }
  // }
}
