import { EffectSupport } from './../effects/effect';
import { EffectChangeData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData';
import CONSTANTS from '../constants.js';
import API from '../api.js';
import { canvas, game } from '../settings';
import {
  AtcvEffect,
  AtcvEffectSenseFlags,
  AtcvEffectConditionFlags,
  SenseData,
  VisionCapabilities,
  AtcvEffectFlagData,
} from '../conditional-visibility-models.js';
import EmbeddedCollection from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs';
import {
  ActiveEffectData,
  ActorData,
  TokenData,
} from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import Effect from '../effects/effect.js';
import StatusEffects from '../effects/status-effects.js';
import { ConditionalVisibilityEffectDefinitions } from '../conditional-visibility-effect-definition';
import { data } from 'jquery';

// =============================
// Module Generic function
// =============================

export function isGMConnected(): boolean {
  return Array.from(<Users>game.users).find((user) => user.isGM && user.active) ? true : false;
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// export let debugEnabled = 0;
// 0 = none, warnings = 1, debug = 2, all = 3

export function debug(msg, args = '') {
  if (game.settings.get(CONSTANTS.MODULE_NAME, 'debug')) {
    console.log(`DEBUG | ${CONSTANTS.MODULE_NAME} | ${msg}`, args);
  }
  return msg;
}

export function log(message) {
  message = `${CONSTANTS.MODULE_NAME} | ${message}`;
  console.log(message.replace('<br>', '\n'));
  return message;
}

export function notify(message) {
  message = `${CONSTANTS.MODULE_NAME} | ${message}`;
  ui.notifications?.notify(message);
  console.log(message.replace('<br>', '\n'));
  return message;
}

export function info(info, notify = false) {
  info = `${CONSTANTS.MODULE_NAME} | ${info}`;
  if (notify) ui.notifications?.info(info);
  console.log(info.replace('<br>', '\n'));
  return info;
}

export function warn(warning, notify = false) {
  warning = `${CONSTANTS.MODULE_NAME} | ${warning}`;
  if (notify) ui.notifications?.warn(warning);
  console.warn(warning.replace('<br>', '\n'));
  return warning;
}

export function error(error, notify = true) {
  error = `${CONSTANTS.MODULE_NAME} | ${error}`;
  if (notify) ui.notifications?.error(error);
  return new Error(error.replace('<br>', '\n'));
}

export function timelog(message): void {
  warn(Date.now(), message);
}

export const i18n = (key: string): string => {
  return game.i18n.localize(key)?.trim();
};

export const i18nFormat = (key: string, data = {}): string => {
  return game.i18n.format(key, data)?.trim();
};

// export const setDebugLevel = (debugText: string): void => {
//   debugEnabled = { none: 0, warn: 1, debug: 2, all: 3 }[debugText] || 0;
//   // 0 = none, warnings = 1, debug = 2, all = 3
//   if (debugEnabled >= 3) CONFIG.debug.hooks = true;
// };

export function dialogWarning(message, icon = 'fas fa-exclamation-triangle') {
  return `<p class="${CONSTANTS.MODULE_NAME}-dialog">
        <i style="font-size:3rem;" class="${icon}"></i><br><br>
        <strong style="font-size:1.2rem;">${CONSTANTS.MODULE_NAME}</strong>
        <br><br>${message}
    </p>`;
}

export function cleanUpString(stringToCleanUp: string) {
  // regex expression to match all non-alphanumeric characters in string
  const regex = /[^A-Za-z0-9]/g;
  if (stringToCleanUp) {
    return i18n(stringToCleanUp).replace(regex, '').toLowerCase();
  } else {
    return stringToCleanUp;
  }
}

export function isStringEquals(stringToCheck1: string, stringToCheck2: string, startsWith = true): boolean {
  if (stringToCheck1 && stringToCheck2) {
    const s1 = cleanUpString(stringToCheck1) ?? '';
    const s2 = cleanUpString(stringToCheck2) ?? '';
    if (startsWith) {
      return s1.startsWith(s2) || s2.startsWith(s1);
    } else {
      return s1 === s2;
    }
  } else {
    return stringToCheck1 === stringToCheck2;
  }
}

// =========================================================================================

/**
 *
 * @param obj Little helper for loop enum element on typescript
 * @href https://www.petermorlion.com/iterating-a-typescript-enum/
 * @returns
 */
export function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}

/**
 * @href https://stackoverflow.com/questions/7146217/merge-2-arrays-of-objects
 * @param target
 * @param source
 * @param prop
 */
export function mergeByProperty(target: any[], source: any[], prop: any) {
  source.forEach((sourceElement) => {
    const targetElement = target.find((targetElement) => {
      return sourceElement[prop] === targetElement[prop];
    });
    targetElement ? Object.assign(targetElement, sourceElement) : target.push(sourceElement);
  });
  return target;
}

/**
 * Returns the first selected token
 */
export function getFirstPlayerTokenSelected(): Token | null {
  // Get first token ownted by the player
  const selectedTokens = <Token[]>canvas.tokens?.controlled;
  if (selectedTokens.length > 1) {
    //iteractionFailNotification(i18n("foundryvtt-arms-reach.warningNoSelectMoreThanOneToken"));
    return null;
  }
  if (!selectedTokens || selectedTokens.length == 0) {
    //if(game.user.character.data.token){
    //  //@ts-ignore
    //  return game.user.character.data.token;
    //}else{
    return null;
    //}
  }
  return selectedTokens[0];
}

/**
 * Returns a list of selected (or owned, if no token is selected)
 * note: ex getSelectedOrOwnedToken
 */
export function getFirstPlayerToken(): Token | null {
  // Get controlled token
  let token: Token;
  const controlled: Token[] = <Token[]>canvas.tokens?.controlled;
  // Do nothing if multiple tokens are selected
  if (controlled.length && controlled.length > 1) {
    //iteractionFailNotification(i18n("foundryvtt-arms-reach.warningNoSelectMoreThanOneToken"));
    return null;
  }
  // If exactly one token is selected, take that
  token = controlled[0];
  if (!token) {
    if (!controlled.length || controlled.length == 0) {
      // If no token is selected use the token of the users character
      token = <Token>canvas.tokens?.placeables.find((token) => token.data._id === game.user?.character?.data?._id);
    }
    // If no token is selected use the first owned token of the users character you found
    if (!token) {
      token = <Token>canvas.tokens?.ownedTokens[0];
    }
  }
  return token;
}

function getElevationToken(token: Token): number {
  const base = token.document.data;
  return getElevationPlaceableObject(base);
}

function getElevationWall(wall: Wall): number {
  const base = wall.document.data;
  return getElevationPlaceableObject(base);
}

function getElevationPlaceableObject(placeableObject: any): number {
  let base = placeableObject;
  if (base.document) {
    base = base.document.data;
  }
  const base_elevation =
    //@ts-ignore
    typeof _levels !== 'undefined' &&
    //@ts-ignore
    _levels?.advancedLOS &&
    (placeableObject instanceof Token || placeableObject instanceof TokenDocument)
      ? //@ts-ignore
        _levels.getTokenLOSheight(token)
      : base.elevation ??
        base.flags['levels']?.elevation ??
        base.flags['levels']?.rangeBottom ??
        base.flags['wallHeight']?.wallHeightBottom ??
        0;
  return base_elevation;
}

// =============================
// Module specific function
// =============================

async function updateAtcvVisionLevel(
  tokenToSet: Token,
  ATCVeffect: ActiveEffect,
  statusSightId: string,
  statusSightPath: string,
  valueExplicit: number,
) {
  const ATCVeffects = [ATCVeffect];
  // Organize non-disabled effects by their application priority
  const changes = <EffectChangeData[]>ATCVeffects.reduce((changes, e: ActiveEffect) => {
    if (e.data.disabled) {
      return changes;
    }
    return changes.concat(
      //@ts-ignore
      (<EffectChangeData[]>e.data.changes).map((c: EffectChangeData) => {
        const c2 = <EffectChangeData>duplicate(c);
        // c2.effect = e;
        c2.priority = <number>c2.priority ?? c2.mode * 10;
        return c2;
      }),
    );
  }, []);
  changes.sort((a, b) => <number>a.priority - <number>b.priority);
  // const changes = effect.data.changes;
  // Apply all changes
  for (const change of changes) {
    if (!change.key.includes('ATCV')) {
      continue;
    }
    const updateKey = change.key.slice(5);
    const sensesData = await API.getAllSensesAndConditions();
    if (updateKey === statusSightId) {
      setProperty(tokenToSet.document, `data.flags.${CONSTANTS.MODULE_NAME}.${statusSightId}`, valueExplicit);
      if (statusSightPath) {
        setProperty(tokenToSet.document, <string>statusSightPath, valueExplicit);
      }
      // setProperty(change,`value`,String(valueExplicit));
    }
  }
}

function isTokenInside(token, wallsBlockTargeting) {
  const grid = canvas.scene?.data.grid,
    templatePos = { x: this.data.x, y: this.data.y };
  // Check for center of  each square the token uses.
  // e.g. for large tokens all 4 squares
  const startX = token.width >= 1 ? 0.5 : token.width / 2;
  const startY = token.height >= 1 ? 0.5 : token.height / 2;
  // console.error(grid, templatePos, startX, startY, token.width, token.height, token)
  for (let x = startX; x < token.width; x++) {
    for (let y = startY; y < token.height; y++) {
      const currGrid = {
        x: token.x + x * <number>grid - templatePos.x,
        y: token.y + y * <number>grid - templatePos.y,
      };
      let contains = this.shape?.contains(currGrid.x, currGrid.y);
      if (contains && wallsBlockTargeting) {
        const r = new Ray({ x: currGrid.x + templatePos.x, y: currGrid.y + templatePos.y }, templatePos);
        contains = !canvas.walls?.checkCollision(r);
      }
      if (contains) return true;
    }
  }
  return false;
}

// TODO PREPARE TEMPLATE TO APPLY EFFECT ?
export function templateTokens(template) {
  const wallsBlockTargeting = true;
  const tokens = <TokenData[]>canvas.tokens?.placeables.map((t) => t.data);
  const targets: string[] = [];
  const tokenInside = isTokenInside.bind(template);
  for (const tokenData of tokens) {
    if (tokenInside(tokenData, wallsBlockTargeting)) {
      targets.push(<string>tokenData._id);
    }
  }
  //game.user?.updateTokenTargets(targets);
}

export function shouldIncludeVision(sourceToken: Token, targetToken: Token): boolean | null {
  // if (!sourceToken) {
  //   sourceToken = <Token>getFirstPlayerTokenSelected();
  // }
  // if (!sourceToken) {
  //   sourceToken = <Token>getFirstPlayerToken();
  // }
  if (!sourceToken || !targetToken) {
    return true;
  }

  // ===============================================
  // 0 - Checkout the ownership of the target and the disposition of the target
  // friendly, neutral, hostile
  // =================================================

  // If you are owner of the token you can see him
  const isPlayerOwned = <boolean>targetToken.actor?.hasPlayerOwner;
  // If I'm an owner of the token; remain visible
  if (!game.user?.isGM && (isPlayerOwned || targetToken.owner)) {
    return true;
  }

  let targetActorDisposition;
  if (targetToken && targetToken.data?.disposition) {
    targetActorDisposition = targetToken.data.disposition;
  } else {
    // no token to use so make a guess
    targetActorDisposition =
      targetToken.actor?.type === API.NPC_TYPE ? CONST.TOKEN_DISPOSITIONS.HOSTILE : CONST.TOKEN_DISPOSITIONS.FRIENDLY;
  }
  let sourceActorDisposition;
  if (sourceToken && sourceToken.data?.disposition) {
    sourceActorDisposition = sourceToken.data.disposition;
  } else {
    // no token to use so make a guess
    sourceActorDisposition =
      sourceToken.actor?.type === API.NPC_TYPE ? CONST.TOKEN_DISPOSITIONS.HOSTILE : CONST.TOKEN_DISPOSITIONS.FRIENDLY;
  }

  // If both are hostile return true
  if (
    sourceActorDisposition == CONST.TOKEN_DISPOSITIONS.HOSTILE &&
    targetActorDisposition == CONST.TOKEN_DISPOSITIONS.HOSTILE
  ) {
    return true;
  }

  if (game.settings.get(CONSTANTS.MODULE_NAME, 'disableForNonHostileNpc')) {
    if (
      targetActorDisposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY ||
      targetActorDisposition === CONST.TOKEN_DISPOSITIONS.NEUTRAL
    ) {
      return true;
    }
  }
  // ========================================
  // 1 - Preparation of the active effect
  // =========================================

  const sourceVisionLevels = getSensesFromToken(sourceToken) ?? [];
  const targetVisionLevels = getConditionsFromToken(targetToken) ?? [];

  if (!sourceVisionLevels || sourceVisionLevels.length == 0) {
    // If at least a condition is present on target it should be false
    if (targetVisionLevels && targetVisionLevels.length > 0) {
      return false;
    } else {
      return true; // default vaue
    }
  }

  for (const sourceStatusEffect of sourceVisionLevels) {
    if (sourceStatusEffect.statusSight?.id == AtcvEffectSenseFlags.BLINDED) {
      // Someone is blind
      return false;
    }
  }

  if (!targetVisionLevels || targetVisionLevels.length == 0) {
    return true;
  }

  // ========================================
  // 2 - Check for the correct status sight
  // =========================================

  const sourceVisionLevelsValid: AtcvEffect[] = [];

  const visibleForTypeOfSenseByIndex = [...sourceVisionLevels].map((sourceVisionLevel: AtcvEffect) => {
    // Check elevation
    if (sourceVisionLevel?.visionElevation) {
      const tokenElevation = getElevationToken(sourceToken);
      const targetElevation = getElevationToken(targetToken);
      if (tokenElevation < targetElevation) {
        return false;
      }
    }
    // Check distance
    if (sourceVisionLevel?.visionDistanceValue && sourceVisionLevel?.visionDistanceValue > 0) {
      const tokenDistance = getUnitTokenDist(sourceToken, targetToken);
      if (sourceVisionLevel?.visionDistanceValue < tokenDistance) {
        return false;
      }
    }
    // Check list of sources and targets
    const resultsOnTarget = targetVisionLevels.map((targetVisionLevel) => {
      if (!targetVisionLevel || !targetVisionLevel.statusSight) {
        sourceVisionLevelsValid.push(sourceVisionLevel);
        return true;
      }
      if (sourceVisionLevel?.visionTargets?.length > 0) {
        if (sourceVisionLevel?.visionTargets.includes(<string>targetVisionLevel.statusSight?.id)) {
          sourceVisionLevelsValid.push(sourceVisionLevel);
          return true;
        } else {
          return false;
        }
      }
      if (targetVisionLevel?.visionSources?.length > 0) {
        if (targetVisionLevel?.visionSources.includes(<string>sourceVisionLevel.statusSight?.id)) {
          sourceVisionLevelsValid.push(sourceVisionLevel);
          return true;
        } else {
          return false;
        }
      }
      if (
        targetVisionLevel.statusSight?.id == AtcvEffectSenseFlags.NORMAL ||
        targetVisionLevel.statusSight?.id == AtcvEffectSenseFlags.NONE
      ) {
        sourceVisionLevelsValid.push(sourceVisionLevel);
        return true;
      }
      const result =
        <number>sourceVisionLevel?.statusSight?.visionLevelMinIndex <=
          <number>targetVisionLevel.statusSight?.visionLevelMinIndex &&
        <number>sourceVisionLevel?.statusSight?.visionLevelMaxIndex >=
          <number>targetVisionLevel.statusSight?.visionLevelMaxIndex;
      if (result) {
        sourceVisionLevelsValid.push(sourceVisionLevel);
      }
      return result;
    });
    // if any source has vision to the token, the token is visible
    const resultFinal = resultsOnTarget.reduce((total, curr) => total || curr, false);
    return resultFinal;
  });

  let canYouSeeMeByLevelIndex = false;
  // if any source has vision to the token, the token is visible
  canYouSeeMeByLevelIndex = visibleForTypeOfSenseByIndex.reduce((total, curr) => total || curr, false);

  if (!canYouSeeMeByLevelIndex) {
    return canYouSeeMeByLevelIndex;
  }

  // ========================================
  // 3 - Check for the correct value number
  // =========================================

  const visibleForTypeOfSenseByValue = [...sourceVisionLevelsValid].map((sourceVisionLevel: AtcvEffect) => {
    const resultsOnTarget = targetVisionLevels.map((targetVisionLevel) => {
      if (!targetVisionLevel || !targetVisionLevel.statusSight) {
        return true;
      }
      if (
        targetVisionLevel.statusSight?.id == AtcvEffectSenseFlags.NORMAL ||
        targetVisionLevel.statusSight?.id == AtcvEffectSenseFlags.NONE
      ) {
        return true;
      }
      // the "-1" case
      if (<number>targetVisionLevel.visionLevelValue <= -1) {
        return false;
      } else {
        const result =
          <number>sourceVisionLevel.visionLevelValue <= -1 ||
          <number>sourceVisionLevel.visionLevelValue >= <number>targetVisionLevel.visionLevelValue;
        return result;
      }
    });
    // if any source has vision to the token, the token is visible
    const resultFinal = resultsOnTarget.reduce((total, curr) => total || curr, false);
    return resultFinal;
  });

  let canYouSeeMeByLevelValue = false;
  // if any source has vision to the token, the token is visible
  canYouSeeMeByLevelValue = visibleForTypeOfSenseByValue.reduce((total, curr) => total || curr, false);

  return canYouSeeMeByLevelValue;
}

export async function prepareActiveEffectForConditionalVisibility(
  sourceToken: Token,
  visionCapabilities: VisionCapabilities,
) {
  // Make sure to remove anything wiith value 0
  for (const senseData of await API.getAllSensesAndConditions()) {
    const effectNameToCheckOnActor = i18n(<string>senseData?.name);
    if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
      const activeEffectToRemove = <ActiveEffect>(
        await API.findEffectByNameOnToken(<string>sourceToken.id, effectNameToCheckOnActor)
      );
      //// const actve = retrieveAtcvVisionLevelFromActiveEffect(activeEffectToRemove,senseData);
      //const actve = sourceToken.document?.getFlag(CONSTANTS.MODULE_NAME, senseData.id);
      const atcvEffectFlagData = <AtcvEffectFlagData>sourceToken.document?.getFlag(CONSTANTS.MODULE_NAME, senseData.id);
      const actve = atcvEffectFlagData.visionLevelValue;
      if (actve == 0 || actve == null || actve == undefined) {
        await API.removeEffectFromIdOnToken(<string>sourceToken.id, <string>activeEffectToRemove.id);
      }
    }
  }

  // const actor = <Actor>sourceToken.document.getActor();

  // MANAGE THE UPDATE OF EFFECT INSTEAD REMOVE AND ADD
  // REMOVE EVERY SENSES WITH THE SAME NAME

  // const keysSensesFirstTime: string[] = [];
  for (const [key, sense] of visionCapabilities.retrieveSenses()) {
    const effectNameToCheckOnActor = i18n(<string>sense.statusSight?.name);
    if (sense.visionLevelValue && sense.visionLevelValue != 0) {
      // TODO why this failed to return ???
      // if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
      const activeEffectToRemove = <ActiveEffect>(
        await API.findEffectByNameOnToken(<string>sourceToken.id, effectNameToCheckOnActor)
      );
      if (activeEffectToRemove) {
        const actve = retrieveAtcvVisionLevelValueFromActiveEffect(activeEffectToRemove.data.changes);
        if (sense.visionLevelValue != actve) {
          //await API.removeEffectFromIdOnToken(<string>sourceToken.id, <string>activeEffectToRemove.id);
          const data = <ActiveEffectData>duplicate(activeEffectToRemove.data);
          data.changes.forEach((aee) => {
            if (aee.key.startsWith('ATCV.') && !aee.key.startsWith('ATCV.condition') && aee.value) {
              aee.value = String(sense.visionLevelValue);
            }
          });
          await API.updateActiveEffectFromIdOnToken(
            <string>sourceToken.id,
            <string>activeEffectToRemove.id,
            undefined,
            undefined,
            data,
          );
        }
      } else {
        await API.addEffectConditionalVisibilityOnToken(
          <string>sourceToken.id,
          <string>sense.statusSight?.id,
          false,
          sense.visionDistanceValue,
          sense.visionLevelValue,
        );
      }
      // }
    } else {
      if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
        const activeEffectToRemove = <ActiveEffect>(
          await API.findEffectByNameOnToken(<string>sourceToken.id, effectNameToCheckOnActor)
        );
        //const actve = retrieveAtcvVisionLevelFromActiveEffect(activeEffectToRemove, key);
        const actve = retrieveAtcvVisionLevelValueFromActiveEffect(activeEffectToRemove.data.changes);
        if (sense.visionLevelValue != actve) {
          await API.removeEffectFromIdOnToken(<string>sourceToken.id, <string>activeEffectToRemove.id);
        }
      }
    }
  }

  // ADD THE SENSES FINALLY

  // for (const [key, sense] of visionCapabilities.retrieveSenses()) {
  //   if (sense.visionLevelValue && sense.visionLevelValue != 0) {
  //     const effectNameToCheckOnActor = i18n(<string>sense.statusSight?.name);
  //     if (!(await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true))) {
  //       await API.addEffectConditionalVisibilityOnToken(
  //         <string>sourceToken.id,
  //         <string>sense.statusSight?.id,
  //         false,
  //         sense.visionDistanceValue,
  //         sense.visionLevelValue,
  //       );
  //     }
  //   }
  // }

  // MANAGE THE UPDATE OF EFFECT INSTEAD REMOVE AND ADD
  // REMOVE EVERY CONDITIONS WITH THE SAME NAME

  // const keysConditionsFirstTime: string[] = [];
  for (const [key, condition] of visionCapabilities.retrieveConditions()) {
    const effectNameToCheckOnActor = i18n(<string>condition.statusSight?.name);
    if (condition.visionLevelValue && condition.visionLevelValue != 0) {
      // TODO why this failed to return ???
      // if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
      const activeEffectToRemove = <ActiveEffect>(
        await API.findEffectByNameOnToken(<string>sourceToken.id, effectNameToCheckOnActor)
      );
      if (activeEffectToRemove) {
        //const actve = retrieveAtcvVisionLevelFromActiveEffect(activeEffectToRemove, key);
        const actve = retrieveAtcvVisionLevelValueFromActiveEffect(activeEffectToRemove.data.changes);
        if (condition.visionLevelValue != actve) {
          //await API.removeEffectFromIdOnToken(<string>sourceToken.id, <string>activeEffectToRemove.id);
          const data = <ActiveEffectData>duplicate(activeEffectToRemove.data);
          data.changes.forEach((aee) => {
            if (aee.key.startsWith('ATCV.') && !aee.key.startsWith('ATCV.condition') && aee.value) {
              aee.value = String(condition.visionLevelValue);
            }
          });
          await API.updateActiveEffectFromIdOnToken(
            <string>sourceToken.id,
            <string>activeEffectToRemove.id,
            undefined,
            undefined,
            data,
          );
        }
      } else {
        await API.addEffectConditionalVisibilityOnToken(
          <string>sourceToken.id,
          <string>condition.statusSight?.id,
          false,
          condition.visionDistanceValue,
          condition.visionLevelValue,
        );
      }
      //}
    } else {
      if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
        const activeEffectToRemove = <ActiveEffect>(
          await API.findEffectByNameOnToken(<string>sourceToken.id, effectNameToCheckOnActor)
        );
        //const actve = retrieveAtcvVisionLevelFromActiveEffect(activeEffectToRemove, key);
        const actve = retrieveAtcvVisionLevelValueFromActiveEffect(activeEffectToRemove.data.changes);
        if (condition.visionLevelValue != actve) {
          await API.removeEffectFromIdOnToken(<string>sourceToken.id, <string>activeEffectToRemove.id);
        }
      }
    }
  }

  // ADD THE CONDITIONS FINALLY

  // for (const [key, condition] of visionCapabilities.retrieveConditions()) {
  //   if (condition.visionLevelValue && condition.visionLevelValue != 0) {
  //     const effectNameToCheckOnActor = i18n(<string>condition.statusSight?.name);
  //     if (!(await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true))) {
  //       await API.addEffectConditionalVisibilityOnToken(
  //         <string>sourceToken.id,
  //         <string>condition.statusSight?.id,
  //         false,
  //         condition.visionDistanceValue,
  //         condition.visionLevelValue,
  //       );
  //     }
  //   }
  // }

  // Refresh the flags (this is necessary for retrocompatibility)
  visionCapabilities.refreshSenses();
  visionCapabilities.refreshConditions();
}

