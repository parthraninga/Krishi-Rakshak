/**
 * Download each crop's image_url and store as local assets, mapped by crop id.
 * Uses react-native-fs for storage; mapping persisted in AsyncStorage.
 */
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const CROP_IMAGE_MAP_KEY = '@KrishiRakshak/cropImageMap';
const CROP_IMAGES_DIR = 'crop_images';

const getCropImagesDir = () => `${RNFS.DocumentDirectoryPath}/${CROP_IMAGES_DIR}`;

/** Returns file URI for Image component (file:// on Android) */
const toFileUri = (path) => {
  if (Platform.OS === 'android' && path && !path.startsWith('file://')) {
    return `file://${path}`;
  }
  return path;
};

/** Get persisted map: cropId -> local file path */
export const getCropImageMap = async () => {
  try {
    const raw = await AsyncStorage.getItem(CROP_IMAGE_MAP_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return typeof map === 'object' ? map : {};
  } catch {
    return {};
  }
};

/** Save map to AsyncStorage */
const setCropImageMap = async (map) => {
  await AsyncStorage.setItem(CROP_IMAGE_MAP_KEY, JSON.stringify(map));
};

/** Resolve image source for a crop: use cached local asset if available, else image_url */
export const getCropImageSource = async (crop) => {
  if (!crop) return null;
  const map = await getCropImageMap();
  const localPath = map[crop.id];
  if (localPath) {
    const exists = await RNFS.exists(localPath).catch(() => false);
    if (exists) return { uri: toFileUri(localPath) };
  }
  if (crop.image_url) return { uri: crop.image_url };
  return null;
};

/** Resolve image source synchronously using a pre-loaded map (for lists) */
export const getCropImageSourceFromMap = (crop, map) => {
  if (!crop) return null;
  const localPath = map[crop.id];
  if (localPath) return { uri: toFileUri(localPath) };
  if (crop.image_url) return { uri: crop.image_url };
  return null;
};

/** Download one image and save to app storage; returns local path or null */
export const downloadCropImage = async (crop) => {
  if (!crop?.image_url) return null;
  const dir = getCropImagesDir();
  const existsDir = await RNFS.exists(dir).catch(() => false);
  if (!existsDir) await RNFS.mkdir(dir);
  const pathPart = crop.image_url.split('?')[0] || '';
  const ext = pathPart.split('.').pop()?.toLowerCase() || '';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'png';
  const toFile = `${dir}/crop_${crop.id}.${safeExt}`;
  try {
    const { promise } = RNFS.downloadFile({
      fromUrl: crop.image_url,
      toFile,
    });
    const result = await promise;
    if (result.statusCode === 200) return toFile;
  } catch (e) {
    console.warn('Crop image download failed:', crop.id, crop.name, e.message);
  }
  return null;
};

/** Download all crop images from CROPS_BY_CATEGORY-style data and store map */
export const downloadAllCropImages = async (categoriesWithCrops, onProgress) => {
  const map = await getCropImageMap();
  const dir = getCropImagesDir();
  const existsDir = await RNFS.exists(dir).catch(() => false);
  if (!existsDir) await RNFS.mkdir(dir);

  const allCrops = [];
  categoriesWithCrops.forEach((cat) => {
    if (cat.crops && Array.isArray(cat.crops)) allCrops.push(...cat.crops);
  });

  let done = 0;
  for (const crop of allCrops) {
    if (map[crop.id]) {
      const exists = await RNFS.exists(map[crop.id]).catch(() => false);
      if (exists) {
        done++;
        onProgress?.({ done, total: allCrops.length, crop });
        continue;
      }
    }
    const localPath = await downloadCropImage(crop);
    if (localPath) {
      map[crop.id] = localPath;
      await setCropImageMap(map);
    }
    done++;
    onProgress?.({ done, total: allCrops.length, crop });
  }

  return map;
};
