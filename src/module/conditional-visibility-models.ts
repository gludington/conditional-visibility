import type { EffectChangeData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData';
import API from './api';
import CONSTANTS from './constants';
import Effect from './effects/effect';
import { EffectSupport } from './effects/effect-support';
import {
  error,
  getSensesFromToken,
  getConditionsFromToken,
  i18n,
  retrieveAtcvEffectFromActiveEffect,
  isStringEquals,
  duplicateExtended,
  warn,
  retrieveAtcvVisionLevelKeyFromChanges,
} from './lib/lib';
export class AtcvEffect {
  // Effect Base
  visionId: string;
  visionName: string;
  visionPath: string;
  visionIcon: string;

  // Effect changes
  // statusSight: SenseData | undefined;
  visionLevelValue: number | undefined;
  visionElevation: boolean;
  visionTargets: string[];
  visionSources: string[];
  visionTargetImage: string;
  visionSourceImage: string;
  visionDistanceValue: number | undefined;
  visionType: string;
  visionIsDisabled: boolean;

  visionBlinded: boolean;
  visionBlindedOverride: boolean;

  static fromSenseData(senseData: SenseData, visionLevelValue: number, isDisabled = false) {
    const res = new AtcvEffect();
    res.visionId = senseData.id;
    res.visionName = i18n(senseData.name);

    let isSense = false;
    if (senseData.conditionType === 'sense') {
      isSense = true;
    } else if (senseData.conditionType === 'condition') {
      isSense = false;
    } else {
      isSense = !!API.SENSES.find((senseData) => {
        return isStringEquals(senseData.id, res.visionId) || isStringEquals(senseData.name, res.visionName);
      });
    }

    res.visionPath = senseData.path;
    res.visionIcon = senseData.img;

    res.visionLevelValue = visionLevelValue ?? 0;
    res.visionElevation = senseData.conditionElevation;
    res.visionTargets = senseData.conditionTargets;
    res.visionSources = senseData.conditionSources;
    res.visionTargetImage = senseData.conditionTargetImage;
    res.visionSourceImage = senseData.conditionSourceImage;
    res.visionDistanceValue = senseData.conditionDistance;
    res.visionType = senseData.conditionType ? senseData.conditionType : isSense ? 'sense' : 'condition';
    res.visionIsDisabled = String(isDisabled) === 'true' ? true : false;
    res.visionBlinded = String(senseData.conditionBlinded) === 'true' ? true : false;
    res.visionBlindedOverride = String(senseData.conditionBlindedOverride) === 'true' ? true : false;
    return res;
  }

  static mergeWithSensedataDefault(res: AtcvEffect): AtcvEffect {
    const allSensesAndConditionsData: SenseData[] = [];
    allSensesAndConditionsData.push(...API.SENSES);
    allSensesAndConditionsData.push(...API.CONDITIONS);
    const senseData = allSensesAndConditionsData.find((senseData) => {
      return isStringEquals(senseData.id, res.visionId) || isStringEquals(senseData.name, res.visionName);
    });
    if (!senseData) {
      return res;
    }

    if (!res.visionId) {
      res.visionId = senseData.id;
    }
    if (!res.visionName) {
      res.visionName = i18n(senseData.name);
    }
    if (!res.visionPath) {
      res.visionPath = senseData.path;
    }
    if (!res.visionIcon) {
      res.visionIcon = senseData.img;
    }
    // if(!res.visionLevelValue){
    //   res.visionLevelValue = visionLevelValue;
    // }
    if (!res.visionElevation) {
      res.visionElevation = senseData.conditionElevation;
    }
    if (!res.visionTargets) {
      res.visionTargets = senseData.conditionTargets;
    }
    if (!res.visionSources) {
      res.visionSources = senseData.conditionSources;
    }
    if (!res.visionTargetImage) {
      res.visionTargetImage = senseData.conditionTargetImage;
    }
    if (!res.visionSourceImage) {
      res.visionSourceImage = senseData.conditionSourceImage;
    }
    if (!res.visionDistanceValue) {
      res.visionDistanceValue = senseData.conditionDistance;
    }
    // if(!res.visionType){
    //   res.visionType = isSense ? 'sense' : 'condition';
    // }
    // if(!res.visionIsDisabled){
    //   res.visionIsDisabled = String(IsDisabled) === 'true' ? true : false;
    // }
    if (!res.visionBlinded) {
      res.visionBlinded = senseData.conditionBlinded;
    }
    if (!res.visionBlindedOverride) {
      res.visionBlindedOverride = senseData.conditionBlindedOverride;
    }
    return res;
  }

  static retrieveAtcvChangesFromEffect(res: Effect): EffectChangeData[] {
    const allSensesAndConditionsData: SenseData[] = [];
    allSensesAndConditionsData.push(...API.SENSES);
    allSensesAndConditionsData.push(...API.CONDITIONS);
    const senseData = allSensesAndConditionsData.find((senseData) => {
      return (
        isStringEquals(senseData.id, retrieveAtcvVisionLevelKeyFromChanges(res.changes)) ||
        isStringEquals(senseData.id, res.customId) ||
        isStringEquals(senseData.name, res.name)
      );
    });
    if (!senseData) {
      return res.atcvChanges;
    }

    const atcvChanges: any[] = [];
    atcvChanges.push(...res.atcvChanges);

    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionElevation')).length <= 0) {
      if (senseData.conditionElevation) {
        atcvChanges.push({
          key: 'ATCV.conditionElevation',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionElevation}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionDistance')).length <= 0) {
      if (senseData.conditionDistance) {
        atcvChanges.push({
          key: 'ATCV.conditionDistance',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionDistance}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionTargets')).length <= 0) {
      if (senseData.conditionTargets) {
        atcvChanges.push({
          key: 'ATCV.conditionTargets',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionTargets.join(',')}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionSources')).length <= 0) {
      if (senseData.conditionSources) {
        atcvChanges.push({
          key: 'ATCV.conditionSources',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionSources.join(',')}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionTargetImage')).length <= 0) {
      if (senseData.conditionTargetImage) {
        atcvChanges.push({
          key: 'ATCV.conditionTargetImage',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionTargetImage}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionSourceImage')).length <= 0) {
      if (senseData.conditionSourceImage) {
        atcvChanges.push({
          key: 'ATCV.conditionSourceImage',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionSourceImage}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionType')).length <= 0) {
      if (senseData.conditionType) {
        atcvChanges.push({
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionType}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionBlinded')).length <= 0) {
      if (senseData.conditionBlinded) {
        atcvChanges.push({
          key: 'ATCV.conditionBlinded',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionBlinded}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionBlindedOverride')).length <= 0) {
      if (senseData.conditionBlindedOverride) {
        atcvChanges.push({
          key: 'ATCV.conditionBlindedOverride',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionBlindedOverride}`,
          priority: 5,
        });
      }
    }
    return atcvChanges;
  }

  private static retrieveAtcvChangesFromActiveEffect(res: ActiveEffect): EffectChangeData[] {
    const allSensesAndConditionsData: SenseData[] = [];
    allSensesAndConditionsData.push(...API.SENSES);
    allSensesAndConditionsData.push(...API.CONDITIONS);
    const senseData = allSensesAndConditionsData.find((senseData) => {
      return (
        isStringEquals(senseData.id, retrieveAtcvVisionLevelKeyFromChanges(res.data.changes)) ||
        isStringEquals(senseData.id, <string>res.id) ||
        isStringEquals(senseData.name, res.data.label)
      );
    });
    if (!senseData) {
      return res.data.changes;
    }

    const atcvChanges: any[] = [];
    atcvChanges.push(...res.data.changes);

    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionElevation')).length <= 0) {
      if (senseData.conditionElevation) {
        atcvChanges.push({
          key: 'ATCV.conditionElevation',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionElevation}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionDistance')).length <= 0) {
      if (senseData.conditionDistance) {
        atcvChanges.push({
          key: 'ATCV.conditionDistance',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionDistance}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionTargets')).length <= 0) {
      if (senseData.conditionTargets) {
        atcvChanges.push({
          key: 'ATCV.conditionTargets',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionTargets.join()}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionSources')).length <= 0) {
      if (senseData.conditionSources) {
        atcvChanges.push({
          key: 'ATCV.conditionSources',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionSources.join()}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionTargetImage')).length <= 0) {
      if (senseData.conditionTargetImage) {
        atcvChanges.push({
          key: 'ATCV.conditionTargetImage',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionTargetImage}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionSourceImage')).length <= 0) {
      if (senseData.conditionSourceImage) {
        atcvChanges.push({
          key: 'ATCV.conditionSourceImage',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionSourceImage}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionType')).length <= 0) {
      if (senseData.conditionType) {
        atcvChanges.push({
          key: 'ATCV.conditionType',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionType}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionBlinded')).length <= 0) {
      if (senseData.conditionBlinded) {
        atcvChanges.push({
          key: 'ATCV.conditionBlinded',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionBlinded}`,
          priority: 5,
        });
      }
    }
    if (atcvChanges.filter((e) => isStringEquals(e.key, 'ATCV.conditionBlindedOverride')).length <= 0) {
      if (senseData.conditionBlindedOverride) {
        atcvChanges.push({
          key: 'ATCV.conditionBlindedOverride',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: `${senseData.conditionBlindedOverride}`,
          priority: 5,
        });
      }
    }
    return atcvChanges;
  }

  static fromEffect(tokenDocument: TokenDocument, effect: Effect) {
    effect.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(effect);

    const effectChanges: EffectChangeData[] = EffectSupport._handleIntegrations(effect) || [];

    let res = retrieveAtcvEffectFromActiveEffect(
      tokenDocument,
      effectChanges,
      i18n(effect.name),
      effect.icon,
      undefined,
      effect.isDisabled,
    );
    if (!res) {
      return;
    }
    if (!res.visionId && effect.customId) {
      res.visionId = effect.customId;
    }
    /*
    let sensesOrConditions: SenseData[] = [];
    sensesOrConditions.push(...API.SENSES);
    sensesOrConditions.push(...API.CONDITIONS);
    for (const senseData of sensesOrConditions) {
      if (isStringEquals(res.visionId, senseData.id)) {
        res = AtcvEffect.mergeWithSensedataDefault(res, senseData);
        break;
      }
    }
    */
    res = AtcvEffect.mergeWithSensedataDefault(res);
    return res;
  }

  static fromActiveEffect(tokenDocument: TokenDocument, activeEffect: ActiveEffect) {
    //const effectChanges = activeEffect.data.changes;
    const effectChanges = AtcvEffect.retrieveAtcvChangesFromActiveEffect(activeEffect);
    let res = retrieveAtcvEffectFromActiveEffect(
      tokenDocument,
      effectChanges,
      i18n(activeEffect.data.label),
      <string>activeEffect.data.icon,
      undefined,
      activeEffect.data.disabled,
    );
    if (!res) {
      return;
    }
    /*
    let sensesOrConditions: SenseData[] = [];
    sensesOrConditions.push(...API.SENSES);
    sensesOrConditions.push(...API.CONDITIONS);
    for (const senseData of sensesOrConditions) {
      if (isStringEquals(res.visionId, senseData.id)) {
        res = AtcvEffect.mergeWithSensedataDefault(res, senseData);
        break;
      }
    }
    */
    res = AtcvEffect.mergeWithSensedataDefault(res);
    return res;
  }

  static toEffectFromAtcvEffect(res: AtcvEffect): Effect {
    const visionLevel = res.visionLevelValue;
    const nameOrCustomId = res.visionId;
    const isSense = res.visionType && res.visionType === 'sense' ? true : false;

    const origin = undefined;
    const overlay = false;
    const disabled = false;

    const changesTmp: any[] = [];
    changesTmp.push(<any>{
      key: 'ATCV.' + nameOrCustomId,
      mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
      value: visionLevel ?? 0,
      priority: 5,
    });
    changesTmp.push({
      key: 'ATCV.conditionType',
      mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
      value: `${isSense ? 'sense' : 'condition'}`,
      priority: 5,
    });
    if (res.visionElevation) {
      changesTmp.push({
        key: 'ATCV.conditionElevation',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: `${res.visionElevation}`,
        priority: 5,
      });
    }
    if (res.visionDistanceValue && res.visionDistanceValue > 0) {
      changesTmp.push({
        key: 'ATCV.conditionDistance',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: `${res.visionDistanceValue}`,
        priority: 5,
      });
    }
    if (res.visionTargets && res.visionTargets.length > 0) {
      changesTmp.push({
        key: 'ATCV.conditionTargets',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: `${res.visionTargets.join(',')}`,
        priority: 5,
      });
    }
    if (res.visionSources && res.visionSources.length > 0) {
      changesTmp.push({
        key: 'ATCV.conditionSources',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: `${res.visionSources.join(',')}`,
        priority: 5,
      });
    }
    if (res.visionTargetImage && res.visionTargetImage.length > 0) {
      changesTmp.push({
        key: 'ATCV.conditionTargetImage',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: `${res.visionTargetImage}`,
        priority: 5,
      });
    }
    if (res.visionSourceImage && res.visionSourceImage.length > 0) {
      changesTmp.push({
        key: 'ATCV.conditionSourceImage',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: `${res.visionSourceImage}`,
        priority: 5,
      });
    }
    if (res.visionBlinded) {
      changesTmp.push({
        key: 'ATCV.conditionBlinded',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: `${res.visionBlinded}`,
        priority: 5,
      });
    }
    if (res.visionBlindedOverride) {
      changesTmp.push({
        key: 'ATCV.conditionBlindedOverride',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: `${res.visionBlindedOverride}`,
        priority: 5,
      });
    }

    let nameToUse = res.visionName;
    if (!nameToUse.endsWith('(CV)')) {
      nameToUse = nameToUse + ' (CV)';
    }

    const effect = new Effect({
      customId: res.visionId,
      name: nameToUse,
      description: '',
      icon: res.visionIcon,
      tint: '',
      seconds: NaN,
      rounds: NaN,
      turns: NaN,
      isDynamic: false,
      isViewable: true,
      isDisabled: res.visionIsDisabled,
      isTemporary: isSense ? false : true,
      isSuppressed: false,
      flags: {},
      changes: [],
      atlChanges: [],
      tokenMagicChanges: [],
      nestedEffects: [],
      transfer: true,
      atcvChanges: changesTmp,
    });
    if (!effect.name.endsWith('(CV)')) {
      effect.name = effect.name + ' (CV)';
    }
    effect.changes = duplicateExtended(changesTmp);

    // Add some feature if is a sense or a condition
    // Force check for make condition temporary and sense passive
    if (isSense) {
      effect.isTemporary = false; // passive ae
    } else {
      effect.isTemporary = true;
      if (!effect.flags?.core?.statusId) {
        // Just make sure the effect is built it right
        if (!effect.flags) {
          effect.flags = {};
        }
        if (!effect.flags.core) {
          effect.flags.core = {};
        }
        effect.flags.core.statusId = effect._id;
      }
    }
    effect.transfer = !disabled;
    if (!i18n(effect.name).endsWith('(CV)')) {
      effect.name = i18n(effect.name) + ' (CV)';
    }
    effect.overlay = overlay;
    return effect;
  }
}

export class CVSkillData {
  id: string;
  name: string;
  icon: string;
  enable: boolean;
  senseData: SenseData | null;
}

export interface SenseData {
  id: string; // This is the unique id used for sync all the senses and conditions (please no strange character, no whitespace and all in lowercase...)
  name: string; // This is the unique name used for sync all the senses and conditions (here you cna put any dirty character you want)
  path: string; // [OPTIONAL] This is the path to the property you want to associate with this sense e.g. data.skills.prc.passive
  img: string; // [OPTIONAL] Image to associate to this sense
  conditionElevation: boolean; // [OPTIONAL] force to check the elevation between the source token and the target token, useful when using module like 'Levels'
  conditionTargets: string[]; // [OPTIONAL] This is used for explicitly tell to the checker what AE Condition can be see from this AE Sense based on the custom id used from this module (you can set this but is used only from a sense effect)
  conditionSources: string[]; // [OPTIONAL] This is used for explicitly tell to the checker what AE Sense can be see from this AE Condition based on the custom id used from this module (you can set this but is used only from a condition effect)
  conditionDistance: number; // [OPTIONAL] set a maximum distance for check the sight with this effect
  conditionType: string; // indicate the type of CV usually they are or 'sense' or 'condition' not both, **THIS IS ESSENTIAL FOR USE SENSE AND CONDITION NOT REGISTERED ON THE MODULE IF NOT FOUNDED BY DEFAULT IS CONSIDERED A SENSE**, so now you can just modify the AE and you are not forced to call the registered macro of the module CV, this is very useful for integration with other modules.

  conditionBlinded: boolean; // [OPTIONAL] If true this effect / condition is applied on the token / actor it will be evaluated for the blinded check and only another effect with `ATCV.conditionBlindedOverride = true` will be able to avoid this check.
  conditionBlindedOverride: boolean; // [OPTIONAL] If true it indicates that this effect is able to work even with the "Blinded" condition applied to the token

  conditionTargetImage: string; // [OPTIONAL] string path to the image applied on target token and used from the source token (the one you click on) for replace the image token only for that player with a special sight
  conditionSourceImage: string; // [OPTIONAL] string path to the image applied on target token and used from the target token (the one you try to see) for replace the image token only for that player with a special sight
}

export enum ConditionalVisibilityFlags {
  FORCE_VISIBLE = 'dataforcevisible',
  // DATA_SENSES = 'datasenses',
  // DATA_CONDITIONS = 'dataconditions',
  // MAX_SIGHT_DISTANCE = 'maxsightdistance'
  USE_STEALTH_PASSIVE = 'datausestealthpassive',
  ORIGINAL_IMAGE = 'dataoriginalimage',
}

export enum AtcvEffectSenseFlags {
  // additional generic
  NONE = 'none',
  NORMAL = 'normal',
  // additional dnd5e
  DARKVISION = 'darkvision',
  SEE_INVISIBLE = 'seeinvisible',
  BLIND_SIGHT = 'blindsight',
  TREMOR_SENSE = 'tremorsense',
  TRUE_SIGHT = 'truesight',
  DEVILS_SIGHT = 'devilssight',
  // PASSIVE_STEALTH = '_ste',
  // PASSIVE_PERCEPTION = '_prc',
  // additional PF2E
  GREATER_DARKVISION = 'greaterdarkvision',
  LOW_LIGHT_VISION = 'lowlightvision',
  BLINDED = 'blinded',
  // additional pf1e
  SEE_INVISIBILITY = 'seeinvisibility',
  BLIND_SENSE = 'blindsense',
  SCENT = 'scent',
  SEE_IN_DARKNESS = 'seeindarkness',
}

export enum AtcvEffectConditionFlags {
  NONE = 'none',
  INVISIBLE = 'invisible',
  OBSCURED = 'obscured',
  IN_DARKNESS = 'indarkness',
  HIDDEN = 'hidden',
  IN_MAGICAL_DARKNESS = 'inmagicaldarkness',
  STEALTHED = 'stealthed',
}

/**
 * This is system indipendent utility class
 */
export class VisionCapabilities {
  senses: Map<string, AtcvEffect>;
  conditions: Map<string, AtcvEffect>;
  token: Token;

  constructor(srcToken: Token) {
    if (srcToken) {
      this.token = srcToken;
      this.senses = new Map<string, AtcvEffect>();
      this.conditions = new Map<string, AtcvEffect>();
      // SENSES
      this.addSenses();

      // CONDITIONS
      this.addConditions();

      for (const sense of getSensesFromToken(srcToken.document)) {
        if (sense.visionType === 'sense' && !this.senses.has(sense.visionId)) {
          this.senses.set(sense.visionId, sense);
        }
      }
      for (const condition of getConditionsFromToken(srcToken.document)) {
        if (condition.visionType === 'condition' && !this.conditions.has(condition.visionId)) {
          this.conditions.set(condition.visionId, condition);
        }
      }
    } else {
      error('No token found for get the visual capabilities');
    }
  }

  hasSenses() {
    if (this.senses.size > 0) {
      return true;
    } else {
      return false;
    }
  }

  hasConditions() {
    if (this.conditions.size > 0) {
      return true;
    } else {
      return false;
    }
  }

  retrieveSenses() {
    const sensesTmp = new Map<string, AtcvEffect>();
    for (const [key, value] of this.senses.entries()) {
      if (value.visionLevelValue && value.visionLevelValue != 0) {
        sensesTmp.set(key, value);
      }
    }

    return sensesTmp;
  }

  addSenses() {
    Promise.all(
      API.SENSES.map(async (statusSight) => {
        // const atcvEffectFlagData = <AtcvEffect>this.token?.document?.getFlag(CONSTANTS.MODULE_NAME, statusSight.id);
        const atcvEffectFlagData =
          <AtcvEffect>this.token?.actor?.getFlag(CONSTANTS.MODULE_NAME, statusSight.id) ??
          <AtcvEffect>this.token?.document?.getFlag(CONSTANTS.MODULE_NAME, statusSight.id); // TODO TO REMOVE
        if (atcvEffectFlagData) {
          const visionLevelValue = atcvEffectFlagData.visionLevelValue || 0;
          const visionDistanceValue = atcvEffectFlagData.visionDistanceValue || 0;
          const conditionElevation = atcvEffectFlagData.visionElevation || false;
          const conditionTargets: string[] = atcvEffectFlagData.visionTargets || [];
          const conditionSources: string[] = atcvEffectFlagData.visionSources || [];
          const conditionTargetImage = atcvEffectFlagData.visionTargetImage || '';
          const conditionSourceImage = atcvEffectFlagData.visionSourceImage || '';
          const conditionType = atcvEffectFlagData.visionType || 'sense';
          const conditionIsDisabled = atcvEffectFlagData.visionIsDisabled || false;
          const conditionBlinded = atcvEffectFlagData.visionBlinded || false;
          const conditionBlindedOverride = atcvEffectFlagData.visionBlindedOverride || false;

          const statusEffect = <AtcvEffect>{
            visionId: statusSight.id,
            visionName: statusSight.name,
            visionElevation: conditionElevation ?? false,
            visionTargets: conditionTargets ?? [],
            visionSources: conditionSources ?? [],
            visionLevelValue: visionLevelValue ?? 0,
            visionDistanceValue: visionDistanceValue ?? 0,
            visionTargetImage: conditionTargetImage ?? '',
            visionSourceImage: conditionSourceImage ?? '',
            // statusSight: statusSight,
            visionType: conditionType,
            visionIsDisabled: conditionIsDisabled,
            visionBlinded: conditionBlinded,
            visionBlindedOverride: conditionBlindedOverride,
          };
          this.senses.set(statusSight.id, statusEffect);
        }
      }),
    );
  }

  retrieveConditions() {
    const coditionsTmp = new Map<string, AtcvEffect>();
    for (const [key, value] of this.conditions.entries()) {
      if (value.visionLevelValue && value.visionLevelValue != 0) {
        coditionsTmp.set(key, value);
      }
    }
    return coditionsTmp;
  }

  addConditions() {
    Promise.all(
      API.CONDITIONS.map(async (statusSight) => {
        // const atcvEffectFlagData = <AtcvEffect>this.token.document?.getFlag(CONSTANTS.MODULE_NAME, statusSight.id);
        const atcvEffectFlagData =
          <AtcvEffect>this.token?.actor?.getFlag(CONSTANTS.MODULE_NAME, statusSight.id) ??
          <AtcvEffect>this.token.document?.getFlag(CONSTANTS.MODULE_NAME, statusSight.id); // TODO TO REMOVE
        if (atcvEffectFlagData) {
          const visionLevelValue = atcvEffectFlagData.visionLevelValue || 0;
          const visionDistanceValue = atcvEffectFlagData.visionDistanceValue || 0;
          const conditionElevation = atcvEffectFlagData.visionElevation || false;
          const conditionTargets: string[] = atcvEffectFlagData.visionTargets || [];
          const conditionSources: string[] = atcvEffectFlagData.visionSources || [];
          const conditionTargetImage = atcvEffectFlagData.visionTargetImage || '';
          const conditionSourceImage = atcvEffectFlagData.visionSourceImage || '';
          const conditionType = atcvEffectFlagData.visionType || 'condition';
          const conditionIsDisabled = atcvEffectFlagData.visionIsDisabled || false;
          const conditionBlinded = atcvEffectFlagData.visionBlinded || false;
          const conditionBlindedOverride = atcvEffectFlagData.visionBlindedOverride || false;

          const statusEffect = <AtcvEffect>{
            visionId: statusSight.id,
            visionName: statusSight.name,
            visionElevation: conditionElevation ?? false,
            visionTargets: conditionTargets ?? [],
            visionSources: conditionSources ?? [],
            visionLevelValue: visionLevelValue ?? 0,
            visionDistanceValue: visionDistanceValue ?? 0,
            visionTargetImage: conditionTargetImage ?? '',
            visionSourceImage: conditionSourceImage ?? '',
            // statusSight: statusSight,
            visionType: conditionType,
            visionIsDisabled: conditionIsDisabled,
            visionBlinded: conditionBlinded,
            visionBlindedOverride: conditionBlindedOverride,
          };
          this.conditions.set(statusSight.id, statusEffect);
        }
      }),
    );
  }
}

export class CVResultData {
  sourceTokenId: string;
  targetTokenId: string;
  sourceVisionsLevels: AtcvEffect[];
  targetVisionsLevels: AtcvEffect[];
  canSee: boolean;
}