export function getSensesFromToken(token: Token): AtcvEffect[] {
  return _getCVFromToken(token, API.SENSES);
}

export function getConditionsFromToken(token: Token): AtcvEffect[] {
  return _getCVFromToken(token, API.CONDITIONS);
}

function _getCVFromToken(token: Token, statusSights: SenseData[]): AtcvEffect[] {
  if (!token) {
    info(`No token found`);
    return [];
  }
  const actor = <Actor>token.document?.actor || <Actor>token?.actor; // <Actor>token.document?.getActor() ||
  if (!actor) {
    info(`No actor found for token '${token.name}'`);
    return [];
  }
  const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>actor?.data.effects;
  //const totalEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>actor?.data.effects.contents.filter(i => !i.data.disabled);
  const atcvEffects = actorEffects.filter(
    (entity) => !!entity.data.changes.find((effect) => effect.key.includes('ATCV')),
  );
  let visionElevation = true;
  let conditionTargets: string[] = [];
  let conditionSources: string[] = [];
  const statusEffects: AtcvEffect[] = [];

  for (const effectEntity of atcvEffects) {
    const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
    if (!effectNameToSet) {
      continue;
    }
    const effectSight = statusSights.find((a: SenseData) => {
      return isStringEquals(effectNameToSet, a.id) || isStringEquals(effectNameToSet, a.name);
    });
    // if is a AE with the label of the module (no id sorry)
    if (effectSight) {
      // // Organize non-disabled effects by their application priority
      // const changes = <EffectChangeData[]>ATCVeffects.reduce((changes, e: ActiveEffect) => {
      //   if (e.data.disabled) {
      //     return changes;
      //   }
      //   return changes.concat(
      //     //@ts-ignore
      //     (<EffectChangeData[]>e.data.changes).map((c: EffectChangeData) => {
      //       const c2 = <EffectChangeData>duplicate(c);
      //       // c2.effect = e;
      //       c2.priority = <number>c2.priority ?? c2.mode * 10;
      //       return c2;
      //     }),
      //   );
      // }, []);
      // changes.sort((a, b) => <number>a.priority - <number>b.priority);

      visionElevation = retrieveAtcvElevationFromActiveEffect(effectEntity.data.changes);
      conditionTargets = retrieveAtcvTargetsFromActiveEffect(effectEntity.data.changes);
      conditionSources = retrieveAtcvSourcesFromActiveEffect(effectEntity.data.changes);

      // look up if you have not basic AE and if the check elevation is not enabled
      if (
        !effectSight.conditionElevation &&
        effectSight.id != AtcvEffectSenseFlags.NONE &&
        effectSight.id != AtcvEffectSenseFlags.NORMAL &&
        effectSight.id != AtcvEffectSenseFlags.BLINDED
      ) {
        visionElevation = false;
      }
      let distance = 0;
      let atcvValue = 0;
      let atcvTargetImage = '';
      const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
      if (effectNameToSet) {
        distance = retrieveAtcvVisionLevelDistanceFromActiveEffect(effectEntity.data.changes);
        atcvValue = retrieveAtcvVisionLevelValueFromActiveEffect(effectEntity.data.changes);
        atcvTargetImage = retrieveAtcvVisionTargetImageFromActiveEffect(effectEntity.data.changes);
      }

      statusEffects.push({
        visionElevation: visionElevation,
        visionTargets: conditionTargets,
        visionSources: conditionSources,
        statusSight: effectSight,
        visionDistanceValue: distance,
        visionLevelValue: atcvValue,
        visionTargetImage: atcvTargetImage,
      });
    }
  }
  return statusEffects;
}

