import { ConditionalVisibility } from "./ConditionalVisibility"
import * as Constants from "./Constants";

export const registerSettings = function() {

	game.settings.register(Constants.MODULE_NAME, "autoStealth", {
		name: game.i18n.localize("CONVIS.settings.autoStealth.name"),
		hint: game.i18n.localize("CONVIS.settings.autoStealth.hint"),
		config: true,
		type: Boolean,
		default: false,
		onChange: value => console.log(Constants.MODULE_NAME + ' | autoStealth set to ' + value)
	})

	game.settings.register(Constants.MODULE_NAME, "popup-version", {
		scope: "world",
		config: false,
		type: String,
		default: "0.0.9",
	  });
	  
	// Register any custom module settings here
	ConditionalVisibility.onInit();	
}
