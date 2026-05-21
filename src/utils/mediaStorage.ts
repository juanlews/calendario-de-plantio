import * as FS from 'expo-file-system';

/**
 * Get a Directory reference for a planting's media folder.
 */
const getPlantingMediaDir = (plantingId: string): FS.Directory => {
  return new FS.Directory(FS.Paths.document, 'media', plantingId);
};

/**
 * Ensure the planting media directory exists (with parent directories).
 */
const ensurePlantingMediaDir = async (plantingId: string): Promise<FS.Directory> => {
  const dir = getPlantingMediaDir(plantingId);
  if (dir.exists) return dir;

  // Ensure parent 'media' dir exists
  const mediaDir = new FS.Directory(FS.Paths.document, 'media');
  if (!mediaDir.exists) {
    mediaDir.createDirectory('media');
  }
  dir.createDirectory(plantingId);
  return dir;
};

/**
 * Copy a picked image/video to the planting media directory.
 * Returns the persistent local URI.
 */
export const saveMediaToPlanting = async (
  plantingId: string,
  entryId: string,
  sourceUri: string,
  mimeType: string,
): Promise<string> => {
  const dir = await ensurePlantingMediaDir(plantingId);
  const ext = mimeType.includes('video') ? '.mp4' : '.jpg';
  const destFile = new FS.File(dir, `${entryId}${ext}`);
  const srcFile = new FS.File(sourceUri);

  // Stream copy using SDK 54 File API
  const reader = srcFile.readableStream().getReader();
  const writer = destFile.writableStream().getWriter();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      await writer.write(value);
    }
  } finally {
    reader.releaseLock();
    writer.releaseLock();
  }

  return destFile.uri;
};

/**
 * Delete all media files for a journal entry.
 */
export const deleteEntryMedia = async (plantingId: string, entryId: string): Promise<void> => {
  const dir = getPlantingMediaDir(plantingId);
  if (!dir.exists) return;

  const jpgFile = new FS.File(dir, `${entryId}.jpg`);
  const mp4File = new FS.File(dir, `${entryId}.mp4`);

  if (jpgFile.exists) {
    try { jpgFile.delete(); } catch { /* ignore */ }
  }
  if (mp4File.exists) {
    try { mp4File.delete(); } catch { /* ignore */ }
  }
};

/**
 * Delete all media for a planting (when plant is deleted).
 */
export const deletePlantingMedia = async (plantingId: string): Promise<void> => {
  const dir = getPlantingMediaDir(plantingId);
  if (dir.exists) {
    try { dir.delete(); } catch { /* ignore */ }
  }
};

/**
 * Get the URI for a journal entry's media file, or null if none.
 */
export const getEntryMediaUri = async (
  plantingId: string,
  entryId: string,
): Promise<string | null> => {
  const dir = getPlantingMediaDir(plantingId);
  if (!dir.exists) return null;

  const jpgFile = new FS.File(dir, `${entryId}.jpg`);
  if (jpgFile.exists) return jpgFile.uri;

  const mp4File = new FS.File(dir, `${entryId}.mp4`);
  if (mp4File.exists) return mp4File.uri;

  return null;
};
