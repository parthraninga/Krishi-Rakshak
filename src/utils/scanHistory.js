import AsyncStorage from '@react-native-async-storage/async-storage';

const SCAN_HISTORY_KEY = '@KrishiRakshak/scanHistory';
const MAX_HISTORY = 30;

export const getScanHistory = async () => {
  try {
    const raw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
};

export const saveScanToHistory = async (entry) => {
  try {
    const raw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    const newList = [{ ...entry, id: entry.id || Date.now().toString() }, ...list].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(newList));
    return newList;
  } catch (e) {
    console.warn('saveScanToHistory', e);
    return [];
  }
};

export const updateScanNotes = async (id, notes) => {
  try {
    const raw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const next = list.map((item) => (item.id === id ? { ...item, notes } : item));
    await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch (e) {
    console.warn('updateScanNotes', e);
    return [];
  }
};
