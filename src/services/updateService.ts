import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const GITHUB_OWNER = 'juanlews';
const GITHUB_REPO = 'calendario-de-plantio';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface ReleaseInfo {
  tagName: string;
  name: string;
  body: string;
  htmlUrl: string;
  publishedAt: string;
  assets: Array<{
    name: string;
    browserDownloadUrl: string;
    size: number;
  }>;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseInfo?: ReleaseInfo;
  error?: string;
}

/**
 * Normalize version string for comparison (remove 'v' prefix if present)
 */
function normalizeVersion(version: string): string {
  return version.startsWith('v') ? version.slice(1) : version;
}

/**
 * Compare two version strings (semver-like)
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = normalizeVersion(v1).split('.').map(Number);
  const parts2 = normalizeVersion(v2).split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

/**
 * Get current app version from expo-constants
 */
export function getCurrentVersion(): string {
  // In Expo bare workflow, the version is in Constants.expoConfig?.version
  // or Constants.manifest?.version (deprecated)
  const version = Constants.expoConfig?.version || Constants.manifest?.version || '0.0.0';
  return version;
}

/**
 * Check if we should perform an automatic check (once per day)
 */
export async function shouldAutoCheck(): Promise<boolean> {
  try {
    const lastCheck = await SecureStore.getItemAsync('lastUpdateCheck');
    if (!lastCheck) return true;

    const lastCheckTime = parseInt(lastCheck, 10);
    const now = Date.now();
    return (now - lastCheckTime) >= CHECK_INTERVAL_MS;
  } catch {
    return true;
  }
}

/**
 * Save the timestamp of the last update check
 */
export async function saveLastCheckTime(): Promise<void> {
  try {
    await SecureStore.setItemAsync('lastUpdateCheck', Date.now().toString());
  } catch (error) {
    console.warn('Failed to save last update check time:', error);
  }
}

/**
 * Fetch latest release from GitHub
 */
export async function fetchLatestRelease(): Promise<ReleaseInfo | null> {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      tagName: data.tag_name,
      name: data.name || data.tag_name,
      body: data.body || '',
      htmlUrl: data.html_url,
      publishedAt: data.published_at,
      assets: data.assets || [],
    };
  } catch (error) {
    console.error('Failed to fetch latest release:', error);
    return null;
  }
}

/**
 * Find APK asset in release assets
 */
export function findApkAsset(release: ReleaseInfo): string | null {
  // Look for universal APK first, then any .apk
  const universalApk = release.assets.find(a => a.name.endsWith('-universal.apk') || a.name.includes('universal') && a.name.endsWith('.apk'));
  if (universalApk) return universalApk.browserDownloadUrl;

  const anyApk = release.assets.find(a => a.name.endsWith('.apk'));
  if (anyApk) return anyApk.browserDownloadUrl;

  // Fallback to release page
  return release.htmlUrl;
}

/**
 * Main function to check for updates
 */
export async function checkForUpdates(force = false): Promise<UpdateCheckResult> {
  const currentVersion = getCurrentVersion();

  // If not forced, check if we should auto-check
  if (!force) {
    const shouldCheck = await shouldAutoCheck();
    if (!shouldCheck) {
      return {
        hasUpdate: false,
        currentVersion,
        latestVersion: currentVersion,
        error: 'Auto-check interval not reached',
      };
    }
  }

  await saveLastCheckTime();

  const release = await fetchLatestRelease();
  if (!release) {
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      error: 'Failed to fetch release info',
    };
  }

  const latestVersion = release.tagName;
  const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

  return {
    hasUpdate,
    currentVersion,
    latestVersion,
    releaseInfo: release,
  };
}

/**
 * Open the release URL in browser (for manual download)
 */
export async function openReleaseUrl(url: string): Promise<void> {
  // We'll use Linking from react-native
  const { Linking } = await import('react-native');
  await Linking.openURL(url);
}