import { ConditionalVisibilty } from "./ConditionalVisibility"

export const registerSettings = function() {
	// Register any custom module settings here
	console.error(CONFIG.statusEffects);
	CONFIG.statusEffects.push('modules/conditional-visibility/icons/invisible.svg');
	//game.settings.register(ConditionalVisibilty.MODULE_NAME, key, metadata)
}
