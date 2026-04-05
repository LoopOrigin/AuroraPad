const { execSync } = require('child_process');

const INITIAL_VERSION = '0.1.0';
const SEMVER_TAG_PATTERN = /^v(\d+)\.(\d+)\.(\d+)$/;

function run(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

function getLatestTag() {
  const tags = run('git tag --list --sort=-v:refname')
    .split('\n')
    .map((tag) => tag.trim())
    .filter((tag) => SEMVER_TAG_PATTERN.test(tag));

  return tags[0] || '';
}

function getHeadTag() {
  const tags = run('git tag --points-at HEAD --list')
    .split('\n')
    .map((tag) => tag.trim())
    .filter((tag) => SEMVER_TAG_PATTERN.test(tag));

  return tags[0] || '';
}

function parseVersion(tag) {
  const match = tag.match(SEMVER_TAG_PATTERN);

  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function bumpVersion(version, bumpType) {
  if (bumpType === 'major') {
    return `${version.major + 1}.0.0`;
  }

  if (bumpType === 'minor') {
    return `${version.major}.${version.minor + 1}.0`;
  }

  return `${version.major}.${version.minor}.${version.patch + 1}`;
}

function detectBumpType(commits) {
  if (!commits.trim()) {
    return 'patch';
  }

  const entries = commits
    .split('\x1e')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [subject = '', body = ''] = entry.split('\x1f');
      return { subject, body };
    });

  const hasBreaking = entries.some(({ subject, body }) => {
    return /!:\s/.test(subject) || /^.+\(.+\)!:\s/.test(subject) || body.includes('BREAKING CHANGE:');
  });

  if (hasBreaking) {
    return 'major';
  }

  const hasFeature = entries.some(({ subject }) => /^feat(\(.+\))?:\s/i.test(subject));

  if (hasFeature) {
    return 'minor';
  }

  return 'patch';
}

function main() {
  const headTag = getHeadTag();

  if (headTag) {
    const version = headTag.replace(/^v/, '');
    console.log(`version=${version}`);
    console.log(`tag=${headTag}`);
    return;
  }

  const latestTag = getLatestTag();

  if (!latestTag) {
    console.log(`version=${INITIAL_VERSION}`);
    console.log(`tag=v${INITIAL_VERSION}`);
    return;
  }

  const latestVersion = parseVersion(latestTag);
  const commitRange = `${latestTag}..HEAD`;
  const commits = run(`git log ${commitRange} --format=%s%x1f%b%x1e`);
  const bumpType = detectBumpType(commits);
  const nextVersion = bumpVersion(latestVersion, bumpType);

  console.log(`version=${nextVersion}`);
  console.log(`tag=v${nextVersion}`);
}

main();