export function retrieveAtcvElevationFromActiveEffect(effectChanges: EffectChangeData[]): boolean {
  let checkElevationAcvt = false;
  // const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
  // if (!effectNameToSet) {
  //   return atcvValue;
  // }
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  // Apply all changes
  for (const change of effectEntityChanges) {
    if (isStringEquals(change.key, 'ATCV.conditionElevation') && change.value) {
      checkElevationAcvt = Boolean(change.value);
      break;
    }
  }
  return checkElevationAcvt;
}

export function retrieveAtcvTargetImageFromActiveEffect(effectChanges: EffectChangeData[]): string {
  let checkTargetImageAcvt = '';
  // const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
  // if (!effectNameToSet) {
  //   return atcvValue;
  // }
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  // Apply all changes
  for (const change of effectEntityChanges) {
    if (isStringEquals(change.key, 'ATCV.conditionTargetImage') && change.value) {
      checkTargetImageAcvt = String(change.value);
      break;
    }
  }
  return checkTargetImageAcvt;
}

export function retrieveAtcvTargetsFromActiveEffect(effectChanges: EffectChangeData[]): string[] {
  let checkTargetsAcvt: string[] = [];
  // const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
  // if (!effectNameToSet) {
  //   return atcvValue;
  // }
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  // Apply all changes
  for (const change of effectEntityChanges) {
    if (isStringEquals(change.key, 'ATCV.conditionTargets') && change.value) {
      const inTags = <any>change.value;
      if (!(typeof inTags === 'string' || inTags instanceof RegExp || Array.isArray(inTags))) {
        error(`'ATCV.conditionTargets' must be of type string or array`);
      }
      let providedTags = typeof inTags === 'string' ? inTags.split(',') : inTags;

      if (!Array.isArray(providedTags)) providedTags = [providedTags];

      providedTags.forEach((t) => {
        if (!(typeof t === 'string' || t instanceof RegExp)) {
          error(`'ATCV.conditionTargets' in array must be of type string or regexp`);
        }
      });

      checkTargetsAcvt = providedTags.map((t) => (t instanceof RegExp ? t : t.trim()));
      break;
    }
  }
  return checkTargetsAcvt;
}

