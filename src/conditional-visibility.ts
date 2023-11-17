/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */
// Import TypeScript modules
import { checkSystem, registerSettings } from './module/settings';
import { preloadTemplates } from './module/preloadTemplates';
import { registerHotkeys } from './module/hotkeys';
import CONSTANTS from './module/constants';
import { dialogWarning, error, log } from './module/lib/lib';
import { initHooks, readyHooks, setupHooks } from './module/module';
import type API from './module/api';

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', function () {
  log(' init ' + CONSTANTS.MODULE_NAME);
  // Assign custom classes and constants here

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  preloadTemplates();

  // Register custom sheets (if any)
  initHooks();
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
  setupHooks();
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function () {
  if (!game.modules.get('lib-wrapper')?.active && game.user?.isGM) {
    let word = 'install and activate';
    if (game.modules.get('lib-wrapper')) word = 'activate';
    throw error(`Requires the 'libWrapper' module. Please ${word} it.`);
  }
  if (!game.modules.get('socketlib')?.active && game.user?.isGM) {
    let word = 'install and activate';
    if (game.modules.get('socketlib')) word = 'activate';
    throw error(`Requires the 'socketlib' module. Please ${word} it.`);
  }
  if (game.modules.get('less-fog')?.active && game.user?.isGM) {
    dialogWarning(
      `With less-fog module enabled and active. The module "less fog" breaks the dm view of tokens. The gm still see an invisible token as other tokens, but the players don't so is a minor issue. The solution is just make sure the module 'Less Fog' settings 'Reveal Tokens' and 'Reveal to All Players' are set to false (unchecked box) both.`,
    );
  }
  if (game.modules.get('levels')?.active && game.user?.isGM) {
    dialogWarning(
      `With levels module enabled and active, <b>if the scene is with "Token vision" set to false (unchecked box)</b>, after selected a token and click on the canvas with the option "Release on left click" enable the hidden token are visible for a small instant this is a incompatibility with the [Levels](https://github.com/theripper93/Levels) module i cannot solve, the simple solution is just enable the token vision on the current scene.`,
    );
  }

  // if (!isGMConnected()) {
  //   warn(`Requires a GM to be connected for players to be able to loot item piles.`, true);
  // }

  // Do anything once the module is ready
  readyHooks();
});

/* ------------------------------------ */
/* Other Hooks							*/
/* ------------------------------------ */

export interface ConditionalVisibilityModuleData {
  api: typeof API;
  socket: any;
}

/**
 * Initialization helper, to set API.
 * @param api to set to game module.
 */
export function setApi(api: typeof API): void {
  const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as ConditionalVisibilityModuleData;
  data.api = api;
}

/**
 * Returns the set API.
 * @returns Api from games module.
 */
export function getApi(): typeof API {
  const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as ConditionalVisibilityModuleData;
  return data.api;
}

/**
 * Initialization helper, to set Socket.
 * @param socket to set to game module.
 */
export function setSocket(socket: any): void {
  const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as ConditionalVisibilityModuleData;
  data.socket = socket;
}

/*
 * Returns the set socket.
 * @returns Socket from games module.
 */
export function getSocket() {
  const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as ConditionalVisibilityModuleData;
  return data.socket;
}
