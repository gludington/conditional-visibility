import { ConditionalVisibilityEffectDefinitions } from './conditional-visibility-effect-definition';
import { registerLibwrappers, updateTokenHandler } from './libwrapper';
import { registerSocket, conditionalVisibilitySocket } from './socket';

import CONSTANTS from './constants';
import HOOKS from './hooks';
import {
  debug,
  getConditionsFromToken,
  getSensesFromToken,
  i18n,
  isStringEquals,
  prepareActiveEffectForConditionalVisibility,
  retrieveAtcvElevationFromActiveEffect,
  retrieveAtcvSourcesFromActiveEffect,
  retrieveAtcvTargetImageFromActiveEffect,
  retrieveAtcvTargetsFromActiveEffect,
  retrieveAtcvVisionLevelDistanceFromActiveEffect,
  toggleStealth,
} from './lib/lib';
import API from './api';
import EffectInterface from './effects/effect-interface';
import { registerHotkeys } from './hotkeys';
import { canvas, game } from './settings';
import { checkSystem } from './settings';
import {
  AtcvEffect,
  AtcvEffectConditionFlags,
  AtcvEffectFlagData,
  AtcvEffectSenseFlags,
  SenseData,
  VisionCapabilities,
} from './conditional-visibility-models';
import {
  EffectChangeData,
  EffectChangeDataSource,
} from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData';
import { EffectSupport } from './effects/effect';
import { ActiveEffectData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import StatusEffects from './effects/status-effects';

export const initHooks = async (): Promise<void> => {
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

export const setupHooks = async (): Promise<void> => {
  // setup all the hooks

  //@ts-ignore
  window.ConditionalVisibility.API.effectInterface = new EffectInterface(CONSTANTS.MODULE_NAME);
  //@ts-ignore
  window.ConditionalVisibility.API.effectInterface.initialize();

  // Deprecated to remove soon....
  //@ts-ignore
  window.ConditionalVisibility.setCondition = ConditionalVisibility.API.setCondition;

  if (game[CONSTANTS.MODULE_NAME]) {
    game[CONSTANTS.MODULE_NAME] = {};
  }
  if (game[CONSTANTS.MODULE_NAME].API) {
    game[CONSTANTS.MODULE_NAME].API = {};
  }
  //@ts-ignore
  game[CONSTANTS.MODULE_NAME].API = window.ConditionalVisibility.API;
};

export const readyHooks = async (): Promise<void> => {
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
};

const module = {
  onRenderTokenConfig(tokenConfig: TokenConfig, jQuery: JQuery, data: object): void {
    const visionTab = $('div.tab[data-tab="vision"]');
    const senses = API.SENSES ?? [];
    const sensesTemplateData: any[] = [];
    for (const s of senses) {
      if (s.id != AtcvEffectSenseFlags.NONE && s.id != AtcvEffectSenseFlags.NORMAL) {
        const s2: any = duplicate(s);
        //s2.value = tokenConfig.object.getFlag(CONSTANTS.MODULE_NAME, s.id);
        const currentAtcvEffectFlagData = <AtcvEffectFlagData>tokenConfig.object.getFlag(CONSTANTS.MODULE_NAME, s.id);
        if (currentAtcvEffectFlagData) {
          s2.value = currentAtcvEffectFlagData.visionLevelValue ?? 0;
        } else {
          s2.value = 0;
        }
        sensesTemplateData.push(s2);
      }
    }
    const conditions = API.CONDITIONS ?? [];
    const conditionsTemplateData: any[] = [];
    for (const s of conditions) {
      if (s.id != AtcvEffectSenseFlags.NONE && s.id != AtcvEffectSenseFlags.NORMAL) {
        const s2: any = duplicate(s);
        //s2.value = tokenConfig.object.getFlag(CONSTANTS.MODULE_NAME, s.id);
        const currentAtcvEffectFlagData = <AtcvEffectFlagData>tokenConfig.object.getFlag(CONSTANTS.MODULE_NAME, s.id);
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
    }).then((extraSenses) => {
      visionTab.append(extraSenses);
    });
  },
  async updateToken(document: TokenDocument, change, options, userId) {
    const token = <Token>document.object;
    if (change.flags && change.flags[CONSTANTS.MODULE_NAME]) {
      const sourceVisionCapabilities: VisionCapabilities = new VisionCapabilities(<Token>document.object);
      const p = getProperty(change, `flags.${CONSTANTS.MODULE_NAME}`);
      for (const key in p) {
        const senseOrConditionIdKey = key;
        const senseOrConditionValue = <AtcvEffectFlagData>p[key];
        const senseOrConditionId = senseOrConditionIdKey.replace('-=', '');
        if (senseOrConditionValue?.visionLevelValue && senseOrConditionValue?.visionLevelValue != 0) {
          const isSense = <SenseData>API.SENSES.find((sense: SenseData) => {
            return (
              isStringEquals(sense.id, senseOrConditionId) || isStringEquals(i18n(sense.name), i18n(senseOrConditionId))
            );
          });
          const isCondition = <SenseData>API.CONDITIONS.find((sense: SenseData) => {
            return (
              isStringEquals(sense.id, senseOrConditionId) || isStringEquals(i18n(sense.name), i18n(senseOrConditionId))
            );
          });
          if (isSense) {
            let cur = <AtcvEffect>sourceVisionCapabilities.senses.get(senseOrConditionId);
            if (cur) {
              cur.visionLevelValue = <number>senseOrConditionValue.visionLevelValue;
              sourceVisionCapabilities.senses.set(senseOrConditionId, cur);
            } else {
              cur = <AtcvEffect>{};
              cur.statusSight = isSense;
              cur.visionDistanceValue = isSense.conditionDistance;
              cur.visionElevation = isSense.conditionElevation;
              cur.visionLevelValue = <number>senseOrConditionValue.visionLevelValue;
              cur.visionSources = isSense.conditionSources;
              cur.visionTargets = isSense.conditionTargets;
              cur.visionTargetImage = isSense.conditionTargetImage;
              sourceVisionCapabilities.senses.set(senseOrConditionId, cur);
            }
          } else {
            let cur = <AtcvEffect>sourceVisionCapabilities.conditions.get(senseOrConditionId);
            if (cur) {
              cur.visionLevelValue = <number>senseOrConditionValue.visionLevelValue;
              sourceVisionCapabilities.conditions.set(senseOrConditionId, cur);
            } else {
              cur = <AtcvEffect>{};
              cur.statusSight = isCondition;
              cur.visionDistanceValue = isCondition.conditionDistance;
              cur.visionElevation = isCondition.conditionElevation;
              cur.visionLevelValue = <number>senseOrConditionValue.visionLevelValue;
              cur.visionSources = isCondition.conditionSources;
              cur.visionTargets = isCondition.conditionTargets;
              cur.visionTargetImage = isCondition.conditionTargetImage;
              sourceVisionCapabilities.conditions.set(senseOrConditionId, cur);
            }
          }
        }
        if (sourceVisionCapabilities.hasSenses() || sourceVisionCapabilities.hasConditions()) {
          // const sourceVisionLevels = getSensesFromToken(<Token>document.object);
          prepareActiveEffectForConditionalVisibility(token, sourceVisionCapabilities);
          // const sourceVisionLevels = getSensesFromToken(<Token>document.object);
        } else {
          for (const senseData of await API.getAllSensesAndConditions()) {
            const effectNameToCheckOnActor = i18n(<string>senseData?.name);
            if (await API.hasEffectAppliedOnToken(<string>token.id, effectNameToCheckOnActor, true)) {
              const activeEffectToRemove = <ActiveEffect>(
                await API.findEffectByNameOnToken(<string>token.id, effectNameToCheckOnActor)
              );
              await API.removeEffectFromIdOnToken(<string>token.id, <string>activeEffectToRemove.id);
            }
          }
        }
      } // Fine for
    }
    // If Using Stealth Mode for Player Tokens
    // if (game.settings.get(CONSTANTS.MODULE_NAME, "playerTokenStealthMode").valueOf()){
    //   if (change.disposition == 1 || change.disposition == 2){ // If friendly or Neutral
    //       if (options.hidden == true && game.user?.isGM == false){
    //           for (const placed_token of <Token[]>canvas.tokens?.placeables) {
    //               if (placed_token.id == options._id){ // Find the Token in Question
    //                   if (game.user.id in <Partial<Record<string, 0 | 1 | 2 | 3>>>placed_token?.actor?.data?.permission){ // If I'm an owner of the token; remain visible
    //                       placed_token.data.hidden = false;
    //                   } else {
    //                       placed_token.data.hidden = true;
    //                   }
    //               }
    //           }
    //       }
    //   }
    // }
  },
  async updateActiveEffect(activeEffect: ActiveEffect, options: EffectChangeData, isRemoved: boolean) {
    if (!activeEffect.data.changes?.find((effect) => effect.key.includes('ATCV'))) {
      return;
    }
    const actor = <Actor>activeEffect.parent;
    const totalEffects = <ActiveEffect[]>actor?.effects.contents.filter((i) => !i.data.disabled);
    const atcvEffects = totalEffects.filter(
      (entity) => !!entity.data.changes.find((effect) => effect.key.includes('ATCV')),
    );
    if (activeEffect.data.disabled) {
      atcvEffects.push(activeEffect);
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
          const sensesData = await API.getAllSensesAndConditions();
          for (const statusSight of sensesData) {
            if (updateKey === statusSight.id) {
              // TODO TO CHECK IF WE NEED TO FILTER THE TOKENS AGAIN MAYBE WITH A ADDITIONAL ATCV active change data effect ?
              for (const tokenToSet of tokenArray) {
                const currentAtcvEffectFlagData = <AtcvEffectFlagData>(
                  tokenToSet?.document.getFlag(CONSTANTS.MODULE_NAME, updateKey)
                );
                const currentValue = String(<number>currentAtcvEffectFlagData.visionLevelValue) ?? '0';
                if (change.value != currentValue) {
                  if (isRemoved) {
                    //await tokenToSet?.document.setFlag(CONSTANTS.MODULE_NAME, updateKey, 0);
                    //// setProperty(tokenToSet.document, `data.flags.${CONSTANTS.MODULE_NAME}.${statusSight.id}`, 0);
                    await tokenToSet?.document.unsetFlag(CONSTANTS.MODULE_NAME, updateKey);
                  } else {
                    //await tokenToSet?.document.setFlag(CONSTANTS.MODULE_NAME, updateKey, change.value);
                    //// setProperty(tokenToSet.document, `data.flags.${CONSTANTS.MODULE_NAME}.${statusSight.id}`, change.value);
                    const atcvEffectFlagData = AtcvEffectFlagData.fromActiveEffect(atcvEffect);
                    await tokenToSet?.document.setFlag(CONSTANTS.MODULE_NAME, updateKey, atcvEffectFlagData);
                  }
                  if (statusSight?.path) {
                    if (isRemoved) {
                      setProperty(tokenToSet.document, <string>statusSight?.path, 0);
                    } else {
                      setProperty(tokenToSet.document, <string>statusSight?.path, change.value);
                    }
                  }
                }
              }
              break;
            }
          }
        }
      }
    } else {
      if (isRemoved) {
        for (const tok of tokenArray) {
          const sense = (await API.getAllSensesAndConditions()).find((sense: SenseData) => {
            return (
              isStringEquals(i18n(sense.name), i18n(<string>activeEffect.name)) ||
              isStringEquals(i18n(sense.name), i18n(activeEffect.data.label))
            );
          });
          if (sense?.id) {
            //await tok?.document.setFlag(CONSTANTS.MODULE_NAME, sense?.id, 0);
            await tok?.document.unsetFlag(CONSTANTS.MODULE_NAME, sense?.id);
          }
        }
      }
    }
  },
  async dfredsConvenientEffectsReady(...args) {
    if (!game.settings.get(CONSTANTS.MODULE_NAME, 'disableDCEAutomaticImport')) {
      // https://github.com/DFreds/dfreds-convenient-effects/issues/110
      //@ts-ignore
      if (game.dfreds) {
        const effects = ConditionalVisibilityEffectDefinitions.all();
        const activeEffectsData: any[] = [];
        for (const effect of effects) {
          // I also added this for specifically checking for custom effects.
          // It will return undefined if it doesn't exist:
          const effectToFoundByName = i18n(effect.name);
          //@ts-ignore
          const effectFounded = <Effect>game.dfreds.effectInterface.findCustomEffectByName(effectToFoundByName);
          if (!effectFounded) {
            const origin = undefined;
            const overlay = false;
            const disabled = false;
            // Add some feature if is a sense or a condition
            if (effect) {
              const isSense = API.SENSES.find((sense: SenseData) => {
                return (
                  isStringEquals(sense.id, effect.customId) || isStringEquals(i18n(sense.name), effectToFoundByName)
                );
              });
              if (isSense) {
                effect.isTemporary = false; // passive ae
                // effect.dae = { stackable: false, specialDuration: [], transfer: true }
                effect.transfer = false;
              }
              effect.transfer = !disabled;
            }
            const data = effect.convertToActiveEffectData({ origin, overlay });
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
      //const hiddenValue = app.object.document.getFlag(CONSTANTS.MODULE_NAME, AtcvEffectConditionFlags.HIDDEN);
      const atcvEffectFlagData = <AtcvEffectFlagData>(
        app.object.document.getFlag(CONSTANTS.MODULE_NAME, AtcvEffectConditionFlags.HIDDEN)
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
};
