export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to "modules/senses/templates"
		"modules/conditional-visibility/templates/extra_senses.html",
		"modules/conditional-visibility/templates/stealth_hud.html"
	];
	return loadTemplates(templatePaths);
}
