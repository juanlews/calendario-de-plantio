import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

interface Props {
  selectedType: 'photo' | 'video';
  selectedMediaUri: string | null;
  onMediaSelected: (uri: string) => void;
  onMediaRemoved: () => void;
  theme: any;
}

export const MediaPicker: React.FC<Props> = ({
  selectedType,
  selectedMediaUri,
  onMediaSelected,
  onMediaRemoved,
  theme,
}) => {
  const { t } = useTranslation();

  const pickMedia = async (useCamera: boolean) => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (useCamera) {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPerm.granted) {
          Alert.alert(t('journal.validationPhoto'), 'Permita acesso à câmera nas configurações.');
          return;
        }
        result = await (selectedType === 'video'
          ? ImagePicker.launchCameraAsync({
              mediaTypes: ['videos'],
              quality: 0.7,
              videoMaxDuration: 60,
            })
          : ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.8,
              allowsEditing: false,
            }));
      } else {
        const galleryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!galleryPerm.granted) {
          Alert.alert(t('journal.validationPhoto'), 'Permita acesso à galeria nas configurações.');
          return;
        }
        result = await (selectedType === 'video'
          ? ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['videos'],
              quality: 0.7,
            })
          : ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
              allowsEditing: false,
            }));
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onMediaSelected(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Erro ao selecionar mídia:', err);
      Alert.alert(t('journal.validationPhoto'), t('journal.validationPhotoMsg'));
    }
  };

  if (selectedMediaUri) {
    return (
      <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
        {selectedType === 'photo' ? (
          <Image source={{ uri: selectedMediaUri }} style={styles.mediaPreview} resizeMode="cover" />
        ) : (
          <View style={[styles.videoPreview, { backgroundColor: theme.colors.elevation.level1 }]}>
            <Text style={{ fontSize: 48 }}>🎥</Text>
            <Text style={[styles.videoPreviewText, { color: theme.colors.onSurfaceVariant }]}>
              {t('journal.video')}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.mediaRemoveBtn, { backgroundColor: theme.colors.errorContainer }]}
          onPress={onMediaRemoved}
        >
          <Text style={[styles.mediaRemoveText, { color: theme.colors.onErrorContainer }]}>
            ✕ {t('journal.deleteBtn')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.fieldGroup, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        style={[
          styles.mediaBtn,
          {
            backgroundColor: theme.colors.elevation.level1,
            borderColor: theme.colors.primary,
            marginBottom: 10,
          },
        ]}
        onPress={() => pickMedia(true)}
      >
        <Text style={styles.mediaBtnIcon}>{selectedType === 'photo' ? '📷' : '🎥'}</Text>
        <Text style={[styles.mediaBtnText, { color: theme.colors.primary }]}>
          {selectedType === 'photo' ? t('journal.takePhoto') : t('journal.recordVideo')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.mediaBtn,
          {
            backgroundColor: theme.colors.elevation.level1,
            borderColor: theme.colors.outlineVariant,
          },
        ]}
        onPress={() => pickMedia(false)}
      >
        <Text style={styles.mediaBtnIcon}>🖼️</Text>
        <Text style={[styles.mediaBtnText, { color: theme.colors.onSurfaceVariant }]}>
          {selectedType === 'photo' ? t('journal.photoLibrary') : t('journal.videoLibrary')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: { padding: 16, marginTop: 1 },
  mediaBtn: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  mediaBtnIcon: { fontSize: 40, marginBottom: 8 },
  mediaBtnText: { fontSize: 14, fontWeight: '600' },
  mediaPreview: { width: '100%', height: 250, borderRadius: 12, marginBottom: 10 },
  videoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPreviewText: { fontSize: 14, marginTop: 8 },
  mediaRemoveBtn: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  mediaRemoveText: { fontSize: 14, fontWeight: '600' },
});
