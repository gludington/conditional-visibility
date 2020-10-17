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
import { registerSettings } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';
import { ConditionalVisibility } from './module/ConditionalVisibility';
import * as Constants from './module/Constants';

declare global {
    interface Window { Senses: ConditionalVisibility }
}
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function() {
	console.log(Constants.MODULE_NAME + ' | init ' + Constants.MODULE_NAME);
	// Assign custom classes and constants here
	
	// Register custom module settings
	registerSettings();
	
	// Preload Handlebars templates
	await preloadTemplates();

	// Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function() {

});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', async function() {
	// Do anything once the module is ready
	console.log(Constants.MODULE_NAME + ' | Ready ' + Constants.MODULE_NAME);
    const sightLayer = canvas.layers.find(layer => {
        return layer.__proto__.constructor.name === 'SightLayer'
    });

    ConditionalVisibility.initialize(sightLayer, canvas.hud.token);	
});

// Add any additional hooks if necessary
Hooks.on("renderTokenConfig", (tokenConfig, html, data) => {
    ConditionalVisibility.INSTANCE.onRenderTokenConfig(tokenConfig, html, data);
});

Hooks.on("renderTokenHUD", (app, html, data) => {
    ConditionalVisibility.INSTANCE.onRenderTokenHUD(app, html, data);
});

Hooks.on("preUpdateToken", (thing, token, update, options, userId) => {
    ConditionalVisibility.INSTANCE.onPreUpdateToken(token, update);
})
