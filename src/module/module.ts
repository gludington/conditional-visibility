import { ConditionalVisibilityEffectDefinitions } from './conditional-visibility-effect-definition';
import { registerLibwrappers } from './libwrapper';
import { registerSocket, conditionalVisibilitySocket } from './socket';

import CONSTANTS from './constants';
import HOOKS from './hooks';
import {
  debug,
  duplicateExtended,
  getConditionsFromToken,
  getSensesFromToken,
  i18n,
  isStringEquals,
  is_real_number,
  prepareActiveEffectForConditionalVisibility,
  repairAndSetFlag,
  repairAndUnSetFlag,
  toggleStealth,
  warn,
} from './lib/lib';
import API from './api';
import EffectInterface from './effects/effect-interface';
import { registerHotkeys } from './hotkeys';
import { canvas, game } from './settings';
import { checkSystem } from './settings';
import {
  AtcvEffect,
  AtcvEffectConditionFlags,
  AtcvEffectSenseFlags,
  ConditionalVisibilityFlags,
  SenseData,
  VisionCapabilities,
} from './conditional-visibility-models';
import { EffectChangeData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData';
import Effect, { EffectSupport } from './effects/effect';
import { setApi } from '../conditional-visibility';
import { tokenToString } from 'typescript';
import EmbeddedCollection from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs';
import { ActorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';

export const initHooks = (): void => {
  // registerSettings();
  registerLibwrappers();

  Hooks.once('socketlib.ready', registerSocket);

  Hooks.on('dfreds-convenient-effects.ready', (...args) => {
    module.dfredsConvenientEffectsReady(...args);
  });

  if (game.settings.get(CONSTANTS.MODULE_NAME, 'debugHooks')) {
    for (const hook of Object.values(HOOKS)) {
      if (typeof hook === 'string') {
        Hooks.on(hook, (...args) => debug(`Hook called: ${hook}`, ...args));
        debug(`Registered hook: ${hook}`);
      } else {
        for (const innerHook of Object.values(hook)) {
          Hooks.on(<string>innerHook, (...args) => debug(`Hook called: ${innerHook}`, ...args));
          debug(`Registered hook: ${innerHook}`);
        }
      }
    }
  }

  //@ts-ignore
  window.ConditionalVisibility = {
    API,
  };
};

export const setupHooks = (): void => {
  // setup all the hooks
  API.effectInterface = new EffectInterface(CONSTANTS.MODULE_NAME) as unknown as typeof EffectInterface;
  //@ts-ignore
  API.effectInterface.initialize();

  //@ts-ignore
  window.ConditionalVisibility.API.effectInterface = new EffectInterface(CONSTANTS.MODULE_NAME);
  //@ts-ignore
  window.ConditionalVisibility.API.effectInterface.initialize();

  // Deprecated to remove soon....
  //@ts-ignore
  window.ConditionalVisibility.setCondition = ConditionalVisibility.API.setCondition;
  //@ts-ignore
  window.ConditionalVisibility.unHide = ConditionalVisibility.API.unHide;
  //@ts-ignore
  window.ConditionalVisibility.hide = ConditionalVisibility.API.hide;

  // if (!game[CONSTANTS.MODULE_NAME]) {
  //   game[CONSTANTS.MODULE_NAME] = {};
  // }
  // if (!game[CONSTANTS.MODULE_NAME].API) {
  //   game[CONSTANTS.MODULE_NAME].API = {};
  // }
  // //@ts-ignore
  // game[CONSTANTS.MODULE_NAME].API = window.ConditionalVisibility.API;

  //@ts-ignore
  setApi(window.ConditionalVisibility.API);
};

export const readyHooks = (): void => {
  checkSystem();
  registerHotkeys();
  Hooks.callAll(HOOKS.READY);

  // ConditionalVisibility.initialize(sightLayer, canvas.hud?.token);
  // Add any additional hooks if necessary
  Hooks.on('renderTokenConfig', (tokenConfig, html, data) => {
    // Only GM can see this
    if (game.user?.isGM) {
      module.onRenderTokenConfig(tokenConfig, html, data);
    }
  });

  Hooks.on('updateToken', (document: TokenDocument, change, options, userId) => {
    module.updateToken(document, change, options, userId);
  });

  Hooks.on('updateActor', (actor: Actor, change, options, userId) => {
    if (actor.token) {
      module.updateActor(<TokenDocument>actor.token, change, options, userId);
    } else {
      const token = canvas.tokens?.placeables.find((t: Token) => {
        return t.actor?.id === actor.id;
      });
      if (token) {
        module.updateActor(<TokenDocument>token.document, change, options, userId);
      }
    }
  });

  Hooks.on('addActiveEffect', async (effect, options) => {
    module.updateActiveEffect(effect, options, false);
  });

  Hooks.on('updateActiveEffect', async (effect, options) => {
    module.updateActiveEffect(effect, options, false);
  });

  Hooks.on('deleteActiveEffect', async (effect, options) => {
    module.updateActiveEffect(effect, options, true);
  });

  Hooks.on('renderTokenHUD', (app, html, data) => {
    // Only GM can see this
    if (game.user?.isGM) {
      module.renderTokenHUD(app, html, data);
    }
  });

  Hooks.on('renderChatMessage', async (message: ChatMessage, html: JQuery<HTMLElement>, speakerInfo) => {
    module.renderChatMessage(message, html, speakerInfo);
  });
};

const module = {
  onRenderTokenConfig(tokenConfig: TokenConfig, jQuery: JQuery, data: object): void {
    const visionTab = $('div.tab[data-tab="vision"]');
    // TODO TO CHECK IF I CAN ADD MY CUSTOMIZED ONES WITHOUT THE NEED OF REGISTERED
    // const senses = API.SENSES ?? [];
    // const conditions = API.CONDITIONS ?? [];
    const senses = getSensesFromToken(tokenConfig.token).sort((a, b) => a.visionName.localeCompare(b.visionName));
    const conditions = getConditionsFromToken(tokenConfig.token).sort((a, b) =>
      a.visionName.localeCompare(b.visionName),
    );

    const sensesTemplateData: any[] = [];
    for (const s of senses) {
      if (s.visionId != AtcvEffectSenseFlags.NONE && s.visionId != AtcvEffectSenseFlags.NORMAL) {
        const s2: any = duplicateExtended(s);
        // const currentAtcvEffectFlagData = <AtcvEffect>tokenConfig.object.getFlag(CONSTANTS.MODULE_NAME, s.visionId);
        const currentAtcvEffectFlagData =
          <AtcvEffect>tokenConfig.actor.getFlag(CONSTANTS.MODULE_NAME, s.visionId) ??
          <AtcvEffect>tokenConfig.object.getFlag(CONSTANTS.MODULE_NAME, s.visionId);
        if (currentAtcvEffectFlagData) {
          s2.value = currentAtcvEffectFlagData.visionLevelValue ?? 0;
        } else {
          s2.value = 0;
        }
        sensesTemplateData.push(s2);
      }
    }

    const conditionsTemplateData: any[] = [];
    for (const s of conditions) {
      if (s.visionId != AtcvEffectConditionFlags.NONE) {
        const s2: any = duplicateExtended(s);
        // const currentAtcvEffectFlagData = <AtcvEffect>tokenConfig.object.getFlag(CONSTANTS.MODULE_NAME, s.visionId);
        const currentAtcvEffectFlagData =
          <AtcvEffect>tokenConfig.actor.getFlag(CONSTANTS.MODULE_NAME, s.visionId) ??
          <AtcvEffect>tokenConfig.object.getFlag(CONSTANTS.MODULE_NAME, s.visionId);
        if (currentAtcvEffectFlagData) {
          s2.value = currentAtcvEffectFlagData.visionLevelValue ?? 0;
        } else {
          s2.value = 0;
        }
        conditionsTemplateData.push(s2);
      }
    }
    renderTemplate(`modules/${CONSTANTS.MODULE_NAME}/templates/extra_senses.hbs`, {
      // flags: tokenConfig.object.data.flags[CONSTANTS.MODULE_NAME] ?? {},
      senses: sensesTemplateData,
      conditions: conditionsTemplateData,
      forcevisible: tokenConfig.actor.getFlag(CONSTANTS.MODULE_NAME, ConditionalVisibilityFlags.FORCE_VISIBLE) ?? false
    }).then((extraSenses) => {
      visionTab.append(extraSenses);
    });
  },
  async updateActor(document: TokenDocument, change, options, userId) {
    const sourceToken = <Token>document.object;
    if (!sourceToken) {
      return;
    }
    const isPlayerOwned = <boolean>document.isOwner;
    if (!game.user?.isGM && !isPlayerOwned) {
      return;
    }
    // const sourceVisionCapabilities: VisionCapabilities = new VisionCapabilities(<Token>document.object);
    // TODO for now only dnd5e
    let p = getProperty(change, API.PATH_ATTRIBUTES_SENSES);
    // TODO to remove
    if (!p) {
      p = getProperty(change, `data.attributes.senses`);
    }
    for (const key in p) {
      const senseOrConditionIdKey = key;
      const senseOrConditionValue = <number>p[key];
      const atcvEffectFlagData = API.getAllDefaultSensesAndConditions(sourceToken).find((senseData: AtcvEffect) => {
        return isStringEquals(senseData.visionId, senseOrConditionIdKey);
      });
      if (!atcvEffectFlagData) {
        warn(`Can't find a senseData for the sense '${senseOrConditionIdKey}'`, true);
      } else {
        // const effects = ConditionalVisibilityEffectDefinitions.all(senseOrConditionValue, atcvEffectFlagData.visionLevelValue);
        if (senseOrConditionValue && <number>senseOrConditionValue > 0) {
          atcvEffectFlagData.visionDistanceValue = senseOrConditionValue;
          if (!atcvEffectFlagData.visionLevelValue || atcvEffectFlagData.visionLevelValue === 0) {
            atcvEffectFlagData.visionLevelValue = 1;
          }
          // await sourceToken?.document.setFlag(CONSTANTS.MODULE_NAME, senseOrConditionIdKey, atcvEffectFlagData);
          await repairAndSetFlag(sourceToken, senseOrConditionIdKey, atcvEffectFlagData);
        }
      }
    } // Fine for
    if (
      change.flags &&
      change.flags[CONSTANTS.MODULE_NAME] &&
      !getProperty(change, `flags.${CONSTANTS.MODULE_NAME}.${ConditionalVisibilityFlags.FORCE_VISIBLE}`)
    ) {
      module.updateToken(sourceToken.document, change, options, userId);
    } else {
      // if (getProperty(<Actor>sourceToken.actor, `data.flags.${CONSTANTS.MODULE_NAME}`)) {
      //   // Refrsh for any ATCV update
      //   canvas.perception.schedule({
      //     lighting: { refresh: true },
      //     sight: { refresh: true },
      //   });
      // }
    }
  },
  async updateToken(document: TokenDocument, change, options, userId) {
    const sourceToken = <Token>document.object;
    if (!sourceToken) {
      return;
    }
    const isPlayerOwned = <boolean>document.isOwner;
    if (!game.user?.isGM && !isPlayerOwned) {
      return;
    }
    let isEnabledForToken = false;
    let p;
    if (
      change.flags &&
      change.flags[CONSTANTS.MODULE_NAME] &&
      !getProperty(change, `flags.${CONSTANTS.MODULE_NAME}.${ConditionalVisibilityFlags.FORCE_VISIBLE}`)
    ) {
      isEnabledForToken = true;
      p = getProperty(change, `flags.${CONSTANTS.MODULE_NAME}`);
    }
    if (
      change.flags &&
      change.actor &&
      change.actor.flags[CONSTANTS.MODULE_NAME] &&
      !getProperty(change, `actor.flags.${CONSTANTS.MODULE_NAME}.${ConditionalVisibilityFlags.FORCE_VISIBLE}`)
    ) {
      isEnabledForToken = true;
      p = getProperty(change, `actor.flags.${CONSTANTS.MODULE_NAME}`);
    }
    if (isEnabledForToken) {
      const setAeToRemove = new Set<string>();
      const sourceVisionCapabilities: VisionCapabilities = new VisionCapabilities(<Token>document.object);

      for (const key in p) {
        const senseOrConditionIdKey = key;
        const senseOrConditionValue = <AtcvEffect>p[key];
        if (senseOrConditionIdKey.includes('-=')) {
          continue;
        }
        if (
          //// !senseOrConditionValue.visionLevelValue ||
          // isNaN(<any>senseOrConditionValue.visionLevelValue) ||
          !is_real_number(senseOrConditionValue.visionLevelValue) ||
          senseOrConditionValue.visionLevelValue === undefined ||
          senseOrConditionValue.visionLevelValue === null
        ) {
          const currentValueOfFlag = Number(
            // (<AtcvEffect>document.getFlag(CONSTANTS.MODULE_NAME, senseOrConditionIdKey))?.visionLevelValue || 0,
            (<AtcvEffect>document.actor?.getFlag(CONSTANTS.MODULE_NAME, senseOrConditionIdKey))?.visionLevelValue ??
              (<AtcvEffect>document.getFlag(CONSTANTS.MODULE_NAME, senseOrConditionIdKey))?.visionLevelValue ??
              0,
          );
          if (senseOrConditionValue.visionLevelValue != currentValueOfFlag) {
            senseOrConditionValue.visionLevelValue = currentValueOfFlag;
          }
        }
        const senseOrConditionId = senseOrConditionIdKey; //senseOrConditionIdKey.replace('-=', '');
        if (
          senseOrConditionValue?.visionLevelValue &&
          senseOrConditionValue?.visionLevelValue != 0
          //senseOrConditionValue?.visionLevelValue != currentValueOfFlag //not neeed this
        ) {
          // const isSense = <SenseData>API.SENSES.find((sense: SenseData) => {
          //   return (
          //     isStringEquals(sense.id, senseOrConditionId) || isStringEquals(i18n(sense.name), i18n(senseOrConditionId))
          //   );
          // });
          // const isCondition = <SenseData>API.CONDITIONS.find((sense: SenseData) => {
          //   return (
          //     isStringEquals(sense.id, senseOrConditionId) || isStringEquals(i18n(sense.name), i18n(senseOrConditionId))
          //   );
          // });

          const isSense = <AtcvEffect>getSensesFromToken(sourceToken.document).find((sense: AtcvEffect) => {
            return (
              isStringEquals(<string>sense.visionId, senseOrConditionId) ||
              isStringEquals(<string>sense.visionName, senseOrConditionId)
            );
          });
          const isCondition = <AtcvEffect>getConditionsFromToken(sourceToken.document).find((sense: AtcvEffect) => {
            return (
              isStringEquals(<string>sense.visionId, senseOrConditionId) ||
              isStringEquals(<string>sense.visionName, senseOrConditionId)
            );
          });
          if (!isSense && !isCondition) {
            warn(
              `The effect found for id '${senseOrConditionId}' on the token '${document.name}' is not a 'sense' or a 'condition', this is impossible check out the active effect changes on the token`,
            );
            return;
          }
          if (isSense) {
            const cur = <AtcvEffect>sourceVisionCapabilities.senses.get(senseOrConditionId);
            if (cur) {
              if (!cur.visionType) {
                cur.visionType = 'sense';
              }
              cur.visionLevelValue = <number>senseOrConditionValue.visionLevelValue;
              sourceVisionCapabilities.senses.set(senseOrConditionId, cur);
            } else {
              if (!isSense.visionType) {
                isSense.visionType = 'sense';
              }
              sourceVisionCapabilities.senses.set(senseOrConditionId, isSense);
            }
          } else {
            const cur = <AtcvEffect>sourceVisionCapabilities.conditions.get(senseOrConditionId);
            if (cur) {
              if (!cur.visionType) {
                cur.visionType = 'condition';
              }
              cur.visionLevelValue = <number>senseOrConditionValue.visionLevelValue;
              sourceVisionCapabilities.conditions.set(senseOrConditionId, cur);
            } else {
              if (!isCondition.visionType) {
                isCondition.visionType = 'condition';
              }
              sourceVisionCapabilities.conditions.set(senseOrConditionId, isCondition);
            }
          }
          if (sourceVisionCapabilities.hasSenses() || sourceVisionCapabilities.hasConditions()) {
            await prepareActiveEffectForConditionalVisibility(sourceToken, sourceVisionCapabilities);

            // if (!game.user?.isGM && isGMConnected()) {
            //   return conditionalVisibilitySocket.executeAsGM('prepareActiveEffectForConditionalVisibility', sourceToken, sourceVisionCapabilities);
            // } else {
            //   await prepareActiveEffectForConditionalVisibility(sourceToken, sourceVisionCapabilities);
            // }

            // TODO CHECK IF We don't need the modification of the effect start this anyway
            // const mapFlagsToUpdated = <Map<string,AtcvEffect>>await prepareActiveEffectForConditionalVisibility(token, sourceVisionCapabilities);
            // for (const [atcvEffectKey, atcvEffectValue] of mapFlagsToUpdated) {
            //   await repairAndSetFlag(token, atcvEffectKey, atcvEffectValue);
            // }
          }
        } else if (
          senseOrConditionValue.visionLevelValue === 0 ||
          senseOrConditionValue.visionLevelValue === null ||
          senseOrConditionValue.visionLevelValue === undefined
        ) {
          // //for (const senseData of await API.getAllDefaultSensesAndConditions(token)) {
          // //  const effectNameToCheckOnActor = i18n(<string>senseData?.visionName);
          // const effectNameToCheckOnActor = i18n(senseOrConditionValue.visionName)
          //   //if (await API.hasEffectAppliedOnToken(<string>token.id, effectNameToCheckOnActor, true)) {
          //     const activeEffectToRemove = <ActiveEffect>(
          //       await API.findEffectByNameOnToken(<string>token.id, effectNameToCheckOnActor)
          //     );
          //     if(activeEffectToRemove){
          //       await API.removeEffectFromIdOnToken(<string>token.id, <string>activeEffectToRemove.id);
          //     }
          //   //}
          // //}
          // Make sure to remove anything with value 0
          for (const senseData of await API.getAllDefaultSensesAndConditions(sourceToken)) {
            if (senseData.visionId === senseOrConditionIdKey) {
              const effectNameToCheckOnActor = i18n(<string>senseData?.visionName);
              const activeEffectToRemove = <ActiveEffect>(
                await API.findEffectByNameOnToken(<string>sourceToken.id, effectNameToCheckOnActor)
              );
              if (activeEffectToRemove) {
                const actve = senseOrConditionValue.visionLevelValue ?? 0;
                if (actve === 0 || actve === null || actve === undefined || !actve) {
                  //await API.removeEffectFromIdOnToken(<string>sourceToken.id, <string>activeEffectToRemove.id);
                  setAeToRemove.add(<string>activeEffectToRemove.id);
                }
              }
            }
          }
        }
      } // Fine for
      // TODO check better solution
      // conditionalVisibilitySocket.executeForEveryone('sightRefreshCV', sourceToken);
      // for (const t of <Token[]>canvas.tokens?.placeables) {
      //   t.updateSource();
      //   // t.document.update();
      //   // Hooks.callAll('sightRefresh', t);
      //   // t.refresh();
      // }
      // FINALLY REMVE ALL THE ACTIVE EFFECT
      if (setAeToRemove.size > 0) {
        API.removeEffectFromIdOnTokenMultiple(<string>sourceToken.id, Array.from(setAeToRemove));
      }
    }
    // if (getProperty(<Actor>sourceToken.actor, `data.flags.${CONSTANTS.MODULE_NAME}`)) {
    //   // Refrsh for any ATCV update
    //   canvas.perception.schedule({
    //     lighting: { refresh: true },
    //     sight: { refresh: true },
    //   });
    // }
  },
  async updateActiveEffect(activeEffect: ActiveEffect, options: EffectChangeData, isRemoved: boolean) {
    if (
      !activeEffect.data?.changes ||
      activeEffect.data?.changes.length <= 0 ||
      !activeEffect.data.changes?.find((effect) => effect.key.includes('ATCV'))
    ) {
      return;
    }
    const actor = <Actor>activeEffect.parent;
    const totalEffects = <ActiveEffect[]>actor?.effects.contents.filter((i) => !i.data.disabled);
    const atcvEffects = totalEffects.filter(
      (entity) => !!entity.data.changes.find((effect) => effect.key.includes('ATCV')),
    );
    if (activeEffect.data.disabled || isRemoved) {
      const atcvEffectsChanges = activeEffect.data.changes.filter((entity) => entity.key.includes('ATCV'));
      if (atcvEffectsChanges && atcvEffectsChanges.length > 0) {
        atcvEffects.push(activeEffect);
      }
    }

    const entity = <Actor>activeEffect.parent;
    if (entity.documentName !== 'Actor') {
      return;
    }
    let link = getProperty(entity, 'data.token.actorLink');
    if (link === undefined) {
      link = true;
    }
    let tokenArray: Token[] = [];
    if (!link) {
      //@ts-ignore
      tokenArray = [entity.token?.object];
    } else {
      tokenArray = entity.getActiveTokens();
    }
    if (tokenArray === []) {
      return;
    }

    if (atcvEffects.length > 0) {
      for (const atcvEffect of atcvEffects) {
        const changes = atcvEffect.data.changes.sort((a, b) => <number>a.priority - <number>b.priority);
        // Apply all changes
        for (const change of changes) {
          if (!change.key.includes('ATCV')) {
            continue;
          }
          const updateKey = change.key.slice(5);
          for (const tokenToSet of tokenArray) {
            const isPlayerOwned = <boolean>tokenToSet.document.isOwner;
            if (!isPlayerOwned) {
              continue;
            }
            const sensesData = await API.getAllDefaultSensesAndConditions(tokenToSet);
            for (const statusSight of sensesData) {
              if (updateKey === statusSight.visionId) {
                // TODO TO CHECK IF WE NEED TO FILTER THE TOKENS AGAIN MAYBE WITH A ADDITIONAL ATCV active change data effect ?
                const currentAtcvEffectFlagData = <AtcvEffect>(
                  // tokenToSet?.document.getFlag(CONSTANTS.MODULE_NAME, updateKey)
                  (tokenToSet?.actor?.getFlag(CONSTANTS.MODULE_NAME, updateKey) ??
                    tokenToSet?.document.getFlag(CONSTANTS.MODULE_NAME, updateKey))
                );
                const currentValue = String(<number>currentAtcvEffectFlagData?.visionLevelValue) ?? '0';
                if (change.value != currentValue) {
                  if (isRemoved || currentValue == '0') {
                    // await tokenToSet?.document.unsetFlag(CONSTANTS.MODULE_NAME, updateKey);
                    await repairAndUnSetFlag(tokenToSet, updateKey);
                  } else {
                    const atcvEffectFlagData = AtcvEffect.fromActiveEffect(tokenToSet.document, atcvEffect);
                    // await tokenToSet?.document.setFlag(CONSTANTS.MODULE_NAME, updateKey, atcvEffectFlagData);
                    await repairAndSetFlag(tokenToSet, updateKey, atcvEffectFlagData);
                  }
                  // REMOVES SOME PEOPLE DOESN'T WANT THIS ? AND I'M NOT SURE HOW OTHER MODULES CAN WORK WITH THIS
                  // if (statusSight?.visionPath && statusSight?.visionPath.toLowerCase().includes('data')) {
                  //   if (isRemoved || currentValue == '0') {
                  //     setProperty(tokenToSet.document, <string>statusSight?.visionPath, 0);
                  //   } else {
                  //     setProperty(tokenToSet.document, <string>statusSight?.visionPath, change.value);
                  //   }
                  // }
                } else {
                  // Strange bug fixing
                  if (isRemoved && activeEffect.id === atcvEffect.id) {
                    // await tokenToSet?.document.unsetFlag(CONSTANTS.MODULE_NAME, updateKey);
                    await repairAndUnSetFlag(tokenToSet, updateKey);
                  }
                }
                break;
              }
            }
            // TODO check better solution
            // conditionalVisibilitySocket.executeForEveryone('updateSourceCV', tokenToSet);
            // for (const t of <Token[]>canvas.tokens?.placeables) {
            //   t.updateSource();
            //   // t.document.update();
            //   // Hooks.callAll('sightRefresh', t);
            //   // t.refresh();
            // }
          }
        }
      }
    } else {
      if (isRemoved) {
        for (const sourceToken of tokenArray) {
          const sense = (await API.getAllDefaultSensesAndConditions(sourceToken)).find((sense: AtcvEffect) => {
            return (
              isStringEquals(sense.visionName, <string>activeEffect.name) ||
              isStringEquals(sense.visionName, activeEffect.data.label)
            );
          });
          if (sense?.visionId) {
            // await sourceToken?.document.unsetFlag(CONSTANTS.MODULE_NAME, sense?.visionId);
            await repairAndUnSetFlag(sourceToken, sense?.visionId);
            // TODO check better solution
            //conditionalVisibilitySocket.executeForEveryone('updateSourceCV', sourceToken);
            // for (const t of <Token[]>canvas.tokens?.placeables) {
            //   t.updateSource();
            //   // t.document.update();
            //   // Hooks.callAll('sightRefresh', t);
            //   // t.refresh();
            // }
          }
        }
      }
    }
    // Refrsh for any ATCV update
    // canvas.perception.schedule({
    //   lighting: { refresh: true },
    //   sight: { refresh: true },
    // });
  },
  async dfredsConvenientEffectsReady(...args) {
    if (!game.settings.get(CONSTANTS.MODULE_NAME, 'disableDCEAutomaticImport')) {
      // https://github.com/DFreds/dfreds-convenient-effects/issues/110
      //@ts-ignore
      if (game.modules.get('dfreds-convenient-effects')?.active && game.dfreds && game.dfreds.effectInterface) {
        const effects = ConditionalVisibilityEffectDefinitions.all(0, 1);
        const activeEffectsData: any[] = [];
        for (const effect of effects) {
          // I also added this for specifically checking for custom effects.
          // It will return undefined if it doesn't exist:
          let effectToFoundByName = i18n(effect.name);
          if (!effectToFoundByName.endsWith('(CV)')) {
            effectToFoundByName = effectToFoundByName + ' (CV)';
          }
          //@ts-ignore
          const effectFounded = <Effect>game.dfreds.effectInterface.findCustomEffectByName(effectToFoundByName);
          if (!effectFounded) {
            const origin = undefined;
            const overlay = false;
            const disabled = false;

            const isSense = API.SENSES.find((sense: SenseData) => {
              return isStringEquals(sense.id, effect.customId) || isStringEquals(i18n(sense.name), effectToFoundByName);
            });
            const isCondition = API.CONDITIONS.find((sense: SenseData) => {
              return isStringEquals(sense.id, effect.customId) || isStringEquals(i18n(sense.name), effectToFoundByName);
            });
            // Add some feature if is a sense or a condition
            if (effect) {
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
            }
            // BUG ???
            //const data = effect.convertToActiveEffectData({ origin, overlay });
            //effect.origin = EffectSupport.prepareOriginForToken(token);
            effect.overlay = overlay;
            const data = EffectSupport.convertToActiveEffectData(effect);
            activeEffectsData.push(data);
          }
        }

        //The data that is passed in are standard ActiveEffectData... i.e. from
        //canvas.tokens.controlled[0].actor.effects.get('some key').data.toObject()
        //@ts-ignore
        game.dfreds.effectInterface.createNewCustomEffectsWith({
          activeEffects: activeEffectsData,
        });
      }
    }
  },
  async renderTokenHUD(...args) {
    if (game.settings.get(CONSTANTS.MODULE_NAME, 'enableHud')) {
      const [app, html, data] = args;
      if (!game.user?.isGM) {
        return;
      }
      if (!app?.object?.document) {
        return;
      }
      const buttonPos = game.settings.get(CONSTANTS.MODULE_NAME, 'hudPos');
      const atcvEffectFlagData = <AtcvEffect>(
        // app.object.document.getFlag(CONSTANTS.MODULE_NAME, AtcvEffectConditionFlags.HIDDEN)
        (app.object.actor.getFlag(CONSTANTS.MODULE_NAME, AtcvEffectConditionFlags.HIDDEN) ??
          app.object.document.getFlag(CONSTANTS.MODULE_NAME, AtcvEffectConditionFlags.HIDDEN))
      );
      const hiddenValue = atcvEffectFlagData?.visionLevelValue ?? 0;
      const borderButton = `<div class="control-icon toggleStealth ${
        hiddenValue && hiddenValue != 0 ? 'active' : ''
      }" ${
        hiddenValue && hiddenValue != 0
          ? `style="background: blue; opacity:0.85;"`
          : `style="background: blueviolet; opacity:0.85;"`
      } title="Toggle Stealth"> <i class="fas fa-eye"></i></div>`;
      const Pos = html.find(buttonPos);
      Pos.append(borderButton);
      html.find('.toggleStealth').click(toggleStealth.bind(app));
    }
  },
  async renderChatMessage(...args){
    const [message, html, speakerInfo] = args; // message: ChatMessage, html: JQuery<HTMLElement>, speakerInfo
    if (!game?.ready) {
      return;
    }
    if (!game.settings.get(CONSTANTS.MODULE_NAME, 'autoStealth')) {
      return;
    }
    let tokenChatId = <string>speakerInfo.message.speaker.token;
    const actorChatId = <string>speakerInfo.message.speaker.actor;

    if (!actorChatId) {
      return;
    }

    const actor = <Actor>game.actors?.get(actorChatId);
    if (!tokenChatId) {
      if (actor.getActiveTokens()?.length > 0) {
        tokenChatId = <string>actor.getActiveTokens()[0].id;
      }
    }
    let token: Token | null = null;
    if (tokenChatId) {
      token = <Token>canvas.tokens?.placeables.find((t) => {
        return t.id === tokenChatId;
      });
    }

    let selectedTokens = <Token[]>[];
    if (token) {
      selectedTokens = [token];
    }
    if (!selectedTokens || selectedTokens.length == 0) {
      selectedTokens = [<Token[]>canvas.tokens?.controlled][0];
    }

    const sourceToken = selectedTokens[0];
    if (!sourceToken) {
      return;
    }
    const isPlayerOwned = <boolean>sourceToken.document.isOwner;
    if (!game.user?.isGM && !isPlayerOwned) {
      return;
    }

    let isStealth = false;
    // This work with TAH, LMRTFY and character sheet
    if (speakerInfo.message.roll) {
      const rollChatTotal = JSON.parse(<string>speakerInfo.message.roll)?.total || '0';
      const fullTextContent: string =
        <number>message.data.flavor?.length > message.data.content.length
          ? <string>message.data.flavor
          : <string>message.data.content;
      if (fullTextContent) {
        // Clean up the string for multisystem (D&D5, PF2, ecc.)
        const innerTextTmp = fullTextContent.toLowerCase().trim();
        const arr1 = innerTextTmp.split(/\r?\n/);
        for (let i = 0; i < arr1.length; i++) {
          let text = arr1[i];
          if (text) {
            text = text.toLowerCase().trim();
            // TODO integration multisystem
            // Keywords to avoid for all the system ?
            if (text.indexOf('check') !== -1 || text.indexOf('ability') !== -1 || text.indexOf('skill') !== -1) {
              //
            } else {
              continue;
            }
            text = text.replace(/\W/g, ' ');
            text = text.replace('skill', '');
            text = text.replace('check', '');
            text = text.replace('ability', '');
            text = text.replace(/[0-9]/g, '');
            if (text.trim().indexOf(i18n(API.STEALTH_ID_LANG_SKILL).toLowerCase()) !== -1) {
              isStealth = true;
              break;
            }
          }
        }
      }

      if (isStealth) {
        //@ts-ignore
        let valStealthRoll = parseInt(rollChatTotal);
        // if (isNaN(valStealthRoll)) {
        if (!is_real_number(valStealthRoll)) {
          valStealthRoll = 0;
        }

        const senseId = AtcvEffectSenseFlags.NONE;
        const conditionId = AtcvEffectConditionFlags.HIDDEN;

        for (const selectedToken of selectedTokens) {
          if (!selectedToken) {
            continue;
          }
          const setAeToRemove = new Set<string>();
          const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>selectedToken.actor?.data.effects;
          if (senseId != AtcvEffectSenseFlags.NONE && senseId != AtcvEffectSenseFlags.NORMAL) {
            const effect = <Effect>await ConditionalVisibilityEffectDefinitions.effect(senseId);
            if (effect) {
              if (valStealthRoll == 0) {
                // await API.removeEffectOnToken(selectedToken.id, i18n(<string>effect?.name));
                const effectToRemove = <ActiveEffect>(
                  actorEffects.find((activeEffect) =>
                    isStringEquals(<string>activeEffect?.data?.label, <string>effect?.name),
                  )
                );
                if (effectToRemove) {
                  setAeToRemove.add(<string>effectToRemove.id);
                }
                await repairAndUnSetFlag(selectedToken, senseId);
              } else {
                const atcvEffectFlagData = AtcvEffect.fromEffect(selectedToken.document, effect);
                atcvEffectFlagData.visionLevelValue = valStealthRoll;
                await repairAndSetFlag(selectedToken, senseId, atcvEffectFlagData);
              }
            } else {
              warn(`Can't find effect definition for '${senseId}'`, true);
            }
          }
          //@ts-ignore
          if (conditionId != AtcvEffectConditionFlags.NONE) {
            const effect = <Effect>await ConditionalVisibilityEffectDefinitions.effect(conditionId);
            if (effect) {
              if (valStealthRoll == 0) {
                // await API.removeEffectOnToken(selectedToken.id, i18n(<string>effect?.name));
                const effectToRemove = <ActiveEffect>(
                  actorEffects.find((activeEffect) =>
                    isStringEquals(<string>activeEffect?.data?.label, <string>effect?.name),
                  )
                );
                if (effectToRemove) {
                  setAeToRemove.add(<string>effectToRemove.id);
                }
                await repairAndUnSetFlag(selectedToken, conditionId);
              } else {
                const atcvEffectFlagData = AtcvEffect.fromEffect(selectedToken.document, effect);
                atcvEffectFlagData.visionLevelValue = valStealthRoll;
                await repairAndSetFlag(selectedToken, conditionId, atcvEffectFlagData);
              }
            } else {
              warn(`Can't find effect definition for '${conditionId}'`, true);
            }
          }
          // FINALLY REMVE ALL THE ACTIVE EFFECT
          if (setAeToRemove.size > 0) {
            API.removeEffectFromIdOnTokenMultiple(<string>selectedToken.id, Array.from(setAeToRemove));
          }
        }
      }
    }
    // This work with Monk TokenBar
    else if (message.data.flags['monks-tokenbar']) {
      const rollChatTotal = $(message.data.content).find('.total').html() || '0';
      //@ts-ignore
      let valStealthRoll = parseInt(rollChatTotal);
      // if (isNaN(valStealthRoll)) {
      if (!is_real_number(valStealthRoll)) {
        valStealthRoll = 0;
      }
      if (valStealthRoll === 0) {
        return;
      }
      const fullTextContent: string = <string>(<any>message.data.flags['monks-tokenbar']).name;
      if (fullTextContent) {
        // Clean up the string for multisystem (D&D5, PF2, ecc.)
        const innerTextTmp = fullTextContent.toLowerCase().trim();
        const arr1 = innerTextTmp.split(/\r?\n/);
        for (let i = 0; i < arr1.length; i++) {
          let text = arr1[i];
          if (text) {
            text = text.toLowerCase().trim();
            // TODO integration multisystem
            // Keywords to avoid for all the system ?
            if (text.indexOf('check') !== -1 || text.indexOf('ability') !== -1 || text.indexOf('skill') !== -1) {
              //
            } else {
              continue;
            }
            text = text.replace(/\W/g, ' ');
            text = text.replace('skill', '');
            text = text.replace('check', '');
            text = text.replace('ability', '');
            text = text.replace(/[0-9]/g, '');
            if (text.trim().indexOf(i18n(API.STEALTH_ID_LANG_SKILL).toLowerCase()) !== -1) {
              isStealth = true;
              break;
            }
          }
        }
      }
      if (isStealth) {
        const senseId = AtcvEffectSenseFlags.NONE;
        const conditionId = AtcvEffectConditionFlags.HIDDEN;

        for (const selectedToken of selectedTokens) {
          if (!selectedToken) {
            continue;
          }
          const setAeToRemove = new Set<string>();
          const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>selectedToken.actor?.data.effects;
          if (senseId != AtcvEffectSenseFlags.NONE && senseId != AtcvEffectSenseFlags.NORMAL) {
            const effect = <Effect>await ConditionalVisibilityEffectDefinitions.effect(senseId);
            if (effect) {
              if (valStealthRoll == 0) {
                // await API.removeEffectOnToken(selectedToken.id, i18n(<string>effect?.name));
                const effectToRemove = <ActiveEffect>(
                  actorEffects.find((activeEffect) =>
                    isStringEquals(<string>activeEffect?.data?.label, <string>effect?.name),
                  )
                );
                if (effectToRemove) {
                  setAeToRemove.add(<string>effectToRemove.id);
                }
                await repairAndUnSetFlag(selectedToken, senseId);
              } else {
                const atcvEffectFlagData = AtcvEffect.fromEffect(selectedToken.document, effect);
                atcvEffectFlagData.visionLevelValue = valStealthRoll;
                await repairAndSetFlag(selectedToken, senseId, atcvEffectFlagData);
              }
            } else {
              warn(`Can't find effect definition for '${senseId}'`, true);
            }
          }
          //@ts-ignore
          if (conditionId != AtcvEffectConditionFlags.NONE) {
            const effect = <Effect>await ConditionalVisibilityEffectDefinitions.effect(conditionId);
            if (effect) {
              if (valStealthRoll == 0) {
                // await API.removeEffectOnToken(selectedToken.id, i18n(<string>effect?.name));
                const effectToRemove = <ActiveEffect>(
                  actorEffects.find((activeEffect) =>
                    isStringEquals(<string>activeEffect?.data?.label, <string>effect?.name),
                  )
                );
                if (effectToRemove) {
                  setAeToRemove.add(<string>effectToRemove.id);
                }
                await repairAndUnSetFlag(selectedToken, conditionId);
              } else {
                const atcvEffectFlagData = AtcvEffect.fromEffect(selectedToken.document, effect);
                atcvEffectFlagData.visionLevelValue = valStealthRoll;
                await repairAndSetFlag(selectedToken, conditionId, atcvEffectFlagData);
              }
            } else {
              warn(`Can't find effect definition for '${conditionId}'`, true);
            }
          }
          // FINALLY REMVE ALL THE ACTIVE EFFECT
          if (setAeToRemove.size > 0) {
            API.removeEffectFromIdOnTokenMultiple(<string>selectedToken.id, Array.from(setAeToRemove));
          }
        }
      }
    }
  }
};
