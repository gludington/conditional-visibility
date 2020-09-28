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

	ack: FormApplication ;
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
Hooks.once('ready', function() {
	// Do anything once the module is ready
	console.error("Ready");
    const sightLayer = canvas.layers.find(layer => {
        return layer.__proto__.constructor.name === 'SightLayer'
    });

    const realRestrictVisibility = sightLayer.restrictVisibility;
    
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
                const flags:any = {};
                flags.seeinvisible = srcTokens.some(sTok => {
                    return sTok.data.flags['conditional-visibility'] && 
                        (sTok.data.flags['conditional-visibility'].seeinvisible === true
                        || sTok.data.flags['conditional-visibility'].blindsight === true
                        || sTok.data.flags['conditional-visibility'].tremorsense === true
                        || sTok.data.flags['conditional-visibility'].truesight === true);
                });
                flags.seeobscured = srcTokens.some(sTok => {
                    return sTok.data.flags['conditional-visibility'] && 
                        (sTok.data.flags['conditional-visibility'].blindsight === true
                        || sTok.data.flags['conditional-visibility'].tremorsense === true);
                });
                flags.seeindarkness = srcTokens.some(sTok => {
                    return sTok.data.flags['conditional-visibility'] && 
                    (sTok.data.flags['conditional-visibility'].blindsight === true
                    || sTok.data.flags['conditional-visibility'].devilssight === true
                    || sTok.data.flags['conditional-visibility'].tremorsense === true
                    || sTok.data.flags['conditional-visibility'].truesight === true);
                });
                for (let t of restricted) {
                    if (srcTokens.indexOf(t) < 0) {
                        t.visible = compare(t.data.effects, flags);
                    }
                }
            }
        }
    }

    // update sight layer, as custom decisons will not be executed the
    // first time through, and cannot be forced in setup
   sightLayer.update(); 	
	
});

function compare(effects:any, flags:any): boolean {
    if (effects.length > 0) {
        const invisible = effects.some(eff => eff.endsWith('detective.svg'));
        if (invisible === true) {
            if (flags.seeinvisible === true) {
                return true;
            }
        }
        
        const obscured = effects.some(eff => eff.endsWith('foggy.svg'));
        if (obscured === true) {
            if (flags.seeobscured === true) {
                return true;
            }
        }
        const indarkness = effects.some(eff => eff.endsWith('moon.svg'));
        if (indarkness === true) {
            if (flags.seeindarkness === true) {
                return true;
            }
        }
        return false;
    } else {
        return true;
    }

}


// Add any additional hooks if necessary
Hooks.on("renderTokenHUD", (tokenHUD, html, data) => {
    if (game.user.isGM === true) {
        //window.Senses.showHud(tokenHUD, jQuery, data);
    }
});

Hooks.on("renderTokenConfig", async (tokenConfig, jQuery, data) => {
    const visionTab = $('div.tab[data-tab="vision"]');
    const extraSenses = await renderTemplate("modules/conditional-visibility/templates/extra_senses.html", tokenConfig.object.data.flags['conditional-visibility'] || {});
    visionTab.append(extraSenses);
});

Hooks.on("modifyDocument", (a,b,c,d) => {
    console.error(a, b, c, d);
});

Hooks.on("preUpdateToken", (a, b, c, d) => {
    console.error("PRE", a, b, c, d);
})