export function retrieveAtcvSourcesFromActiveEffect(effectChanges: EffectChangeData[]): string[] {
  let checkSourcesAcvt: string[] = [];
  // const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
  // if (!effectNameToSet) {
  //   return atcvValue;
  // }
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  // Apply all changes
  for (const change of effectEntityChanges) {
    if (isStringEquals(change.key, 'ATCV.conditionSources') && change.value) {
      const inTags = <any>change.value;
      if (!(typeof inTags === 'string' || inTags instanceof RegExp || Array.isArray(inTags))) {
        error(`'ATCV.conditionSources' must be of type string or array`);
      }
      let providedTags = typeof inTags === 'string' ? inTags.split(',') : inTags;

      if (!Array.isArray(providedTags)) providedTags = [providedTags];

      providedTags.forEach((t) => {
        if (!(typeof t === 'string' || t instanceof RegExp)) {
          error(`'ATCV.conditionSources' in array must be of type string or regexp`);
        }
      });

      checkSourcesAcvt = providedTags.map((t) => (t instanceof RegExp ? t : t.trim()));
      break;
    }
  }
  return checkSourcesAcvt;
}

export function retrieveAtcvVisionLevelValueFromActiveEffect(effectChanges: EffectChangeData[]): number {
  //Look up for ATCV to manage vision level
  let atcvValue: any = 0;
  // const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
  // if (!effectNameToSet) {
  //   return atcvValue;
  // }
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  //atcvValue = effectEntity.data.changes.find((aee) => {
  atcvValue = effectEntityChanges.find((aee) => {
    if (aee.key.startsWith('ATCV.') && !aee.key.startsWith('ATCV.condition') && aee.value) {
      return aee;
    }
  });
  if (!atcvValue) {
    // Ignore ???
    return 0;
  }
  return Number(atcvValue.value);
}

