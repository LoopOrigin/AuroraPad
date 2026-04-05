const fs = require('fs');
const path = require('path');

const nextVersion = process.argv[2];

if (!nextVersion) {
  console.error('Usage: node scripts/set-version.js <version>');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const packageLockPath = path.join(rootDir, 'package-lock.json');

function updateJsonVersion(filePath) {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  json.version = nextVersion;

  if (json.packages && json.packages['']) {
    json.packages[''].version = nextVersion;
  }

  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`);
}

updateJsonVersion(packageJsonPath);

if (fs.existsSync(packageLockPath)) {
  updateJsonVersion(packageLockPath);
}

console.log(`Updated project version to ${nextVersion}`);
