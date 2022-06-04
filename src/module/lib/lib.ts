import { conditionalVisibilitySocket } from './../socket';
import CONSTANTS from '../constants.js';
import API from '../api.js';
import {
  AtcvEffect,
  AtcvEffectSenseFlags,
  AtcvEffectConditionFlags,
  VisionCapabilities,
  SenseData,
  ConditionalVisibilityFlags,
  CVSkillData,
  CVResultData,
} from '../conditional-visibility-models.js';
import type {
  ActorData,
  TokenData,
} from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import type EmbeddedCollection from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs';
import type { EffectChangeData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData';
import type Effect from '../effects/effect.js';
import { ConditionalVisibilityEffectDefinitions } from '../conditional-visibility-effect-definition.js';
import { EffectSupport } from '../effects/effect-support';

// =============================
// Module Generic function
// =============================

export async function getToken(documentUuid) {
  const document = await fromUuid(documentUuid);
  //@ts-ignore
  return document?.token ?? document;
}

export function getOwnedTokens(priorityToControlledIfGM: boolean): Token[] {
  const gm = game.user?.isGM;
  if (gm) {
    if (priorityToControlledIfGM) {
      const arr = <Token[]>canvas.tokens?.controlled;
      if (arr && arr.length > 0) {
        return arr;
      } else {
        return <Token[]>canvas.tokens?.placeables;
      }
    } else {
      return <Token[]>canvas.tokens?.placeables;
    }
  }
  if (priorityToControlledIfGM) {
    const arr = <Token[]>canvas.tokens?.controlled;
    if (arr && arr.length > 0) {
      return arr;
    }
  }
  let ownedTokens = <Token[]>canvas.tokens?.placeables.filter((token) => token.isOwner && (!token.data.hidden || gm));
  if (ownedTokens.length === 0 || !canvas.tokens?.controlled[0]) {
    ownedTokens = <Token[]>(
      canvas.tokens?.placeables.filter((token) => (token.observer || token.isOwner) && (!token.data.hidden || gm))
    );
  }
  return ownedTokens;
}

export function is_UUID(inId) {
  return typeof inId === 'string' && (inId.match(/\./g) || []).length && !inId.endsWith('.');
}

export function getUuid(target) {
  // If it's an actor, get its TokenDocument
  // If it's a token, get its Document
  // If it's a TokenDocument, just use it
  // Otherwise fail
  const document = getDocument(target);
  return document?.uuid ?? false;
}

export function getDocument(target) {
  if (target instanceof foundry.abstract.Document) return target;
  return target?.document;
}

export function is_real_number(inNumber) {
  return !isNaN(inNumber) && typeof inNumber === 'number' && isFinite(inNumber);
}

export function isGMConnected() {
  return !!Array.from(<Users>game.users).find((user) => user.isGM && user.active);
}

export function isGMConnectedAndSocketLibEnable() {
  return isGMConnected(); // && !game.settings.get(CONSTANTS.MODULE_NAME, 'doNotUseSocketLibFeature');
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isActiveGM(user) {
  return user.active && user.isGM;
}

export function getActiveGMs() {
  return game.users?.filter(isActiveGM);
}

export function isResponsibleGM() {
  if (!game.user?.isGM) return false;
  return !getActiveGMs()?.some((other) => other.data._id < <string>game.user?.data._id);
}

export function firstGM() {
  return game.users?.find(u => u.isGM && u.active);
}

export function isFirstGM() {
  return game.user?.id === firstGM()?.id;
}

export function firstOwner(doc):User|undefined {
  /* null docs could mean an empty lookup, null docs are not owned by anyone */
  if (!doc) return undefined;
  const permissionObject=(doc instanceof TokenDocument ? doc.actor?.data.permission : doc.data.permission) ?? {}
  const playerOwners = Object.entries(permissionObject)
    .filter(([id, level]) => (!game.users?.get(id)?.isGM && game.users?.get(id)?.active) && level === 3)
    .map(([id, level]) => id);
  
  if (playerOwners.length > 0) {
    return game.users?.get(<string>playerOwners[0]);
  }

  /* if no online player owns this actor, fall back to first GM */
  return firstGM();
}

/* Players first, then GM */
export function isFirstOwner(doc) {
  return game.user?.id === firstOwner(doc)?.id;
}

// ================================
// Logger utility
// ================================

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

// =========================================================================================

export function cleanUpString(stringToCleanUp: string) {
  // regex expression to match all non-alphanumeric characters in string
  const regex = /[^A-Za-z0-9]/g;
  if (stringToCleanUp) {
    return i18n(stringToCleanUp).replace(regex, '').toLowerCase();
  } else {
    return stringToCleanUp;
  }
}

export function isStringEquals(stringToCheck1: string, stringToCheck2: string, startsWith = false): boolean {
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
 * The duplicate function of foundry keep converting my string value to "0"
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
  for (const sourceElement of source) {
    const targetElement = target.find((targetElement) => {
      return sourceElement[prop] === targetElement[prop];
    });
    targetElement ? Object.assign(targetElement, sourceElement) : target.push(sourceElement);
  }
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
  return <Token>selectedTokens[0];
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
  token = <Token>controlled[0];
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
        _levels.getTokenLOSheight(placeableObject)
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

export async function prepareActiveEffectForConditionalVisibility(
  sourceToken: Token,
  visionCapabilities: VisionCapabilities,
): Promise<Map<string, AtcvEffect>> {
  const mapToUpdate = new Map<string, AtcvEffect>();
  const setAeToRemove = new Set<string>();

  // Make sure to remove anything with value 0
  for (const senseData of await getAllDefaultSensesAndConditions(sourceToken)) {
    let effectNameToCheckOnActor = i18n(<string>senseData?.visionName);
    if (!effectNameToCheckOnActor.endsWith('(CV)')) {
      effectNameToCheckOnActor = effectNameToCheckOnActor + ' (CV)';
    }
    if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
      const activeEffectToRemove = <ActiveEffect>(
        await API.findEffectByNameOnToken(<string>sourceToken.id, effectNameToCheckOnActor)
      );
      const atcvEffectFlagData = <AtcvEffect>sourceToken.actor?.getFlag(CONSTANTS.MODULE_NAME, senseData.visionId);
      if (activeEffectToRemove && atcvEffectFlagData?.visionId) {
        const actve = atcvEffectFlagData?.visionLevelValue;
        if (actve === 0 || actve === null || actve === undefined || !actve) {
          // await API.removeEffectFromIdOnToken(<string>sourceToken.id, <string>activeEffectToRemove.id);
          setAeToRemove.add(<string>activeEffectToRemove.id);
          // 2022-05-28
          await repairAndUnSetFlag(sourceToken, atcvEffectFlagData.visionId);
        }
      }
    }
  }

  // const actor = <Actor>sourceToken.document.getActor();

  // MANAGE THE UPDATE OF EFFECT INSTEAD REMOVE AND ADD
  // REMOVE EVERY SENSES WITH THE SAME NAME

  // const keysSensesFirstTime: string[] = [];
  for (const [key, sense] of visionCapabilities.retrieveSenses()) {
    let effectNameToCheckOnActor = i18n(<string>sense.visionName);
    if (!effectNameToCheckOnActor.endsWith('(CV)')) {
      effectNameToCheckOnActor = effectNameToCheckOnActor + ' (CV)';
    }
    const activeEffectFounded = <ActiveEffect>(
      await API.findEffectByNameOnToken(<string>sourceToken.id, effectNameToCheckOnActor)
    );
    if (sense.visionLevelValue && sense.visionLevelValue != 0) {
      // TODO why this failed to return ???
      //if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
      if (activeEffectFounded) {
        // const actve = retrieveAtcvVisionLevelValueFromActiveEffect(
        //   sourceToken,
        //   activeEffectFounded.data?.changes || [],
        // );
        // if (sense.visionLevelValue != actve) {
        //@ts-ignore
        const data = <ActiveEffectData>(
          duplicateExtended(activeEffectFounded.data ? activeEffectFounded.data : activeEffectFounded)
        );
        let thereISADifference = false;
        for (const aee of data?.changes) {
          if (aee.key.startsWith('ATCV.')) {
            if (!aee.key.startsWith('ATCV.condition')) {
              if (String(aee.value) != String(sense.visionLevelValue)) {
                thereISADifference = true;
              }
              aee.value = String(sense.visionLevelValue);
            } else if (aee.key.startsWith('ATCV.conditionElevation')) {
              if (String(aee.value) != String(sense.visionElevation)) {
                thereISADifference = true;
              }
              aee.value = String(sense.visionElevation);
            } else if (aee.key.startsWith('ATCV.conditionDistance')) {
              if (String(aee.value) != String(sense.visionDistanceValue)) {
                thereISADifference = true;
              }
              aee.value = String(sense.visionDistanceValue);
            } else if (aee.key.startsWith('ATCV.conditionTargets')) {
              if (String(aee.value) != String(sense.visionTargets.join(','))) {
                thereISADifference = true;
              }
              aee.value = sense.visionTargets.join(',');
            } else if (aee.key.startsWith('ATCV.conditionSources')) {
              if (String(aee.value) != String(sense.visionSources.join(','))) {
                thereISADifference = true;
              }
              aee.value = sense.visionSources.join(',');
            } else if (aee.key.startsWith('ATCV.conditionTargetImage')) {
              if (String(aee.value) != String(sense.visionTargetImage)) {
                thereISADifference = true;
              }
              aee.value = sense.visionTargetImage;
            } else if (aee.key.startsWith('ATCV.conditionSourceImage')) {
              if (String(aee.value) != String(sense.visionSourceImage)) {
                thereISADifference = true;
              }
              aee.value = sense.visionSourceImage;
            } else if (aee.key.startsWith('ATCV.conditionType')) {
              if (String(aee.value) != String(sense.visionType)) {
                thereISADifference = true;
              }
              aee.value = sense.visionType;
            } else if (aee.key.startsWith('ATCV.conditionBlinded')) {
              if (String(aee.value) != String(sense.visionBlinded)) {
                thereISADifference = true;
              }
              aee.value = sense.visionBlinded;
            } else if (aee.key.startsWith('ATCV.conditionBlindedOverride')) {
              if (String(aee.value) != String(sense.visionBlindedOverride)) {
                thereISADifference = true;
              }
              aee.value = sense.visionBlindedOverride;
            }
          }
        }
        if (thereISADifference && data?.changes.length > 0) {
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
        // }
      } else {
        const atcvEffcet = await API.addOrUpdateEffectConditionalVisibilityOnToken(
          <string>sourceToken.id,
          sense,
          false,
        );
        if (atcvEffcet) {
          mapToUpdate.set(sense.visionId, atcvEffcet);
        }
      }
    } else {
      // TODO why this failed to return ???
      //if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
      if (activeEffectFounded) {
        // 2022-05-28
        // const actve = retrieveAtcvVisionLevelValueFromActiveEffect(
        //   sourceToken,
        //   activeEffectFounded.data?.changes || [],
        // );
        const actve = retrieveAtcvEffectFromActiveEffectSimple(
          sourceToken.document,
          activeEffectFounded.data?.changes || [],
        );
        if (actve) {
          if (sense.visionLevelValue != actve.visionLevelValue) {
            //await API.removeEffectFromIdOnToken(<string>sourceToken.id, <string>activeEffectFounded.id);
            setAeToRemove.add(<string>activeEffectFounded.id);
            // 2022-05-28
            await repairAndUnSetFlag(sourceToken, actve.visionId);
          }
        }
      }
    }
  }

  // MANAGE THE UPDATE OF EFFECT INSTEAD REMOVE AND ADD
  // REMOVE EVERY CONDITIONS WITH THE SAME NAME

  // const keysConditionsFirstTime: string[] = [];
  for (const [key, condition] of visionCapabilities.retrieveConditions()) {
    let effectNameToCheckOnActor = i18n(<string>condition.visionName);
    if (!effectNameToCheckOnActor.endsWith('(CV)')) {
      effectNameToCheckOnActor = effectNameToCheckOnActor + ' (CV)';
    }
    const activeEffectFounded = <ActiveEffect>(
      await API.findEffectByNameOnToken(<string>sourceToken.id, effectNameToCheckOnActor)
    );
    if (condition.visionLevelValue && condition.visionLevelValue != 0) {
      // TODO why this failed to return ???
      //if (await API.hasEffectAppliedOnToken(<string>sourceToken.id, effectNameToCheckOnActor, true)) {
      if (activeEffectFounded) {
        // const actve = retrieveAtcvVisionLevelValueFromActiveEffect(
        //   sourceToken,
        //   activeEffectFounded.data?.changes || [],
        // );
        // if (condition.visionLevelValue != actve) {
        //@ts-ignore
        const data = <ActiveEffectData>(
          duplicateExtended(activeEffectFounded.data ? activeEffectFounded.data : activeEffectFounded)
        );
        let thereISADifference = false;
        for (const aee of data?.changes) {
          if (aee.key.startsWith('ATCV.')) {
            if (!aee.key.startsWith('ATCV.condition')) {
              if (String(aee.value) != String(condition.visionLevelValue)) {
                thereISADifference = true;
              }
              aee.value = String(condition.visionLevelValue);
            } else if (aee.key.startsWith('ATCV.conditionElevation')) {
              if (String(aee.value) != String(condition.visionElevation)) {
                thereISADifference = true;
              }
              aee.value = String(condition.visionElevation);
            } else if (aee.key.startsWith('ATCV.conditionDistance')) {
              if (String(aee.value) != String(condition.visionDistanceValue)) {
                thereISADifference = true;
              }
              aee.value = String(condition.visionDistanceValue);
            } else if (aee.key.startsWith('ATCV.conditionTargets')) {
              if (String(aee.value) != String(condition.visionTargets.join(','))) {
                thereISADifference = true;
              }
              aee.value = condition.visionTargets.join(',');
            } else if (aee.key.startsWith('ATCV.conditionSources')) {
              if (String(aee.value) != String(condition.visionSources.join(','))) {
                thereISADifference = true;
              }
              aee.value = condition.visionSources.join(',');
            } else if (aee.key.startsWith('ATCV.conditionTargetImage')) {
              if (String(aee.value) != String(condition.visionTargetImage)) {
                thereISADifference = true;
              }
              aee.value = condition.visionTargetImage;
            } else if (aee.key.startsWith('ATCV.conditionSourceImage')) {
              if (String(aee.value) != String(condition.visionSourceImage)) {
                thereISADifference = true;
              }
              aee.value = condition.visionSourceImage;
            } else if (aee.key.startsWith('ATCV.conditionType')) {
              if (String(aee.value) != String(condition.visionType)) {
                thereISADifference = true;
              }
              aee.value = condition.visionType;
            } else if (aee.key.startsWith('ATCV.conditionBlinded')) {
              if (String(aee.value) != String(condition.visionBlinded)) {
                thereISADifference = true;
              }
              aee.value = condition.visionBlinded;
            } else if (aee.key.startsWith('ATCV.conditionBlindedOverride')) {
              if (String(aee.value) != String(condition.visionBlindedOverride)) {
                thereISADifference = true;
              }
              aee.value = condition.visionBlindedOverride;
            }
          }
        }
        if (thereISADifference && data?.changes.length > 0) {
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
        // }
      } else {
        const atcvEffcet = await API.addOrUpdateEffectConditionalVisibilityOnToken(
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
        // 2022-05-28
        // const actve = retrieveAtcvVisionLevelValueFromActiveEffect(
        //   sourceToken,
        //   activeEffectFounded.data?.changes || [],
        // );
        const actve = retrieveAtcvEffectFromActiveEffectSimple(
          sourceToken.document,
          activeEffectFounded.data?.changes || [],
        );
        if (actve) {
          if (condition.visionLevelValue != actve.visionLevelValue) {
            //await API.removeEffectFromIdOnToken(<string>sourceToken.id, <string>activeEffectFounded.id);
            setAeToRemove.add(<string>activeEffectFounded.id);
            // 2022-05-28
            await repairAndUnSetFlag(sourceToken, actve.visionId);
          }
        }
      }
    }
  }

  // FINALLY REMVE ALL THE ACTIVE EFFECT
  if (setAeToRemove.size > 0) {
    await API.removeEffectFromIdOnTokenMultiple(<string>sourceToken.id, Array.from(setAeToRemove));
  }

  return mapToUpdate;
}

export function getSensesFromTokenFast(
  tokenDocument: TokenDocument,
  filterValueNoZero = false,
  filterIsDisabled = false,
): AtcvEffect[] {
  return _getCVFromTokenFast(tokenDocument, filterValueNoZero, filterIsDisabled, true);
}

export function getConditionsFromTokenFast(
  tokenDocument: TokenDocument,
  filterValueNoZero = false,
  filterIsDisabled = false,
): AtcvEffect[] {
  return _getCVFromTokenFast(tokenDocument, filterValueNoZero, filterIsDisabled, false);
}

export function _getCVFromTokenFast(
  tokenDocument: TokenDocument,
  filterValueNoZero = false,
  filterIsDisabled = false,
  isSense = true,
): AtcvEffect[] {
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
        senseData.conditionType = isSense ? 'sense' : 'condition';
        const atcvEffect = AtcvEffect.fromSenseData(senseData, 0);
        if (filterValueNoZero && atcvEffect.visionLevelValue == 0) {
          continue;
        }
        if (filterIsDisabled && atcvEffect.visionIsDisabled) {
          continue;
        }
        if (isSense && atcvEffect.visionType === 'sense') {
          statusEffects.push(atcvEffect);
        } else if (!isSense && atcvEffect.visionType === 'condition') {
          statusEffects.push(atcvEffect);
        }
      }
    }
    // if (isSense) {
    //   return statusEffects.filter((a) => a.visionType === 'sense') ?? [];
    // } else {
    //   return statusEffects.filter((a) => a.visionType === 'condition') ?? [];
    // }
    return statusEffects;
  }

  // A token is present
  const actor = <Actor>tokenDocument?.actor; // <Actor>token.document?.getActor() ||
  if (!actor) {
    info(`No actor found for token '${tokenDocument.name}'`);
    return [];
  }
  const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>actor?.data.effects;
  //const totalEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>actor?.data.effects.contents.filter(i => !i.data.disabled);
  const atcvEffects = actorEffects.filter((entity) => {
    return (
      !!entity.data.changes.find((effect) => effect.key.includes('ATCV')) && filterIsDisabled && !entity.data.disabled
    );
  });

  if (atcvEffects != null && atcvEffects != undefined) {
    for (const effectEntity of atcvEffects) {
      const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
      if (!effectNameToSet) {
        continue;
      }
      const atcvEffectTmp = retrieveAtcvEffectFromActiveEffect(
        tokenDocument,
        effectEntity.data.changes,
        effectNameToSet,
        <string>effectEntity.data.icon,
        undefined,
        effectEntity.data.disabled,
      );

      if (!atcvEffectTmp) {
        continue;
      }
      if (!atcvEffectTmp.visionId) {
        continue;
      }
      if (filterValueNoZero && atcvEffectTmp.visionLevelValue == 0) {
        continue;
      }
      if (filterIsDisabled && atcvEffectTmp.visionIsDisabled) {
        continue;
      }
      const alreadyPresent = statusEffects.find((e) => {
        return isStringEquals(e.visionId, atcvEffectTmp.visionId);
      });
      if (!alreadyPresent) {
        if (isSense && atcvEffectTmp.visionType === 'sense') {
          statusEffects.push(atcvEffectTmp);
        } else if (!isSense && atcvEffectTmp.visionType === 'condition') {
          statusEffects.push(atcvEffectTmp);
        }
      }
    }
    return statusEffects;
  } else {
    const atcvEffectsObject = getProperty(<Actor>tokenDocument?.actor, `data.flags.${CONSTANTS.MODULE_NAME}`);
    for (const key in atcvEffectsObject) {
      const senseOrConditionIdKey = key;
      if (
        senseOrConditionIdKey == ConditionalVisibilityFlags.FORCE_VISIBLE
      ) {
        continue;
      }
      const senseValue = <AtcvEffect>atcvEffectsObject[key];

      if (!senseValue.visionId) {
        continue;
      }
      if (filterValueNoZero && senseValue.visionLevelValue == 0) {
        continue;
      }
      if (filterIsDisabled && senseValue.visionIsDisabled) {
        continue;
      }

      const alreadyPresent = statusEffects.find((e) => {
        return isStringEquals(e.visionId, senseValue.visionId);
      });
      if (!alreadyPresent) {
        if (isSense && senseValue.visionType === 'sense') {
          statusEffects.push(senseValue);
        } else if (!isSense && senseValue.visionType === 'condition') {
          statusEffects.push(senseValue);
        }
      }
    }
    if (isSense) {
      return statusEffects.filter((a) => a.visionType === 'sense') ?? [];
    } else {
      return statusEffects.filter((a) => a.visionType === 'condition') ?? [];
    }
  }
}

// export function getConditionsFromTokenFast(
//   tokenDocument: TokenDocument,
//   filterValueNoZero = false,
//   filterIsDisabled = false,
// ): AtcvEffect[] {
//   // 2022-05-27
//   /*
//   const atcvEffects =
//     <AtcvEffect[]>tokenDocument.actor?.getFlag(CONSTANTS.MODULE_NAME, ConditionalVisibilityFlags.DATA_CONDITIONS) ?? [];
//   if (atcvEffects.filter((a) => !a.visionId).length > 0) {
//     return getConditionsFromToken(tokenDocument);
//   }
//   */
//   const atcvEffects = getConditionsFromToken(tokenDocument);
//   if (atcvEffects.length > 0) {
//     return atcvEffects;
//   } else {
//     const atcvEffectsObject = getProperty(<Actor>tokenDocument?.actor, `data.flags.${CONSTANTS.MODULE_NAME}`);
//     for (const key in atcvEffectsObject) {
//       const conditionIdKey = key;
//       if (
//         conditionIdKey == ConditionalVisibilityFlags.FORCE_VISIBLE
//       ) {
//         continue;
//       }
//       const conditionValue = <AtcvEffect>atcvEffectsObject[key];
//       if (filterValueNoZero && conditionValue.visionLevelValue == 0) {
//         continue;
//       }
//       if (filterIsDisabled && conditionValue.visionIsDisabled) {
//         continue;
//       }
//       atcvEffects.push(conditionValue);
//     }
//     const conditions = atcvEffects.filter((a) => a.visionType === 'condition') ?? [];
//     // 2022-05.27
//     //tokenDocument.actor?.setFlag(CONSTANTS.MODULE_NAME, ConditionalVisibilityFlags.DATA_CONDITIONS, conditions);
//     return conditions;
//   }
// }

export function getSensesFromToken(
  tokenDocument: TokenDocument | null,
  filterValueNoZero = false,
  filterIsDisabled = false,
): AtcvEffect[] {
  return _getCVFromToken(tokenDocument, true, filterValueNoZero, filterIsDisabled);
}

export function getConditionsFromToken(
  tokenDocument: TokenDocument | null,
  filterValueNoZero = false,
  filterIsDisabled = false,
): AtcvEffect[] {
  return _getCVFromToken(tokenDocument, false, filterValueNoZero, filterIsDisabled);
}

function _getCVFromToken(
  tokenDocument: TokenDocument | null,
  isSense: boolean,
  filterValueNoZero = false,
  filterIsDisabled = false,
): AtcvEffect[] {
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
        senseData.conditionType = isSense ? 'sense' : 'condition';
        const atcvEffect = AtcvEffect.fromSenseData(senseData, 0);
        if (filterValueNoZero && atcvEffect.visionLevelValue == 0) {
          continue;
        }
        if (filterIsDisabled && atcvEffect.visionIsDisabled) {
          continue;
        }
        statusEffects.push(atcvEffect);
      }
    }
    return statusEffects;
    // if (filterValueNoZero) {
    //   return statusEffects.filter((a) => a.visionLevelValue != 0);
    // } else {
    //   return statusEffects;
    // }
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
      tokenDocument,
      effectEntity.data.changes,
      effectNameToSet,
      <string>effectEntity.data.icon,
      undefined,
      effectEntity.data.disabled,
    );

    if (!atcvEffectTmp) {
      continue;
    }
    if (!atcvEffectTmp.visionId) {
      continue;
    }

    if (filterValueNoZero && atcvEffectTmp.visionLevelValue == 0) {
      continue;
    }
    if (filterIsDisabled && atcvEffectTmp.visionIsDisabled) {
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
      if (filterValueNoZero && atcvEffectTmp.visionLevelValue == 0) {
        continue;
      }
      if (filterIsDisabled && atcvEffectTmp.visionIsDisabled) {
        continue;
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
      senseData.conditionType = isSense ? 'sense' : 'condition';
      const atcvEffect = AtcvEffect.fromSenseData(senseData, 0);
      if (filterValueNoZero && atcvEffect.visionLevelValue == 0) {
        continue;
      }
      if (filterIsDisabled && atcvEffect.visionIsDisabled) {
        continue;
      }
      statusEffectsFinal.push(atcvEffect);
    } else {
      const atcvEffect = AtcvEffect.mergeWithSensedataDefault(alreadyPresent);
      if (filterValueNoZero && atcvEffect.visionLevelValue == 0) {
        continue;
      }
      if (filterIsDisabled && atcvEffect.visionIsDisabled) {
        continue;
      }
      statusEffectsFinal.push(atcvEffect);
    }
  }
  return statusEffectsFinal;
  // if (filterValueNoZero) {
  //   return statusEffectsFinal.filter((a) => a.visionLevelValue != 0);
  // } else {
  //   return statusEffectsFinal;
  // }
}