// export function retrieveAtcvVisionLevelFromActiveEffect(effectEntity: ActiveEffect, effectSightId: string): number {
//   //Look up for ATCV to manage vision level
//   let atcvValue: any = 0;
//   const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
//   if (!effectNameToSet) {
//     return atcvValue;
//   }
//   const effectEntityChanges = EffectSupport.retrieveChangesOrderedByPriorityFromAE(effectEntity);
//   //atcvValue = effectEntity.data.changes.find((aee) => {
//   atcvValue = effectEntityChanges.find((aee) => {
//     if (isStringEquals(aee.key, 'ATCV.' + effectSightId) && aee.value) {
//       return aee;
//     }
//   });
//   if (!atcvValue) {
//     // Ignore ???
//     return 0;
//   }
//   return Number(atcvValue.value);
// }

export function retrieveAtcvVisionTargetImageFromActiveEffect(effectChanges: EffectChangeData[]): string {
  //Look up for ATCV to manage vision level
  let atcvValue: any = '';
  // const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
  // if (!effectNameToSet) {
  //   return atcvValue;
  // }
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  atcvValue = effectEntityChanges.find((aee) => {
    if (isStringEquals(aee.key, 'ATCV.conditionTargetImage') && aee.value) {
      return aee;
    }
  });
  if (!atcvValue) {
    // Ignore ???
    return '';
  }
  return String(atcvValue.value);
}

