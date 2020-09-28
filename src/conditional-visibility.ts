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
	// Do anything once the module is ready
	console.log('conditional-visibility | Ready conditional-visibility');
    const sightLayer = canvas.layers.find(layer => {
        return layer.__proto__.constructor.name === 'SightLayer'
    });

    ConditionalVisibilty.initialize(sightLayer);

    // update sight layer, as custom decisons will not be executed the
    // first time through, and cannot be forced in setup
   await sightLayer.update(); 	
	
});


// Add any additional hooks if necessary
Hooks.on("renderTokenConfig", async (tokenConfig, jQuery, data) => {
    const visionTab = $('div.tab[data-tab="vision"]');
    const extraSenses = await renderTemplate("modules/conditional-visibility/templates/extra_senses.html", tokenConfig.object.data.flags[ConditionalVisibilty.MODULE_NAME] || {});
    visionTab.append(extraSenses);
});

Hooks.on("preUpdateToken", (thing, d, update, options, userId) => {
    ConditionalVisibilty.INSTANCE.checkRedraw(update);
})
