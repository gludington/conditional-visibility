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
import { ConditionalVisibilty } from './module/ConditionalVisibility';

declare global {
    interface Window { Senses: ConditionalVisibilty }
}
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function() {
	console.log('conditional-visibility | Initializing conditional-visibility');
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
	if (game.system.id === 'pf2e') {
		ui.notifications.error(game.i18n.format("CONVIS.unsupportedsystem", {system: game.system.id}))
	}
	// Do anything once the module is ready
	console.log('conditional-visibility | Ready conditional-visibility');
    const sightLayer = canvas.layers.find(layer => {
        return layer.__proto__.constructor.name === 'SightLayer'
    });

    ConditionalVisibilty.initialize(sightLayer, canvas.hud.token);	
});


// Add any additional hooks if necessary
Hooks.on("renderTokenConfig", (tokenConfig, html, data) => {
    ConditionalVisibilty.INSTANCE.onRenderTokenConfig(tokenConfig, html, data);
});

Hooks.on("renderTokenHUD", (app, html, data) => {
    ConditionalVisibilty.INSTANCE.onRenderTokenHUD(app, html, data);
});

Hooks.on("preUpdateToken", (thing, token, update, options, userId) => {
    ConditionalVisibilty.INSTANCE.onPreUpdateToken(token, update);
})
