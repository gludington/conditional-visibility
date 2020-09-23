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
	console.log('senses | Initializing conditional-visibility');

	// Assign custom classes and constants here
	
	// Register custom module settings
	registerSettings();
	
	// Preload Handlebars templates
	await preloadTemplates();

	ack: FormApplication ;
	// Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function() {
	// Do anything after initialization but before
	// ready
	game.settings.register("senses", "devilssight", {
        name: game.i18n.localize("senses.ConsumeCharge.Name"),
        hint: game.i18n.localize("dynamiceffects.ConsumeCharge.Hint"),
        scope: "world",
        default: true,
        config: true,
        type: Boolean
    });
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function() {
	// Do anything once the module is ready
	console.error("Ready");
    const sightLayer = canvas.layers.find(layer => {
        return layer.__proto__.constructor.name === 'SightLayer'
    });

    const realRestrictVisibility = sightLayer.restrictVisibility;

    const senses:ConditionalVisibilty = new ConditionalVisibilty(sightLayer);
    const compare = (values, container) => {
        if (values.length === 0 || container.length === 0) {
            return false;
        }
        for (let val in values) {
            if (container.indexOf(val) >= 0) {
                return true;
            }
        }
        return false;
    }
    sightLayer.restrictVisibility = () => {
        
        realRestrictVisibility.call(sightLayer);
        const restricted = canvas.tokens.placeables.filter(token => token.visible);
        if (restricted && restricted.length > 0) {
            let srcTokens = new Array<Token>();
            if (sightLayer.sources && sightLayer.sources.vision) {
                for (const [key, source] of sightLayer.sources.vision) {
                    if (key.startsWith("Token.")) {
                        const tok = canvas.tokens.placeables.find(tok => tok.id === key.substring("Token.".length))
                        if (tok) {
                            srcTokens.push(tok);
                        }
                    }
                }
            } else {
                if (game.user.isGM === false) {
                    srcTokens = game.user.character.getActiveTokens();
                }
            }
            if (srcTokens.length > 0) {
                const srcActorIds = srcTokens.map(sTok => sTok.data.actorId);
                for (let t of restricted) {
                    if (srcTokens.indexOf(t) < 0) {
                        let newVis = true;
                        if (t.data.flags[ConditionalVisibilty.MODULE_NAME]) {
                            if (t.data.flags[ConditionalVisibilty.MODULE_NAME].characters) {
                                newVis = compare(srcActorIds, t.data.flags[ConditionalVisibilty.MODULE_NAME].characters);
                            } else {
                                newVis = false;
                            }
                            if (!newVis) {
                                if (t.data.flags[ConditionalVisibilty.MODULE_NAME].statusConditions) {
                                    
                                } else {
                                    newVis = true;
                                }
                            }
                        }
                        t.visible = newVis;
                    }
                }
            }
        }
    }
    window.Senses = senses;
    // update sight layer, as custom decisons will not be executed the
    // first time through, and cannot be forced in setup
   sightLayer.update(); 	
	
});

// Add any additional hooks if necessary
Hooks.on("renderTokenHUD", (tokenHUD, html, data) => {
    if (game.user.isGM === true) {
        window.Senses.showHud(tokenHUD, html, data);
    }
});