export function retrieveEffectChangeDataFromSenseData(
  senseData: SenseData,
  visionLevelValue: number,
  isDisabled: boolean,
): EffectChangeData[] {
  const atcvEffect = AtcvEffect.fromSenseData(senseData, visionLevelValue, isDisabled);
  const effect = AtcvEffect.toEffectFromAtcvEffect(atcvEffect);
  const effectChanges: EffectChangeData[] = EffectSupport._handleIntegrations(effect) || [];
  return effectChanges;
}

export function retrieveEffectChangeDataFromAtcvEffect(atcvEffect: AtcvEffect): EffectChangeData[] {
  const effect = AtcvEffect.toEffectFromAtcvEffect(atcvEffect);
  const effectChanges: EffectChangeData[] = EffectSupport._handleIntegrations(effect) || [];
  return effectChanges;
}

export function retrieveEffectChangeDataFromEffect(effect: Effect): EffectChangeData[] {
  const effectChanges: EffectChangeData[] = EffectSupport._handleIntegrations(effect) || [];
  return effectChanges;
}

export function retrieveAtcvEffectFromActiveEffectSimple(
  tokenDocument: TokenDocument,
  effectChanges: EffectChangeData[],
): AtcvEffect | null {
  const effectName = '';
  const atcvValueChange = <EffectChangeData>effectChanges.find((aee) => {
    if (aee.key.startsWith('ATCV.') && aee.key === 'ATCV.conditionType' && aee.value) {
      return aee;
    }
  });
  if (!atcvValueChange) {
    warn(`Can't find a AtcvEffec for [${effectChanges}]`);
    return null;
  }
  const isSense = atcvValueChange.value === 'sense' ? true : false;
  const isDisabled = false;
  const effectIcon = '';
  return retrieveAtcvEffectFromActiveEffect(tokenDocument, effectChanges, effectName, effectIcon, isSense, isDisabled);
}

