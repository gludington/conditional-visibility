export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to "modules/senses/templates"
		"modules/conditional-visibility/templates/visibility-conditions.html"
	];
	return loadTemplates(templatePaths);
}
