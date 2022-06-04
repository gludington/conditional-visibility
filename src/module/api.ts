import { conditionalVisibilitySocket } from './socket';
import CONSTANTS from './constants';
import {
  checkAndDisplayUserSpecificImage,
  duplicateExtended,
  error,
  getAllDefaultSensesAndConditions,
  getConditionsFromTokenFast,
  getSensesFromTokenFast,
  getToken,
  i18n,
  i18nFormat,
  info,
  isStringEquals,
  is_real_number,
  prepareActiveEffectForConditionalVisibility,
  renderAutoSkillsDialog,
  repairAndSetFlag,
  repairAndUnSetFlag,
  retrieveAndMergeEffect,
  retrieveAtcvVisionLevelKeyFromChanges,
  retrieveEffectChangeDataFromAtcvEffect,
  retrieveEffectChangeDataFromEffect,
  retrieveEffectChangeDataFromSenseData,
  shouldIncludeVisionV2,
  warn,
  _registerSenseData,
  _unregisterSenseData,
} from './lib/lib';
import EffectInterface from './effects/effect-interface';
import {
  AtcvEffect,
  AtcvEffectConditionFlags,
  AtcvEffectSenseFlags,
  ConditionalVisibilityFlags,
  CVResultData,
  CVSkillData,
  SenseData,
} from './conditional-visibility-models';
import type Effect from './effects/effect';
import { ConditionalVisibilityEffectDefinitions } from './conditional-visibility-effect-definition';
import type { EnhancedConditions } from './cub/enhanced-conditions';
import type { ActiveEffectData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import { EffectSupport } from './effects/effect-support';

const API = {
  effectInterface: EffectInterface,

  get CUB(): EnhancedConditions {
    //@ts-ignore
    return game.cub;
  },

  /**
   * The attributes used to track dynamic attributes in this system
   *
   * @returns {array}
   */
  get SENSES(): SenseData[] {
    return <SenseData[]>game.settings.get(CONSTANTS.MODULE_NAME, 'senses');
  },

  /**
   * The attributes used to track dynamic attributes in this system
   *
   * @returns {array}
   */
  get CONDITIONS(): SenseData[] {
    return <SenseData[]>game.settings.get(CONSTANTS.MODULE_NAME, 'conditions');
  },

  /**
   * The attributes used to track dynamic attributes in this system
   *
   * @returns {array}
   */
  get EFFECTS(): Effect[] {
    return <Effect[]>game.settings.get(CONSTANTS.MODULE_NAME, 'effects');
  },

  /**
   * The attributes used to track dynamic attributes in this system
   *
   * @returns {CVSkillData[]}
   */
  get SKILLS(): CVSkillData[] {
    return <CVSkillData[]>game.settings.get(CONSTANTS.MODULE_NAME, 'skills');
  },

  // TODO MAKE THIS BETTER
  get SKILLS_CONDITION(): String[] {
    if (game.system.id === 'dnd5e') {
      return [AtcvEffectConditionFlags.HIDDEN, 'stealth'];
    } else if (game.system.id === 'pf2e') {
      return [AtcvEffectConditionFlags.HIDDEN, 'stealth'];
    } else {
      return [AtcvEffectConditionFlags.HIDDEN];
    }
  },

  // TODO MAKE THIS BETTER
  get SKILLS_SENSE(): String[] {
    if (game.system.id === 'dnd5e') {
      return [AtcvEffectSenseFlags.NORMAL, 'perception'];
    } else if (game.system.id === 'pf2e') {
      return [AtcvEffectSenseFlags.NORMAL, 'perception'];
    } else {
      return [AtcvEffectSenseFlags.NORMAL];
    }
  },

  /**
   * The attributes used to track dynamic attributes in this system
   *
   * @returns {array}
   */
  get NPC_TYPE(): string {
    return <string>game.settings.get(CONSTANTS.MODULE_NAME, 'npcType');
  },

  /**
   * The attribute used to track the passive perception skill in this system
   *
   * @returns {String}
   */
  get PERCEPTION_PASSIVE_SKILL(): string {
    return <string>game.settings.get(CONSTANTS.MODULE_NAME, 'passivePerceptionSkill');
  },

  /**
   * The attribute used to track the passive stealth skill in this system
   *
   * @returns {String}
   */
  get STEALTH_PASSIVE_SKILL(): string {
    return <string>game.settings.get(CONSTANTS.MODULE_NAME, 'passiveStealthSkill');
  },

  /**
   * The attribute used to track the active stealth skill in this system
   *
   * @returns {String}
   */
  get STEALTH_ACTIVE_SKILL(): string {
    return <string>game.settings.get(CONSTANTS.MODULE_NAME, 'activeStealthSkill');
  },

  // /**
  //  * The attributes used to track dynamic attributes in this system
  //  *
  //  * @returns {array}
  //  */
  // get STEALTH_ID_SKILL(): string {
  //   return <string>game.settings.get(CONSTANTS.MODULE_NAME, 'idStealthSkill');
  // },

  // /**
  //  * The attributes used to track dynamic attributes in this system
  //  *
  //  * @returns {string}
  //  */
  // get STEALTH_ID_LANG_SKILL(): string {
  //   return <string>game.settings.get(CONSTANTS.MODULE_NAME, 'idLangStealthSkill') ?? 'Stealth';
  // },

  /**
   * The attributes used to track dynamic attributes in this system
   *
   * @returns {array}
   */
  get PATH_ATTRIBUTES_SENSES(): string {
    return <string>game.settings.get(CONSTANTS.MODULE_NAME, 'pathAttributesSenses') ?? `data.attributes.senses`;
  },

  /**
   * Sets the inAttribute used to track the passive perceptions in this system
   *
   * @param {String} inAttribute
   * @returns {Promise}
   */
  async setPassivePerceptionSkill(inAttribute) {
    if (typeof inAttribute !== 'string') {
      throw error('setPassivePerceptionSkill | inAttribute must be of type string');
    }
    await game.settings.set(CONSTANTS.MODULE_NAME, 'preconfiguredSystem', true);
    return game.settings.set(CONSTANTS.MODULE_NAME, 'passivePerceptionSkill', inAttribute);
  },

  /**
   * Sets the inAttribute used to track the passive perceptions in this system
   *
   * @param {String} inAttribute
   * @returns {Promise}
   */
  async setPassiveStealthSkill(inAttribute) {
    if (typeof inAttribute !== 'string') {
      throw error('setPassiveStealthSkill | inAttribute must be of type string');
    }
    await game.settings.set(CONSTANTS.MODULE_NAME, 'preconfiguredSystem', true);
    return game.settings.set(CONSTANTS.MODULE_NAME, 'passiveStealthSkill', inAttribute);
  },

  /**
   * Sets the inAttribute used to track the passive perceptions in this system
   *
   * @param {String} inAttribute
   * @returns {Promise}
   */
  async setActiveStealthSkill(inAttribute) {
    if (typeof inAttribute !== 'string') {
      throw error('setActiveStealthSkill | inAttribute must be of type string');
    }
    await game.settings.set(CONSTANTS.MODULE_NAME, 'preconfiguredSystem', true);
    return game.settings.set(CONSTANTS.MODULE_NAME, 'activeStealthSkill', inAttribute);
  },

  /**
   * Sets the attributes used to track dynamic attributes in this system
   *
   * @param {array} inAttributes
   * @returns {Promise}
   */
  async setSenses(inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('setSenses | inAttributes must be of type array');
    }
    for (const attribute of inAttributes) {
      if (typeof attribute !== 'object') {
        throw error('setSenses | each entry in the inAttributes array must be of type object');
      }
      if (typeof attribute.name !== 'string') {
        throw error('setSenses | attribute.name must be of type string');
      }
      if (typeof attribute.attribute !== 'string') {
        throw error('setSenses | attribute.path must be of type string');
      }
      if (attribute.img && typeof attribute.img !== 'string') {
        throw error('setSenses | attribute.img must be of type string');
      }
    }
    return game.settings.set(CONSTANTS.MODULE_NAME, 'senses', inAttributes);
  },

  /**
   * Sets the attributes used to track dynamic attributes in this system
   *
   * @param {array} inAttributes
   * @returns {Promise}
   */
  async setConditions(inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('setConditions | inAttributes must be of type array');
    }
    for (const attribute of inAttributes) {
      if (typeof attribute !== 'object') {
        throw error('setConditions | each entry in the inAttributes array must be of type object');
      }
      if (typeof attribute.name !== 'string') {
        throw error('setConditions | attribute.name must be of type string');
      }
      if (typeof attribute.attribute !== 'string') {
        throw error('setConditions | attribute.path must be of type string');
      }
      if (attribute.img && typeof attribute.img !== 'string') {
        throw error('setConditions | attribute.img must be of type string');
      }
    }
    return game.settings.set(CONSTANTS.MODULE_NAME, 'conditions', inAttributes);
  },

  // ======================
  // Effect Management
  // ======================

  async removeEffectArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('removeEffectArr | inAttributes must be of type array');
    }
    const [params] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffect(params);
    return result;
  },

  async toggleEffectArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('toggleEffectArr | inAttributes must be of type array');
    }
    const [effectName, params] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface).toggleEffect(effectName, params);
    return result;
  },

  async addEffectArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('addEffectArr | inAttributes must be of type array');
    }
    const [params] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.addEffect(params);
    return result;
  },

  async hasEffectAppliedArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('hasEffectAppliedArr | inAttributes must be of type array');
    }
    const [effectName, uuid] = inAttributes;
    const result = (<EffectInterface>this.effectInterface)._effectHandler.hasEffectApplied(effectName, uuid);
    return result;
  },

  async hasEffectAppliedOnActorArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('hasEffectAppliedOnActorArr | inAttributes must be of type array');
    }
    const [effectName, uuid, includeDisabled] = inAttributes;
    const result = (<EffectInterface>this.effectInterface)._effectHandler.hasEffectAppliedOnActor(
      effectName,
      uuid,
      includeDisabled,
    );
    return result;
  },

  async hasEffectAppliedFromIdOnActorArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('hasEffectAppliedFromIdOnActorArr | inAttributes must be of type array');
    }
    const [effectId, uuid, includeDisabled] = inAttributes;
    const result = (<EffectInterface>this.effectInterface)._effectHandler.hasEffectAppliedFromIdOnActor(
      effectId,
      uuid,
      includeDisabled,
    );
    return result;
  },

  async addEffectOnActorArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('addEffectOnActorArr | inAttributes must be of type array');
    }
    const [effectName, uuid, origin, overlay, effect] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.addEffectOnActor(
      effectName,
      uuid,
      origin,
      overlay,
      effect,
    );
    return result;
  },

  async removeEffectOnActorArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('removeEffectOnActorArr | inAttributes must be of type array');
    }
    const [effectName, uuid] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectOnActor(effectName, uuid);
    return result;
  },

  async removeEffectFromIdOnActorArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('removeEffectFromIdOnActor | inAttributes must be of type array');
    }
    const [effectId, uuid] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectFromIdOnActor(
      effectId,
      uuid,
    );
    return result;
  },

  async toggleEffectFromIdOnActorArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('addEffectOnActorArr | inAttributes must be of type array');
    }
    const [effectId, uuid, alwaysDelete, forceEnabled, forceDisabled] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.toggleEffectFromIdOnActor(
      effectId,
      uuid,
      alwaysDelete,
      forceEnabled,
      forceDisabled,
    );
    return result;
  },

  async findEffectByNameOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | null> {
    if (!Array.isArray(inAttributes)) {
      throw error('findEffectByNameOnActorArr | inAttributes must be of type array');
    }
    const [effectName, uuid] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.findEffectByNameOnActor(
      effectName,
      uuid,
    );
    return result;
  },

  async hasEffectAppliedOnTokenArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('hasEffectAppliedOnTokenArr | inAttributes must be of type array');
    }
    const [effectName, uuid, includeDisabled] = inAttributes;
    const result = (<EffectInterface>this.effectInterface)._effectHandler.hasEffectAppliedOnToken(
      effectName,
      uuid,
      includeDisabled,
    );
    return result;
  },

  async hasEffectAppliedFromIdOnTokenArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('hasEffectAppliedFromIdOnTokenArr | inAttributes must be of type array');
    }
    const [effectId, uuid, includeDisabled] = inAttributes;
    const result = (<EffectInterface>this.effectInterface)._effectHandler.hasEffectAppliedFromIdOnToken(
      effectId,
      uuid,
      includeDisabled,
    );
    return result;
  },

  async addEffectOnTokenArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('addEffectOnTokenArr | inAttributes must be of type array');
    }
    const [effectName, uuid, origin, overlay, effect] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.addEffectOnToken(
      effectName,
      uuid,
      origin,
      overlay,
      effect,
    );
    return result;
  },

  async removeEffectOnTokenArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('removeEffectOnTokenArr | inAttributes must be of type array');
    }
    const [effectName, uuid] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectOnToken(effectName, uuid);
    return result;
  },

  async removeEffectFromIdOnTokenArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('removeEffectFromIdOnToken | inAttributes must be of type array');
    }
    const [effectId, uuid] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectFromIdOnToken(
      effectId,
      uuid,
    );
    return result;
  },

  async removeEffectFromIdOnTokenMultipleArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('removeEffectFromIdOnTokenMultipleArr | inAttributes must be of type array');
    }
    const [effectIds, uuid] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectFromIdOnTokenMultiple(
      effectIds,
      uuid,
    );
    return result;
  },

  async toggleEffectFromIdOnTokenArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('addEffectOnTokenArr | inAttributes must be of type array');
    }
    const [effectId, uuid, alwaysDelete, forceEnabled, forceDisabled] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.toggleEffectFromIdOnToken(
      effectId,
      uuid,
      alwaysDelete,
      forceEnabled,
      forceDisabled,
    );
    return result;
  },

  async findEffectByNameOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | null> {
    if (!Array.isArray(inAttributes)) {
      throw error('findEffectByNameOnTokenArr | inAttributes must be of type array');
    }
    const [effectName, uuid] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.findEffectByNameOnToken(
      effectName,
      uuid,
    );
    return result;
  },

  async addActiveEffectOnTokenArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('addActiveEffectOnTokenArr | inAttributes must be of type array');
    }
    const [tokenId, activeEffectData] = inAttributes;
    const result = (<EffectInterface>this.effectInterface)._effectHandler.addActiveEffectOnToken(
      <string>tokenId,
      activeEffectData,
    );
    return result;
  },

  async updateEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
    if (!Array.isArray(inAttributes)) {
      throw error('updateEffectFromIdOnTokenArr | inAttributes must be of type array');
    }
    const [effectId, uuid, origin, overlay, effectUpdated] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.updateEffectFromIdOnToken(
      effectId,
      uuid,
      origin,
      overlay,
      effectUpdated,
    );
    return result;
  },

  async updateEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
    if (!Array.isArray(inAttributes)) {
      throw error('updateEffectFromNameOnTokenArr | inAttributes must be of type array');
    }
    const [effectName, uuid, origin, overlay, effectUpdated] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.updateEffectFromNameOnToken(
      effectName,
      uuid,
      origin,
      overlay,
      effectUpdated,
    );
    return result;
  },

  async updateActiveEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
    if (!Array.isArray(inAttributes)) {
      throw error('updateActiveEffectFromIdOnTokenArr | inAttributes must be of type array');
    }
    const [effectId, uuid, origin, overlay, effectUpdated] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.updateActiveEffectFromIdOnToken(
      effectId,
      uuid,
      origin,
      overlay,
      effectUpdated,
    );
    return result;
  },

  async updateActiveEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
    if (!Array.isArray(inAttributes)) {
      throw error('updateActiveEffectFromNameOnTokenArr | inAttributes must be of type array');
    }
    const [effectName, uuid, origin, overlay, effectUpdated] = inAttributes;
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.updateActiveEffectFromNameOnToken(
      effectName,
      uuid,
      origin,
      overlay,
      effectUpdated,
    );
    return result;
  },

  // ======================
  // Effect Actor Management
  // ======================
  /*
  async addEffectOnActor(actorId: string, effectName: string, effect: Effect) {
    const result = await (<EffectInterface>this.effectInterface).addEffectOnActor(effectName, <string>actorId, effect);
    return result;
  },

  async findEffectByNameOnActor(actorId: string, effectName: string): Promise<ActiveEffect | null> {
    const result = await (<EffectInterface>this.effectInterface).findEffectByNameOnActor(effectName, <string>actorId);
    return result;
  },

  async hasEffectAppliedOnActor(actorId: string, effectName: string, includeDisabled:boolean) {
    const result = (<EffectInterface>this.effectInterface).hasEffectAppliedOnActor(effectName, <string>actorId, includeDisabled);
    return result;
  },

  async hasEffectAppliedFromIdOnActor(actorId: string, effectId: string, includeDisabled:boolean) {
    const result = (<EffectInterface>this.effectInterface).hasEffectAppliedFromIdOnActor(effectId, <string>actorId, includeDisabled);
    return result;
  },

  async toggleEffectFromIdOnActor(
    actorId: string,
    effectId: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ) {
    const result = await (<EffectInterface>this.effectInterface).toggleEffectFromIdOnActor(
      effectId,
      <string>actorId,
      alwaysDelete,
      forceEnabled,
      forceDisabled,
    );
    return result;
  },

  async addActiveEffectOnActor(actorId: string, activeEffectData: ActiveEffectData) {
    const result = (<EffectInterface>this.effectInterface).addActiveEffectOnActor(<string>actorId, activeEffectData);
    return result;
  },

  async removeEffectOnActor(actorId: string, effectName: string) {
    const result = await (<EffectInterface>this.effectInterface).removeEffectOnActor(effectName, <string>actorId);
    return result;
  },

  async removeEffectFromIdOnActor(actorId: string, effectId: string) {
    const result = await (<EffectInterface>this.effectInterface).removeEffectFromIdOnActor(effectId, <string>actorId);
    return result;
  },
  */
  // ======================
  // Effect Token Management
  // ======================

  async addEffectOnToken(tokenId: string, effectName: string, effect: Effect) {
    const result = await (<EffectInterface>this.effectInterface).addEffectOnToken(effectName, <string>tokenId, effect);
    return result;
  },

  async findEffectByNameOnToken(tokenId: string, effectName: string): Promise<ActiveEffect | null> {
    const result = await (<EffectInterface>this.effectInterface).findEffectByNameOnToken(effectName, <string>tokenId);
    return result;
  },

  async hasEffectAppliedOnToken(tokenId: string, effectName: string, includeDisabled: boolean) {
    const result = (<EffectInterface>this.effectInterface).hasEffectAppliedOnToken(
      effectName,
      <string>tokenId,
      includeDisabled,
    );
    return result;
  },

  async hasEffectAppliedFromIdOnToken(tokenId: string, effectId: string, includeDisabled: boolean) {
    const result = (<EffectInterface>this.effectInterface).hasEffectAppliedFromIdOnToken(
      effectId,
      <string>tokenId,
      includeDisabled,
    );
    return result;
  },

  async toggleEffectFromIdOnToken(
    tokenId: string,
    effectId: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ) {
    const result = await (<EffectInterface>this.effectInterface).toggleEffectFromIdOnToken(
      effectId,
      <string>tokenId,
      alwaysDelete,
      forceEnabled,
      forceDisabled,
    );
    return result;
  },

  async addActiveEffectOnToken(tokenId: string, activeEffectData: ActiveEffectData) {
    const result = await (<EffectInterface>this.effectInterface).addActiveEffectOnToken(
      <string>tokenId,
      activeEffectData,
    );
    return result;
  },

  async removeEffectOnToken(tokenId: string, effectName: string) {
    const result = await (<EffectInterface>this.effectInterface).removeEffectOnToken(effectName, <string>tokenId);
    return result;
  },

  async removeEffectFromIdOnToken(tokenId: string, effectId: string) {
    const result = await (<EffectInterface>this.effectInterface).removeEffectFromIdOnToken(effectId, <string>tokenId);
    return result;
  },

  async removeEffectFromIdOnTokenMultiple(tokenId: string, effectIds: string[]) {
    const result = await (<EffectInterface>this.effectInterface).removeEffectFromIdOnTokenMultiple(
      effectIds,
      <string>tokenId,
    );
    return result;
  },

  async updateEffectFromIdOnToken(tokenId: string, effectId: string, origin, overlay, effectUpdated: Effect) {
    const result = await (<EffectInterface>this.effectInterface).updateEffectFromIdOnToken(
      effectId,
      tokenId,
      origin,
      overlay,
      effectUpdated,
    );
    return result;
  },

  async updateEffectFromNameOnToken(tokenId: string, effectName: string, origin, overlay, effectUpdated: Effect) {
    const result = await (<EffectInterface>this.effectInterface).updateEffectFromNameOnToken(
      effectName,
      tokenId,
      origin,
      overlay,
      effectUpdated,
    );
    return result;
  },

  async updateActiveEffectFromIdOnToken(
    tokenId: string,
    effectId: string,
    origin,
    overlay,
    effectUpdated: ActiveEffectData,
  ) {
    const result = await (<EffectInterface>this.effectInterface).updateActiveEffectFromIdOnToken(
      effectId,
      tokenId,
      origin,
      overlay,
      effectUpdated,
    );
    return result;
  },

  async updateActiveEffectFromNameOnToken(
    tokenId: string,
    effectName: string,
    origin,
    overlay,
    effectUpdated: ActiveEffectData,
  ) {
    const result = await (<EffectInterface>this.effectInterface).updateActiveEffectFromNameOnToken(
      effectName,
      tokenId,
      origin,
      overlay,
      effectUpdated,
    );
    return result;
  },

  // OLD API
  // For example, if you want to set all the selected tokens invisible:
  // `ConditionalVisibility.setCondition(canvas.tokens.controlled, 'invisible', true)`

  // The *hidden* condition requires system specific rules, and so uses a different set of methods.  Note this is only available on systems that have these rules developed, currently only D&D 5e.  Issues or contributions for other issues are welcome.

  // `ConditionalVisibility.hide(tokens, value)`
  // * tokens - a list of tokens to affect
  // * value - optional; a flat value to apply to all tokens.  If not specified, each token will make system-specific roll.

  // `ConditionalVisibility.unHide(tokens)`
  // * tokens - a list of tokens from which to remove the hidden condition.

  async hide(tokens: Token[], value: number) {
    const allSensesAndConditionsData: SenseData[] = [];
    allSensesAndConditionsData.push(...API.SENSES);
    allSensesAndConditionsData.push(...API.CONDITIONS);
    const senseDataEffect = allSensesAndConditionsData.find((senseData) => {
      return isStringEquals(senseData.id, AtcvEffectConditionFlags.HIDDEN);
    });
    if (senseDataEffect) {
      for (const token of tokens) {
        const sourceVisionLevels = getConditionsFromTokenFast(token.document, true) ?? [];
        for (const sourceVision of sourceVisionLevels) {
          if (isStringEquals(sourceVision.visionId, AtcvEffectConditionFlags.HIDDEN)) {
            const atcvEffect = sourceVision;
            repairAndSetFlag(token, AtcvEffectConditionFlags.HIDDEN, atcvEffect);
          }
        }
        if (
          game.modules.get('midi-qol')?.active &&
          <boolean>(<any>(<any>game.settings.get('midi-qol', 'ConfigSettings'))?.optionalRules)?.removeHiddenInvis
        ) {
          await token.actor?.unsetFlag(CONSTANTS.MODULE_NAME, ConditionalVisibilityFlags.FORCE_VISIBLE);
        }
      }
    }
  },

  async unHide(tokens: Token[]) {
    for (const token of tokens) {
      const sourceVisionLevels = getConditionsFromTokenFast(token.document, true) ?? [];
      for (const sourceVision of sourceVisionLevels) {
        if (isStringEquals(sourceVision.visionId, AtcvEffectConditionFlags.HIDDEN)) {
          // const atcvEffect = sourceVision; //AtcvEffect.fromSenseData(senseDataEffect, 1);
          // await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, AtcvEffectConditionFlags.HIDDEN);
          repairAndUnSetFlag(token, AtcvEffectConditionFlags.HIDDEN);
        }
      }
      if (
        game.modules.get('midi-qol')?.active &&
        <boolean>(<any>(<any>game.settings.get('midi-qol', 'ConfigSettings'))?.optionalRules)?.removeHiddenInvis
      ) {
        if (token.actor) {
          await token.actor?.setFlag(CONSTANTS.MODULE_NAME, ConditionalVisibilityFlags.FORCE_VISIBLE, true);
        }
      }
    }
  },

  async clean(tokens: Token[]) {
    const allSensesAndConditionsData: SenseData[] = [];
    allSensesAndConditionsData.push(...API.SENSES);
    allSensesAndConditionsData.push(...API.CONDITIONS);
    for (const token of tokens) {
      const arr = getSensesFromTokenFast(token.document, true);
      for (const atcvEffect of arr) {
        repairAndUnSetFlag(token, atcvEffect.visionId);
      }
      const arr2 = getConditionsFromTokenFast(token.document, true);
      for (const atcvEffect of arr2) {
        repairAndUnSetFlag(token, atcvEffect.visionId);
      }
      if (
        game.modules.get('midi-qol')?.active &&
        <boolean>(<any>(<any>game.settings.get('midi-qol', 'ConfigSettings'))?.optionalRules)?.removeHiddenInvis
      ) {
        await token.actor?.unsetFlag(CONSTANTS.MODULE_NAME, ConditionalVisibilityFlags.FORCE_VISIBLE);
      }
    }
  },

  async setCondition(tokens: Token[], conditionId: string, disabled: boolean): Promise<void> {
    for (const token of tokens) {
      if (
        game.modules.get('midi-qol')?.active &&
        <boolean>(<any>(<any>game.settings.get('midi-qol', 'ConfigSettings'))?.optionalRules)?.removeHiddenInvis
      ) {
        await token.actor?.unsetFlag(CONSTANTS.MODULE_NAME, ConditionalVisibilityFlags.FORCE_VISIBLE);
      }
      const sourceVisionLevels = getConditionsFromTokenFast(token.document, true) ?? [];
      for (const sourceVision of sourceVisionLevels) {
        if (isStringEquals(sourceVision.visionId, conditionId)) {
          const atcvEffect = sourceVision; //AtcvEffect.fromSenseData(senseDataEffect, 1);
          await token.actor?.setFlag(CONSTANTS.MODULE_NAME, conditionId, atcvEffect);
        }
      }
    }
  },

  async addOrUpdateEffectConditionalVisibilityOnToken(
    tokenNameOrId: string,
    senseDataEffect: AtcvEffect,
    disabled: boolean,
  ): Promise<AtcvEffect | undefined> {
    const tokens = <Token[]>canvas.tokens?.placeables;
    const token = <Token>tokens.find((token) => {
      return isStringEquals(token.name, i18n(tokenNameOrId)) || isStringEquals(token.id, tokenNameOrId);
    });

    if (!token) {
      warn(`No token found with reference '${tokenNameOrId}'`, true);
    }

    let distance = <number>senseDataEffect.visionDistanceValue;
    let visionLevel = <number>senseDataEffect.visionLevelValue;

    if (!distance) {
      distance = 0;
    }

    if (!visionLevel) {
      visionLevel = 0;
    }

    let effect:Effect = <Effect>await retrieveAndMergeEffect(
      senseDataEffect.visionId, senseDataEffect.visionName, 
      distance, visionLevel);

    const isSense = senseDataEffect.visionType === 'sense';
    if (!effect) {
      const sensesAndConditionOrderByName = <AtcvEffect[]>await getAllDefaultSensesAndConditions(token);
      const senseOrCondition = <AtcvEffect>sensesAndConditionOrderByName.find((sense: AtcvEffect) => {
        return (
          isStringEquals(sense.visionId, senseDataEffect.visionId) ||
          isStringEquals(sense.visionName, senseDataEffect.visionName)
        );
      });
      if (senseOrCondition) {
        /*
        changesTmp = <any[]>[
          {
            key: 'ATCV.' + senseOrCondition.visionId,
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: String(senseDataEffect.visionLevelValue),
            priority: 5,
          },
        ];
        changesTmp = changesTmp.filter((c) => !c.key.startsWith(`data.`));
        if (senseDataEffect.visionDistanceValue && senseDataEffect.visionDistanceValue > 0) {
          changesTmp.push({
            key: 'ATCV.conditionDistance',
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: `${senseDataEffect.visionDistanceValue}`,
            priority: 5,
          });
        }
        */
        const changesTmp = retrieveEffectChangeDataFromAtcvEffect(senseDataEffect);
        effect = EffectSupport.buildDefault(
          senseOrCondition.visionId,
          senseOrCondition.visionName,
          senseOrCondition.visionIcon,
          !!isSense,
          [],
          [],
          [],
          changesTmp,
        );
      } else {
        /*
        changesTmp = <any[]>[
          {
            key: 'ATCV.' + senseDataEffect.visionId,
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: String(senseDataEffect.visionLevelValue),
            priority: 5,
          },
        ];
        changesTmp = changesTmp.filter((c) => !c.key.startsWith(`data.`));
        if (senseDataEffect.visionDistanceValue && senseDataEffect.visionDistanceValue > 0) {
          changesTmp.push({
            key: 'ATCV.conditionDistance',
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: `${senseDataEffect.visionDistanceValue}`,
            priority: 5,
          });
        }
        */
        const changesTmp = retrieveEffectChangeDataFromAtcvEffect(senseDataEffect);
        effect = EffectSupport.buildDefault(
          senseDataEffect.visionId,
          senseDataEffect.visionName,
          senseDataEffect.visionIcon,
          !!isSense,
          [],
          [],
          [],
          changesTmp,
        );
      }
    }
    // TODO check if we need this ??? ADDED 2022-05-22
    else if (EffectSupport._handleIntegrations(effect)?.length == 0) {
      info(`The use case 'changesTmp.length==0' should not be happening`);
      const effectTmp = AtcvEffect.toEffectFromAtcvEffect(senseDataEffect);
      effect.changes = effectTmp.changes;
      effect.tokenMagicChanges = effectTmp.tokenMagicChanges;
      effect.atlChanges = effectTmp.atlChanges;
      effect.atcvChanges = effectTmp.atcvChanges;
    }

    // Add some feature if is a sense or a condition
    if (!effect) {
      warn(
        `No effect found with reference '${senseDataEffect.visionId}' and name '${senseDataEffect.visionName}', please create this active effect on the actor or on dfred convinient effects with the AE change 'ATCV.${senseDataEffect.visionId}' with any numeric value`,
        true,
      );
      return undefined;
    } else {
      if (isSense) {
        effect.isTemporary = false; // passive ae
        // effect.dae = { stackable: false, specialDuration: [], transfer: true }
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

      let effectToFoundByName = i18n(senseDataEffect.visionName);
      if (!effectToFoundByName.endsWith('(CV)')) {
        effectToFoundByName = effectToFoundByName + ' (CV)';
      }
      let nameToUse = effectToFoundByName ? effectToFoundByName : effect?.name;
      if (!nameToUse.endsWith('(CV)')) {
        nameToUse = nameToUse + ' (CV)';
      }
      const activeEffectFounded = <ActiveEffect>await API.findEffectByNameOnToken(<string>token.id, nameToUse);
      if (activeEffectFounded) {
        await (<EffectInterface>this.effectInterface).updateEffectFromIdOnToken(
          <string>activeEffectFounded.id,
          <string>token.id,
          undefined,
          undefined,
          effect,
        );
      } else {
        if (!nameToUse.endsWith('(CV)')) {
          nameToUse = nameToUse + ' (CV)';
        }
        if (!effect.name.endsWith('(CV)')) {
          effect.name = effect.name + ' (CV)';
        }
        await (<EffectInterface>this.effectInterface).addEffectOnToken(nameToUse, <string>token.id, effect);
      }
      effect.atcvChanges = AtcvEffect.retrieveAtcvChangesFromEffect(effect);
      const atcvEffectFlagData = AtcvEffect.fromEffect(token.document, effect);
      const result = atcvEffectFlagData;
      return result;
    }
  },

  async registerSense(senseData: SenseData): Promise<void> {
    const sensesData = <SenseData[]>API.SENSES;
    const newSenseData = await _registerSenseData(senseData, sensesData, 'sense');
    if (newSenseData && newSenseData.length > 0) {
      await game.settings.set(CONSTANTS.MODULE_NAME, 'senses', newSenseData);
      info(`Register sense '${senseData.id}' with name ${senseData.name}`, true);
    }
  },

  async registerCondition(senseData: SenseData): Promise<void> {
    const conditionsData = <SenseData[]>API.CONDITIONS;
    const newConditionData = await _registerSenseData(senseData, conditionsData, 'condition');
    if (newConditionData && newConditionData.length > 0) {
      await game.settings.set(CONSTANTS.MODULE_NAME, 'conditions', newConditionData);
      info(`Register condition '${senseData.id}' with name ${senseData.name}`, true);
    }
  },

  async unRegisterSense(senseDataIdOrName: string): Promise<void> {
    const sensesData = <SenseData[]>API.SENSES;
    const newSenseData = await _unregisterSenseData(senseDataIdOrName, sensesData, 'sense');
    if (newSenseData && newSenseData.length > 0) {
      await game.settings.set(CONSTANTS.MODULE_NAME, 'senses', newSenseData);
      info(`Unregister sense '${senseDataIdOrName}'`, true);
    }
  },

  async unRegisterCondition(senseDataIdOrName: string): Promise<void> {
    const conditionsData = <SenseData[]>API.CONDITIONS;
    const newConditionsData = await _unregisterSenseData(senseDataIdOrName, conditionsData, 'condition');
    if (newConditionsData && newConditionsData.length > 0) {
      await game.settings.set(CONSTANTS.MODULE_NAME, 'conditions', newConditionsData);
      info(`Unregister condition '${senseDataIdOrName}`, true);
    }
  },

  async rollStealth(token: Token): Promise<number> {
    let mytotal = 0;
    if (token && token.actor) {
      const stealthActiveSetting = API.STEALTH_ACTIVE_SKILL; //game.settings.get(CONSTANTS.MODULE_NAME, 'passiveStealthSkill');
      //document.actor.data
      const stealthActive = <number>getProperty(<Actor>token?.document?.actor, `data.${stealthActiveSetting}`);
      if (stealthActiveSetting && stealthActive && is_real_number(stealthActive)) {
        // && !isNaN(stealthActive)) {
        const roll = await new Roll('1d20 + (' + stealthActive + ')').roll();
        mytotal = <number>roll.total;
      }
      const roll = await new Roll('1d20').roll();
      mytotal = <number>roll.total;
    } else {
      const roll = await new Roll('1d20').roll();
      mytotal = <number>roll.total;
    }
    // This is atrick only for cv module
    if (mytotal < 0) {
      mytotal = 0;
    }
    return mytotal;
  },

  async prepareActiveEffectForConditionalVisibilityArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('prepareActiveEffectForConditionalVisibility | inAttributes must be of type array');
    }
    const [sourceToken, visionCapabilities] = inAttributes;
    const result = await prepareActiveEffectForConditionalVisibility(sourceToken, visionCapabilities);
    return result;
  },

  updateSourceCVArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('updateSourceCVArr | inAttributes must be of type array');
    }
    const [sourceToken] = inAttributes;
    for (const t of <Token[]>canvas.tokens?.placeables) {
      t.updateSource();
      t.document.update();
      Hooks.callAll('sightRefresh', t);
    }
  },

  sightRefreshCVArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('sightRefreshCVArr | inAttributes must be of type array');
    }
    const [sourceToken] = inAttributes;
    // Hooks.callAll('sightRefresh', sourceToken);
    for (const t of <Token[]>canvas.tokens?.placeables) {
      Hooks.callAll('sightRefresh', t);
    }
  },

  drawImageByUserCVArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('drawImageByUserCVArr | inAttributes must be of type array');
    }
    const [image, sourceTokenId] = inAttributes;
    const tokens = <Token[]>canvas.tokens?.placeables;
    const sourceToken = <Token>tokens.find((token) => {
      return isStringEquals(token.name, i18n(sourceTokenId)) || isStringEquals(token.id, sourceTokenId);
    });

    if (!sourceToken) {
      warn(`No token found with reference '${sourceTokenId}'`, true);
    }
    checkAndDisplayUserSpecificImage(image, sourceToken, true, 40);
  },

  renderAutoSkillsDialogCVArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('renderAutoSkillsDialogCVArr | inAttributes must be of type array');
    }
    const [sourceTokenId, enabledSkill, isSense, valSkillRoll] = inAttributes;
    const tokens = <Token[]>canvas.tokens?.placeables || [];
    const sourceToken = <Token>tokens.find((token) => {
      return isStringEquals(token.name, i18n(sourceTokenId)) || isStringEquals(token.id, sourceTokenId);
    });

    if (!sourceToken) {
      warn(`No token found with reference '${sourceTokenId}'`, true);
    }
    renderAutoSkillsDialog(sourceToken, enabledSkill, isSense, valSkillRoll);
  },

  canSeeFromTokenIds(sourceTokenIdOrName: string, targetTokenIdOrName: string): boolean {
    if (!sourceTokenIdOrName) {
      warn(`No source token reference is passed`, true);
    }
    if (!targetTokenIdOrName) {
      warn(`No target token reference is passed`, true);
    }
    const tokens = <Token[]>canvas.tokens?.placeables || [];
    const sourceToken = <Token>tokens.find((token) => {
      return isStringEquals(token.name, i18n(targetTokenIdOrName)) || isStringEquals(token.id, targetTokenIdOrName);
    });
    const targetToken = <Token>tokens.find((token) => {
      return isStringEquals(token.name, i18n(sourceTokenIdOrName)) || isStringEquals(token.id, sourceTokenIdOrName);
    });
    return this.canSee(sourceToken,targetToken);
  },

  canSee(sourceToken: Token, targetToken: Token): boolean {
    if (!sourceToken) {
      warn(`No source token is found`, true);
    }
    if (!targetToken) {
      warn(`No target token is found`, true);
    }
    const cvResultData = shouldIncludeVisionV2(sourceToken, targetToken);
    return cvResultData.canSee;
  },

  canSeeWithData(sourceTokenIdOrName: string, targetTokenIdOrName: string): CVResultData {
    const tokens = <Token[]>canvas.tokens?.placeables || [];
    const sourceToken = <Token>tokens.find((token) => {
      return isStringEquals(token.name, i18n(targetTokenIdOrName)) || isStringEquals(token.id, targetTokenIdOrName);
    });
    const targetToken = <Token>tokens.find((token) => {
      return isStringEquals(token.name, i18n(sourceTokenIdOrName)) || isStringEquals(token.id, sourceTokenIdOrName);
    });
    if (!sourceToken) {
      warn(`No token found with reference '${sourceTokenIdOrName}'`, true);
    }
    if (!targetToken) {
      warn(`No token found with reference '${targetTokenIdOrName}'`, true);
    }
    const cvResultData = shouldIncludeVisionV2(sourceToken, targetToken);
    return cvResultData;
  },

  async cleanUpToken(tokenId: string) {
    const token = <Token>canvas.tokens?.get(tokenId);
    if (token && token.document) {
      if (getProperty(token.document, `data.flags.${CONSTANTS.MODULE_NAME}`)) {
        const p = getProperty(token.document, `data.flags.${CONSTANTS.MODULE_NAME}`);
        for (const key in p) {
          const senseOrConditionIdKey = key;
          const senseOrConditionValue = <AtcvEffect>p[key];
          await token.document.unsetFlag(CONSTANTS.MODULE_NAME, senseOrConditionIdKey);
          info(`Cleaned up token '${token.name}'`, true);
        }
      }
    } else {
      warn(`No token found on the canvas for id '${tokenId}'`, true);
    }
  },

  async cleanUpTokenSelected() {
    const tokens = <Token[]>canvas.tokens?.controlled;
    if (!tokens || tokens.length === 0) {
      warn(`No tokens are selected`, true);
      return;
    }
    for (const token of tokens) {
      if (token && token.document) {
        if (getProperty(token.document, `data.flags.${CONSTANTS.MODULE_NAME}`)) {
          const p = getProperty(token.document, `data.flags.${CONSTANTS.MODULE_NAME}`);
          for (const key in p) {
            const senseOrConditionIdKey = key;
            const senseOrConditionValue = <AtcvEffect>p[key];
            await token.document.unsetFlag(CONSTANTS.MODULE_NAME, senseOrConditionIdKey);
            info(`Cleaned up token '${token.name}'`, true);
          }
        }
      } else {
        warn(`No token found on the canvas for id '${token.id}'`, true);
      }
    }
    for (const token of tokens) {
      if (token && token.actor) {
        if (getProperty(token.actor, `data.flags.${CONSTANTS.MODULE_NAME}`)) {
          const p = getProperty(token.actor, `data.flags.${CONSTANTS.MODULE_NAME}`);
          for (const key in p) {
            const senseOrConditionIdKey = key;
            const senseOrConditionValue = <AtcvEffect>p[key];
            await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, senseOrConditionIdKey);
            info(`Cleaned up actor '${token.name}'`, true);
          }
        }
      } else {
        warn(`No token found on the canvas for id '${token.id}'`, true);
      }
    }
  },

  async cleanUpTokenSelectedOnlyCVData() {
    const tokens = <Token[]>canvas.tokens?.controlled;
    if (!tokens || tokens.length === 0) {
      warn(`No tokens are selected`, true);
      return;
    }
    for (const token of tokens) {
      if (token && token.actor) {
        if (getProperty(token.actor, `data.flags.${CONSTANTS.MODULE_NAME}`)) {
          const p = getProperty(token.actor, `data.flags.${CONSTANTS.MODULE_NAME}`);
          for (const key in p) {
            const senseOrConditionIdKey = key;
            if (key.startsWith('data')) {
              const senseOrConditionValue = <AtcvEffect>p[key];
              await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, senseOrConditionIdKey);
              info(`Cleaned up actor '${token.name}'`, true);
            }
          }
        }
      } else {
        warn(`No token found on the canvas for id '${token.id}'`, true);
      }
    }
  },

  // weakMap: new Map<String, boolean>(),
};

export default API;
