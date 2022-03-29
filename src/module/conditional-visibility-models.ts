import { EffectChangeData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData';
import { ActiveEffectData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
/* eslint-disable prefer-const */
import API from './api';
import CONSTANTS from './constants';
import Effect, { EffectSupport } from './effects/effect';
import {
  error,
  getSensesFromToken,
  getConditionsFromToken,
  i18n,
  retrieveAtcvEffectFromActiveEffect,
  isStringEquals,
  getConditionsFromTokenFast,
  getSensesFromTokenFast,
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
  // visionLevelMinIndex: number;
  // visionLevelMaxIndex: number;
  visionElevation: boolean;
  visionTargets: string[];
  visionSources: string[];
  visionTargetImage: string;
  visionDistanceValue: number | undefined;
  visionType: string;
  visionIsDisabled: boolean;

  static fromSenseData(senseData: SenseData, visionLevelValue: number, isDisabled = false) {
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

    const res = new AtcvEffect();
    res.visionId = senseData.id;
    res.visionName = i18n(senseData.name);
    res.visionPath = senseData.path;
    res.visionIcon = senseData.img;

    res.visionLevelValue = visionLevelValue ?? 0;
    // res.visionLevelMinIndex = senseData.conditionLevelMinIndex;
    // res.visionLevelMaxIndex = senseData.conditionLevelMaxIndex;
    res.visionElevation = senseData.conditionElevation;
    res.visionTargets = senseData.conditionTargets;
    res.visionSources = senseData.conditionSources;
    res.visionTargetImage = senseData.conditionTargetImage;
    res.visionDistanceValue = senseData.conditionDistance;
    res.visionType = senseData.conditionType ? senseData.conditionType : isSense ? 'sense' : 'condition';
    res.visionIsDisabled = String(isDisabled) === 'true' ? true : false;
    return res;
  }

  static mergeWithSensedataDefault(res: AtcvEffect) {
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
    // if (!res.visionLevelMinIndex) {
    //   res.visionLevelMinIndex = senseData.conditionLevelMinIndex;
    // }
    // if (!res.visionLevelMaxIndex) {
    //   res.visionLevelMaxIndex = senseData.conditionLevelMaxIndex;
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
    // if(!res.visionTargetImage){
    //   res.visionTargetImage = '';
    // }
    if (!res.visionDistanceValue) {
      res.visionDistanceValue = senseData.conditionDistance;
    }
    // if(!res.visionType){
    //   res.visionType = isSense ? 'sense' : 'condition';
    // }
    // if(!res.visionIsDisabled){
    //   res.visionIsDisabled = Stirng(IsDisabled) === 'true' ? true : false;
    // }
    return res;
  }

  static mergeEffectWithSensedataDefault(res: Effect): EffectChangeData[] {
    const allSensesAndConditionsData: SenseData[] = [];
    allSensesAndConditionsData.push(...API.SENSES);
    allSensesAndConditionsData.push(...API.CONDITIONS);
    const senseData = allSensesAndConditionsData.find((senseData) => {
      return isStringEquals(senseData.id, res.customId) || isStringEquals(senseData.name, res.name);
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
    return atcvChanges;
  }

  private static mergeActiveEffectWithSensedataDefault(res: ActiveEffect): EffectChangeData[] {
    const allSensesAndConditionsData: SenseData[] = [];
    allSensesAndConditionsData.push(...API.SENSES);
    allSensesAndConditionsData.push(...API.CONDITIONS);
    const senseData = allSensesAndConditionsData.find((senseData) => {
      return isStringEquals(senseData.id, <string>res.id) || isStringEquals(senseData.name, res.data.label);
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

    return atcvChanges;
  }

  static fromEffect(tokenDocument: TokenDocument, effect: Effect) {
    effect.atcvChanges = AtcvEffect.mergeEffectWithSensedataDefault(effect);

    const effectChanges: EffectChangeData[] = EffectSupport._handleIntegrations(effect) || [];

    let res = retrieveAtcvEffectFromActiveEffect(
      tokenDocument,
      effectChanges,
      i18n(effect.name),
      effect.icon,
      undefined,
      effect.isDisabled,
    );
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
    const effectChanges = AtcvEffect.mergeActiveEffectWithSensedataDefault(activeEffect);
    let res = retrieveAtcvEffectFromActiveEffect(
      tokenDocument,
      effectChanges,
      i18n(activeEffect.data.label),
      <string>activeEffect.data.icon,
      undefined,
      activeEffect.data.disabled,
    );
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
}

export interface SenseData {
  id: string; // This is the unique id used for sync all the senses and conditions (please no strange character, no whitespace and all in lowercase...)
  name: string; // This is the unique name used for sync all the senses and conditions (here you cna put any dirty character you want)
  path: string; // This is the path to the property you want to associate with this sense e.g. data.skills.prc.passive
  img: string; // [OPTIONAL] Image to associate to this sense
  // conditionLevelMinIndex: number; // [OPTIONAL] check a min index for filter a range of sense can see these conditions, or viceversa conditions can be seen only from this sense
  // conditionLevelMaxIndex: number; // [OPTIONAL] check a max index for filter a range of sense can see these conditions, or viceversa conditions can be seen only from this sense
  conditionElevation: boolean; // [OPTIONAL] force to check the elevation between the source token and the target token, useful when using module like 'Levels'
  conditionTargets: string[]; // [OPTIONAL] force to apply the check only for these sources (you can set this but is used only from sense)
  conditionSources: string[]; // [OPTIONAL] force to apply the check only for these sources (you can set this but is used only from condition)
  conditionTargetImage: string; // [OPTIONAL] string path to the image applied on target token and used from the source token (the one you click on) for replace only for that player with a special sight
  conditionDistance: number; // [OPTIONAL] set a maximum distance for check the sight with this effect
  conditionType: string; // indicate the type of CV usually they are or 'sense' or 'condition' not both, **THIS IS ESSENTIAL FOR USE SENSE AND CONDITION NOT REGISTERED ON THE MODULE IF NOT FOUNDED BY DEFAULT IS CONSIDERED A SENSE**, so now you can just modify the AE and you are not forced to call the registered macro of the module CV, this is very useful for integration with other modules.
}

export enum ConditionalVisibilityFlags {
  FORCE_VISIBLE = 'forcevisible',
  DATA_SENSES = 'datasenses',
  DATA_CONDITIONS = 'dataconditions'
}

export enum AtcvEffectSenseFlags {
  // additional generic
  NONE = 'none',
  NORMAL = 'normal',
  // additional dnd5e and pf2e
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
}

export enum AtcvEffectConditionFlags {
  NONE = 'none',
  INVISIBLE = 'invisible',
  OBSCURED = 'obscured',
  IN_DARKNESS = 'indarkness',
  HIDDEN = 'hidden',
  IN_MAGICAL_DARKNESS = 'inmagicaldarkness',
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
          <AtcvEffect>this.token?.document?.getFlag(CONSTANTS.MODULE_NAME, statusSight.id);
        if (atcvEffectFlagData) {
          let visionLevelValue = atcvEffectFlagData.visionLevelValue || 0;
          let visionDistanceValue = atcvEffectFlagData.visionDistanceValue || 0;
          let conditionElevation = atcvEffectFlagData.visionElevation || false;
          let conditionTargets: string[] = atcvEffectFlagData.visionTargets || [];
          let conditionSources: string[] = atcvEffectFlagData.visionSources || [];
          let conditionTargetImage = atcvEffectFlagData.visionTargetImage || '';
          let conditionType = atcvEffectFlagData.visionType || 'sense';
          // let conditionLevelMinIndex = atcvEffectFlagData.visionLevelMinIndex || 0;
          // let conditionLevelMaxIndex = atcvEffectFlagData.visionLevelMaxIndex || 10;
          let conditionIsDisabled = atcvEffectFlagData.visionIsDisabled || false;

          const statusEffect = <AtcvEffect>{
            visionId: statusSight.id,
            visionName: statusSight.name,
            visionElevation: conditionElevation ?? false,
            visionTargets: conditionTargets ?? [],
            visionSources: conditionSources ?? [],
            visionLevelValue: visionLevelValue ?? 0,
            visionDistanceValue: visionDistanceValue ?? 0,
            visionTargetImage: conditionTargetImage ?? '',
            // statusSight: statusSight,
            visionType: conditionType,
            // visionLevelMinIndex: conditionLevelMinIndex,
            // visionLevelMaxIndex: conditionLevelMaxIndex,
            visionIsDisabled: conditionIsDisabled,
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
          <AtcvEffect>this.token.document?.getFlag(CONSTANTS.MODULE_NAME, statusSight.id);
        if (atcvEffectFlagData) {
          let visionLevelValue = atcvEffectFlagData.visionLevelValue || 0;
          let visionDistanceValue = atcvEffectFlagData.visionDistanceValue || 0;
          let conditionElevation = atcvEffectFlagData.visionElevation || false;
          let conditionTargets: string[] = atcvEffectFlagData.visionTargets || [];
          let conditionSources: string[] = atcvEffectFlagData.visionSources || [];
          let conditionTargetImage = atcvEffectFlagData.visionTargetImage || '';
          let conditionType = atcvEffectFlagData.visionType || 'condition';
          // let conditionLevelMinIndex = atcvEffectFlagData.visionLevelMinIndex || 0;
          // let conditionLevelMaxIndex = atcvEffectFlagData.visionLevelMaxIndex || 10;
          let conditionIsDisabled = atcvEffectFlagData.visionIsDisabled || false;

          const statusEffect = <AtcvEffect>{
            visionId: statusSight.id,
            visionName: statusSight.name,
            visionElevation: conditionElevation ?? false,
            visionTargets: conditionTargets ?? [],
            visionSources: conditionSources ?? [],
            visionLevelValue: visionLevelValue ?? 0,
            visionDistanceValue: visionDistanceValue ?? 0,
            visionTargetImage: conditionTargetImage ?? '',
            // statusSight: statusSight,
            visionType: conditionType,
            // visionLevelMinIndex: conditionLevelMinIndex,
            // visionLevelMaxIndex: conditionLevelMaxIndex,
            visionIsDisabled: conditionIsDisabled,
          };
          this.conditions.set(statusSight.id, statusEffect);
        }
      }),
    );
  }
}

export class CheckerDebugData {
  atcvSourceEffect: AtcvEffect;
  atcvTargetEffect: AtcvEffect | string;
  checkerResult: boolean;
}
