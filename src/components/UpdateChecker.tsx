import React from 'react';
import { Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { checkForUpdates, findApkAsset, type ReleaseInfo } from '../services/updateService';
import * as SecureStore from 'expo-secure-store';

const UPDATE_DISMISSED_KEY = 'updateDismissedVersion';

export function UpdateChecker({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    async function checkForUpdateOnStart() {
      // Only check once per app session
      if (checked) return;

      try {
        const result = await checkForUpdates(false); // auto-check (respects 24h interval)

        if (!mounted) return;

        if (result.hasUpdate && result.releaseInfo) {
          // Check if user already dismissed this version
          const dismissedVersion = await SecureStore.getItemAsync(UPDATE_DISMISSED_KEY);
          if (dismissedVersion === result.latestVersion) {
            setChecked(true);
            return;
          }

          const apkUrl = findApkAsset(result.releaseInfo);

          Alert.alert(
            t('update.availableTitle'),
            apkUrl
              ? `${t('update.availableDesc')}\n\n${t('update.version')}: ${result.releaseInfo.tagName}`
              : `${t('update.availableDesc')}\n\n${t('update.version')}: ${result.releaseInfo.tagName}\n\n${t('update.visitPage')}`,
            [
              {
                text: t('update.later'),
                style: 'cancel',
                onPress: () => {
                  // Don't save dismissal, just skip for this session
                  setChecked(true);
                },
              },
              {
                text: apkUrl ? t('update.download') : t('update.openPage'),
                onPress: async () => {
                  if (apkUrl) {
                    await Linking.openURL(apkUrl);
                  } else {
                    await Linking.openURL(result.releaseInfo!.htmlUrl);
                  }
                  // Mark as dismissed for this version
                  await SecureStore.setItemAsync(UPDATE_DISMISSED_KEY, result.latestVersion);
                  setChecked(true);
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          setChecked(true);
        }
      } catch (error) {
        console.error('Update check failed:', error);
        setChecked(true);
      }
    }

    checkForUpdateOnStart();

    return () => {
      mounted = false;
    };
  }, [checked, t]);

  return <>{children}</>;
}