export function retrieveAtcvVisionLevelDistanceFromActiveEffect(effectChanges: EffectChangeData[]): number {
  let distance = 0;
  // const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
  // if (!effectNameToSet) {
  //   return atcvValue;
  // }
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  const conditionDistanceAE = effectEntityChanges.find(
    (aee) => isStringEquals(aee.key, 'ATCV.conditionDistance') && aee.value,
  );
  const conditionDistance = Number(conditionDistanceAE?.value);
  if (conditionDistance > 0) {
    distance = conditionDistance;
  }
  // if is a AE with the label of the module (no id sorry)
  //Look up for ATL dim and bright sight to manage distance
  // const dimSightAE = effectEntityChanges.find((aee) => isStringEquals(aee.key, 'ATL.dimSight') && aee.value);
  // const brightSightAE = effectEntityChanges.find((aee) => isStringEquals(aee.key, 'ATL.brightSight') && aee.value);
  // const brightSight = Number(brightSightAE?.value);
  // const dimSight = Number(dimSightAE?.value);
  // if (brightSight || dimSight) {
  //   distance = Math.max(brightSight, dimSight);
  // }
  return distance;
}

export async function toggleStealth(event) {
  //const stealthedWithHiddenConditionOri =
  //  this.object.document.getFlag(CONSTANTS.MODULE_NAME, AtcvEffectConditionFlags.HIDDEN) ?? 0;
  const atcvEffectFlagData = <AtcvEffectFlagData>(
    this.object.document.getFlag(CONSTANTS.MODULE_NAME, AtcvEffectConditionFlags.HIDDEN)
  );
  const stealthedWithHiddenConditionOri = atcvEffectFlagData?.visionLevelValue ?? 0;
  let stealthedWithHiddenCondition = duplicate(stealthedWithHiddenConditionOri);
  if (stealthedWithHiddenCondition == 0 && getProperty(this.object.document, `data.${API.STEALTH_PASSIVE_SKILL}`)) {
    stealthedWithHiddenCondition = getProperty(this.object.document, `data.${API.STEALTH_PASSIVE_SKILL}`);
  }

  // Senses
  // const optionsSenses: string[] = [];
  const sensesOrderByName = <SenseData[]>API.SENSES; //.sort((a, b) => a.name.localeCompare(b.name));
  // sensesOrderByName.forEach((a: SenseData) => {
  //   if (a.id == AtcvEffectSenseFlags.NONE) {
  //     optionsSenses.push(`<option selected="selected" data-image="${a.img}" value="">${i18n(a.name)}</option>`);
  //   } else {
  //     optionsSenses.push(`<option data-image="${a.img}" value="${a.id}">${i18n(a.name)}</option>`);
  //   }
  // });
  // Conditions
  // const optionsConditions: string[] = [];
  const conditionsOrderByName = <SenseData[]>API.CONDITIONS; //.sort((a, b) => a.name.localeCompare(b.name));
  // conditionsOrderByName.forEach((a: SenseData) => {
  //   if (a.id == AtcvEffectConditionFlags.HIDDEN) {
  //     optionsConditions.push(`<option selected="selected" data-image="${a.img}" value="">${i18n(a.name)}</option>`);
  //   } else {
  //     optionsConditions.push(`<option data-image="${a.img}" value="${a.id}">${i18n(a.name)}</option>`);
  //   }
  // });

  const result = await API.rollStealth(this.object);
  const content = await renderTemplate(`modules/${CONSTANTS.MODULE_NAME}/templates/stealth_hud.html`, {
    currentstealth: stealthedWithHiddenCondition,
    stealthroll: result,
    senses: sensesOrderByName,
    conditions: conditionsOrderByName,
  });
  const hud = new Dialog({
    title: i18n(CONSTANTS.MODULE_NAME + '.dialogs.title.hidden'),
    content: content,
    buttons: {
      one: {
        icon: '<i class="fas fa-check"></i>',
        label: 'OK',
        callback: async (html: JQuery<HTMLElement>) => {
          //@ts-ignore
          const valCurrentstealth = parseInt(html.find('div.form-group').children()[1]?.value);
          //@ts-ignore
          let valStealthRoll = parseInt(html.find('div.form-group').children()[3]?.value);
          if (isNaN(valStealthRoll)) {
            valStealthRoll = 0;
          }
          //@ts-ignore
          const senseId = String(html.find('div.form-group').children()[6]?.value);
          //@ts-ignore
          const conditionId = String(html.find('div.form-group').children()[10]?.value);

          let selectedTokens = <Token[]>canvas.tokens?.controlled;
          if (!selectedTokens || selectedTokens.length == 0) {
            selectedTokens = [this.object];
          }
          for (const selectedToken of selectedTokens) {
            if (senseId != AtcvEffectSenseFlags.NONE && senseId != AtcvEffectSenseFlags.NORMAL) {
              const effect = <Effect>await ConditionalVisibilityEffectDefinitions.effect(senseId);
              if (effect) {
                if (valStealthRoll == 0) {
                  await API.removeEffectOnToken(selectedToken.id, i18n(<string>effect?.name));
                  await selectedToken.document.unsetFlag(CONSTANTS.MODULE_NAME, senseId);
                } else {
                  //await selectedToken.document.setFlag(CONSTANTS.MODULE_NAME, senseId, valStealthRoll);
                  const atcvEffectFlagData = AtcvEffectFlagData.fromEffect(effect);
                  atcvEffectFlagData.visionLevelValue = valStealthRoll;
                  await selectedToken.document.setFlag(CONSTANTS.MODULE_NAME, senseId, atcvEffectFlagData);
                }
              } else {
                warn(`Can't find effect definition for '${senseId}'`, true);
              }
            }
            if (conditionId != AtcvEffectConditionFlags.NONE) {
              const effect = <Effect>await ConditionalVisibilityEffectDefinitions.effect(conditionId);
              if (effect) {
                if (valStealthRoll == 0) {
                  await API.removeEffectOnToken(selectedToken.id, i18n(<string>effect?.name));
                  await selectedToken.document.unsetFlag(CONSTANTS.MODULE_NAME, conditionId);
                } else {
                  //await selectedToken.document.setFlag(CONSTANTS.MODULE_NAME, conditionId, valStealthRoll);
                  const atcvEffectFlagData = AtcvEffectFlagData.fromEffect(effect);
                  atcvEffectFlagData.visionLevelValue = valStealthRoll;
                  await selectedToken.document.setFlag(CONSTANTS.MODULE_NAME, conditionId, atcvEffectFlagData);
                }
              } else {
                warn(`Can't find effect definition for '${conditionId}'`, true);
              }
            }
          }
          event.currentTarget.classList.toggle('active', valStealthRoll && valStealthRoll != 0);
        },
      },
    },
    close: async (html: JQuery<HTMLElement>) => {
      event.currentTarget.classList.toggle(
        'active',
        stealthedWithHiddenConditionOri && stealthedWithHiddenConditionOri != 0,
      );
    },
    default: 'close',
  });
  hud.render(true);
}

