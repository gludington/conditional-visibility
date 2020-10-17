export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to "modules/senses/templates"
		"modules/conditional-visibility/templates/extra_senses.html",
		"modules/conditional-visibility/templates/stealth_hud.html",
		"modules/conditional-visibility/templates/help_dialog.html"
	];
	return loadTemplates(templatePaths);
}