export function retrieveAtcvEffectFromActiveEffect(
  tokenDocument: TokenDocument,
  effectChanges: EffectChangeData[],
  effectName: string,
  effectIcon: string,
  isSense: boolean | undefined = undefined,
  isDisabled: boolean,
): AtcvEffect | null {
  const atcvEffect: AtcvEffect = <any>{};

  if (!atcvEffect.visionName) {
    atcvEffect.visionName = effectName;
  }

  if (!atcvEffect.visionIcon) {
    atcvEffect.visionIcon = effectIcon;
  }

  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  for (const change of effectEntityChanges) {
    if (change.key.startsWith('ATCV.') && !change.key.startsWith('ATCV.condition') && change.value) {
      if (atcvEffect.visionId === null || atcvEffect.visionId === undefined) {
        atcvEffect.visionId = change.key.slice(5);
        let myvalue = 0;
        if (!change.value) {
          // Ignore ???
          if (change.value === '0') {
            myvalue = 0;
          } else {
            myvalue = 1;
          }
        } else {
          if (change.value && String(change.value).includes('data.')) {
            //myvalue =  Number(getProperty(<ActorData>tokenDocument?.actor?.data,String(change.value)));
            // Retrieve the formula.
            const formula = change.value.replace(/data\./g, '@');
            // Replace shorthand.
            // formula = formula
            //   .replace(/@abil\./g, '@abilities.')
            //   .replace(/@attr\./g, '@attributes.');
            // Roll the dice!
            // Build the roll.
            const data = tokenDocument.actor ? tokenDocument.actor.getRollData() : {};
            const roll = new Roll(formula, data);
            // Roll the dice.
            let myresult = 0;
            //roll.roll();
            try {
              // TODO Roll#evaluate is becoming asynchronous. In the short term you may pass async=true or async=false 
              // to evaluation options to nominate your preferred behavior.
              roll.evaluate();
              myresult = roll.total ? <number>roll.total : parseInt(roll.result);
            } catch (e) {
              myresult = parseInt(eval(roll.result));
            }
            //myvalue = roll.total || 0;
            if (!is_real_number(myresult)) {
              warn(`The formula '${formula}' doesn't return a number we set the default 1`, true);
              myvalue = 1;
            } else {
              myvalue = myresult;
            }
          } else {
            myvalue = Number(change.value);
          }
          if (!is_real_number(myvalue)) {
            myvalue = 1;
          }
        }
        atcvEffect.visionLevelValue = myvalue;
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionElevation') && change.value) {
      if (atcvEffect.visionElevation === null || atcvEffect.visionElevation === undefined) {
        atcvEffect.visionElevation = change.value === 'true' ? true : false;
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

        for (const t of providedTags) {
          if (!(typeof t === 'string' || t instanceof RegExp)) {
            error(`'ATCV.conditionTargets' in array must be of type string or regexp`);
          }
        }
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

        for (const t of providedTags) {
          if (!(typeof t === 'string' || t instanceof RegExp)) {
            error(`'ATCV.conditionSources' in array must be of type string or regexp`);
          }
        }
        atcvEffect.visionSources = providedTags.map((t) => (t instanceof RegExp ? t : t.trim()));
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionTargetImage') && change.value) {
      if (atcvEffect.visionTargetImage === null || atcvEffect.visionTargetImage === undefined) {
        atcvEffect.visionTargetImage = String(change.value);
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionSourceImage') && change.value) {
      if (atcvEffect.visionSourceImage === null || atcvEffect.visionSourceImage === undefined) {
        atcvEffect.visionSourceImage = String(change.value);
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionType') && change.value) {
      if (atcvEffect.visionType === null || atcvEffect.visionType === undefined) {
        atcvEffect.visionType = String(change.value);
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionBlinded') && change.value) {
      if (atcvEffect.visionBlinded === null || atcvEffect.visionBlinded === undefined) {
        atcvEffect.visionBlinded = change.value === 'true' ? true : false;
      }
    } else if (isStringEquals(change.key, 'ATCV.conditionBlindedOverride') && change.value) {
      if (atcvEffect.visionBlindedOverride === null || atcvEffect.visionBlindedOverride === undefined) {
        atcvEffect.visionBlindedOverride = change.value === 'true' ? true : false;
      }
    }
  }

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

  atcvEffect.visionIsDisabled = String(isDisabled) === 'true' ? true : false;

  const atcvEffect2 = AtcvEffect.mergeWithSensedataDefault(atcvEffect);
  if (!atcvEffect2.visionName.endsWith('(CV)')) {
    atcvEffect2.visionName = atcvEffect2.visionName + ' (CV)';
  }
  return atcvEffect2;
}

/**
 * @deprecated to remove in some way
 * @param effectChanges
 * @returns
 */
export function retrieveAtcvVisionLevelValueFromActiveEffect(token: Token, effectChanges: EffectChangeData[]): string {
  let atcvValue = '0';
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  const atcvEffectChangeData = <EffectChangeData>effectEntityChanges.find((aee) => {
    if (aee.key.startsWith('ATCV.') && !aee.key.startsWith('ATCV.condition') && aee.value) {
      return aee;
    }
  });
  if (!atcvEffectChangeData) {
    // Ignore ???
    if (atcvEffectChangeData === '0') {
      return '0';
    } else {
      return '1';
    }
  }
  if (atcvEffectChangeData && String(atcvEffectChangeData.value).startsWith('data.')) {
    atcvValue = String(getProperty(<ActorData>token.document?.actor?.data, String(atcvEffectChangeData.value)));
  } else {
    atcvValue = String(atcvEffectChangeData.value);
  }
  if (!is_real_number(parseInt(atcvValue))) {
    return '1';
  }
  return atcvValue;
}

export function retrieveAtcvVisionLevelKeyFromChanges(effectChanges: EffectChangeData[]): string {
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  const atcvValueChange = <EffectChangeData>effectEntityChanges.find((aee) => {
    if (aee.key.startsWith('ATCV.') && !aee.key.startsWith('ATCV.condition') && aee.value) {
      return aee;
    }
  });
  if (!atcvValueChange) {
    return '';
  }
  const atcvKey = atcvValueChange.key;
  const key = atcvKey.replace('ATCV.', '');
  if (!key) {
    return '';
  }
  return key;
}

export async function toggleStealth(event, app) {
  const atcvEffectFlagData = <AtcvEffect>(
    app.object.actor.getFlag(CONSTANTS.MODULE_NAME, AtcvEffectConditionFlags.HIDDEN)
  );
  let stealthedWithHiddenCondition = atcvEffectFlagData?.visionLevelValue ?? 0;
  let stealthedPassive = 0;
  if (
    stealthedWithHiddenCondition == 0 &&
    getProperty(app.object.document.actor, `data.${API.STEALTH_PASSIVE_SKILL}`)
  ) {
    stealthedWithHiddenCondition =
      <number>getProperty(app.object.document.actor, `data.${API.STEALTH_PASSIVE_SKILL}`) || 0;
    stealthedPassive = getProperty(app.object.document.actor, `data.${API.STEALTH_PASSIVE_SKILL}`) || 0;
  }

  // TODO TO CHECK IF I CAN ADD MY CUSTOMIZED ONES WITHOUT THE NEED OF REGISTERED
  //const sensesOrderByName = <SenseData[]>API.SENSES; //.sort((a, b) => a.name.localeCompare(b.name));
  //const conditionsOrderByName = <SenseData[]>API.CONDITIONS; //.sort((a, b) => a.name.localeCompare(b.name));
  const sensesOrderByName = getSensesFromToken(app.object).sort((a, b) => a.visionName.localeCompare(b.visionName));
  const conditionsOrderByName = getConditionsFromToken(app.object).sort((a, b) =>
    a.visionName.localeCompare(b.visionName),
  );
  for (const [i, item] of sensesOrderByName.entries()) {
    if (item.visionId === AtcvEffectSenseFlags.NONE) {
      sensesOrderByName.splice(i, 1);
      sensesOrderByName.unshift(item);
    }
  }
  for (const [i, item] of conditionsOrderByName.entries()) {
    if (item.visionId === AtcvEffectConditionFlags.NONE) {
      conditionsOrderByName.splice(i, 1);
      conditionsOrderByName.unshift(item);
    }
    // Remove stealthed
    if (item.visionId === AtcvEffectConditionFlags.STEALTHED) {
      conditionsOrderByName.splice(i, 1);
    }
  }

  const stealthedActive = await API.rollStealth(app.object);
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
          if (!is_real_number(valStealthRoll)) {
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
          /*
          let selectedTokens = <Token[]>[];
          if (app.object) {
            selectedTokens = [app.object];
          }
          if (!selectedTokens || selectedTokens.length == 0) {
            selectedTokens = [<Token[]>canvas.tokens?.controlled][0];
          }
          */
          const selectedTokens = <Token[]>canvas.tokens?.controlled;
          for (const selectedToken of selectedTokens) {
            const setAeToRemove = new Set<string>();
            const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>selectedToken.actor?.data.effects;
            if (
              senseId != AtcvEffectSenseFlags.NONE
              // 2022-05-30
              //senseId != AtcvEffectSenseFlags.NORMAL
            ) {
              // const effect = <Effect>await ConditionalVisibilityEffectDefinitions.effect(senseId);
              const effect = <Effect>await retrieveAndMergeEffect(senseId, '', 0, 0);
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
                  const atcvEffectFlagData = AtcvEffect.fromEffect(app.object.document, effect);
                  if (atcvEffectFlagData) {
                    atcvEffectFlagData.visionLevelValue = valStealthRoll;
                    await repairAndSetFlag(selectedToken, senseId, atcvEffectFlagData);
                  }
                }
              } else {
                warn(`Can't find effect definition for '${senseId}', maybe you forgot to registered that ?`, true);
              }
            }
            if (conditionId != AtcvEffectConditionFlags.NONE) {
              // const effect = <Effect>await ConditionalVisibilityEffectDefinitions.effect(conditionId);
              const effect = <Effect>await retrieveAndMergeEffect(conditionId, '', 0, 0);
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
                  const atcvEffectFlagData = AtcvEffect.fromEffect(app.object.document, effect);
                  if (atcvEffectFlagData) {
                    atcvEffectFlagData.visionLevelValue = valStealthRoll;
                    await repairAndSetFlag(selectedToken, conditionId, atcvEffectFlagData);
                  }
                }
              } else {
                warn(`Can't find effect definition for '${conditionId}', maybe you forgot to registered that ?`, true);
              }
            }
            // FINALLY REMVE ALL THE ACTIVE EFFECT
            if (setAeToRemove.size > 0) {
              await API.removeEffectFromIdOnTokenMultiple(<string>selectedToken.id, Array.from(setAeToRemove));
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

export function getDistanceSightFromToken(token: Token): number {
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
  return sightDistance;
}

function getPerfectVisionVisionRange(token: Token): number {
  let sightLimit = parseFloat(<string>token.document.getFlag('perfect-vision', 'sightLimit'));

  if (!is_real_number(sightLimit)) {
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
  if (game.modules.get('levels')?.active) {
    return token.losHeight;
    /*
    let losDiff;
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
    */
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
    return true;
  }
}

// ========================================================================================

export async function repairAndSetFlag(token: Token, key: string, value: AtcvEffect) {
  const isPlayerOwned = <boolean>token.document.isOwner;
  if (!game.user?.isGM && !isPlayerOwned) {
    return;
  }
  if (token.actor) {
    let effectNameToCheckOnActor = i18n(<string>value.visionName);
    if (!effectNameToCheckOnActor.endsWith('(CV)')) {
      effectNameToCheckOnActor = effectNameToCheckOnActor + ' (CV)';
    }
    const activeEffectFounded = <ActiveEffect>(
      await API.findEffectByNameOnToken(<string>token.id, effectNameToCheckOnActor)
    );
    let thereISADifference = false;
    if (activeEffectFounded) {
      //@ts-ignore
      const data = <ActiveEffectData>(
        duplicateExtended(activeEffectFounded.data ? activeEffectFounded.data : activeEffectFounded)
      );
      for (const aee of data?.changes) {
        if (aee.key.startsWith('ATCV.')) {
          let updateKey = '';
          if (!aee.key.startsWith('ATCV.condition')) {
            updateKey = aee.key.slice(5);
            if (String(aee.value) != String(value?.visionLevelValue)) {
              thereISADifference = true;
            }
          } else if (aee.key.startsWith('ATCV.conditionElevation')) {
            if (String(aee.value) != String(value?.visionElevation)) {
              thereISADifference = true;
            }
          } else if (aee.key.startsWith('ATCV.conditionDistance')) {
            if (String(aee.value) != String(value?.visionDistanceValue)) {
              thereISADifference = true;
            }
          } else if (aee.key.startsWith('ATCV.conditionTargets')) {
            if (String(aee.value) != String(value?.visionTargets)) {
              thereISADifference = true;
            }
          } else if (aee.key.startsWith('ATCV.conditionSources')) {
            if (String(aee.value) != String(value?.visionSources)) {
              thereISADifference = true;
            }
          } else if (aee.key.startsWith('ATCV.conditionTargetImage')) {
            if (String(aee.value) != String(value?.visionTargetImage)) {
              thereISADifference = true;
            }
          } else if (aee.key.startsWith('ATCV.conditionSourceImage')) {
            if (String(aee.value) != String(value?.visionSourceImage)) {
              thereISADifference = true;
            }
          } else if (aee.key.startsWith('ATCV.conditionType')) {
            if (String(aee.value) != String(value?.visionType)) {
              thereISADifference = true;
            }
          } else if (aee.key.startsWith('ATCV.conditionBlinded')) {
            if (String(aee.value) != String(value?.visionBlinded)) {
              thereISADifference = true;
            }
          } else if (aee.key.startsWith('ATCV.conditionBlindedOverride')) {
            if (String(aee.value) != String(value?.visionBlindedOverride)) {
              thereISADifference = true;
            }
          }
          if (updateKey === value.visionId) {
            break;
          } else {
            thereISADifference = false;
          }
        }
      }
      if (!thereISADifference) {
        const currentAtcvEffectFlagData = <AtcvEffect>token?.actor?.getFlag(CONSTANTS.MODULE_NAME, key);
        if (currentAtcvEffectFlagData) {
          if (value.visionLevelValue != currentAtcvEffectFlagData.visionLevelValue) {
            thereISADifference = true;
          } else if (value.visionElevation != currentAtcvEffectFlagData.visionElevation) {
            thereISADifference = true;
          } else if (value.visionDistanceValue != currentAtcvEffectFlagData.visionDistanceValue) {
            thereISADifference = true;
          } else if (value.visionTargets != currentAtcvEffectFlagData.visionTargets) {
            thereISADifference = true;
          } else if (value.visionSources != currentAtcvEffectFlagData.visionSources) {
            thereISADifference = true;
          } else if (value.visionTargetImage != currentAtcvEffectFlagData.visionTargetImage) {
            thereISADifference = true;
          } else if (value.visionSourceImage != currentAtcvEffectFlagData.visionSourceImage) {
            thereISADifference = true;
          } else if (value.visionType != currentAtcvEffectFlagData.visionType) {
            thereISADifference = true;
          } else if (value.visionBlinded != currentAtcvEffectFlagData.visionBlinded) {
            thereISADifference = true;
          } else if (value.visionBlindedOverride != currentAtcvEffectFlagData.visionBlindedOverride) {
            thereISADifference = true;
          }
        } else {
          thereISADifference = true;
        }
      }
    } else {
      thereISADifference = true;
    }

    // TODO START TO REMOVE THIS IS FOR A RETROCOMPATIBILITY ISSUE
    if (token.document.getFlag(CONSTANTS.MODULE_NAME, key)) {
      await token.document.unsetFlag(CONSTANTS.MODULE_NAME, key);
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionElevation')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionElevation');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionDistance')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionDistance');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionTargets')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionTargets');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionSources')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionSources');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionTargetImage')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionTargetImage');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionSourceImage')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionSourceImage');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionType')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionType');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionBlinded')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionBlinded');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionBlindedOverride')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionBlindedOverride');
    }

    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'datasenses')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'datasenses');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'dataconditions')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'dataconditions');
    }
    // TODO END TO REMOVE THIS IS FOR A RETROCOMPATIBILITY ISSUE
    if (thereISADifference) {
      await token.actor?.setFlag(CONSTANTS.MODULE_NAME, key, value);
      if (game.settings.get(CONSTANTS.MODULE_NAME, 'enableRefreshSightCVHandler')) {
        canvas.perception.schedule({
          lighting: { refresh: true },
          sight: { refresh: true },
        });
      }
    }
  }
}

