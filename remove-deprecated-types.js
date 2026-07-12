const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Remove deprecated TypeScript type packages
delete packageJson.dependencies['@types/bcryptjs'];
delete packageJson.dependencies['@types/dompurify'];

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Removed deprecated TypeScript type packages from package.json');
