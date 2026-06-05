import { useEffect, useState, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { checkForUpdates, findApkAsset, type UpdateCheckResult, type ReleaseInfo } from '../services/updateService';
import { useTranslation } from 'react-i18next';

export function useUpdateCheck() {
  const { t } = useTranslation();
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [checking, setChecking] = useState(false);

  const checkUpdates = useCallback(async (force = false) => {
    setChecking(true);
    try {
      const result = await checkForUpdates(force);
      setUpdateInfo(result);
      return result;
    } finally {
      setChecking(false);
    }
  }, []);

  const showUpdateModal = useCallback((release: ReleaseInfo) => {
    const apkUrl = findApkAsset(release);
    const message = apkUrl
      ? `${t('update.availableDesc')}\n\n${t('update.version')}: ${release.tagName}`
      : `${t('update.availableDesc')}\n\n${t('update.version')}: ${release.tagName}\n\n${t('update.visitPage')}`;

    Alert.alert(
      t('update.availableTitle'),
      message,
      [
        {
          text: t('update.later'),
          style: 'cancel',
        },
        {
          text: apkUrl ? t('update.download') : t('update.openPage'),
          onPress: () => {
            if (apkUrl) {
              Linking.openURL(apkUrl);
            } else {
              Linking.openURL(release.htmlUrl);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [t]);

  // Auto-check on mount (once per day)
  useEffect(() => {
    checkUpdates(false);
  }, [checkUpdates]);

  return {
    updateInfo,
    checking,
    checkUpdates,
    showUpdateModal,
  };
}