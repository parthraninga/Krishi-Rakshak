import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ChevronLeftIcon, SearchIcon} from '../components/Icons';
import {CropIcon} from '../components/CropIcons';
import CROPS_BY_CATEGORY from '../data/cropsByCategory';
import {
  getCropImageMap,
  downloadAllCropImages,
  getCropImageSourceFromMap,
} from '../utils/cropImageCache';

const STORAGE_KEY = '@KrishiRakshak/selectedCrops';

const AddCropsScreen = ({onBack, onContinue}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  const [cropImageMap, setCropImageMap] = useState({});

  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved) && saved.length > 0) setSelectedCrops(saved);
        } catch (_) {}
      }
    });
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const map = await getCropImageMap();
      if (cancelled) return;
      setCropImageMap(map);
      downloadAllCropImages(CROPS_BY_CATEGORY, async ({ done, total }) => {
        if (cancelled) return;
        const next = await getCropImageMap();
        setCropImageMap(next);
      }).then((finalMap) => {
        if (!cancelled) setCropImageMap(finalMap);
      }).catch(() => {});
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CROPS_BY_CATEGORY;
    return CROPS_BY_CATEGORY.map((cat) => ({
      ...cat,
      crops: cat.crops.filter((c) => c.name.toLowerCase().includes(q)),
    })).filter((cat) => cat.crops.length > 0);
  }, [searchQuery]);

  const toggleCrop = (crop) => {
    const id = crop.id;
    setSelectedCrops((prev) =>
      prev.some((c) => c.id === id) ? prev.filter((c) => c.id !== id) : [...prev, crop]
    );
  };

  const removeSelected = (crop) => {
    setSelectedCrops((prev) => prev.filter((c) => c.id !== crop.id));
  };

  const toggleCategory = (category) => {
    setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCrops));
    } catch (e) {
      console.warn('Save selected crops', e);
    }
    onContinue?.();
    onBack?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={[styles.header, {paddingTop: Math.max(12, insets.top) + 8}]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Crops</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchWrap}>
        <SearchIcon size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Crop"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {selectedCrops.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.alreadyAddedLabel}>Already added</Text>
            <View style={styles.selectedChipsRow}>
            {selectedCrops.map((crop) => (
              <View key={crop.id} style={styles.selectedChip}>
                <View style={styles.selectedChipImageWrap}>
                  <CropIcon crop={crop} size={40} />
                </View>
                <Text style={styles.selectedChipName} numberOfLines={1}>{crop.name}</Text>
                <TouchableOpacity
                  style={styles.selectedChipRemove}
                  onPress={() => removeSelected(crop)}>
                  <Text style={styles.selectedChipRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            </View>
          </View>
        )}

        <Text style={styles.instructionTitle}>Please choose the crops you grow</Text>
        <Text style={styles.instructionSub}>This will help us to serve you better.</Text>

        {filteredCategories.map(({ category, displayName, crops }) => {
          const isCollapsed = collapsed[category];
          return (
            <View key={category} style={styles.categoryBlock}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category)}
                activeOpacity={0.7}>
                <Text style={styles.categoryTitle}>{displayName}</Text>
                <Text style={styles.categoryChevron}>{isCollapsed ? '▼' : '▲'}</Text>
              </TouchableOpacity>
              {!isCollapsed && (
                <View style={styles.cropGrid}>
                  {crops.map((crop) => {
                    const isSelected = selectedCrops.some((c) => c.id === crop.id);
                    return (
                      <TouchableOpacity
                        key={crop.id}
                        style={styles.cropItem}
                        onPress={() => toggleCrop(crop)}
                        activeOpacity={0.8}>
                        <View style={[styles.cropImageWrap, isSelected && styles.cropImageWrapSelected]}>
                          <CropIcon crop={crop} size={56} />
                          {isSelected && (
                            <View style={styles.checkBadge}>
                              <Text style={styles.checkBadgeText}>✓</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.cropName} numberOfLines={1}>{crop.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: Math.max(16, insets.bottom) + 8}]}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backBtn: {
    padding: 8,
    marginRight: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  selectedSection: {
    marginBottom: 20,
  },
  alreadyAddedLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D7D3E',
    marginBottom: 10,
  },
  selectedChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  selectedChip: {
    width: 72,
    alignItems: 'center',
  },
  selectedChipImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#2D7D3E',
  },
  selectedChipImageWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#2D7D3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedChipName: {
    fontSize: 11,
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedChipRemove: {
    position: 'absolute',
    top: -4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedChipRemoveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  instructionSub: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  categoryBlock: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryChevron: {
    fontSize: 12,
    color: '#666',
  },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  cropItem: {
    width: '30%',
    minWidth: 90,
    maxWidth: 110,
    alignItems: 'center',
  },
  cropImageWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropImageWrapSelected: {
    borderWidth: 2,
    borderColor: '#2D7D3E',
  },
  cropImage: {
    width: 72,
    height: 72,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2D7D3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cropName: {
    fontSize: 12,
    color: '#333',
    marginTop: 6,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  continueBtn: {
    backgroundColor: '#2D7D3E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default AddCropsScreen;
