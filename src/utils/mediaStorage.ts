import { Paths, Directory, File } from 'expo-file-system';
import { copyAsync, getInfoAsync, deleteAsync, makeDirectoryAsync } from 'expo-file-system';

/**
 * Get the Directory instance for media files of a planting.
 * Creates the directory if it doesn't exist.
 */
const getPlantingMediaDir = async (plantingId: string): Promise<Directory> => {
  const dir = new Directory(Paths.document, 'media', plantingId);
  try {
    dir.list();
  } catch {
    dir.createDirectory(plantingId);
    // makeDirectoryAsync fallback
    await makeDirectoryAsync(dir.uri, { intermediates: true });
  }
  return dir;
};

/**
 * Move a picked image/video to the planting media directory.
 * Returns the new local URI.
 */
export const saveMediaToPlanting = async (
  plantingId: string,
  entryId: string,
  sourceUri: string,
  mimeType: string,
): Promise<string> => {
  const dir = await getPlantingMediaDir(plantingId);
  const ext = mimeType.includes('video') ? '.mp4' : '.jpg';
  const destUri = `${dir.uri}/${entryId}${ext}`;

  await copyAsync({
    from: sourceUri,
    to: destUri,
  });

  return destUri;
};

/**
 * Delete all media files for a journal entry.
 */
export const deleteEntryMedia = async (plantingId: string, entryId: string): Promise<void> => {
  const dir = await getPlantingMediaDir(plantingId);
  const jpgPath = `${dir.uri}/${entryId}.jpg`;
  const mp4Path = `${dir.uri}/${entryId}.mp4`;

  const [jpgInfo, mp4Info] = await Promise.all([
    getInfoAsync(jpgPath),
    getInfoAsync(mp4Path),
  ]);

  if (jpgInfo.exists) await deleteAsync(jpgPath);
  if (mp4Info.exists) await deleteAsync(mp4Path);
};

/**
 * Delete all media for a planting (used when plant is deleted).
 */
export const deletePlantingMedia = async (plantingId: string): Promise<void> => {
  const dirPath = `${Paths.document.uri}media/${plantingId}`;
  const info = await getInfoAsync(dirPath);
  if (info.exists) {
    await deleteAsync(dirPath);
  }
};

/**
 * Get the URI for a journal entry's media file.
 */
export const getEntryMediaUri = async (
  plantingId: string,
  entryId: string,
): Promise<string | null> => {
  const dir = await getPlantingMediaDir(plantingId);
  const jpgPath = `${dir.uri}/${entryId}.jpg`;
  const mp4Path = `${dir.uri}/${entryId}.mp4`;

  const [jpgInfo, mp4Info] = await Promise.all([
    getInfoAsync(jpgPath),
    getInfoAsync(mp4Path),
  ]);

  if (jpgInfo.exists) return jpgPath;
  if (mp4Info.exists) return mp4Path;
  return null;
};
