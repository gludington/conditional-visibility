import { EffectSupport } from './../effects/effect';
import { EffectChangeData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData';
import CONSTANTS from '../constants.js';
import API from '../api.js';
import { canvas, game } from '../settings';
import {
  AtcvEffect,
  AtcvEffectSenseFlags,
  AtcvEffectConditionFlags,
  VisionCapabilities,
  SenseData,
  CheckerDebugData,
} from '../conditional-visibility-models.js';
import EmbeddedCollection from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs';
import {
  ActiveEffectData,
  ActorData,
  TokenData,
} from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import Effect from '../effects/effect.js';
import { ConditionalVisibilityEffectDefinitions } from '../conditional-visibility-effect-definition';

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

/**
 * The duplicate function of foundry keep converting my stirng value to "0"
 * i don't know why this methos is a brute force solution for avoid that problem
 */
export function duplicateExtended(obj: any): any {
  try {
    //@ts-ignore
    if (structuredClone) {
      //@ts-ignore
      return structuredClone(obj);
    } else {
      // Shallow copy
      // const newObject = jQuery.extend({}, oldObject);
      // Deep copy
      // const newObject = jQuery.extend(true, {}, oldObject);
      return jQuery.extend(true, {}, obj);
    }
  } catch (e) {
    return duplicate(obj);
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
/*
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
        const c2 = <EffectChangeData>duplicateExtended(c);
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
    const sensesData = await API.getAllDefaultSensesAndConditions(tokenToSet);
    if (updateKey === statusSightId) {
      setProperty(tokenToSet.document, `data.flags.${CONSTANTS.MODULE_NAME}.${statusSightId}`, valueExplicit);
      if (statusSightPath) {
        setProperty(tokenToSet.document, <string>statusSightPath, valueExplicit);
      }
      // setProperty(change,`value`,String(valueExplicit));
    }
  }
}
*/
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

  // 2) Check if the target is owned from the player if true you can see the token.
  //const isPlayerOwned = <boolean>targetToken.actor?.hasPlayerOwner;
  const isPlayerOwned = <boolean>targetToken.isOwner;
  if (!game.user?.isGM && (isPlayerOwned || targetToken.owner)) {
    debug(
      `(2) Player own target: Is true, target ${targetToken.data.name} ${'is visible'} to source ${
        sourceToken.data.name
      }`,
    );
    return true;
  }
  debug(
    `(2) Player own target: Is false, target ${targetToken.data.name} ${'is not visible'} to source ${
      sourceToken.data.name
    }`,
  );
  // 3) Check for the token disposition:

  // 3.1) by default the check is applied to all token disposition Friendly, Neutral, Hostile,
  // You can disable the check for all non hostile NPC with the module settings 'Disable for non hostile npc'
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

  // 3.2) A npc Hostile can see other Hostile npc
  if (
    sourceActorDisposition == CONST.TOKEN_DISPOSITIONS.HOSTILE &&
    targetActorDisposition == CONST.TOKEN_DISPOSITIONS.HOSTILE
  ) {
    debug(
      `(3.2) Source token and target token are bot hostile: Is true, target ${
        targetToken.data.name
      } ${'is visible'} to source ${sourceToken.data.name}`,
    );
    return true;
  }
  debug(
    `(3.2) Source token and target token are bot hostile: Is false, target ${
      targetToken.data.name
    } ${'is not visible'} to source ${sourceToken.data.name}`,
  );
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

  const sourceVisionLevels = getSensesFromToken(sourceToken.document, true) ?? [];
  const targetVisionLevels = getConditionsFromToken(targetToken.document, true) ?? [];

  const stealthedPassive = getProperty(<Actor>targetToken?.document?.actor, `data.${API.STEALTH_PASSIVE_SKILL}`) || 0;
  // 10 + Wisdom Score Modifier + Proficiency Bonus
  //@ts-ignore
  const perceptionPassive =
    getProperty(<Actor>sourceToken?.document?.actor, `data.${API.PERCEPTION_PASSIVE_SKILL}`) || 0;

  // 4) If module setting `autoPassivePerception` is enabled, check by default if
  // _Perception Passive of the system_ is `>` of the _Stealth Passive of the System_,
  // but only IF NO ACTIVE EFFECT CONDITION ARE PRESENT ON THE TARGET
  if (game.settings.get(CONSTANTS.MODULE_NAME, 'autoPassivePerception')) {
    if (targetVisionLevels.length == 0) {
      if (perceptionPassive >= stealthedPassive) {
        debug(
          `(4) Auto passive perception: Is true, target ${targetToken.data.name} ${'is visible'} to source ${
            sourceToken.data.name
          }`,
        );
        return true;
      }
    }
  }
  debug(
    `(4) Auto passive perception: Is false, target ${targetToken.data.name} ${'is not visible'} to source ${
      sourceToken.data.name
    }`,
  );
  // 5) Check if the source token has at least a active effect marked with key `ATCV.<sense or condition id>`
  if (sourceVisionLevels.length === 0) {
    // 5.1) If at least a condition is present on target it should be false else with no 'sense' on source e no ' condition' on target is true
    if (targetVisionLevels.length === 0) {
      debug(
        `(5) Source token not has a 'sense' and target has no 'condition': Is true target ${
          targetToken.data.name
        } ${'is visible'} to source ${sourceToken.data.name}`,
      );
      return true;
    }
  }
  debug(
    `(5) Source token not has a 'sense' and target has no 'condition': Is false, target ${
      targetToken.data.name
    } ${'is not visible'} to source ${sourceToken.data.name}`,
  );

  // 6) Check if the source token has the active effect `blinded` active, if is true, you cannot see anything and return false.
  for (const sourceStatusEffect of sourceVisionLevels) {
    if (isStringEquals(sourceStatusEffect.visionId, AtcvEffectSenseFlags.BLINDED)) {
      debug(
        `(6) Source token not has the sense '${AtcvEffectSenseFlags.BLINDED}': Is false, target ${
          targetToken.data.name
        } ${'is not visible'} to source ${sourceToken.data.name}`,
      );
      // Someone is blind
      return false;
    }
  }
  debug(
    `(6) Source token not has the sense '${AtcvEffectSenseFlags.BLINDED}': Is true, target ${
      targetToken.data.name
    } ${'is visible'} to source ${sourceToken.data.name}`,
  );
  // 7) If not 'condition' are present on the target token return true (nothing to check).
  if (targetVisionLevels.length == 0) {
    debug(
      `(7) If no 'condition' are present on target: Is true, target ${
        targetToken.data.name
      } ${'is visible'} to source ${sourceToken.data.name}`,
    );
    return true;
  }
  debug(
    `(7) If no 'condition' are present on target: Is false, target ${
      targetToken.data.name
    } ${'is not visible'} to source ${sourceToken.data.name}`,
  );

  // 8) Check again for _passive perception vs passive stealth_ like on point 4) this time we use the hidden active effect like the stealth passive on the target token...
  // THIS WILL BE CHECK ONLY IF ONE CONDITION IS PRESENT ON THE TARGET AND THE CONDITION TYPE IS 'HIDDEN'
  if (game.settings.get(CONSTANTS.MODULE_NAME, 'autoPassivePerception')) {
    if (sourceVisionLevels.length === 0) {
      let isTheCaseWhenOnlyTheHiddenConditionIsPresentOnTarget = true;
      let currentHiddenValue = 0;
      for (const targetVisionLevel of targetVisionLevels) {
        if (!isStringEquals(targetVisionLevel.visionId, AtcvEffectConditionFlags.HIDDEN)) {
          isTheCaseWhenOnlyTheHiddenConditionIsPresentOnTarget = false;
          break;
        } else {
          currentHiddenValue = <number>targetVisionLevel.visionLevelValue;
        }
      }
      if (!currentHiddenValue) {
        currentHiddenValue = 0;
      }
      // if (currentHiddenValue < stealthedPassive && game.settings.get(CONSTANTS.MODULE_NAME, 'autoPassivePerception')) {
      //   debug(
      //     `(8.1) Is the case when only the hidden condition is present on target but stealth passive > the the hidden value state : Is true, target ${
      //       targetToken.data.name
      //     } ${'is visible'} to source ${sourceToken.data.name}`,
      //   );
      //   currentHiddenValue = stealthedPassive;
      // }
      if (isTheCaseWhenOnlyTheHiddenConditionIsPresentOnTarget) {
        if (perceptionPassive >= currentHiddenValue) {
          debug(
            `(8.2) Check if the current perception passive value is >= of the 'Hidden Perception passive value': Is true, target ${
              targetToken.data.name
            } ${'is visible'} to source ${sourceToken.data.name}`,
          );
          return true;
        }
      }
    }
  }
  debug(
    `(8) Is the case when only the hidden condition is present on target: Is false, target ${
      targetToken.data.name
    } ${'is not visible'} to source ${sourceToken.data.name}`,
  );

  // ========================================
  // 2 - Check for the correct status sight
  // =========================================

  const sourceVisionLevelsValidForDebug: Map<string, CheckerDebugData> = new Map<string, CheckerDebugData>();
  const sourceVisionLevelsValid: Map<string, AtcvEffect> = new Map<string, AtcvEffect>();

  // 9) Check if the source token has some 'sense' powerful enough to beat every 'condition' ont he target token:
  const visibleForTypeOfSenseByIndex = [...sourceVisionLevels].map((sourceVisionLevel: AtcvEffect) => {
    const resultsOnTarget = targetVisionLevels.map((targetVisionLevel: AtcvEffect) => {
      // 9.0) If no `ATCV.visioId` is founded on the target token return true (this shoudldn't never happened is just for avoid some unwanted behaviour)
      if (!targetVisionLevel || !targetVisionLevel.visionId) {
        sourceVisionLevelsValidForDebug.set(sourceVisionLevel.visionId, {
          atcvSourceEffect: sourceVisionLevel,
          atcvTargetEffect: targetVisionLevel,
          checkerResult: true,
        });
        sourceVisionLevelsValid.set(sourceVisionLevel.visionId, sourceVisionLevel);
        debug(
          `(9) If no 'ATCV.visioId' is founded on the target token: Is true, target ${
            targetToken.data.name
          } ${'is visible'} to source ${sourceToken.data.name}`,
        );
        return true;
      }

      debug(
        `(9) If no 'ATCV.visioId' is founded on the target token: Is false, target ${
          targetToken.data.name
        } ${'is not visible'} to source ${sourceToken.data.name}`,
      );

      // 9.1) Check for explicit `ATCV.conditionTargets` and `ATCV.conditionSources`, this control make avoid the following 9.X check
      if (sourceVisionLevel?.visionTargets?.length > 0) {
        if (sourceVisionLevel?.visionTargets.includes(<string>targetVisionLevel.visionId)) {
          sourceVisionLevelsValidForDebug.set(sourceVisionLevel.visionId, {
            atcvSourceEffect: sourceVisionLevel,
            atcvTargetEffect: targetVisionLevel,
            checkerResult: true,
          });
          sourceVisionLevelsValid.set(sourceVisionLevel.visionId, sourceVisionLevel);
          debug(
            `(9.1.1) Check for explicit 'ATCV.conditionTargets' and 'ATCV.conditionSources' on the source: Is true, target ${
              targetToken.data.name
            } ${'is visible'} to source ${sourceToken.data.name}`,
          );
          return true;
        } else {
          sourceVisionLevelsValidForDebug.set(sourceVisionLevel.visionId, {
            atcvSourceEffect: sourceVisionLevel,
            atcvTargetEffect: targetVisionLevel,
            checkerResult: false,
          });
          debug(
            `(9.1.1) Check for explicit 'ATCV.conditionTargets' and 'ATCV.conditionSources' on the source: Is false, target ${
              targetToken.data.name
            } ${'is not visible'} to source ${sourceToken.data.name}`,
          );
          return false;
        }
      }
      if (targetVisionLevel?.visionSources?.length > 0) {
        if (targetVisionLevel?.visionSources.includes(<string>sourceVisionLevel.visionId)) {
          sourceVisionLevelsValidForDebug.set(sourceVisionLevel.visionId, {
            atcvSourceEffect: sourceVisionLevel,
            atcvTargetEffect: targetVisionLevel,
            checkerResult: true,
          });
          sourceVisionLevelsValid.set(sourceVisionLevel.visionId, sourceVisionLevel);
          debug(
            `(9.1.2) Check for explicit 'ATCV.conditionTargets' and 'ATCV.conditionSources on the target: Is true, target ${
              targetToken.data.name
            } ${'is visible'} to source ${sourceToken.data.name}`,
          );
          return true;
        } else {
          sourceVisionLevelsValidForDebug.set(sourceVisionLevel.visionId, {
            atcvSourceEffect: sourceVisionLevel,
            atcvTargetEffect: targetVisionLevel,
            checkerResult: false,
          });
          debug(
            `(9.1.2) Check for explicit 'ATCV.conditionTargets' and 'ATCV.conditionSources' on the target: Is false, target ${
              targetToken.data.name
            } ${'is not visible'} to source ${sourceToken.data.name}`,
          );
          return false;
        }
      }

      // 9.2) If the 'condition' on the target token is `NONE` return true
      if (isStringEquals(targetVisionLevel.visionId, AtcvEffectConditionFlags.NONE)) {
        sourceVisionLevelsValidForDebug.set(sourceVisionLevel.visionId, {
          atcvSourceEffect: sourceVisionLevel,
          atcvTargetEffect: targetVisionLevel,
          checkerResult: true,
        });
        sourceVisionLevelsValid.set(sourceVisionLevel.visionId, sourceVisionLevel);
        debug(
          `(9.2) If the 'condition' on the target token is 'NONE' return true: Is true, target ${
            targetToken.data.name
          } ${'is visible'} to source ${sourceToken.data.name}`,
        );
        return true;
      }

      // 9.3) If the 'condition' on the target token is `HIDDEN` and the _Perception Passive of the system_
      // of the source token is `>` of the current sense value, we use the  _Perception Passive of the system_ for the checking and return ture if is `>` of the condition value setted.
      if (isStringEquals(targetVisionLevel.visionId, AtcvEffectConditionFlags.HIDDEN)) {
        if (
          game.settings.get(CONSTANTS.MODULE_NAME, 'autoPassivePerception') &&
          stealthedPassive > <number>targetVisionLevel.visionLevelValue
        ) {
          sourceVisionLevelsValidForDebug.set(sourceVisionLevel.visionId, {
            atcvSourceEffect: sourceVisionLevel,
            atcvTargetEffect: targetVisionLevel,
            checkerResult: true,
          });
          sourceVisionLevelsValid.set(sourceVisionLevel.visionId, sourceVisionLevel);
          debug(
            `(9.3) If the 'condition' on the target token is 'HIDDEN' and we use Perception Passive of the system: Is true, target ${
              targetToken.data.name
            } ${'is visible'} to source ${sourceToken.data.name}`,
          );
          return true;
        }
      }

      // 9.4)  The range of 'condition' level [`conditionLevelMinIndex,conditionLevelMaxIndex`], must be between the 'sense' range level [`conditionLevelMinIndex,conditionLevelMaxIndex`] like explained on the [tables](./tables.md).
      const result =
        <number>sourceVisionLevel?.visionLevelMinIndex <= <number>targetVisionLevel?.visionLevelMinIndex &&
        <number>sourceVisionLevel?.visionLevelMaxIndex >= <number>targetVisionLevel?.visionLevelMaxIndex;
      if (result) {
        sourceVisionLevelsValidForDebug.set(sourceVisionLevel.visionId, {
          atcvSourceEffect: sourceVisionLevel,
          atcvTargetEffect: targetVisionLevel,
          checkerResult: true,
        });
        sourceVisionLevelsValid.set(sourceVisionLevel.visionId, sourceVisionLevel);
        debug(
          `(9.4) The range of 'condition' level ['conditionLevelMinIndex,conditionLevelMaxIndex'], must be between the 'sense' range level ['conditionLevelMinIndex,conditionLevelMaxIndex']: Is true, target ${
            targetToken.data.name
          } ${'is visible'} to source ${sourceToken.data.name}`,
        );
      } else {
        sourceVisionLevelsValidForDebug.set(sourceVisionLevel.visionId, {
          atcvSourceEffect: sourceVisionLevel,
          atcvTargetEffect: targetVisionLevel,
          checkerResult: false,
        });
        debug(
          `(9.4) The range of 'condition' level ['conditionLevelMinIndex,conditionLevelMaxIndex'], must be between the 'sense' range level ['conditionLevelMinIndex,conditionLevelMaxIndex']: Is false, target ${
            targetToken.data.name
          } ${'is not visible'} to source ${sourceToken.data.name}`,
        );
      }
      return result;
    });

    // if any source has vision to the token, the token is visible
    let resultFinal = resultsOnTarget.reduce((total, curr) => total || curr, false);

    if (resultFinal) {
      // 10)  Check if `ATCV.conditionElevation` if set to true, will check if the source token and target token are at the same level .
      if (sourceVisionLevel?.visionElevation) {
        const tokenElevation = getElevationToken(sourceToken);
        const targetElevation = getElevationToken(targetToken);
        if (tokenElevation < targetElevation) {
          sourceVisionLevelsValidForDebug.set(sourceVisionLevel.visionId, {
            atcvSourceEffect: sourceVisionLevel,
            atcvTargetEffect: 'elevation',
            checkerResult: false,
          });
          debug(
            `(10) Check if 'ATCV.conditionElevation' if set to true: Is false, target ${
              targetToken.data.name
            } ${'is not visible'} to source ${sourceToken.data.name}`,
          );
          resultFinal = false;
        }
      }
      // 11)  Check if `ATCV.conditionDistance` is valorized if is set to a numeric value, will check if the tokens are near enough to remain hidden (remember -1 is infinity distance).
      if (sourceVisionLevel?.visionDistanceValue && sourceVisionLevel?.visionDistanceValue != 0) {
        const tokenDistance = getUnitTokenDist(sourceToken, targetToken);
        if (sourceVisionLevel?.visionDistanceValue != -1 && sourceVisionLevel?.visionDistanceValue < tokenDistance) {
          sourceVisionLevelsValidForDebug.set(sourceVisionLevel.visionId, {
            atcvSourceEffect: sourceVisionLevel,
            atcvTargetEffect: 'distance',
            checkerResult: false,
          });
          debug(
            `(11) Check if 'ATCV.conditionDistance' is valorized if is set to a numeric value: Is false, target ${
              targetToken.data.name
            } ${'is not visible'} to source ${sourceToken.data.name}`,
          );
          resultFinal = false;
        }
      }
    }
    return resultFinal;
  });

  // Print map for debug
  if (game.settings.get(CONSTANTS.MODULE_NAME, 'debug')) {
    debug(`PRINTING MAP FOR POINT FOR POINT 9-11 CHECKS`);
    debug(`${sourceToken.data.name} VS ${targetToken.data.name}`);
    for (const [key, value] of sourceVisionLevelsValidForDebug.entries()) {
      debug(
        `${JSON.stringify(value.atcvSourceEffect)} vs ${JSON.stringify(value.atcvTargetEffect)} => ${
          value.checkerResult
        } \n`,
      );
    }
  }

  let canYouSeeMeByLevelIndex = false;
  canYouSeeMeByLevelIndex = visibleForTypeOfSenseByIndex.reduce((total, curr) => total || curr, false);

  if (!canYouSeeMeByLevelIndex) {
    return canYouSeeMeByLevelIndex;
  }

  // ========================================
  // 3 - Check for the correct value number
  // =========================================

  const sourceVisionLevelsValidForDebug12: Map<string, CheckerDebugData> = new Map<string, CheckerDebugData>();

  // 12) Check if the vision level value of the filtered  'sense' on the source token is a number `>=` of the vision level value of the filtered 'condition' on the target token,
  // if the sense is set to `-1` this check is automatically skipped. If the condition and the sense are both set with value `-1` the condition won.
  const visibleForTypeOfSenseByValue = [...sourceVisionLevelsValid.values()].map((sourceVisionLevel: AtcvEffect) => {
    const resultsOnTarget = targetVisionLevels.map((targetVisionLevel) => {
      if (!targetVisionLevel || !targetVisionLevel.visionId) {
        sourceVisionLevelsValidForDebug12.set(sourceVisionLevel.visionId, {
          atcvSourceEffect: sourceVisionLevel,
          atcvTargetEffect: targetVisionLevel,
          checkerResult: true,
        });
        debug(
          `(12.1) Check if '!targetVisionLevel.visionId': Is true, target ${
            targetToken.data.name
          } ${'is visible'} to source ${sourceToken.data.name}`,
        );
        return true;
      }
      if (
        isStringEquals(targetVisionLevel.visionId, AtcvEffectSenseFlags.NORMAL) ||
        isStringEquals(targetVisionLevel.visionId, AtcvEffectSenseFlags.NONE)
      ) {
        sourceVisionLevelsValidForDebug12.set(sourceVisionLevel.visionId, {
          atcvSourceEffect: sourceVisionLevel,
          atcvTargetEffect: targetVisionLevel,
          checkerResult: true,
        });
        debug(
          `(12.2) Check if 'condition' on target is 'NONE' or 'NORMAL': Is true, target ${
            targetToken.data.name
          } ${'is visible'} to source ${sourceToken.data.name}`,
        );
        return true;
      }
      // the "-1" case
      if (<number>targetVisionLevel.visionLevelValue <= -1) {
        sourceVisionLevelsValidForDebug12.set(sourceVisionLevel.visionId, {
          atcvSourceEffect: sourceVisionLevel,
          atcvTargetEffect: targetVisionLevel,
          checkerResult: false,
        });
        debug(
          `(12.3) Check on target 'visionLevelValue <= -1': Is true, target ${
            targetToken.data.name
          } ${'is not visible'} to source ${sourceToken.data.name}`,
        );
        return false;
      } else {
        const result =
          <number>sourceVisionLevel.visionLevelValue <= -1 ||
          <number>sourceVisionLevel.visionLevelValue >= <number>targetVisionLevel.visionLevelValue;
        if (result) {
          sourceVisionLevelsValidForDebug12.set(sourceVisionLevel.visionId, {
            atcvSourceEffect: sourceVisionLevel,
            atcvTargetEffect: targetVisionLevel,
            checkerResult: true,
          });
          debug(
            `(12.4) Check on source 'visionLevelValue <= -1 o > of the target one': Is true, target ${
              targetToken.data.name
            } ${'is visible'} to source ${sourceToken.data.name}`,
          );
        } else {
          sourceVisionLevelsValidForDebug12.set(sourceVisionLevel.visionId, {
            atcvSourceEffect: sourceVisionLevel,
            atcvTargetEffect: targetVisionLevel,
            checkerResult: false,
          });
          debug(
            `(12.4) Check on source 'visionLevelValue <= -1 o > of the target one': Is false, target ${
              targetToken.data.name
            } ${'is not visible'} to source ${sourceToken.data.name}`,
          );
        }
        return result;
      }
    });

    // if any source has vision to the token, the token is visible
    const resultFinal = resultsOnTarget.reduce((total, curr) => total || curr, false);
    return resultFinal;
  });

  // Print map for debug
  if (game.settings.get(CONSTANTS.MODULE_NAME, 'debug')) {
    debug(`PRINTING MAP FOR POINT FOR POINT 12 CHECKS`);
    debug(`${sourceToken.data.name} VS ${targetToken.data.name}`);
    for (const [key, value] of sourceVisionLevelsValidForDebug12.entries()) {
      debug(
        `${JSON.stringify(value.atcvSourceEffect)} vs ${JSON.stringify(value.atcvTargetEffect)} => ${
          value.checkerResult
        } \n`,
      );
    }
  }

  // Print map for debug
  if (game.settings.get(CONSTANTS.MODULE_NAME, 'debug')) {
    debug(`PRINTING MAP FOR POINT FOR POINT FINAL CHECKS`);
    for (const [key, value] of sourceVisionLevelsValidForDebug12.entries()) {
      if (typeof value.atcvTargetEffect === 'string' || value.atcvTargetEffect instanceof String) {
        debug(
          `${sourceToken.data.name}.${value.atcvSourceEffect.visionId} vs ${targetToken.data.name}.${value.atcvTargetEffect} => ${value.checkerResult}`,
        );
      } else {
        debug(
          `${sourceToken.data.name}.${value.atcvSourceEffect.visionId} vs ${targetToken.data.name}.${value.atcvTargetEffect.visionId} => ${value.checkerResult}`,
        );
      }
    }
  }

  let canYouSeeMeByLevelValue = false;
  // if any source has vision to the token, the token is visible
  canYouSeeMeByLevelValue = visibleForTypeOfSenseByValue.reduce((total, curr) => total || curr, false);

  return canYouSeeMeByLevelValue;
}

export async function prepareActiveEffectForConditionalVisibility(
  sourceToken: Token,
  visionCapabilities: VisionCapabilities,
): Promise<Map<string, AtcvEffect>> {
  const mapToUpdate = new Map<string, AtcvEffect>();

  // Make sure to remove anything with value 0
  for (const senseData of await API.getAllDefaultSensesAndConditions(sourceToken)) {
    const effectNameToCheckOnActor = i18n(<string>senseData?.visionName);
    if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
      const activeEffectToRemove = <ActiveEffect>(
        await API.findEffectByNameOnToken(<string>sourceToken.id, effectNameToCheckOnActor)
      );
      //const actve = sourceToken.document?.getFlag(CONSTANTS.MODULE_NAME, senseData.id);
      const atcvEffectFlagData = <AtcvEffect>sourceToken.document?.getFlag(CONSTANTS.MODULE_NAME, senseData.visionId);
      const actve = atcvEffectFlagData?.visionLevelValue;
      if (actve === 0 || actve === null || actve === undefined || !actve) {
        await API.removeEffectFromIdOnToken(<string>sourceToken.id, <string>activeEffectToRemove.id);
      }
    }
  }

  // const actor = <Actor>sourceToken.document.getActor();

  // MANAGE THE UPDATE OF EFFECT INSTEAD REMOVE AND ADD
  // REMOVE EVERY SENSES WITH THE SAME NAME

  // const keysSensesFirstTime: string[] = [];
  for (const [key, sense] of visionCapabilities.retrieveSenses()) {
    const effectNameToCheckOnActor = i18n(<string>sense.visionName);
    const activeEffectFounded = <ActiveEffect>(
      await API.findEffectByNameOnToken(<string>sourceToken.id, effectNameToCheckOnActor)
    );
    if (sense.visionLevelValue && sense.visionLevelValue != 0) {
      // TODO why this failed to return ???
      //if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
      if (activeEffectFounded) {
        const actve = retrieveAtcvVisionLevelValueFromActiveEffect(activeEffectFounded.data?.changes || []);
        if (sense.visionLevelValue != actve) {
          //@ts-ignore
          const data = <ActiveEffectData>duplicateExtended(activeEffectFounded.data);
          data?.changes.forEach((aee) => {
            if (aee.key.startsWith('ATCV.') && !aee.key.startsWith('ATCV.condition') && aee.value) {
              aee.value = String(sense.visionLevelValue);
            }
          });
          if (data?.changes.length > 0) {
            await API.updateActiveEffectFromIdOnToken(
              <string>sourceToken.id,
              <string>activeEffectFounded.id,
              undefined,
              undefined,
              data,
            );
            if (sense) {
              mapToUpdate.set(sense.visionId, sense);
            }
          }
        }
      } else {
        const atcvEffcet = await API.addEffectConditionalVisibilityOnToken(<string>sourceToken.id, sense, false);
        if (atcvEffcet) {
          mapToUpdate.set(sense.visionId, atcvEffcet);
        }
      }
    } else {
      // TODO why this failed to return ???
      //if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
      if (activeEffectFounded) {
        const actve = retrieveAtcvVisionLevelValueFromActiveEffect(activeEffectFounded.data?.changes || []);
        if (sense.visionLevelValue != actve) {
          await API.removeEffectFromIdOnToken(<string>sourceToken.id, <string>activeEffectFounded.id);
        }
      }
    }
  }

  // MANAGE THE UPDATE OF EFFECT INSTEAD REMOVE AND ADD
  // REMOVE EVERY CONDITIONS WITH THE SAME NAME

  // const keysConditionsFirstTime: string[] = [];
  for (const [key, condition] of visionCapabilities.retrieveConditions()) {
    const effectNameToCheckOnActor = i18n(<string>condition.visionName);
    const activeEffectFounded = <ActiveEffect>(
      await API.findEffectByNameOnToken(<string>sourceToken.id, effectNameToCheckOnActor)
    );
    if (condition.visionLevelValue && condition.visionLevelValue != 0) {
      // TODO why this failed to return ???
      //if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
      if (activeEffectFounded) {
        const actve = retrieveAtcvVisionLevelValueFromActiveEffect(activeEffectFounded.data?.changes || []);
        if (condition.visionLevelValue != actve) {
          //@ts-ignore
          const data = <ActiveEffectData>duplicateExtended(activeEffectFounded.data);
          data?.changes.forEach((aee) => {
            if (aee.key.startsWith('ATCV.') && !aee.key.startsWith('ATCV.condition') && aee.value) {
              aee.value = String(condition.visionLevelValue);
            }
          });
          if (data?.changes.length > 0) {
            await API.updateActiveEffectFromIdOnToken(
              <string>sourceToken.id,
              <string>activeEffectFounded.id,
              undefined,
              undefined,
              data,
            );
            if (condition) {
              mapToUpdate.set(condition.visionId, condition);
            }
          }
        }
      } else {
        const atcvEffcet = await API.addEffectConditionalVisibilityOnToken(
          <string>sourceToken.id,
          condition, //<string>condition.statusSight?.id,
          false,
        );
        if (atcvEffcet) {
          mapToUpdate.set(condition.visionId, atcvEffcet);
        }
      }
    } else {
      // TODO why this failed to return ???
      //if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
      if (activeEffectFounded) {
        const actve = retrieveAtcvVisionLevelValueFromActiveEffect(activeEffectFounded.data?.changes || []);
        if (condition.visionLevelValue != actve) {
          await API.removeEffectFromIdOnToken(<string>sourceToken.id, <string>activeEffectFounded.id);
        }
      }
    }
  }

  return mapToUpdate;
}

// export function getSensesFromToken(token: Token): AtcvEffect[] {
//   return _getCVFromToken(token, API.SENSES, true);
// }

// export function getConditionsFromToken(token: Token): AtcvEffect[] {
//   return _getCVFromToken(token, API.CONDITIONS, false);
// }

// function _getCVFromToken(token: Token, statusSights: SenseData[], isSense:boolean): AtcvEffect[] {
//   if (!token) {
//     info(`No token found`);
//     return [];
//   }
//   const actor = <Actor>token.document?.actor || <Actor>token?.actor; // <Actor>token.document?.getActor() ||
//   if (!actor) {
//     info(`No actor found for token '${token.name}'`);
//     return [];
//   }
//   const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>actor?.data.effects;
//   //const totalEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>actor?.data.effects.contents.filter(i => !i.data.disabled);
//   const atcvEffects = actorEffects.filter(
//     (entity) => !!entity.data.changes.find((effect) => effect.key.includes('ATCV')),
//   );

//   const statusEffects: AtcvEffect[] = [];

//   for (const effectEntity of atcvEffects) {
//     const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
//     if (!effectNameToSet) {
//       continue;
//     }
//     const effectSight = statusSights.find((a: SenseData) => {
//       return isStringEquals(effectNameToSet, a.id) || isStringEquals(effectNameToSet, a.name);
//     });
//     // if is a AE with the label of the module (no id sorry)
//       let atcvVisionElevation = true;
//       let atcvConditionTargets: string[] = [];
//       let atcvConditionSources: string[] = [];
//       let atcvDistance = 0;
//       let atcvValue = 0;
//       let atcvTargetImage = '';
//       let atcvType = ''; //isSense ? 'sense' : 'condition';

//       atcvVisionElevation = retrieveAtcvElevationFromActiveEffect(effectEntity.data.changes);
//       atcvConditionTargets = retrieveAtcvTargetsFromActiveEffect(effectEntity.data.changes);
//       atcvConditionSources = retrieveAtcvSourcesFromActiveEffect(effectEntity.data.changes);
//       atcvDistance = retrieveAtcvVisionLevelDistanceFromActiveEffect(effectEntity.data.changes);
//       atcvValue = retrieveAtcvVisionLevelValueFromActiveEffect(effectEntity.data.changes);
//       atcvTargetImage = retrieveAtcvVisionTargetImageFromActiveEffect(effectEntity.data.changes);
//       atcvType = retrieveAtcvTypeFromActiveEffect(effectEntity.data.changes);
//       if(isSense && atcvType != 'sense'){
//         continue;
//       }
//       if(!isSense && atcvType != 'condition'){
//         continue;
//       }

//       if (effectSight && isSense) {
//         // look up if you have not basic AE and if the check elevation is not enabled
//         if (
//           !effectSight.conditionElevation &&
//           effectSight.id != AtcvEffectSenseFlags.NONE &&
//           effectSight.id != AtcvEffectSenseFlags.NORMAL &&
//           effectSight.id != AtcvEffectSenseFlags.BLINDED
//         ) {
//           atcvVisionElevation = false;
//         }
//       }

//       statusEffects.push({
//         visionElevation: atcvVisionElevation,
//         visionTargets: atcvConditionTargets,
//         visionSources: atcvConditionSources,
//         statusSight: effectSight,
//         visionDistanceValue: atcvDistance,
//         visionLevelValue: atcvValue,
//         visionTargetImage: atcvTargetImage,
//         visionType: atcvType,
//       });
//   }
//   return statusEffects;
// }

export function getSensesFromToken(tokenDocument: TokenDocument, filterValueNoZero = false): AtcvEffect[] {
  return _getCVFromToken(tokenDocument, true, filterValueNoZero);
}

export function getConditionsFromToken(tokenDocument: TokenDocument, filterValueNoZero = false): AtcvEffect[] {
  return _getCVFromToken(tokenDocument, false, filterValueNoZero);
}

function _getCVFromToken(tokenDocument: TokenDocument, isSense: boolean, filterValueNoZero = false): AtcvEffect[] {
  const statusEffects: AtcvEffect[] = [];

  // If not token is find we go back to the default preset list...
  if (!tokenDocument) {
    info(`No token found i get only the default registered`);
    //return [];
    let sensesOrConditions: SenseData[] = [];
    if (isSense) {
      sensesOrConditions = API.SENSES;
    } else {
      sensesOrConditions = API.CONDITIONS;
    }
    for (const senseData of sensesOrConditions) {
      const alreadyPresent = statusEffects.find((e) => {
        return isStringEquals(e.visionId, senseData.id);
      });
      if (!alreadyPresent) {
        const atcvEffect = AtcvEffect.fromSenseData(senseData, 0, isSense);
        statusEffects.push(atcvEffect);
      }
    }
    if (filterValueNoZero) {
      return statusEffects.filter((a) => a.visionLevelValue != 0);
    } else {
      return statusEffects;
    }
  }

  // A token is present
  const actor = <Actor>tokenDocument?.actor; // <Actor>token.document?.getActor() ||
  if (!actor) {
    info(`No actor found for token '${tokenDocument.name}'`);
    return [];
  }
  const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>actor?.data.effects;
  //const totalEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>actor?.data.effects.contents.filter(i => !i.data.disabled);
  const atcvEffects = actorEffects.filter(
    (entity) => !!entity.data.changes.find((effect) => effect.key.includes('ATCV')),
  );

  for (const effectEntity of atcvEffects) {
    const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
    if (!effectNameToSet) {
      continue;
    }
    const atcvEffectTmp = retrieveAtcvEffectFromActiveEffect(
      effectEntity.data.changes,
      effectNameToSet,
      <string>effectEntity.data.icon,
      undefined,
    );
    if (!atcvEffectTmp.visionId) {
      continue;
    }

    if (isSense && atcvEffectTmp.visionType === 'sense') {
      statusEffects.push(atcvEffectTmp);
    } else if (!isSense && atcvEffectTmp.visionType === 'condition') {
      statusEffects.push(atcvEffectTmp);
    }
    // TODO to remove this piece of code....
    else {
      const effectSenseSight = API.SENSES.find((a: SenseData) => {
        return isStringEquals(atcvEffectTmp.visionId, a.id) || isStringEquals(effectNameToSet, a.name);
      });
      if (effectSenseSight) {
        atcvEffectTmp.visionType = 'sense';
      } else {
        const effectConditionSight = API.CONDITIONS.find((a: SenseData) => {
          return isStringEquals(atcvEffectTmp.visionId, a.id) || isStringEquals(effectNameToSet, a.name);
        });
        if (effectConditionSight) {
          atcvEffectTmp.visionType = 'condition';
        } else {
          // do nothing
          if (!atcvEffectTmp.visionType) {
            // warn(
            //   `Cannot add the sense or condition with name ${effectNameToSet} the 'visionType' property is not been set please add the 'ATCV.conditionType' active effect changes with the value 'sense' or 'condition', or registered the sense with the condition`,
            //   true,
            // );
            atcvEffectTmp.visionType = 'sense';
          }
        }
      }
      statusEffects.push(atcvEffectTmp);
    }
  }

  const statusEffectsFinal: AtcvEffect[] = [];
  let sensesOrConditions: SenseData[] = [];
  if (isSense) {
    sensesOrConditions = API.SENSES;
  } else {
    sensesOrConditions = API.CONDITIONS;
  }
  for (const senseData of sensesOrConditions) {
    const alreadyPresent = <AtcvEffect>statusEffects.find((e) => {
      return isStringEquals(e.visionId, senseData.id);
    });
    if (!alreadyPresent) {
      const atcvEffect = AtcvEffect.fromSenseData(senseData, 0, isSense);
      statusEffectsFinal.push(atcvEffect);
    } else {
      const atcvEffect = AtcvEffect.mergeWithSensedataDefault(alreadyPresent, senseData);
      statusEffectsFinal.push(atcvEffect);
    }
  }
  if (filterValueNoZero) {
    return statusEffectsFinal.filter((a) => a.visionLevelValue != 0);
  } else {
    return statusEffectsFinal;
  }
}

/*
function _getCVFromToken(token: Token, isSense: boolean, filterValueNoZero = false): AtcvEffect[] {
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

  const statusEffects: AtcvEffect[] = [];

  for (const effectEntity of atcvEffects) {
    const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
    if (!effectNameToSet) {
      continue;
    }
    // const effectSight = statusSights.find((a: SenseData) => {
    //   return isStringEquals(effectNameToSet, a.id) || isStringEquals(effectNameToSet, a.name);
    // });
    // if is a AE with the label of the module (no id sorry)
    const atcvValue = retrieveAtcvVisionLevelValueFromActiveEffect(effectEntity.data.changes) || 0;
    if (atcvValue == 0 && filterValueNoZero) {
      continue;
    }
    const atcvCustomId = retrieveAtcvVisionLevelKeyFromActiveEffect(effectEntity.data.changes) || '';
    const atcvVisionElevation = retrieveAtcvElevationFromActiveEffect(effectEntity.data.changes) || true;
    const atcvConditionTargets = retrieveAtcvTargetsFromActiveEffect(effectEntity.data.changes) || [];
    const atcvConditionSources = retrieveAtcvSourcesFromActiveEffect(effectEntity.data.changes) || [];
    const atcvDistance = retrieveAtcvVisionLevelDistanceFromActiveEffect(effectEntity.data.changes) || 0;
    const atcvTargetImage = retrieveAtcvVisionTargetImageFromActiveEffect(effectEntity.data.changes) || '';
    let atcvType = retrieveAtcvTypeFromActiveEffect(effectEntity.data.changes) || '';
    const atcvLevelMinIndex = retrieveAtcvLevelMinIndexFromActiveEffect(effectEntity.data.changes) || 0;
    const atcvLevelMaxIndex = retrieveAtcvLevelMaxIndexFromActiveEffect(effectEntity.data.changes) || 10;
    let atcvPath = '';

    const effectSightSense = <SenseData>API.SENSES.find((a: SenseData) => {
      return isStringEquals(effectNameToSet, a.id) || isStringEquals(effectNameToSet, a.name);
    });
    const effectSightCondition = <SenseData>API.CONDITIONS.find((a: SenseData) => {
      return isStringEquals(effectNameToSet, a.id) || isStringEquals(effectNameToSet, a.name);
    });

    // TODO maybe i can do better than this ...
    if (effectSightSense && !atcvType) {
      atcvType = 'sense';
    }
    if (effectSightCondition && !atcvType) {
      atcvType = 'condition';
    }
    if (isSense && !atcvType) {
      atcvType = 'sense';
    }
    if (!isSense && !atcvType) {
      atcvType = 'condition';
    }
    if (isSense && atcvType != 'sense') {
      continue;
    }
    if (!isSense && atcvType != 'condition') {
      continue;
    }

    if(effectSightSense){
      atcvPath = effectSightSense.path;
    }
    if(effectSightCondition){
      atcvPath = effectSightCondition.path;
    }

    statusEffects.push({
      visionId: atcvCustomId,
      visionName: effectNameToSet,
      visionPath: atcvPath,
      visionIcon: <string>effectEntity.data.icon,

      visionElevation: atcvVisionElevation,
      visionTargets: atcvConditionTargets,
      visionSources: atcvConditionSources,
      // statusSight: effectSight,
      visionDistanceValue: atcvDistance,
      visionLevelValue: atcvValue,
      visionTargetImage: atcvTargetImage,
      visionType: atcvType,
      visionLevelMinIndex: atcvLevelMinIndex,
      visionLevelMaxIndex: atcvLevelMaxIndex,
    });
  }
  if (!filterValueNoZero) {
    let sensesOrConditions: SenseData[] = [];
    if (isSense) {
      sensesOrConditions = API.SENSES;
    } else {
      sensesOrConditions = API.CONDITIONS;
    }
    for (const senseData of sensesOrConditions) {
      const alreadyPresent = statusEffects.find((e) => {
        return isStringEquals(e.visionId, senseData.id);
      });
      if (!alreadyPresent) {
        const atcvEffect: AtcvEffect = {
          visionId: senseData.id,
          visionName: senseData.name,
          visionElevation: senseData.conditionElevation,
          visionTargets: senseData.conditionTargets,
          visionSources: senseData.conditionSources,
          // statusSight: effectSight,
          visionDistanceValue: senseData.conditionDistance,
          visionLevelValue: 0,
          visionTargetImage: senseData.conditionTargetImage,
          visionType: senseData.conditionType,
          visionLevelMinIndex: senseData.visionLevelMinIndex,
          visionLevelMaxIndex: senseData.visionLevelMaxIndex,
        };
        statusEffects.push(atcvEffect);
      }
    }
  }
  return statusEffects;
}
*/
export function retrieveAtcvEffectFromActiveEffect(
  effectChanges: EffectChangeData[],
  effectName: string,
  effectIcon: string,
  isSense: boolean | undefined = undefined,
): AtcvEffect {
  const atcvEffect: AtcvEffect = <any>{};

  if (!atcvEffect.visionName) {
    atcvEffect.visionName = effectName;
  }

  if (!atcvEffect.visionIcon) {
    atcvEffect.visionIcon = effectIcon;
  }

  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  effectEntityChanges?.forEach((change) => {
    if (change.key.startsWith('ATCV.') && !change.key.startsWith('ATCV.condition') && change.value) {
      if (atcvEffect.visionId === null || atcvEffect.visionId === undefined) {
        atcvEffect.visionId = change.key.slice(5);
        atcvEffect.visionLevelValue = Number(change.value);
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionElevation') && change.value) {
      if (atcvEffect.visionElevation === null || atcvEffect.visionElevation === undefined) {
        atcvEffect.visionElevation = change.value === 'true';
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionDistance') && change.value) {
      if (atcvEffect.visionDistanceValue === null || atcvEffect.visionDistanceValue === undefined) {
        atcvEffect.visionDistanceValue = Number(change.value);
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionTargets') && change.value) {
      if (atcvEffect.visionTargets === null || atcvEffect.visionTargets === undefined) {
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
        atcvEffect.visionTargets = providedTags.map((t) => (t instanceof RegExp ? t : t.trim()));
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionSources') && change.value) {
      if (atcvEffect.visionSources === null || atcvEffect.visionSources === undefined) {
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
        atcvEffect.visionSources = providedTags.map((t) => (t instanceof RegExp ? t : t.trim()));
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionTargetImage') && change.value) {
      if (atcvEffect.visionTargetImage === null || atcvEffect.visionTargetImage === undefined) {
        atcvEffect.visionTargetImage = String(change.value);
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionType') && change.value) {
      if (atcvEffect.visionType === null || atcvEffect.visionType === undefined) {
        atcvEffect.visionType = String(change.value);
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionLevelMinIndex') && change.value) {
      if (atcvEffect.visionLevelMinIndex === null || atcvEffect.visionLevelMinIndex === undefined) {
        atcvEffect.visionLevelMinIndex = Number(change.value);
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionLevelMaxIndex') && change.value) {
      if (atcvEffect.visionLevelMaxIndex === null || atcvEffect.visionLevelMaxIndex === undefined) {
        atcvEffect.visionLevelMaxIndex = Number(change.value);
      }
    }
  });

  if (isSense === null || isSense === undefined) {
    const effectSightSense = <SenseData>API.SENSES.find((a: SenseData) => {
      return isStringEquals(atcvEffect.visionId, a.id) || isStringEquals(atcvEffect.visionName, a.name);
    });
    if (effectSightSense) {
      if (!atcvEffect.visionType) {
        atcvEffect.visionType = 'sense';
      }
    } else {
      const effectSightCondition = <SenseData>API.CONDITIONS.find((a: SenseData) => {
        return isStringEquals(atcvEffect.visionId, a.id) || isStringEquals(atcvEffect.visionName, a.name);
      });
      if (effectSightCondition) {
        if (!atcvEffect.visionType) {
          atcvEffect.visionType = 'condition';
        }
      } else {
        // this cannot be happening
      }
    }
  } else {
    // Last check
    if (!atcvEffect.visionType && isSense) {
      atcvEffect.visionType = 'sense';
    } else if (!atcvEffect.visionType && !isSense) {
      atcvEffect.visionType = 'condition';
    } else {
      // this cannot be happening
    }
  }

  return atcvEffect;
}

/**
 * @deprecated to remove in some way
 * @param effectChanges
 * @returns
 */
export function retrieveAtcvVisionLevelValueFromActiveEffect(effectChanges: EffectChangeData[]): number {
  let atcvValue = 0;
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  const atcvValueChange = effectEntityChanges.find((aee) => {
    if (aee.key.startsWith('ATCV.') && !aee.key.startsWith('ATCV.condition') && aee.value) {
      return aee;
    }
  });
  if (!atcvValueChange) {
    // Ignore ???
    return 0;
  }
  atcvValue = Number(atcvValueChange.value);
  return atcvValue;
}

/*
export function retrieveAtcvVisionLevelKeyFromActiveEffect(effectChanges: EffectChangeData[]): string {
  let atcvKey = '';
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  const atcvKeyChange = <EffectChangeData>effectEntityChanges.find((aee) => {
    if (aee.key.startsWith('ATCV.') && !aee.key.startsWith('ATCV.condition') && aee.value) {
      const updateKey = aee.key.slice(5);
      return updateKey;
    }
  });
  atcvKey = atcvKeyChange.key.slice(5);
  return atcvKey;
}

export function retrieveAtcvElevationFromActiveEffect(effectChanges: EffectChangeData[]): boolean {
  let checkElevationAcvt = false;
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  for (const change of effectEntityChanges) {
    if (isStringEquals(change.key, 'ATCV.conditionElevation') && change.value) {
      checkElevationAcvt = change.value === 'true';
      break;
    }
  }
  return checkElevationAcvt;
}

export function retrieveAtcvTypeFromActiveEffect(effectChanges: EffectChangeData[]): string {
  let checkTypeAcvt = '';
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  for (const change of effectEntityChanges) {
    if (isStringEquals(change.key, 'ATCV.conditionType') && change.value) {
      checkTypeAcvt = String(change.value);
      break;
    }
  }
  return checkTypeAcvt;
}

export function retrieveAtcvLevelMinIndexFromActiveEffect(effectChanges: EffectChangeData[]): number {
  let checkLevelMinIndexAcvt = 0;
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  for (const change of effectEntityChanges) {
    if (isStringEquals(change.key, 'ATCV.conditionLevelMinIndex') && change.value) {
      checkLevelMinIndexAcvt = Number(change.value);
      break;
    }
  }
  return checkLevelMinIndexAcvt;
}

export function retrieveAtcvLevelMaxIndexFromActiveEffect(effectChanges: EffectChangeData[]): number {
  let checkLevelMaxIndexAcvt = 10;
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  for (const change of effectEntityChanges) {
    if (isStringEquals(change.key, 'ATCV.conditionLevelMaxIndex') && change.value) {
      checkLevelMaxIndexAcvt = Number(change.value);
      break;
    }
  }
  return checkLevelMaxIndexAcvt;
}

export function retrieveAtcvTargetImageFromActiveEffect(effectChanges: EffectChangeData[]): string {
  let checkTargetImageAcvt = '';
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
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
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
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
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
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

export function retrieveAtcvVisionTargetImageFromActiveEffect(effectChanges: EffectChangeData[]): string {
  let atcvValue: any = '';
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
*/

export async function toggleStealth(event) {
  //const stealthedWithHiddenConditionOri =
  //  this.object.document.getFlag(CONSTANTS.MODULE_NAME, AtcvEffectConditionFlags.HIDDEN) ?? 0;
  const atcvEffectFlagData = <AtcvEffect>(
    this.object.document.getFlag(CONSTANTS.MODULE_NAME, AtcvEffectConditionFlags.HIDDEN)
  );
  let stealthedWithHiddenCondition = atcvEffectFlagData?.visionLevelValue ?? 0;
  let stealthedPassive = 0;
  if (
    stealthedWithHiddenCondition == 0 &&
    getProperty(this.object.document.actor, `data.${API.STEALTH_PASSIVE_SKILL}`)
  ) {
    stealthedWithHiddenCondition =
      <number>getProperty(this.object.document.actor, `data.${API.STEALTH_PASSIVE_SKILL}`) || 0;
    stealthedPassive = getProperty(this.object.document.actor, `data.${API.STEALTH_PASSIVE_SKILL}`) || 0;
  }

  // TODO TO CHECK IF I CAN ADD MY CUSTOMIZED ONES WITHOUT THE NEED OF REGISTERED
  //const sensesOrderByName = <SenseData[]>API.SENSES; //.sort((a, b) => a.name.localeCompare(b.name));
  //const conditionsOrderByName = <SenseData[]>API.CONDITIONS; //.sort((a, b) => a.name.localeCompare(b.name));
  const sensesOrderByName = getSensesFromToken(this.object).sort((a, b) => a.visionName.localeCompare(b.visionName));
  const conditionsOrderByName = getConditionsFromToken(this.object).sort((a, b) =>
    a.visionName.localeCompare(b.visionName),
  );
  sensesOrderByName.forEach(function (item, i) {
    if (item.visionId === AtcvEffectSenseFlags.NONE) {
      sensesOrderByName.splice(i, 1);
      sensesOrderByName.unshift(item);
    }
  });
  conditionsOrderByName.forEach(function (item, i) {
    if (item.visionId === AtcvEffectConditionFlags.NONE) {
      conditionsOrderByName.splice(i, 1);
      conditionsOrderByName.unshift(item);
    }
  });

  const stealthedActive = await API.rollStealth(this.object);
  const content = await renderTemplate(`modules/${CONSTANTS.MODULE_NAME}/templates/stealth_hud.html`, {
    passivestealth: stealthedPassive,
    currentstealth: stealthedWithHiddenCondition,
    stealthroll: stealthedActive,
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
          const passivestealth = parseInt(html.find('div.form-group').children()[2]?.value);
          //@ts-ignore
          const currentstealth = parseInt(html.find('div.form-group').children()[5]?.value);
          //@ts-ignore
          let valStealthRoll = parseInt(html.find('div.form-group').children()[8]?.value);
          if (isNaN(valStealthRoll)) {
            valStealthRoll = 0;
          }
          //@ts-ignore
          const disablePassiveRecovery = html.find('div.form-group').children()[11]?.value === 'true';
          //@ts-ignore
          const senseId = String(html.find('div.form-group').children()[14]?.value);
          //@ts-ignore
          const conditionId = String(html.find('div.form-group').children()[18]?.value);

          if (valStealthRoll < passivestealth && !disablePassiveRecovery) {
            valStealthRoll = passivestealth;
          }

          let selectedTokens = <Token[]>[];
          if (this.object) {
            selectedTokens = [this.object];
          }
          if (!selectedTokens || selectedTokens.length == 0) {
            selectedTokens = [<Token[]>canvas.tokens?.controlled][0];
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
                  const atcvEffectFlagData = AtcvEffect.fromEffect(effect);
                  atcvEffectFlagData.visionLevelValue = valStealthRoll;
                  await selectedToken.document.setFlag(CONSTANTS.MODULE_NAME, senseId, atcvEffectFlagData);
                }
              } else {
                warn(`Can't find effect definition for '${senseId}', maybe you forgot to registered that ?`, true);
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
                  const atcvEffectFlagData = AtcvEffect.fromEffect(effect);
                  atcvEffectFlagData.visionLevelValue = valStealthRoll;
                  await selectedToken.document.setFlag(CONSTANTS.MODULE_NAME, conditionId, atcvEffectFlagData);
                }
              } else {
                warn(`Can't find effect definition for '${conditionId}', maybe you forgot to registered that ?`, true);
              }
            }
          }
          event.currentTarget.classList.toggle('active', valStealthRoll && valStealthRoll != 0);
        },
      },
    },
    close: async (html: JQuery<HTMLElement>) => {
      event.currentTarget.classList.toggle('active', stealthedWithHiddenCondition && stealthedWithHiddenCondition != 0);
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