export async function repairAndUnSetFlag(token: Token, key: string) {
  const isPlayerOwned = <boolean>token.document.isOwner;
  if (!game.user?.isGM && !isPlayerOwned) {
    return;
  }
  if (token.actor) {
    // TODO START TO REMOVE
    if (token.document.getFlag(CONSTANTS.MODULE_NAME, key)) {
      await token.document.unsetFlag(CONSTANTS.MODULE_NAME, key);
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionElevation')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionElevation');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionDistance')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionDistance');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionTargets')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionTargets');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionSources')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionSources');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionTargetImage')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionTargetImage');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionSourceImage')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionSourceImage');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionType')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionType');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionBlinded')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionBlinded');
    }
    if (token.actor.getFlag(CONSTANTS.MODULE_NAME, 'conditionBlindedOverride')) {
      await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, 'conditionBlindedOverride');
    }
    // TODO END TO REMOVE

    await token.actor?.unsetFlag(CONSTANTS.MODULE_NAME, key);
    if (game.settings.get(CONSTANTS.MODULE_NAME, 'enableRefreshSightCVHandler')) {
      canvas.perception.schedule({
        lighting: { refresh: true },
        sight: { refresh: true },
      });
    }
  }
}

/**
 * Checker version 2
 * @href https://javascript.plainenglish.io/which-type-of-loop-is-fastest-in-javascript-ec834a0f21b9
 */