export function getDistanceSightFromToken(token: Token) {
  let sightDistance = 0;
  // if (token.hasSight) {

  // 1) check sight with perfect vision
  if (game.modules.get('perfect-vision')?.active) {
    sightDistance = getPerfectVisionVisionRange(token);
  }
  // 2) check acotr effects
  const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>token.actor?.data.effects;
  for (const ae of actorEffects) {
    let sightDistanceEffect = 0;
    const effectChanges = ae.data.changes;
    const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
    // if is a AE with the label of the module (no id sorry)
    //Look up for ATL dim and bright sight to manage distance
    const dimSightAE = effectEntityChanges.find((aee) => isStringEquals(aee.key, 'ATL.dimSight') && aee.value);
    const brightSightAE = effectEntityChanges.find((aee) => isStringEquals(aee.key, 'ATL.brightSight') && aee.value);
    const conditionDistanceAE = effectEntityChanges.find(
      (aee) => isStringEquals(aee.key, 'ATCV.conditionDistance') && aee.value,
    );
    const brightSight = Number(brightSightAE?.value);
    const dimSight = Number(dimSightAE?.value);
    const conditionDistance = Number(conditionDistanceAE?.value);
    if (brightSight || dimSight || conditionDistance) {
      sightDistanceEffect = Math.max(brightSight, dimSight, conditionDistance);
    } else {
      sightDistanceEffect = Math.max(token.data.dimSight, token.data.brightSight);
    }
    if (sightDistanceEffect > sightDistance) {
      sightDistance = sightDistanceEffect;
    }
  }
  // 3) check standard token sight
  if (sightDistance <= 0) {
    sightDistance = Math.max(token.data.dimSight, token.data.brightSight);
  }
  // }
}

