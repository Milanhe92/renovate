import semver from 'semver';
import { NewValueConfig } from '../common';

const fromParam = /^\s*from\s*:\s*"([^"]+)"\s*$/;
const fromRange = /^\s*"([^"]+)"\s*\.\.\.\s*$/;
const binaryRange = /^\s*"([^"]+)"\s*(\.\.[.<])\s*"([^"]+)"\s*$/;
const toRange = /^\s*(\.\.[.<])\s*"([^"]+)"\s*$/;

function toSemverRange(range: string): string {
  if (fromParam.test(range)) {
    const [, version] = fromParam.exec(range);
    if (semver.valid(version)) {
      const nextMajor = `${semver.major(version) + 1}.0.0`;
      return `>=${version} <${nextMajor}`;
    }
  } else if (fromRange.test(range)) {
    const [, version] = fromRange.exec(range);
    if (semver.valid(version)) {
      return `>=${version}`;
    }
  } else if (binaryRange.test(range)) {
    const [, fromVersion, op, toVersion] = binaryRange.exec(range);
    if (semver.valid(fromVersion) && semver.valid(toVersion)) {
      return op === '..<'
        ? `>=${fromVersion} <${toVersion}`
        : `>=${fromVersion} <=${toVersion}`;
    }
  } else if (toRange.test(range)) {
    const [, op, toVersion] = toRange.exec(range);
    if (semver.valid(toVersion)) {
      return op === '..<' ? `<${toVersion}` : `<=${toVersion}`;
    }
  }
  return null;
}

function getNewValue({
  currentValue,
  fromVersion,
  toVersion,
}: NewValueConfig): string {
  if (fromParam.test(currentValue)) {
    if (currentValue.includes(fromVersion)) {
      return currentValue.replace(fromVersion, toVersion.replace(/^v/, ''));
    }
    return toVersion.replace(/^v/, '');
  }
  if (fromRange.test(currentValue)) {
    const [, version] = fromRange.exec(currentValue);
    return currentValue.replace(version, toVersion);
  }
  if (binaryRange.test(currentValue)) {
    const [, , , version] = binaryRange.exec(currentValue);
    return currentValue.replace(version, toVersion);
  }
  if (toRange.test(currentValue)) {
    const [, , version] = toRange.exec(currentValue);
    return currentValue.replace(version, toVersion);
  }
  return currentValue;
}

export { toSemverRange, getNewValue };
