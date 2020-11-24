var fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('src/module.json', 'utf8'));
// first argument is node, second is the filename of the script, third is the version we pass in our workflow.
// expected tag format is 'refs/tags/v{major}.{minor}.{patch}"
const tagVersion = process.argv[2].split('/').slice(-1)[0]; 
if (!tagVersion || !tagVersion.startsWith('v')) {
  console.error(`Invalid version specified: ${tagVersion}`);
  process.exitCode = 1;
} else {
  manifest.version = tagVersion.substring(1); // strip the 'v'-prefix
  manifest.download = `https://github.com/gludington/conditional-visibility/releases/download/conditional-visibility-${tagVersion}.zip`
  manifest.manifest = `https://github.com/gludington/conditional-visibility/releases/download/${tagVersion}/module.json`,
  manifest.changelog= `https://github.com/gludington/conditional-visibility/blob/${tagVersion}/CHANGELOG.md`,
  manifest.readme = `https://github.com/gludington/conditional-visibility/blob/${tagVersion}/README.md`,
  fs.writeFileSync('src/module.json', JSON.stringify(manifest, null, 4)); // pretty print JSON back to module.json
  console.log(tagVersion);
}