function getPerfectVisionVisionRange(token: Token): number {
  let sightLimit = parseFloat(<string>token.document.getFlag('perfect-vision', 'sightLimit'));

  if (Number.isNaN(sightLimit)) {
    sightLimit = parseFloat(<string>canvas.scene?.getFlag('perfect-vision', 'sightLimit'));
  }
  return sightLimit;
}

export function getUnitTokenDist(token1: Token, token2: Token) {
  const unitsToPixel = <number>canvas.dimensions?.size / <number>canvas.dimensions?.distance;
  const x1 = token1.center.x;
  const y1 = token1.center.y;
  const z1 = getTokenLOSheight(token1) * unitsToPixel;
  const x2 = token2.center.x;
  const y2 = token2.center.y;
  const z2 = getTokenLOSheight(token2) * unitsToPixel;

  const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)) / unitsToPixel;
  return d;
}

/**
 * Get the total LOS height for a token
 * @param {Object} token - a token object
 * @returns {Integer} returns token elevation plus the LOS height stored in the flags
 **/

function getTokenLOSheight(token) {
  let losDiff;
  if (game.modules.get('levels')?.active) {
    const defaultTokenHeight = game.settings.get('levels', 'defaultLosHeight') || 6;
    const autoLOSHeight = game.settings.get('levels', 'autoLOSHeight') || false;
    const divideBy = token.data.flags.levelsautocover?.ducking ? 3 : 1;
    if (autoLOSHeight) {
      losDiff =
        token.data.flags.levels?.tokenHeight ||
        //@ts-ignore
        canvas.scene?.dimensions.distance * Math.max(token.data.width, token.data.height) * token.data.scale;
    } else {
      losDiff = token.data.flags.levels?.tokenHeight || defaultTokenHeight;
    }
    return token.data.elevation + losDiff / divideBy;
  } else {
    return getElevationToken(token) || token.data.elevation;
  }
}

/**
 * Find out if a token is in the range of a particular object
 * @param {Object} token - a token
 * @param {Object} object - a tile/drawing/light/note
 * @returns {Boolean} - true if in range, false if not
 **/
export function isTokenInRange(token: Token, object: Tile | Drawing | AmbientLight | Note) {
  if (game.modules.get('levels')?.active) {
    let rangeTop = <number>object.document.getFlag('levels', 'rangeTop');
    let rangeBottom = <number>object.document.getFlag('levels', 'rangeBottom');
    if (!rangeTop && rangeTop !== 0) rangeTop = Infinity;
    if (!rangeBottom && rangeBottom !== 0) rangeBottom = -Infinity;
    const elevation = token.data.elevation;
    return elevation <= rangeTop && elevation >= rangeBottom;
  } else {
    // TODO maybe active aura integration
  }
}

// ========================================================================================
