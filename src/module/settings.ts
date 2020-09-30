import { ConditionalVisibilty } from "./ConditionalVisibility"

export const registerSettings = function() {
	// Register any custom module settings here
	for (const effect of ConditionalVisibilty.EFFECTS.keys()) {
		//@ts-ignore
		CONFIG.statusEffects.push(effect);	
	}
	//game.settings.register(ConditionalVisibilty.MODULE_NAME, key, metadata)
}