export function shouldIncludeVisionV2(sourceToken: Token, targetToken: Token): CVResultData {
  if (!sourceToken || !targetToken) {
    // return true;
    return {
      sourceTokenId: sourceToken.id,
      targetTokenId: targetToken.id,
      sourceVisionsLevels: [],
      targetVisionsLevels: [],
      canSee: true
    };
  }
  // wtf?? of course i can see myself
  if (sourceToken.id === targetToken.id) {
    // return true;
    return {
      sourceTokenId: sourceToken.id,
      targetTokenId: targetToken.id,
      sourceVisionsLevels: [],
      targetVisionsLevels: [],
      canSee: true
    };
  }
  // 1) Check if target token is hidden with standard hud feature of foundry and only GM can see
  if (targetToken.data.hidden) {
    // return game.user?.isGM ? true : false;
    return {
      sourceTokenId: sourceToken.id,
      targetTokenId: targetToken.id,
      sourceVisionsLevels: [],
      targetVisionsLevels: [],
      canSee: game.user?.isGM ? true : false
    };
  }
  // 1.1) Check if target token is with the 'Force Visible' flag for Midi Qol integration
  // if (targetToken.actor.getFlag(CONSTANTS.MODULE_NAME, ConditionalVisibilityFlags.FORCE_VISIBLE)) {
  if (targetToken.actor?.getFlag(CONSTANTS.MODULE_NAME, ConditionalVisibilityFlags.FORCE_VISIBLE)) {
    debug(`(1.1) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
    // return true;
    return {
      sourceTokenId: sourceToken.id,
      targetTokenId: targetToken.id,
      sourceVisionsLevels: [],
      targetVisionsLevels: [],
      canSee: true
    };
  }

  // ===============================================
  // 0 - Checkout the ownership of the target and the disposition of the target
  // friendly, neutral, hostile
  // =================================================

  // 2) Check if the target is owned from the player if true you can see the token.
  //const isPlayerOwned = <boolean>targetToken.actor?.hasPlayerOwner;
  const isPlayerOwned = <boolean>targetToken.isOwner;
  if (!game.user?.isGM && (isPlayerOwned || targetToken.owner)) {
    debug(`(2) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
    // return true;
    return {
      sourceTokenId: sourceToken.id,
      targetTokenId: targetToken.id,
      sourceVisionsLevels: [],
      targetVisionsLevels: [],
      canSee: true
    };
  }

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
    debug(`(3.2) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
    // return true;
    return {
      sourceTokenId: sourceToken.id,
      targetTokenId: targetToken.id,
      sourceVisionsLevels: [],
      targetVisionsLevels: [],
      canSee: true
    };
  }

  if (game.settings.get(CONSTANTS.MODULE_NAME, 'disableForNonHostileNpc')) {
    // 3.3 Check if the source is a hostile token
    if (
      targetActorDisposition != CONST.TOKEN_DISPOSITIONS.HOSTILE &&
      sourceActorDisposition != CONST.TOKEN_DISPOSITIONS.HOSTILE
    ) {
      debug(`(3.3) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
      // return true;
      return {
        sourceTokenId: sourceToken.id,
        targetTokenId: targetToken.id,
        sourceVisionsLevels: [],
        targetVisionsLevels: [],
        canSee: true
      };
    }
  }

  // ========================================
  // 1 - Preparation of the active effect
  // =========================================

  let sourceVisionLevels: AtcvEffect[] = getSensesFromTokenFast(sourceToken.document, true, true) ?? [];
  const targetVisionLevels: AtcvEffect[] = getConditionsFromTokenFast(targetToken.document, true, true) ?? [];

  debug(`(3.6) '${sourceToken.data.name}' with sourceVisionLevels = ` + JSON.stringify(sourceVisionLevels, null, 4));
  debug(`(3.7) '${targetToken.data.name}' with targetVisionLevels = ` + JSON.stringify(targetVisionLevels, null, 4));

  const stealthedPassiveValue =
    getProperty(<Actor>targetToken?.document?.actor, `data.${API.STEALTH_PASSIVE_SKILL}`) || 0;
  // 10 + Wisdom Score Modifier + Proficiency Bonus
  //@ts-ignore
  const perceptionPassiveValue =
    getProperty(<Actor>sourceToken?.document?.actor, `data.${API.PERCEPTION_PASSIVE_SKILL}`) || 0;

  const isStealthPassive =
    targetToken.actor?.getFlag(CONSTANTS.MODULE_NAME, ConditionalVisibilityFlags.USE_STEALTH_PASSIVE) != null &&
    targetToken.actor?.getFlag(CONSTANTS.MODULE_NAME, ConditionalVisibilityFlags.USE_STEALTH_PASSIVE) != undefined
      ? targetToken.actor?.getFlag(CONSTANTS.MODULE_NAME, ConditionalVisibilityFlags.USE_STEALTH_PASSIVE)
      : false;

  // 4) If the flag 'USe Stealth Passive' on the token is enabled, check by default if
  // _Perception Passive of the system_ is `>` of the _Stealth Passive of the System_,
  // but only IF NO ACTIVE EFFECT CONDITION ARE PRESENT ON THE TARGET
  if (targetVisionLevels.length == 0) {
    if (isStealthPassive) {
      if (perceptionPassiveValue >= stealthedPassiveValue) {
        debug(`(4.1) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
        // return true;
        return {
          sourceTokenId: sourceToken.id,
          targetTokenId: targetToken.id,
          sourceVisionsLevels: sourceVisionLevels,
          targetVisionsLevels: targetVisionLevels,
          canSee: true
        };
      } else {
        debug(`(4.2) Is false, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
        // return false;
        return {
          sourceTokenId: sourceToken.id,
          targetTokenId: targetToken.id,
          sourceVisionsLevels: sourceVisionLevels,
          targetVisionsLevels: targetVisionLevels,
          canSee: false
        };
      }
    } else {
      debug(`(4.3) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
      // return true;
      return {
        sourceTokenId: sourceToken.id,
        targetTokenId: targetToken.id,
        sourceVisionsLevels: sourceVisionLevels,
        targetVisionsLevels: targetVisionLevels,
        canSee: true
      };
    }
  }

  if (targetVisionLevels.length == 1) {
    // 2022-05-30
    //if (targetVisionLevels[0]?.visionId == AtcvEffectConditionFlags.HIDDEN) {
    if (API.SKILLS_CONDITION.includes(<string>targetVisionLevels[0]?.visionId)) {
      if (perceptionPassiveValue >= (<number>targetVisionLevels[0]?.visionLevelValue ?? 0)) {
        debug(`(8) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
        // return true;
        return {
          sourceTokenId: sourceToken.id,
          targetTokenId: targetToken.id,
          sourceVisionsLevels: sourceVisionLevels,
          targetVisionsLevels: targetVisionLevels,
          canSee: true
        };
      }
    }
  }

  // 5) Check if the source token has at least a active effect marked with key `ATCV.<sense or condition id>`
  if (sourceVisionLevels.length === 0) {
    // 5.1) If at least a condition is present on target it should be false else with no 'sense' on source e no ' condition' on target is true
    if (targetVisionLevels.length === 0) {
      debug(`(5.1) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
      // return true;
      return {
        sourceTokenId: sourceToken.id,
        targetTokenId: targetToken.id,
        sourceVisionsLevels: sourceVisionLevels,
        targetVisionsLevels: targetVisionLevels,
        canSee: true
      };
    }
  }

  // 6) Check if the source token has the active effect `blinded` active, if is true, you cannot see anything and return false.
  // for (const sourceStatusEffect of sourceVisionLevels) {
  let someoneIsBlinded = 0;
  for (let i = 0; i < sourceVisionLevels.length; i++) {
    if (
      //sourceVisionLevels[i]?.visionId === AtcvEffectSenseFlags.BLINDED &&
      sourceVisionLevels[i]?.visionBlinded &&
      sourceVisionLevels[i]?.visionLevelValue != 0
    ) {
      if (<number>sourceVisionLevels[i]?.visionLevelValue > someoneIsBlinded) {
        someoneIsBlinded = <number>sourceVisionLevels[i]?.visionLevelValue;
      }
    }
  }

  if (someoneIsBlinded > 0) {
    // 6.1) Check for blinded override effect avoid the blinded condition.
    const sourceVisionLevelsBlindedOverride: AtcvEffect[] = [];
    for (let i = 0; i < sourceVisionLevels.length; i++) {
      if (
        sourceVisionLevels[i]?.visionBlindedOverride &&
        <number>sourceVisionLevels[i]?.visionLevelValue > someoneIsBlinded
      ) {
        sourceVisionLevelsBlindedOverride.push(<AtcvEffect>sourceVisionLevels[i]);
      }
    }
    if (sourceVisionLevelsBlindedOverride.length == 0) {
      // Someone is blind
      debug(`(6) Is false, '${sourceToken.data.name}' can't see '${targetToken.data.name}'`);
      // return false;
      return {
        sourceTokenId: sourceToken.id,
        targetTokenId: targetToken.id,
        sourceVisionsLevels: sourceVisionLevels,
        targetVisionsLevels: targetVisionLevels,
        canSee: false
      };
    } else {
      debug(`(6.1) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
      sourceVisionLevels = sourceVisionLevelsBlindedOverride;
    }
  }

  // ?? )
  let hasHidden = false;
  let hasStealthed = false;
  for (let i = 0; i < targetVisionLevels.length; i++) {
    // 2022-05-30
    // if (
    //   targetVisionLevels[i]?.visionId === AtcvEffectConditionFlags.HIDDEN &&
    //   targetVisionLevels[i]?.visionLevelValue != 0
    // ) {
    if (
      API.SKILLS_CONDITION.includes(<string>targetVisionLevels[i]?.visionId) &&
      targetVisionLevels[i]?.visionLevelValue != 0
    ) {
      hasHidden = true;
    }
    if (
      targetVisionLevels[i]?.visionId === AtcvEffectConditionFlags.STEALTHED &&
      targetVisionLevels[i]?.visionLevelValue != 0
    ) {
      hasStealthed = true;
    }
  }
  if (!hasStealthed && isStealthPassive) {
    const stealthed: AtcvEffect = new AtcvEffect();
    stealthed.visionId = AtcvEffectConditionFlags.STEALTHED;
    stealthed.visionLevelValue = stealthedPassiveValue;
    targetVisionLevels.push(stealthed);
  }

  // 7) If not 'condition' are present on the target token return true (nothing to check).
  // if (targetVisionLevels.length == 0) {
  //   if (isStealthPassive) {
  //     // 7.1)
  //     if (perceptionPassiveValue >= stealthedPassiveValue) {
  //       debug(`(7.1) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
  //       return true;
  //     } else {
  //       debug(`(7.2) Is false, '${sourceToken.data.name}' can't see '${targetToken.data.name}'`);
  //       return false;
  //     }
  //   } else {
  //     debug(`(7.3) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
  //     return true;
  //   }
  // }

  // 7) Check again for _passive perception vs passive stealth_ like on point 4) this time we use the stealthed active effect like the stealth passive on the target token...
  // THIS WILL BE CHECK ONLY IF ONE CONDITION IS PRESENT ON THE TARGET AND THE CONDITION TYPE IS 'STEALTHED'
  if (targetVisionLevels.length == 1) {
    if (isStealthPassive) {
      if (targetVisionLevels[0]?.visionId == AtcvEffectConditionFlags.STEALTHED) {
        if (perceptionPassiveValue >= (<number>targetVisionLevels[0]?.visionLevelValue ?? 0)) {
          debug(`(7) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
          // return true;
          return {
            sourceTokenId: sourceToken.id,
            targetTokenId: targetToken.id,
            sourceVisionsLevels: sourceVisionLevels,
            targetVisionsLevels: targetVisionLevels,
            canSee: true
          };
        }
      }
    }
  }

  // 8) Check again for _passive perception vs passive stealth_ like on point 4) this time we use the hidden active effect like the stealth passive on the target token...
  // THIS WILL BE CHECK ONLY IF ONE CONDITION IS PRESENT ON THE TARGET AND THE CONDITION TYPE IS 'HIDDEN'
  if (targetVisionLevels.length == 1) {
    if (isStealthPassive) {
      // 2022-05-30
      //if (targetVisionLevels[0]?.visionId == AtcvEffectConditionFlags.HIDDEN) {
      if (API.SKILLS_CONDITION.includes(<string>targetVisionLevels[0]?.visionId)) {
        if (perceptionPassiveValue >= (<number>targetVisionLevels[0]?.visionLevelValue ?? 0)) {
          debug(`(8) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`);
          // return true;
          return {
            sourceTokenId: sourceToken.id,
            targetTokenId: targetToken.id,
            sourceVisionsLevels: sourceVisionLevels,
            targetVisionsLevels: targetVisionLevels,
            canSee: true
          };
        }
      }
    }
  }

  // ========================================
  // 2 - Check for the correct status sight
  // =========================================

  // Is better put these here so we calculate just one time
  const sourceTokenElevation = getElevationToken(sourceToken);
  const targetTokenElevation = getElevationToken(targetToken);
  const tokenDistance = getUnitTokenDist(sourceToken, targetToken);

  let resultFinal = false;

  // 9) Check if the source token has some 'sense' powerful enough to beat every 'condition' ont he target token:
  for (let i = 0; i < sourceVisionLevels.length; i++) {
    // const sourceVisionLevelsValid: Map<string, number> = new Map<string, number>();
    const sourceVisionLevelsValid: number[] = [];
    const sourceVisionLevel = <AtcvEffect>sourceVisionLevels[i];
    for (let j = 0; j < targetVisionLevels.length; j++) {
      const targetVisionLevel = <AtcvEffect>targetVisionLevels[j];
      // 9.0) If no `ATCV.<visionId>` is founded on the target token return true (this shouldn't never happened is just for avoid some unwanted behavior)
      if (
        !targetVisionLevel ||
        !targetVisionLevel.visionId ||
        // 2022-05-30
        //targetVisionLevel.visionId === AtcvEffectSenseFlags.NORMAL ||
        targetVisionLevel.visionId === AtcvEffectSenseFlags.NONE
      ) {
        // sourceVisionLevelsValid.set(sourceVisionLevel.visionId, true);
        // sourceVisionLevelsValid.set(sourceVisionLevel.visionId+j, <number>targetVisionLevel.visionLevelValue);
        sourceVisionLevelsValid.push(<number>targetVisionLevel.visionLevelValue);
        debug(
          `[${sourceVisionLevel.visionId}][${targetVisionLevel.visionId}](9.0) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`,
        );
        continue;
      }
      // 9.1) Check for explicit `ATCV.conditionTargets` and `ATCV.conditionSources`, this control make avoid the following 9.X check
      if (
        sourceVisionLevel?.visionTargets?.length > 0 &&
        !sourceVisionLevel?.visionTargets.includes(<string>targetVisionLevel.visionId)
      ) {
        // sourceVisionLevelsValid.set(sourceVisionLevel.visionId, false);
        // sourceVisionLevelsValid.delete(sourceVisionLevel.visionId);
        debug(
          `[${sourceVisionLevel.visionId}][${targetVisionLevel.visionId}](9.1.1) Is false, '${sourceToken.data.name}' can't see '${targetToken.data.name}'`,
        );
        continue;
      }
      if (
        targetVisionLevel?.visionSources?.length > 0 &&
        !targetVisionLevel?.visionSources.includes(<string>sourceVisionLevel.visionId)
      ) {
        // sourceVisionLevelsValid.set(sourceVisionLevel.visionId, false);
        debug(
          `[${sourceVisionLevel.visionId}][${targetVisionLevel.visionId}](9.1.2) Is false, '${sourceToken.data.name}' can't see '${targetToken.data.name}'`,
        );
        continue;
      }
      // 9.2) If the 'condition' on the target token is `NONE` return true
      //if (isStringEquals(targetVisionLevel.visionId, AtcvEffectConditionFlags.NONE)) {
      if (targetVisionLevel.visionId === AtcvEffectConditionFlags.NONE) {
        // sourceVisionLevelsValid.set(sourceVisionLevel.visionId, true);
        // sourceVisionLevelsValid.set(sourceVisionLevel.visionId+j, <number>targetVisionLevel.visionLevelValue);
        sourceVisionLevelsValid.push(<number>targetVisionLevel.visionLevelValue);
        debug(
          `[${sourceVisionLevel.visionId}][${targetVisionLevel.visionId}](9.2) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`,
        );
        continue;
      }

      // 9.2.1 old 10)  Check if `ATCV.conditionElevation` if set to true, will check if the source token and target token are at the same level .
      if (sourceVisionLevel?.visionElevation && sourceTokenElevation < targetTokenElevation) {
        // sourceVisionLevelsValid.set(sourceVisionLevel.visionId, false);
        // sourceVisionLevelsValid.delete(sourceVisionLevel.visionId);
        debug(
          `[${sourceVisionLevel.visionId}][${targetVisionLevel.visionId}](9.2.1) Is false, '${sourceToken.data.name}' can't see '${targetToken.data.name}'`,
        );
        continue;
      }

      // 9.2.2 old 11)  Check if `ATCV.conditionDistance` is valorized if is set to a numeric value, will check if the tokens are near enough to remain hidden (remember -1 is infinity distance).
      if (
        <number>sourceVisionLevel?.visionDistanceValue > 0 &&
        <number>sourceVisionLevel?.visionDistanceValue < tokenDistance
      ) {
        // sourceVisionLevelsValid.set(sourceVisionLevel.visionId, false);
        // sourceVisionLevelsValid.delete(sourceVisionLevel.visionId);
        debug(
          `[${sourceVisionLevel.visionId}][${targetVisionLevel.visionId}](9.2.2) Is false, '${sourceToken.data.name}' can't see '${targetToken.data.name}'`,
        );
        continue;
      }

      // 9.3) If the 'condition' on the target token is `STEALTHED` and the _Perception Passive of the system_
      // of the source token is `>` of the current sense value, we use the  _Perception Passive of the system_ for the checking and return true if is `>` of the condition value set.
      if (targetVisionLevel.visionId === AtcvEffectConditionFlags.STEALTHED && isStealthPassive && !hasHidden) {
        if (perceptionPassiveValue > <number>targetVisionLevel.visionLevelValue) {
          // sourceVisionLevelsValid.set(sourceVisionLevel.visionId, true);
          // sourceVisionLevelsValid.set(sourceVisionLevel.visionId+j, <number>targetVisionLevel.visionLevelValue);
          sourceVisionLevelsValid.push(<number>targetVisionLevel.visionLevelValue);
          debug(
            `[${sourceVisionLevel.visionId}][${targetVisionLevel.visionId}](9.3) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`,
          );
          continue;
        } else {
          // sourceVisionLevelsValid.set(sourceVisionLevel.visionId, false);
          // sourceVisionLevelsValid.delete(sourceVisionLevel.visionId);
          debug(
            `[${sourceVisionLevel.visionId}][${targetVisionLevel.visionId}](9.3) Is false, '${sourceToken.data.name}' can't see '${targetToken.data.name}'`,
          );
          // TODO particolar case is false but we put the value anyway
          sourceVisionLevelsValid.push(<number>targetVisionLevel.visionLevelValue);
          continue;
        }
      }

      // 9.4)  The range of 'condition' level [`conditionLevelMinIndex,conditionLevelMaxIndex`], must be between the 'sense' range level [`conditionLevelMinIndex,conditionLevelMaxIndex`] like explained on the [tables](./tables.md).
      // REMOVED TO COMPLICATED WE USE SOURCES AND TARGETS

      // sourceVisionLevelsValid.set(sourceVisionLevel.visionId+j, <number>targetVisionLevel.visionLevelValue);
      sourceVisionLevelsValid.push(<number>targetVisionLevel.visionLevelValue);
      debug(
        `[${sourceVisionLevel.visionId}][${targetVisionLevel.visionId}](9.4) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`,
      );
    }

    // 12) Check if the vision level value of the filtered  'sense' on the source token is a number `>=` of the vision level value of the filtered 'condition' on the target token,
    // if the sense is set to `-1` this check is automatically skipped. If the condition and the sense are both set with value `-1` the condition won.
    if (sourceVisionLevelsValid.length == 0) {
      debug(
        `[${sourceVisionLevel.visionId}](12.1) Is false, '${sourceToken.data.name}' can't see '${targetToken.data.name}'`,
      );
      continue;
    }
    // the "-1" case
    if (sourceVisionLevelsValid.includes(-1)) {
      debug(
        `[${sourceVisionLevel.visionId}](12.2) Is false, '${sourceToken.data.name}' can't see '${targetToken.data.name}'`,
      );
      continue;
    }
    const result =
      <number>sourceVisionLevel.visionLevelValue <= -1 ||
      <number>sourceVisionLevel.visionLevelValue >= Math.max(...sourceVisionLevelsValid);
    // <number>sourceVisionLevel.visionLevelValue >= <number>targetVisionLevel.visionLevelValue;
    //return result;
    if (result) {
      debug(
        `[${sourceVisionLevel.visionId}](12.3) Is true, '${sourceToken.data.name}' can see '${targetToken.data.name}'`,
      );
      resultFinal = result;
      // This sense is enough for see the target we exit the loop for velocity without check the other
      break;
    }
  }
  debug(`FINAL => '${sourceToken.data.name}' ${resultFinal ? `can see` : `can't see`} '${targetToken.data.name}'`);
  // return resultFinal;
  return {
    sourceTokenId: sourceToken.id,
    targetTokenId: targetToken.id,
    sourceVisionsLevels: sourceVisionLevels,
    targetVisionsLevels: targetVisionLevels,
    canSee: resultFinal
  };
}

export function getAllDefaultSensesAndConditions(token: Token | null): AtcvEffect[] {
  const allSensesAndConditions: AtcvEffect[] = [];
  if (token) {
    allSensesAndConditions.push(...getSensesFromToken(token.document));
    allSensesAndConditions.push(...getConditionsFromToken(token.document));
  } else {
    allSensesAndConditions.push(...getSensesFromToken(null));
    allSensesAndConditions.push(...getConditionsFromToken(null));
  }

  const sensesOrderByName = allSensesAndConditions.sort((a, b) => a.visionName.localeCompare(b.visionName));
  return sensesOrderByName;
}

export async function _registerSenseData(
  senseData: SenseData,
  sensesDataList: SenseData[],
  conditionType: string,
): Promise<SenseData[] | undefined> {
  if (!senseData.id) {
    warn(`Cannot register the ${conditionType} with id empty or null`, true);
    return;
  }
  if (!senseData.name) {
    warn(`Cannot register the ${conditionType} with name empty or null`, true);
    return;
  }

  senseData.id = senseData.id.trim();

  const sensesAndConditionDataList = <AtcvEffect[]>await getAllDefaultSensesAndConditions(null);
  const senseAlreadyExistsId = sensesAndConditionDataList.find((a: AtcvEffect) => a.visionId == senseData.id);
  const senseAlreadyExistsName = sensesAndConditionDataList.find((a: AtcvEffect) => a.visionName == senseData.name);
  if (senseAlreadyExistsId) {
    warn(`Cannot register the ${conditionType} with id '${senseData.id}' because already exists`, true);
    return;
  }
  if (senseAlreadyExistsName) {
    warn(`Cannot register the ${conditionType} with name '${senseData.name}' because already exists`, true);
    return;
  }

  // Register new effect
  const atcvEffcetX = AtcvEffect.fromSenseData(senseData, 0, false);
  const effectExternal = AtcvEffect.toEffectFromAtcvEffect(atcvEffcetX);
  let newEffectsData: Effect[] = API.EFFECTS || [];
  let effectFounded = !!API.EFFECTS.find((effect: Effect) => {
    return isStringEquals(effect.name, effectExternal.name) || isStringEquals(effect.customId, effectExternal.customId);
  });
  // Update current effect
  if (effectFounded) {
    newEffectsData = newEffectsData.filter(function (el) {
      return el.customId == senseData.id;
    });
    info(
      `Update register the default active effect for the ${conditionType} with name '${senseData.name}' because already exists`,
      true,
    );
    effectFounded = false;
  }
  if (!effectFounded && effectExternal) {
    newEffectsData.push(effectExternal);
    await game.settings.set(CONSTANTS.MODULE_NAME, 'effects', newEffectsData);
  } else {
    warn(
      `Cannot register the default active effect for the ${conditionType} with name '${senseData.name}' because already exists`,
      true,
    );
  }
  // End register new effect
  sensesDataList.push(senseData);
  return sensesDataList;
}

export async function _unregisterSenseData(
  senseDataIdOrName: string,
  sensesDataList: SenseData[],
  valueComment: string,
): Promise<SenseData[] | undefined> {
  if (!senseDataIdOrName) {
    warn(`Cannot unregister the ${valueComment} with id empty or null`, true);
    return;
  }
  const sensesAndConditionDataList = <AtcvEffect[]>await getAllDefaultSensesAndConditions(null);
  const senseAlreadyExistsId = <AtcvEffect>(
    sensesAndConditionDataList.find(
      (a: AtcvEffect) => a.visionId == senseDataIdOrName || a.visionName == senseDataIdOrName,
    )
  );
  if (!senseAlreadyExistsId) {
    warn(`Cannot unregister the ${valueComment} with id '${senseDataIdOrName}' because is not exists`, true);
    return;
  }
  // UnRegister new effect
  let newEffectsData: Effect[] = API.EFFECTS || [];
  const effectFounded = !!API.EFFECTS.find((effect: Effect) => {
    return isStringEquals(effect.name, senseDataIdOrName) || isStringEquals(effect.customId, senseDataIdOrName);
  });
  // Update current effect
  if (effectFounded) {
    newEffectsData = newEffectsData.filter(function (el) {
      return el.customId == senseDataIdOrName;
    });
    await game.settings.set(CONSTANTS.MODULE_NAME, 'effects', newEffectsData);
  } else {
    warn(
      `Cannot unregister the default active effect ${valueComment} with id '${senseDataIdOrName}' because is not exists`,
      true,
    );
  }
  // End UnRegister new effect
  sensesDataList = sensesDataList.filter(function (el) {
    return el.id != senseAlreadyExistsId.visionId;
  });
  return sensesDataList;
}

export function drawHandlerCVImageAll(controlledToken: Token) {
  if (game?.ready && game.settings.get(CONSTANTS.MODULE_NAME, 'enableDrawCVHandler')) {
    // if(<number>(<Token[]>canvas.tokens?.controlled.filter((t)=> t.id==controlledToken.id))?.length <= 0){
    //   return;
    // }
    for (const token of <Token[]>canvas.tokens?.placeables) {
      if (token.id != controlledToken.id) {
        const cvResultData = shouldIncludeVisionV2(controlledToken, token);
        if (cvResultData.canSee) {
          drawHandlerCVImage(controlledToken, token, cvResultData.sourceVisionsLevels, cvResultData.targetVisionsLevels);
        }
      }
    }
  }
}

export async function drawHandlerCVImage(
  controlledToken: Token, tokenToCheckIfIsVisible: Token,  
  atcvEffectsSource:AtcvEffect[], atcvEffectsTarget:AtcvEffect[]):Promise<void> {

  if (game?.ready && game.settings.get(CONSTANTS.MODULE_NAME, 'enableDrawCVHandler')) {
    const currentFlag = controlledToken.actor?.getFlag(
      CONSTANTS.MODULE_NAME,
      ConditionalVisibilityFlags.ORIGINAL_IMAGE + '_' + game.userId + '_' + tokenToCheckIfIsVisible.id,
    );
    if (<number>canvas.tokens?.controlled.length <= 0) {
      if (currentFlag && currentFlag != tokenToCheckIfIsVisible.data.img) {
        await conditionalVisibilitySocket.executeAsUser(
          'drawImageByUserCV',
          game.userId,
          currentFlag,
          tokenToCheckIfIsVisible.id,
        );
        controlledToken.actor?.unsetFlag(
          CONSTANTS.MODULE_NAME,
          ConditionalVisibilityFlags.ORIGINAL_IMAGE + '_' + game.userId + '_' + tokenToCheckIfIsVisible.id,
        );
      } else {
        const ownedsTokens = getOwnedTokens(false).filter((t) => t.id != tokenToCheckIfIsVisible.id);
        for (const ownToken of ownedsTokens) {
          const currentFlagTmp = ownToken.actor?.getFlag(
            CONSTANTS.MODULE_NAME,
            ConditionalVisibilityFlags.ORIGINAL_IMAGE + '_' + game.userId + '_' + tokenToCheckIfIsVisible.id,
          );
          if (currentFlagTmp && currentFlagTmp != tokenToCheckIfIsVisible.data.img) {
            await conditionalVisibilitySocket.executeAsUser(
              'drawImageByUserCV',
              game.userId,
              currentFlagTmp,
              tokenToCheckIfIsVisible.id,
            );
            ownToken.actor?.unsetFlag(
              CONSTANTS.MODULE_NAME,
              ConditionalVisibilityFlags.ORIGINAL_IMAGE + '_' + game.userId + '_' + tokenToCheckIfIsVisible.id,
            );
          }
        }
      }
      return;
    }
    // if (<number>(<Token[]>canvas.tokens?.controlled.filter((t) => t.id == controlledToken.id))?.length <= 0) {
    //   if (game.user?.isGM) {
    //     if (currentFlag) {
    //       await conditionalVisibilitySocket.executeAsUser(
    //         'drawImageByUserCV',
    //         game.userId,
    //         currentFlag,
    //         tokenToCheckIfIsVisible.id,
    //       );
    //       await controlledToken.actor?.unsetFlag(
    //         CONSTANTS.MODULE_NAME,
    //         ConditionalVisibilityFlags.ORIGINAL_IMAGE + '_' + game.userId + '_' + tokenToCheckIfIsVisible.id,
    //       );
    //     }
    //   }
    //   return;
    // }

    // const sourceVisionLevels = getSensesFromTokenFast(controlledToken.document, true, true);
    // const targetVisionLevels = getConditionsFromTokenFast(tokenToCheckIfIsVisible.document, true, true);
    // TODO add priority value for set up the order
    // const atcvEffectsSource = sourceVisionLevels.sort((a, b) =>
    //   String(a.visionLevelValue).localeCompare(String(b.visionLevelValue)),
    // );
    // const atcvEffectsTarget = targetVisionLevels.sort((a, b) =>
    //   String(a.visionLevelValue).localeCompare(String(b.visionLevelValue)),
    // );

    let foundedImageToUpdated = false;


    if (!foundedImageToUpdated) {
      for (const atcvEffectTarget of atcvEffectsTarget) {
        if (atcvEffectTarget.visionSourceImage) {
          if (atcvEffectTarget.visionSourceImage != tokenToCheckIfIsVisible.data.img) {
            const oriImage = tokenToCheckIfIsVisible.data.img;
            await conditionalVisibilitySocket.executeAsUser(
              'drawImageByUserCV',
              game.userId,
              atcvEffectTarget.visionSourceImage,
              tokenToCheckIfIsVisible.id,
            );
            await controlledToken.actor?.setFlag(
              CONSTANTS.MODULE_NAME,
              ConditionalVisibilityFlags.ORIGINAL_IMAGE + '_' + game.userId + '_' + tokenToCheckIfIsVisible.id,
              oriImage,
            );
            foundedImageToUpdated = true;
            break;
          }
          foundedImageToUpdated = true;
        } else {
          // Do noting
          // tokenToCheckIfIsVisible.clear();
        }
      }
    }

    if (!foundedImageToUpdated) {
      for (const atcvEffectSource of atcvEffectsSource) {
        if (atcvEffectSource.visionTargetImage) {
          if (atcvEffectSource.visionTargetImage != tokenToCheckIfIsVisible.data.img) {
            const oriImage = tokenToCheckIfIsVisible.data.img;
            await conditionalVisibilitySocket.executeAsUser(
              'drawImageByUserCV',
              game.userId,
              atcvEffectSource.visionTargetImage,
              tokenToCheckIfIsVisible.id,
            );
            await controlledToken.actor?.setFlag(
              CONSTANTS.MODULE_NAME,
              ConditionalVisibilityFlags.ORIGINAL_IMAGE + '_' + game.userId + '_' + tokenToCheckIfIsVisible.id,
              oriImage,
            );
            foundedImageToUpdated = true;
            break;
          }
          foundedImageToUpdated = true;
        } else {
          // Do noting
          // tokenToCheckIfIsVisible.clear();
        }
      }
    }

    if (!foundedImageToUpdated && currentFlag) {
      if (currentFlag != tokenToCheckIfIsVisible.data.img) {
        await conditionalVisibilitySocket.executeAsUser(
          'drawImageByUserCV',
          game.userId,
          currentFlag,
          tokenToCheckIfIsVisible.id,
        );
        await controlledToken.actor?.unsetFlag(
          CONSTANTS.MODULE_NAME,
          ConditionalVisibilityFlags.ORIGINAL_IMAGE + '_' + game.userId + '_' + tokenToCheckIfIsVisible.id,
        );
      }
    }
  }
}

export function buildButton(html, tooltip, atcvEffectFlagData) {
  /*
  //const buttonPos = game.settings.get(CONSTANTS.MODULE_NAME, 'hudPos');
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
  */
  const hiddenValue = atcvEffectFlagData?.visionLevelValue ?? 0;

  const iconClass = 'fas fa-eye'; // TODO customize icon ???
  const button = $(
    `<div class="control-icon toggleStealth ${hiddenValue && hiddenValue != 0 ? 'active' : ''}" ${
      hiddenValue && hiddenValue != 0
        ? `style="background: blue; opacity:0.85;"`
        : `style="background: blueviolet; opacity:0.85;"`
    } title="${tooltip}"> <i class="${iconClass}"></i></div>`,
  );
  const settingHudColClass = <string>game.settings.get(CONSTANTS.MODULE_NAME, 'hudColumn') ?? 'left';
  const settingHudTopBottomClass = <string>game.settings.get(CONSTANTS.MODULE_NAME, 'hudTopBottom') ?? 'top';

  const buttonPos = '.' + settingHudColClass.toLowerCase();

  const col = html.find(buttonPos);
  if (settingHudTopBottomClass.toLowerCase() === 'top') {
    col.prepend(button);
  } else {
    col.append(button);
  }
  return button;
}

export async function renderDialogRegisterSenseData(
  isSense: boolean,
  senses: AtcvEffect[],
  conditions: AtcvEffect[],
): Promise<Dialog> {
  const filteredSenses = senses.filter(function (el) {
    return el.visionId != AtcvEffectConditionFlags.NONE;
  });
  const filteredConditions = conditions.filter(function (el) {
    return el.visionId != AtcvEffectConditionFlags.NONE;
  });
  const data = {
    // Sense data
    id: '',
    name: '',
    path: '',
    img: '',
    conditionElevation: false,
    conditionTargets: [],
    conditionSources: [],
    conditionDistance: 0,
    conditionType: isSense ? 'sense' : 'condition',
    conditionBlinded: false,
    conditionBlindedOverride: false,
    conditionTargetImage: '',
    conditionSourceImage: '',
    // End sense data
    isSense: isSense,
    senses: filteredSenses,
    conditions: filteredConditions,
  };
  const myContent = await renderTemplate(`modules/${CONSTANTS.MODULE_NAME}/templates/add_new_sensedata.hbs`, data);

  return new Dialog({
    title: isSense
      ? i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.addsense.title`)
      : i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.addcondition.title`),
    content: myContent,
    render: (html: JQuery<HTMLElement>) => {
      //@ts-ignore
      $($(html[0]).find('.conditionSources')[0]).SumoSelect({
        placeholder: 'Select sense sources...',
      });

      //@ts-ignore
      $($(html[0]).find('.conditionTargets')[0]).SumoSelect({
        placeholder: 'Select condition targets...',
      });

      for (const fp of html.find('button.file-picker-conditional-visibility-img')) {
        fp?.addEventListener('click', async function (event) {
          event.preventDefault();
          event.stopPropagation();
          const buttonClick = event.button; // 0 left click
          const button = <EventTarget>event.currentTarget;
          //@ts-ignore
          const target = button.dataset.target;
          //@ts-ignore
          const field = button.form[target] || null;
          const pickedFile = await new FilePicker({
            type: 'image', // imagevideo
            callback: async (path) => {
              $(field).val(path);
            },
          });
          pickedFile.browse(target);
        });
        break;
      }
      for (const fp of html.find('button.file-picker-conditional-visibility-conditionTargetImage')) {
        fp?.addEventListener('click', async function (event) {
          event.preventDefault();
          event.stopPropagation();
          const buttonClick = event.button; // 0 left click
          const button = <EventTarget>event.currentTarget;
          //@ts-ignore
          const target = button.dataset.target;
          //@ts-ignore
          const field = button.form[target] || null;
          const pickedFile = await new FilePicker({
            type: 'image', // imagevideo
            callback: async (path) => {
              $(field).val(path);
            },
          });
          pickedFile.browse(target);
        });
        break;
      }

      for (const fp of html.find('button.file-picker-conditional-visibility-conditionSourceImage')) {
        fp?.addEventListener('click', async function (event) {
          event.preventDefault();
          event.stopPropagation();
          const buttonClick = event.button; // 0 left click
          const button = <EventTarget>event.currentTarget;
          //@ts-ignore
          const target = button.dataset.target;
          //@ts-ignore
          const field = button.form[target] || null;
          const pickedFile = await new FilePicker({
            type: 'image', // imagevideo
            callback: async (path) => {
              $(field).val(path);
            },
          });
          pickedFile.browse(target);
        });
        break;
      }
    },
    buttons: {
      add: {
        icon: '<i class="fas fa-check"></i>',
        label: i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.confirm.apply.choice.add`),
        callback: async (html) => {
          const senseData = <SenseData>new Object();

          senseData.id = <string>$(`[name="conditional-visibility-id"]`).val();
          senseData.name = <string>$(`[name="conditional-visibility-name"]`).val();
          senseData.path = <string>$(`[name="conditional-visibility-path"]`).val();
          senseData.img = <string>$(`[name="conditional-visibility-img"]`).val();
          senseData.conditionElevation =
            $(`[name="conditional-visibility-conditionElevation"]`).val() === 'true' ? true : false;

          senseData.conditionTargets = <string[]>$(`[name="conditional-visibility-conditionTargets"]`).val() || [];

          const conditionTargetsExplicit = <string>$(`[name="conditional-visibility-conditionTargets-explicit"]`).val();
          if (conditionTargetsExplicit) {
            const arr = conditionTargetsExplicit.split(',');
            for (const a of arr) {
              if (a) {
                senseData.conditionTargets.push(a);
              }
            }
          }

          senseData.conditionSources = <string[]>$(`[name="conditional-visibility-conditionSources"]`).val() || [];

          const conditionSourcesExplicit = <string>$(`[name="conditional-visibility-conditionSources-explicit"]`).val();
          if (conditionSourcesExplicit) {
            const arr = conditionSourcesExplicit.split(',');
            for (const a of arr) {
              if (a) {
                senseData.conditionSources.push(a);
              }
            }
          }

          senseData.conditionDistance = <number>$(`[name="conditional-visibility-conditionDistance"]`).val();
          senseData.conditionType = <string>$(`[name="conditional-visibility-conditionType"]`).val();

          senseData.conditionBlinded =
            $(`[name="conditional-visibility-conditionBlinded"]`).val() === 'true' ? true : false;
          senseData.conditionBlindedOverride =
            $(`[name="conditional-visibility-conditionBlindedOverride"]`).val() === 'true' ? true : false;

          senseData.conditionTargetImage = <string>$(`[name="conditional-visibility-conditionTargetImage"]`).val();
          senseData.conditionSourceImage = <string>$(`[name="conditional-visibility-conditionSourceImage"]`).val();

          if (!senseData.id || !senseData.name) {
            warn(`You must set at least the 'id' and the 'name'`, true);
            return;
          }

          if (isSense) {
            API.registerSense(senseData);
          } else {
            API.registerCondition(senseData);
          }
        },
      },
      donothing: {
        icon: '<i class="fas fa-times"></i>',
        label: i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.confirm.apply.choice.donothing`),
        callback: (html) => {
          // Do nothing
        },
      },
    },
    default: 'donothing',
  });
}

export async function renderDialogUnRegisterSenseData(
  isSense: boolean,
  senses: AtcvEffect[],
  conditions: AtcvEffect[],
): Promise<Dialog> {
  const filteredSenses = senses.filter(function (el) {
    return el.visionId != AtcvEffectConditionFlags.NONE;
  });
  const filteredConditions = conditions.filter(function (el) {
    return el.visionId != AtcvEffectConditionFlags.NONE;
  });
  const data = {
    isSense: isSense,
    senses: senses,
    conditions: conditions,
  }; // default value
  const myContent = await renderTemplate(`modules/${CONSTANTS.MODULE_NAME}/templates/delete_sensedata.hbs`, data);

  const dialog = new Dialog({
    title: isSense
      ? i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.deletesense.title`)
      : i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.deletecondition.title`),
    content: myContent,
    render: (html: JQuery<HTMLElement>) => {
      // do nothing
    },
    buttons: {
      delete: {
        icon: '<i class="fas fa-check"></i>',
        label: i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.confirm.apply.choice.delete`),
        callback: async (html) => {
          const sense = <string>$(`[name="conditional-visibility-senses"]`).val();
          const condition = <string>$(`[name="conditional-visibility-conditions"]`).val();
          if (!isSense && !condition) {
            warn(`You must set at least a 'condition'`, true);
            return;
          }
          if (isSense && !sense) {
            warn(`You must set at least a 'sense'`, true);
            return;
          }

          if (isSense) {
            API.unRegisterSense(sense);
          } else {
            API.unRegisterCondition(condition);
          }
        },
      },
      donothing: {
        icon: '<i class="fas fa-times"></i>',
        label: i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.confirm.apply.choice.donothing`),
        callback: (html) => {
          // Do nothing
        },
      },
    },
    default: 'donothing',
  });
  //dialog.options.classes.push('dialogcv');
  dialog.options.height = 150;
  dialog.position.height = 150;
  return dialog;
}

/**
 * Overwrite Token image on the client side if 'userMappings' flag has been set.
 * @param {*} token Token to overwrite the image for
 * @param {*} checks Number of checks/recursive calls to wait for the previous draw() operation to end
 * @returns
 */
export async function checkAndDisplayUserSpecificImage(image: string, token, forceDraw = false, checks = 40) {
  if (!token.document) {
    token = canvas.tokens?.get(token.id);
  }

  const img = image; // mappings[<string>game.userId];
  if (img && img !== token.data.img) {
    // This function may be called while the Token is in the middle of loading it's textures.
    // Attempting to perform a draw() call then would result in multiple overlapped images.
    // We should wait for the texture to be loaded and change the image after. As a failsafe
    // give up after a certain number of checks.
    if (!token.icon.texture) {
      checks--;
      if (checks > 1)
        new Promise((resolve) => setTimeout(resolve, 1)).then(() =>
          checkAndDisplayUserSpecificImage(image, token, forceDraw, checks),
        );
      return;
    }

    // Change the image on the client side, without actually updating the token
    token.data.img = img;
    token.document.data.img = img;

    const visible = token.visible;
    const hadActiveHud = token.hasActiveHUD;

    await token.draw();
    token.visible = visible;
    if (hadActiveHud) canvas.tokens?.hud.bind(token);
  } else if (forceDraw && token.icon.texture) {
    const visible = token.visible;
    const hadActiveHud = token.hasActiveHUD;

    await token.draw();
    token.visible = visible;
    if (hadActiveHud) canvas.tokens?.hud.bind(token);
  }
}

export function renderAutoSkillsDialog(
  selectedToken: Token,
  enabledSkill: CVSkillData,
  isSense: boolean,
  valSkillRoll: number,
) {
  const dialog = new Dialog({
    title: isSense
      ? i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.addsense.title`)
      : i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.addcondition.title`),
    content: isSense
      ? i18nFormat(`${CONSTANTS.MODULE_NAME}.windows.dialogs.addsense.areyousure`, {
          sense: i18n(enabledSkill.name),
          name: i18n(selectedToken.name),
        })
      : i18nFormat(`${CONSTANTS.MODULE_NAME}.windows.dialogs.addcondition.areyousure`, {
          condition: i18n(enabledSkill.name),
          name: i18n(selectedToken.name),
        }),
    render: (html: JQuery<HTMLElement>) => {
      // do nothing
    },
    buttons: {
      addSystemSenseData: {
        icon: '<i class="fas fa-check"></i>',
        label:
          i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.confirm.apply.choice.add`) +
          ' ' +
          i18n(enabledSkill.name) +
          ' (CV)',
        callback: async (html) => {
          const senseData: SenseData = <SenseData>(<CVSkillData>enabledSkill).senseData;
          manageActiveEffectForAutoSkillsFeature(senseData, selectedToken, valSkillRoll);
        },
      },
      addGenericSenseData: {
        icon: '<i class="fas fa-check"></i>',
        label: isSense
          ? i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.confirm.apply.choice.add`) +
            ' ' +
            i18n(`${CONSTANTS.MODULE_NAME}.normal`)
          : i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.confirm.apply.choice.add`) +
            ' ' +
            i18n(`${CONSTANTS.MODULE_NAME}.hidden`),
        callback: async (html) => {
          let senseData: SenseData;
          if (isSense) {
            senseData = <SenseData>API.SENSES.find((s) => {
              return s.id === AtcvEffectSenseFlags.NORMAL;
            });
          } else {
            senseData = <SenseData>API.CONDITIONS.find((s) => {
              return s.id === AtcvEffectConditionFlags.HIDDEN;
            });
          }
          manageActiveEffectForAutoSkillsFeature(senseData, selectedToken, valSkillRoll);
        },
      },
      donothing: {
        icon: '<i class="fas fa-times"></i>',
        label: i18n(`${CONSTANTS.MODULE_NAME}.windows.dialogs.confirm.apply.choice.donothing`),
        callback: (html) => {
          // Do nothing
        },
      },
    },
    default: 'donothing',
  });
  dialog.options.height = 150;
  dialog.position.height = 150;
  dialog.render(true);
}

/**
 * TODO This method need some better developer than me
 * @param textToCheck
 * @returns
 */
export function checkIfAtLeastAEnabledSkillIsFoundedOnChatMessage(textToCheck: string): CVSkillData | null {
  const cvSkillsData = <CVSkillData[]>API.SKILLS;
  const fullTextContent = textToCheck.toLowerCase().trim();
  // TODO special word for integration multisystem and help to identify the chat text
  const check = i18n(`${CONSTANTS.MODULE_NAME}.labels.check`);
  const ability = i18n(`${CONSTANTS.MODULE_NAME}.labels.ability`);
  const skill = i18n(`${CONSTANTS.MODULE_NAME}.labels.skill`);

  let currentCVSkillData: CVSkillData | null = null;
  for (const cvSkillData of cvSkillsData) {
    if (!cvSkillData.enable) {
      continue;
    }

    // Clean up the string for multisystem (D&D5, PF2, ecc.)
    const innerTextTmp = fullTextContent.toLowerCase().trim();
    const arr1 = innerTextTmp.split(/\r?\n/);
    for (let i = 0; i < arr1.length; i++) {
      let text = arr1[i];
      if (text) {
        // Better roll support
        if (text.indexOf(`title="${i18n(cvSkillData.name)?.toLowerCase()}"`) !== -1) {
          // is ok ??
        }
        // Keywords to avoid for all the system ?
        else if (text.indexOf(check) !== -1 || text.indexOf(ability) !== -1 || text.indexOf(skill) !== -1) {
          // is ok ??
        } else {
          continue;
        }
        text = text.replace(/\W/g, ' ');
        text = text.replace(skill, '');
        text = text.replace(check, '');
        text = text.replace(ability, '');
        text = text.replace(/[0-9]/g, '');
        if (text.trim().indexOf(i18n(cvSkillData.name).toLowerCase()) !== -1) {
          currentCVSkillData = cvSkillData;
          break;
        }
      }
    }
    if (currentCVSkillData) {
      break;
    }
  }
  return currentCVSkillData;
}

export async function manageActiveEffectForAutoSkillsFeature(
  senseData: SenseData,
  selectedToken: Token,
  valSkillRoll: number,
) {
  // for(const selectedToken of selectedTokens){
    const setAeToRemove = new Set<string>();
    const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>selectedToken.actor?.data.effects;
    if (senseData?.conditionType === 'sense') {
      // const senseId = senseData.id;
      // const effect = AtcvEffect.toEffectFromAtcvEffect(AtcvEffect.fromSenseData(senseData, valSkillRoll, false));
      //const effect = <Effect>await ConditionalVisibilityEffectDefinitions.effect(senseId);
      const effect = await retrieveAndMergeEffect(
        senseData.id, senseData.name,
        0, valSkillRoll
      );
      if (effect) {
        if (valSkillRoll == 0 || valSkillRoll < -1) {
          // await API.removeEffectOnToken(selectedToken.id, i18n(<string>effect?.name));
          const effectToRemove = <ActiveEffect>(
            actorEffects.find((activeEffect) => isStringEquals(<string>activeEffect?.data?.label, <string>effect?.name))
          );
          if (effectToRemove) {
            setAeToRemove.add(<string>effectToRemove.id);
          }
          //await repairAndUnSetFlag(selectedToken, senseId);
        } else {
          const atcvEffectFlagData = AtcvEffect.fromEffect(selectedToken.document, effect);
          if (atcvEffectFlagData) {
            atcvEffectFlagData.visionLevelValue = valSkillRoll;
            //await repairAndSetFlag(selectedToken, senseId, atcvEffectFlagData);
            await API.addEffectOnToken(selectedToken.id,effect.name,effect);
          }
        }
      } else {
        warn(`Can't find effect definition for sense with id '${senseData.id}' and name '${senseData.name}'`, true);
      }
    }

    if (senseData?.conditionType === 'condition') {
      // const conditionId = senseData.id;
      // const effect = AtcvEffect.toEffectFromAtcvEffect(AtcvEffect.fromSenseData(senseData, valSkillRoll, false));
      //const effect = <Effect>await ConditionalVisibilityEffectDefinitions.effect(conditionId);
      const effect = await retrieveAndMergeEffect(
        senseData.id, senseData.name,
        0, valSkillRoll
      );
      if (effect) {
        if (valSkillRoll == 0) {
          // await API.removeEffectOnToken(selectedToken.id, i18n(<string>effect?.name));
          const effectToRemove = <ActiveEffect>(
            actorEffects.find((activeEffect) => isStringEquals(<string>activeEffect?.data?.label, <string>effect?.name))
          );
          if (effectToRemove) {
            setAeToRemove.add(<string>effectToRemove.id);
          }
          //await repairAndUnSetFlag(selectedToken, conditionId);
        } else {
          const atcvEffectFlagData = AtcvEffect.fromEffect(selectedToken.document, effect);
          if (atcvEffectFlagData) {
            atcvEffectFlagData.visionLevelValue = valSkillRoll;
            //await repairAndSetFlag(selectedToken, conditionId, atcvEffectFlagData);
            await API.addEffectOnToken(selectedToken.id,effect.name,effect);
          }
        }
      } else {
        warn(`Can't find effect definition for condition with id '${senseData.id}' and name '${senseData.name}'`, true);
      }
    }
    // FINALLY REMVE ALL THE ACTIVE EFFECT
    if (setAeToRemove.size > 0) {
      await API.removeEffectFromIdOnTokenMultiple(<string>selectedToken.id, Array.from(setAeToRemove));
    }
  // }
}

export async function retrieveAndMergeEffect(
  atcvId:string, atcvName:string, 
  distance:number, visionLevel:number):Promise<Effect|undefined>{
  let effectFounded: Effect | undefined = undefined;
  let changesTmp: any[] = [];

  // I also added this for specifically checking for custom effects.
  // It will return undefined if it doesn't exist:
  let effectToFoundByName = i18n(atcvName);
  if (!effectToFoundByName.endsWith('(CV)')) {
    effectToFoundByName = effectToFoundByName + ' (CV)';
  }

  // TRY FROM DFRED
  // Check for dfred convenient effect and retrieve the effect with the specific name
  // https://github.com/DFreds/dfreds-convenient-effects/issues/110
  //@ts-ignore
  if (game.modules.get('dfreds-convenient-effects')?.active && game.dfreds && game.dfreds.effectInterface) {
    //@ts-ignore
    const dfredEffect = <Effect>await game.dfreds.effectInterface.findCustomEffectByName(effectToFoundByName);
    if (dfredEffect) {
      if (game.user?.isGM) {
        info(
          `ATTENTION the module 'DFreds Convenient Effects' has a effect with name '${effectToFoundByName}', so we use that, edit that effect if you want to apply a customize solution`,
        );
      }
      if (!dfredEffect.atcvChanges) {
        dfredEffect.atcvChanges = [];
      }
      
      changesTmp = retrieveEffectChangeDataFromEffect(dfredEffect);
      changesTmp = changesTmp.filter((c) => !c.key.startsWith(`data.`));
      // cHECK FOR VALUE
      let foundedFlagVisionValue = false;
      for (const obj of changesTmp) {
        if (obj.key === 'ATCV.' + atcvId && 
          obj.value != String(visionLevel)) {
          obj.value = String(visionLevel);
          foundedFlagVisionValue = true;
          break;
        }
      }
      if (!foundedFlagVisionValue) {
        for (const obj of changesTmp) {
          if (obj.key === 'ATCV.' + atcvId && 
            obj.value != String(visionLevel)) {
            obj.value = String(visionLevel);
            foundedFlagVisionValue = true;
            break;
          }
        }
      }
      /*
      if (!foundedFlagVisionValue) {
        // 2022-05-26 check for duplicate
        const valueKey = retrieveAtcvVisionLevelKeyFromChanges(changesTmp);
        if (!valueKey) {
          senseDataEffect = AtcvEffect.mergeWithSensedataDefault(senseDataEffect);
          if (!senseDataEffect.visionName.endsWith('(CV)')) {
            senseDataEffect.visionName = senseDataEffect.visionName + ' (CV)';
          }
          changesTmp = retrieveEffectChangeDataFromAtcvEffect(senseDataEffect);
          foundedFlagVisionValue = true;
        }
      }
      */
      if (!foundedFlagVisionValue) {
        changesTmp.push(<any>{
          key: 'ATCV.' + atcvId,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: String(visionLevel),
          priority: 5,
        });
      }
      // CHECK FOR TYPE
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
  // If no dfred effect is founded
  if(!effectFounded){
    if (game.user?.isGM) {
      info(
        `ATTENTION the module 'DFreds Convenient Effects' NOT has a effect with name '${effectToFoundByName}', so we don't use that, edit that effect and rename if you want to apply a customize solution`,
      );
    }

    const effectsDefinition = await ConditionalVisibilityEffectDefinitions.all(distance, visionLevel);
    effectFounded = <Effect>effectsDefinition.find((effect: Effect) => {
      return (
        isStringEquals(effect.customId, atcvId) ||
        isStringEquals(effect.name, effectToFoundByName)
      );
    });
  }
  if(!effectFounded){
    let allSensesAndConditions: SenseData[] = [];
    const senses = API.SENSES;
    const conditions = API.CONDITIONS;
    allSensesAndConditions = mergeByProperty(allSensesAndConditions, senses, 'id');
    allSensesAndConditions = mergeByProperty(allSensesAndConditions, conditions, 'id');
    for (const senseData of allSensesAndConditions) {
      if (isStringEquals(atcvId, senseData.id) || isStringEquals(effectToFoundByName, senseData.name)) {
        effectFounded = AtcvEffect.toEffectFromAtcvEffect(AtcvEffect.fromSenseData(senseData, visionLevel, false));
        if(effectFounded){
          break;
        }
      }
    }
  }
  
  if(!effectFounded){
    warn(`No effect is been founded with name '${effectToFoundByName}'`, true);
    return undefined;
  }

  // Add some feature if is a sense or a condition
  const origin = undefined;
  const overlay = false;
  const disabled = false;

  const isSense = API.SENSES.find((sense: SenseData) => {
    return isStringEquals(sense.id, <string>effectFounded?.customId) || isStringEquals(i18n(sense.name), effectToFoundByName);
  });
  const isCondition = API.CONDITIONS.find((sense: SenseData) => {
    return isStringEquals(sense.id, <string>effectFounded?.customId) || isStringEquals(i18n(sense.name), effectToFoundByName);
  });
  
  // Force check for make condition temporary and sense passive
  if (isSense) {
    effectFounded.isTemporary = false; // passive ae
  } else {
    effectFounded.isTemporary = true;
    if (!effectFounded.flags?.core?.statusId) {
      // Just make sure the effect is built it right
      if (!effectFounded.flags) {
        effectFounded.flags = {};
      }
      if (!effectFounded.flags.core) {
        effectFounded.flags.core = {};
      }
      effectFounded.flags.core.statusId = effectFounded._id;
    }
  }
  effectFounded.transfer = !disabled;
  if (!i18n(effectFounded.name).endsWith('(CV)')) {
    effectFounded.name = i18n(effectFounded.name) + ' (CV)';
  }
  // BUG ???
  //const data = effectFounded.convertToActiveEffectData({ origin, overlay });
  //effectFounded.origin = EffectSupport.prepareOriginForToken(token);
  effectFounded.overlay = overlay;
  return effectFounded;
}
