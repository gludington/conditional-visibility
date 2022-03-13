import CONSTANTS from './constants';
import { dialogWarning, error, i18n, info, isStringEquals, mergeByProperty, warn } from './lib/lib';
import EffectInterface from './effects/effect-interface';
import { AtcvEffectFlagData, SenseData } from './conditional-visibility-models';
import HOOKS from './hooks';
import { EnhancedConditions } from './cub/enhanced-conditions';
import { canvas, game } from './settings';
import Effect, { EffectSupport } from './effects/effect';
import { ConditionalVisibilityEffectDefinitions } from './conditional-visibility-effect-definition';
import { ActiveEffectData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';

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
  get PERCEPTION_PASSIVE_SKILL() {
    return game.settings.get(CONSTANTS.MODULE_NAME, 'passivePerceptionSkill');
  },

  /**
   * The attribute used to track the passive stealth skill in this system
   *
   * @returns {String}
   */
  get STEALTH_PASSIVE_SKILL() {
    return game.settings.get(CONSTANTS.MODULE_NAME, 'passiveStealthSkill');
  },

  /**
   * The attribute used to track the active stealth skill in this system
   *
   * @returns {String}
   */
  get STEALTH_ACTIVE_SKILL() {
    return game.settings.get(CONSTANTS.MODULE_NAME, 'activeStealthSkill');
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
    inAttributes.forEach((attribute) => {
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
    });
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
    inAttributes.forEach((attribute) => {
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
    });
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
    const result = await this.effectInterface.toggleEffect(effectName, params);
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
    const result = await (<EffectInterface>this.effectInterface)._effectHandler.hasEffectApplied(effectName, uuid);
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
    const result = await this.effectInterface.addEffectOnActor(effectName, <string>actorId, effect);
    return result;
  },

  async findEffectByNameOnActor(actorId: string, effectName: string): Promise<ActiveEffect | null> {
    const result = await this.effectInterface.findEffectByNameOnActor(effectName, <string>actorId);
    return result;
  },

  async hasEffectAppliedOnActor(actorId: string, effectName: string, includeDisabled:boolean) {
    const result = await this.effectInterface.hasEffectAppliedOnActor(effectName, <string>actorId, includeDisabled);
    return result;
  },

  async hasEffectAppliedFromIdOnActor(actorId: string, effectId: string, includeDisabled:boolean) {
    const result = await this.effectInterface.hasEffectAppliedFromIdOnActor(effectId, <string>actorId, includeDisabled);
    return result;
  },

  async toggleEffectFromIdOnActor(
    actorId: string,
    effectId: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ) {
    const result = await this.effectInterface.toggleEffectFromIdOnActor(
      effectId,
      <string>actorId,
      alwaysDelete,
      forceEnabled,
      forceDisabled,
    );
    return result;
  },

  async addActiveEffectOnActor(actorId: string, activeEffectData: ActiveEffectData) {
    const result = this.effectInterface.addActiveEffectOnActor(<string>actorId, activeEffectData);
    return result;
  },

  async removeEffectOnActor(actorId: string, effectName: string) {
    const result = await this.effectInterface.removeEffectOnActor(effectName, <string>actorId);
    return result;
  },

  async removeEffectFromIdOnActor(actorId: string, effectId: string) {
    const result = await this.effectInterface.removeEffectFromIdOnActor(effectId, <string>actorId);
    return result;
  },
  */
  // ======================
  // Effect Token Management
  // ======================

  async addEffectOnToken(tokenId: string, effectName: string, effect: Effect) {
    const result = await this.effectInterface.addEffectOnToken(effectName, <string>tokenId, effect);
    return result;
  },

  async findEffectByNameOnToken(tokenId: string, effectName: string): Promise<ActiveEffect | null> {
    const result = await this.effectInterface.findEffectByNameOnToken(effectName, <string>tokenId);
    return result;
  },

  async hasEffectAppliedOnToken(tokenId: string, effectName: string, includeDisabled: boolean) {
    const result = await this.effectInterface.hasEffectAppliedOnToken(effectName, <string>tokenId, includeDisabled);
    return result;
  },

  async hasEffectAppliedFromIdOnToken(tokenId: string, effectId: string, includeDisabled: boolean) {
    const result = await this.effectInterface.hasEffectAppliedFromIdOnToken(effectId, <string>tokenId, includeDisabled);
    return result;
  },

  async toggleEffectFromIdOnToken(
    tokenId: string,
    effectId: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ) {
    const result = await this.effectInterface.toggleEffectFromIdOnToken(
      effectId,
      <string>tokenId,
      alwaysDelete,
      forceEnabled,
      forceDisabled,
    );
    return result;
  },

  async addActiveEffectOnToken(tokenId: string, activeEffectData: ActiveEffectData) {
    const result = await this.effectInterface.addActiveEffectOnToken(<string>tokenId, activeEffectData);
    return result;
  },

  async removeEffectOnToken(tokenId: string, effectName: string) {
    const result = await this.effectInterface.removeEffectOnToken(effectName, <string>tokenId);
    return result;
  },

  async removeEffectFromIdOnToken(tokenId: string, effectId: string) {
    const result = await this.effectInterface.removeEffectFromIdOnToken(effectId, <string>tokenId);
    return result;
  },

  async updateEffectFromIdOnToken(tokenId: string, effectId: string, origin, overlay, effectUpdated: Effect) {
    const result = await this.effectInterface.updateEffectFromIdOnToken(
      effectId,
      tokenId,
      origin,
      overlay,
      effectUpdated,
    );
    return result;
  },

  async updateEffectFromNameOnToken(tokenId: string, effectName: string, origin, overlay, effectUpdated: Effect) {
    const result = await this.effectInterface.updateEffectFromNameOnToken(
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
    const result = await this.effectInterface.updateActiveEffectFromIdOnToken(
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
    const result = await this.effectInterface.updateActiveEffectFromNameOnToken(
      effectName,
      tokenId,
      origin,
      overlay,
      effectUpdated,
    );
    return result;
  },

  /*
  static async addEffectConditionalVisibilityOnActor(
    actorNameOrId: string,
    effectName: string,
    distance: number | undefined,
    visionLevel: number | undefined,
  ) {
    const actor = <Actor>game.actors?.get(actorNameOrId) || <Actor>game.actors?.getName(i18n(actorNameOrId));

    if (!actor) {
      warn(`No actor found with reference '${actorNameOrId}'`, true);
    }

    if (!distance) {
      distance = 0;
    }

    if (!visionLevel) {
      visionLevel = 0;
    }

    let effect: Effect | undefined = undefined;
    const sensesOrderByName = <StatusSight[]>API.SENSES.sort((a, b) => a.name.localeCompare(b.name));
    sensesOrderByName.forEach((a: StatusSight) => {
      if (a.id == effectName || i18n(a.name) == effectName) {
        effect = <Effect>EffectDefinitions.all(distance, visionLevel).find((e: Effect) => {
          return e.customId == a.id;
        });
      }
    });

    if (!effect) {
      warn(`No effect found with reference '${effectName}'`, true);
    }

    if (actor && effect) {
      await API.effectInterface.addEffectOnActor(effectName, <string>actor.id, effect);
    }
  }
  */

  async setCondition(
    tokenNameOrId: string,
    senseDataId: string,
    disabled: boolean,
    distance: number | undefined,
    visionLevel: number | undefined,
  ) {
    return API.addEffectConditionalVisibilityOnToken(tokenNameOrId, senseDataId, disabled, distance, visionLevel);
  },

  async addEffectConditionalVisibilityOnToken(
    tokenNameOrId: string,
    senseDataId: string,
    disabled: boolean,
    distance: number | undefined,
    visionLevel: number | undefined,
  ) {
    const tokens = <Token[]>canvas.tokens?.placeables;
    const token = <Token>tokens.find((token) => {
      return isStringEquals(token.name, i18n(tokenNameOrId)) || isStringEquals(token.id, tokenNameOrId);
    });

    if (!token) {
      warn(`No token found with reference '${tokenNameOrId}'`, true);
    }

    if (!distance) {
      distance = 0;
    }

    if (!visionLevel) {
      visionLevel = 0;
    }

    const sensesAndConditionOrderByName = <SenseData[]>await this.getAllSensesAndConditions();
    const effectsDefinition = <Effect[]>ConditionalVisibilityEffectDefinitions.all(distance, visionLevel);

    let effect: Effect | undefined = undefined;
    let senseData: SenseData | undefined = undefined;

    for (const sense of sensesAndConditionOrderByName) {
      // Check for dfred convenient effect and retrieve the effect with the specific name
      // https://github.com/DFreds/dfreds-convenient-effects/issues/110
      //@ts-ignore
      if (sense.effectCustomId && game.dfreds) {
        //@ts-ignore
        effect = <Effect>await game.dfreds.effectInterface.findCustomEffectByName(sense.name);
        senseData = sense;
        break;
      }
      if (senseDataId == sense.id) {
        effect = <Effect>effectsDefinition.find((effect: Effect) => {
          return isStringEquals(effect.customId, sense.id) || isStringEquals(i18n(effect.name), i18n(sense.name));
        });
        senseData = sense;
        break;
      }
    }

    const isSense = API.SENSES.find((sense: SenseData) => {
      return (
        isStringEquals(sense.id, (<SenseData>senseData).id) ||
        isStringEquals(i18n(sense.name), i18n((<SenseData>senseData).name))
      );
    });

    if (!effect) {
      const senseOrCondition = <SenseData>sensesAndConditionOrderByName.find((sense: SenseData) => {
        return (
          isStringEquals(sense.id, (<SenseData>senseData).id) ||
          isStringEquals(i18n(sense.name), i18n((<SenseData>senseData).name))
        );
      });
      if (senseOrCondition) {
        const atcvChanges = [
          {
            key: 'ATCV.' + senseOrCondition.id,
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: String(visionLevel),
            priority: 5,
          },
        ];
        effect = EffectSupport.buildDefault(senseOrCondition, !!isSense, [], [], [], atcvChanges);
      }
    }
    // Add some feature if is a sense or a condition
    if (effect) {
      if (isSense) {
        effect.isTemporary = false; // passive ae
        // effect.dae = { stackable: false, specialDuration: [], transfer: true }
        effect.transfer = false;
      }
      effect.transfer = !disabled;
    }

    if (!effect) {
      warn(`No effect found with reference '${senseDataId}'`, true);
    } else {
      if (token && effect) {
        const nameToUse = senseData?.name ? senseData?.name : effect?.name;
        await this.effectInterface.addEffectOnToken(nameToUse, <string>token.id, effect);
        //await token?.document?.setFlag(CONSTANTS.MODULE_NAME, (<Effect>effect).customId, visionLevel);
        const atcvEffectFlagData = AtcvEffectFlagData.fromEffect(effect);
        await token?.document?.setFlag(CONSTANTS.MODULE_NAME, (<Effect>effect).customId, atcvEffectFlagData);
      }
    }
  },

  async getAllSensesAndConditions(): Promise<SenseData[]> {
    let allSensesAndConditions: SenseData[] = [];
    const senses = API.SENSES;
    const conditions = API.CONDITIONS;
    allSensesAndConditions = mergeByProperty(allSensesAndConditions, senses, 'id');
    allSensesAndConditions = mergeByProperty(allSensesAndConditions, conditions, 'id');
    const sensesOrderByName = <SenseData[]>allSensesAndConditions.sort((a, b) => a.name.localeCompare(b.name));
    return sensesOrderByName;
  },

  async registerSense(senseData: SenseData): Promise<void> {
    const sensesData = <SenseData[]>game.settings.get(CONSTANTS.MODULE_NAME, 'senses');
    const newSenseData = await this._registerSenseData(senseData, sensesData, 'sense', false);
    if (newSenseData && newSenseData.length > 0) {
      await game.settings.set(CONSTANTS.MODULE_NAME, 'senses', newSenseData);
      info(`Register sense '${senseData.id}' with name ${senseData.name}`, true);
    }
  },

  async registerCondition(senseData: SenseData): Promise<void> {
    const conditionsData = <SenseData[]>game.settings.get(CONSTANTS.MODULE_NAME, 'conditions');
    const newConditionData = await this._registerSenseData(senseData, conditionsData, 'condition', false);
    if (newConditionData && newConditionData.length > 0) {
      await game.settings.set(CONSTANTS.MODULE_NAME, 'conditions', newConditionData);
      info(`Register condition '${senseData.id}' with name ${senseData.name}`, true);
    }
  },

  async unRegisterSense(senseDataIdOrName: string): Promise<void> {
    const sensesData = <SenseData[]>game.settings.get(CONSTANTS.MODULE_NAME, 'senses');
    const newSenseData = await this._unregisterSenseData(senseDataIdOrName, sensesData, 'sense', true);
    if (newSenseData && newSenseData.length > 0) {
      await game.settings.set(CONSTANTS.MODULE_NAME, 'senses', newSenseData);
      info(`Untegister sense '${senseDataIdOrName}'`, true);
    }
  },

  async unRegisterCondition(senseDataIdOrName: string): Promise<void> {
    const conditionsData = <SenseData[]>game.settings.get(CONSTANTS.MODULE_NAME, 'conditions');
    const newConditionsData = await this._unregisterSenseData(senseDataIdOrName, conditionsData, 'condition', true);
    if (newConditionsData && newConditionsData.length > 0) {
      await game.settings.set(CONSTANTS.MODULE_NAME, 'conditions', newConditionsData);
      info(`Untegister condition '${senseDataIdOrName}`, true);
    }
  },

  async _registerSenseData(
    senseData: SenseData,
    sensesDataList: SenseData[],
    valueComment: string,
  ): Promise<SenseData[] | undefined> {
    if (!senseData.id) {
      warn(`Cannot register the ${valueComment} with id empty or null`, true);
      return;
    }
    if (!senseData.name) {
      warn(`Cannot register the ${valueComment} with name empty or null`, true);
      return;
    }
    const sensesAndConditionDataList = <SenseData[]>await this.getAllSensesAndConditions();
    const senseAlreadyExistsId = sensesAndConditionDataList.find((a: SenseData) => a.id == senseData.id);
    const senseAlreadyExistsName = sensesAndConditionDataList.find((a: SenseData) => a.name == senseData.name);
    if (senseAlreadyExistsId) {
      warn(`Cannot register the ${valueComment} with id '${senseData.id}' because already exists`, true);
      return;
    }
    if (senseAlreadyExistsName) {
      warn(`Cannot register the ${valueComment} with name '${senseData.name}' because already exists`, true);
      return;
    }
    sensesDataList.push(senseData);
    return sensesDataList;
  },

  async _unregisterSenseData(
    senseDataIdOrName: string,
    sensesDataList: SenseData[],
    valueComment: string,
  ): Promise<SenseData[] | undefined> {
    if (!senseDataIdOrName) {
      warn(`Cannot unregister the ${valueComment} with id empty or null`, true);
      return;
    }
    const sensesAndConditionDataList = <SenseData[]>await this.getAllSensesAndConditions();
    const senseAlreadyExistsId = <SenseData>(
      sensesAndConditionDataList.find((a: SenseData) => a.id == senseDataIdOrName || a.name == senseDataIdOrName)
    );
    if (!senseAlreadyExistsId) {
      warn(`Cannot unregister the ${valueComment} with id '${senseDataIdOrName}' because is not exists exists`, true);
      return;
    }
    sensesDataList = sensesDataList.filter(function (el) {
      return el.id != senseAlreadyExistsId.id;
    });
    return sensesDataList;
  },

  async rollStealth(token: Token): Promise<number> {
    let total = 0;
    if (token && token.actor) {
      const stealthActiveSetting = API.STEALTH_ACTIVE_SKILL; //game.settings.get(CONSTANTS.MODULE_NAME, 'passiveStealthSkill');
      const stealthActive = <number>getProperty(token.actor, `data.${stealthActiveSetting}`);
      if (stealthActiveSetting && stealthActive && !isNaN(stealthActive)) {
        const roll = await new Roll('1d20 + (' + stealthActive + ')').roll();
        total = roll._total;
      }
      const roll = await new Roll('1d20').roll();
      total = roll._total;
    } else {
      const roll = await new Roll('1d20').roll();
      total = roll._total;
    }
    // This is atrick only for cv module
    if (total < 0) {
      total = 0;
    }
    return total;
  },
};

export default API;
