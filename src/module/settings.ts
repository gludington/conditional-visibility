import { ConditionalVisibilty } from "./ConditionalVisibility"

export const registerSettings = function() {
	// Register any custom module settings here
	CONFIG.statusEffects.push('modules/conditional-visibility/icons/unknown.svg');
	CONFIG.statusEffects.push('modules/conditional-visibility/icons/foggy.svg');
	CONFIG.statusEffects.push('modules/conditional-visibility/icons/moon.svg');
	CONFIG.statusEffects.push('modules/conditional-visibility/icons/newspaper.svg');
	//game.settings.register(ConditionalVisibilty.MODULE_NAME, key, metadata)
}
