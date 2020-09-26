export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to "modules/senses/templates"
		"modules/conditional-visibility/templates/visibility-conditions.html",
		"modules/conditional-visibility/templates/extra_senses.html"
	];
	return loadTemplates(templatePaths);
}
