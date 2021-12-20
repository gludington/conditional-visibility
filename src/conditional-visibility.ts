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
import { getGame, CONDITIONAL_VISIBILITY_MODULE_NAME, registerSettings } from './module/settings';
import { preloadTemplates } from './module/preloadTemplates';
import { ConditionalVisibility } from './module/ConditionalVisibility';
import { readyHooks } from './module/Hooks';

declare global {
  interface Window {
    Senses: ConditionalVisibility;
  }
}

export let debugEnabled = 0;
// 0 = none, warnings = 1, debug = 2, all = 3
export const debug = (...args: any[]): void => {
  if (debugEnabled > 1) console.log(`DEBUG:${CONDITIONAL_VISIBILITY_MODULE_NAME} | `, ...args);
};
export const log = (...args: any[]): void => console.log(`${CONDITIONAL_VISIBILITY_MODULE_NAME} | `, ...args);
export const warn = (...args: any[]): void => {
  if (debugEnabled > 0) console.warn(`${CONDITIONAL_VISIBILITY_MODULE_NAME} | `, ...args);
};
export const error = (...args: any[]): void => console.error(`${CONDITIONAL_VISIBILITY_MODULE_NAME} | `, ...args);
export const timelog = (...args: any[]): void => warn(`${CONDITIONAL_VISIBILITY_MODULE_NAME} | `, Date.now(), ...args);
export const i18n = (key: string): string => {
  return getGame().i18n.localize(key);
};
export const i18nFormat = (key: string, data = {}): string => {
  return getGame().i18n.format(key, data);
};

export const setDebugLevel = (debugText: string): void => {
  debugEnabled = { none: 0, warn: 1, debug: 2, all: 3 }[debugText] || 0;
  // 0 = none, warnings = 1, debug = 2, all = 3
  if (debugEnabled >= 3) CONFIG.debug.hooks = true;
};

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  log(' init ' + CONDITIONAL_VISIBILITY_MODULE_NAME);
  // Assign custom classes and constants here

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();

  // Register custom sheets (if any)
});

Hooks.once('socketlib.ready', () => {
  //@ts-ignore
  ConditionalVisibility.SOCKET = socketlib.registerModule(CONDITIONAL_VISIBILITY_MODULE_NAME);
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', async function () {
  // Do anything once the module is ready
  readyHooks();
});

Hooks.once('libChangelogsReady', function () {
  //@ts-ignore
  libChangelogs.register(
    CONDITIONAL_VISIBILITY_MODULE_NAME,
    `
    - Sync with [szefo09](https://github.com/szefo09/conditional-visibility) (2021-12-20)
    - Add some little check for typescript code
    `,
    'minor',
  );
});
