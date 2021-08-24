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
import { getGame, CONDITIONAL_VISIBILITY_MODULE_NAME, registerSettings } from "./module/settings.js";
import { preloadTemplates } from "./module/preloadTemplates.js";
import { ConditionalVisibility } from "./module/ConditionalVisibility.js";
import { readyHooks } from "./module/Hooks.js";
export let debugEnabled = 0;
// 0 = none, warnings = 1, debug = 2, all = 3
export const debug = (...args) => {
    if (debugEnabled > 1)
        console.log(`DEBUG:${CONDITIONAL_VISIBILITY_MODULE_NAME} | `, ...args);
};
export const log = (...args) => console.log(`${CONDITIONAL_VISIBILITY_MODULE_NAME} | `, ...args);
export const warn = (...args) => {
    if (debugEnabled > 0)
        console.warn(`${CONDITIONAL_VISIBILITY_MODULE_NAME} | `, ...args);
};
export const error = (...args) => console.error(`${CONDITIONAL_VISIBILITY_MODULE_NAME} | `, ...args);
export const timelog = (...args) => warn(`${CONDITIONAL_VISIBILITY_MODULE_NAME} | `, Date.now(), ...args);
export const i18n = (key) => {
    return getGame().i18n.localize(key);
};
export const i18nFormat = (key, data = {}) => {
    return getGame().i18n.format(key, data);
};
export const setDebugLevel = (debugText) => {
    debugEnabled = { none: 0, warn: 1, debug: 2, all: 3 }[debugText] || 0;
    // 0 = none, warnings = 1, debug = 2, all = 3
    if (debugEnabled >= 3)
        CONFIG.debug.hooks = true;
};
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
    //  if (getGame().modules.get("levels")?.active) {
    //    return error("Conditional Visibility does not currently work with Levels module. Initialization stopped.");
    //  }
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
Hooks.once('setup', function () { });
/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', async function () {
    // Do anything once the module is ready
    readyHooks();
});
