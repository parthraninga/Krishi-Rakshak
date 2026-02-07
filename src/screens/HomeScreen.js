import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {request, check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import {
  LocationIcon,
  BellIcon,
  MenuIcon,
  SearchIcon,
  MicIcon,
  TargetIcon,
  PlusIcon,
  WheatIcon,
  CottonIcon,
  TurmericIcon,
  SugarcaneIcon,
  SeedlingIcon,
  SeedsIcon,
  TreeIcon,
  CartIcon,
  ChevronDownIcon,
  CameraIcon,
  FertilizerIcon,
  PesticideIcon,
  ArrowRightIcon,
  AnalysisIcon,
} from '../components/Icons';
import ScanScreen from './ScanScreen';
import AnalysisScreen from './AnalysisScreen';
import AddCropsScreen from './AddCropsScreen';
import MyCropsScreen from './MyCropsScreen';
import {CropIcon} from '../components/CropIcons';
import {GEOCODE_API_BASE} from '../config';
import {saveScanToHistory} from '../utils/scanHistory';

const fertilizerBg = require('../../assets/fertilizer.png');

const SELECTED_CROPS_KEY = '@KrishiRakshak/selectedCrops';

const getCropIcon = (iconName) => {
  switch (iconName) {
    case 'plus':
      return <PlusIcon size={32} />;
    case 'wheat':
      return <WheatIcon size={32} />;
    case 'turmeric':
      return <TurmericIcon size={32} />;
    case 'cotton':
      return <CottonIcon size={32} />;
    case 'sugarcane':
      return <SugarcaneIcon size={32} />;
    default:
      return <WheatIcon size={32} />;
  }
};

const LOCATION_PERMISSION = Platform.OS === 'ios'
  ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
  : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

/**
 * Reverse geocode using node-geocoder backend when GEOCODE_API_BASE is set,
 * otherwise fallback to direct Nominatim. Always returns a proper place name, never coordinates.
 */
const reverseGeocode = async (latitude, longitude) => {
  if (GEOCODE_API_BASE) {
    try {
      const res = await fetch(
        `${GEOCODE_API_BASE.replace(/\/$/, '')}/reverse-geocode?lat=${latitude}&lon=${longitude}`,
      );
      const data = await res.json();
      const address = data?.address;
      if (address && typeof address === 'string') return address.trim();
      return null;
    } catch {
      return null;
    }
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
      {headers: {'Accept-Language': 'en', 'User-Agent': 'KrishiRakshak/1.0'}},
    );
    const data = await res.json();
    const addr = data?.address;
    if (!addr) return null;

    const parts = [
      addr.village,
      addr.town,
      addr.city,
      addr.municipality,
      addr.county,
      addr.state_district,
      addr.state,
      addr.country,
    ].filter(Boolean);

    const unique = [...new Set(parts)];
    if (unique.length > 0) return unique.join(', ');
    if (data?.display_name) return data.display_name;
    return null;
  } catch {
    return null;
  }
};

const PLACEHOLDER_NO_LOCATION = 'Set your location';
const HARDCODED_LOCATION = 'IIT Gandhinagar, Palaj, Gujarat';

const HomeScreen = ({language}) => {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState(null);
  const [showLocationBanner, setShowLocationBanner] = useState(true);
  const [showScanScreen, setShowScanScreen] = useState(false);
  const [showAddCropsScreen, setShowAddCropsScreen] = useState(false);
  const [showMyCropsScreen, setShowMyCropsScreen] = useState(false);
  const [selectedCropForDetail, setSelectedCropForDetail] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [homeSelectedCrops, setHomeSelectedCrops] = useState([]);

  const loadSelectedCrops = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(SELECTED_CROPS_KEY);
      const saved = raw ? JSON.parse(raw) : [];
      setHomeSelectedCrops(Array.isArray(saved) ? saved : []);
    } catch {
      setHomeSelectedCrops([]);
    }
  }, []);

  useEffect(() => {
    loadSelectedCrops();
  }, [loadSelectedCrops]);

  const updateLocationFromGPS = useCallback(async () => {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        async () => {
          setLocation(HARDCODED_LOCATION);
          setShowLocationBanner(false);
          resolve(true);
        },
        () => resolve(false),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    });
  }, []);

  const requestLocationAndUpdate = useCallback(async () => {
    setLocationLoading(true);
    try {
      const status = await request(LOCATION_PERMISSION);
      if (status === RESULTS.GRANTED) {
        await updateLocationFromGPS();
      }
    } finally {
      setLocationLoading(false);
    }
  }, [updateLocationFromGPS]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const status = await check(LOCATION_PERMISSION);
      if (cancelled) return;
      if (status === RESULTS.GRANTED) {
        setShowLocationBanner(false);
        await updateLocationFromGPS();
      }
    })();
    return () => { cancelled = true; };
  }, [updateLocationFromGPS]);

  if (showScanScreen) {
    return (
      <ScanScreen
        onClose={() => setShowScanScreen(false)}
        onSaveToHistory={saveScanToHistory}
      />
    );
  }

  if (showAddCropsScreen) {
    return (
      <AddCropsScreen
        onBack={() => {
          loadSelectedCrops();
          setShowAddCropsScreen(false);
        }}
        onContinue={() => {
          loadSelectedCrops();
          setShowAddCropsScreen(false);
        }}
      />
    );
  }

  if (showMyCropsScreen) {
    return (
      <MyCropsScreen
        initialCrop={selectedCropForDetail}
        onBack={() => {
          loadSelectedCrops();
          setShowMyCropsScreen(false);
          setSelectedCropForDetail(null);
        }}
      />
    );
  }

  if (activeTab === 'analysis') {
    return (
      <SafeAreaView style={styles.container}>
        <AnalysisScreen />
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
            <TreeIcon size={28} color="#666" />
            <Text style={styles.navLabel}>Dehaat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
            <AnalysisIcon size={28} color="#2D7D3E" />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
            <CartIcon size={28} color="#666" />
            <Text style={styles.navLabel}>Shop</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section - padding so it doesn't collide with status/notch */}
        <View style={[styles.header, {paddingTop: Math.max(12, insets.top) + 8}]}>
          <View style={styles.topBar}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>Your location</Text>
              <View style={styles.locationRow}>
                <View style={styles.locationIcon}>
                  <LocationIcon size={20} />
                </View>
                <Text style={styles.locationText}>{location ?? HARDCODED_LOCATION}</Text>
                <View style={styles.dropdownIcon}>
                  <ChevronDownIcon size={12} />
                </View>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <BellIcon size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MenuIcon size={22} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchIcon size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for products, brands, etc."
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowScanScreen(true)}>
              <CameraIcon size={22} color="#2D7D3E" />
            </TouchableOpacity>
            <TouchableOpacity>
              <MicIcon size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Permission Banner */}
        {showLocationBanner && (
          <View style={styles.permissionBanner}>
            <View style={styles.bannerContent}>
              <View style={styles.targetIcon}>
                <TargetIcon size={32} />
              </View>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerText}>Location permission is off.</Text>
                <Text style={styles.bannerText}>Allow access to show your current location.</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.allowButton}
              onPress={requestLocationAndUpdate}
              disabled={locationLoading}>
              {locationLoading ? (
                <ActivityIndicator size="small" color="#2D7D3E" />
              ) : (
                <Text style={styles.allowButtonText}>Allow</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Crop Selection: Add Crop + already added crops */}
        <View style={styles.cropSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cropScrollContent}>
            {[{ id: 'add', name: 'Add Crop', icon: 'plus' }, ...homeSelectedCrops].map((crop) => (
              <TouchableOpacity
                key={crop.id === 'add' ? 'add' : `crop-${crop.id}`}
                style={styles.cropCard}
                onPress={() => {
                  if (crop.id === 'add') setShowAddCropsScreen(true);
                  else {
                    setSelectedCropForDetail(crop);
                    setShowMyCropsScreen(true);
                  }
                }}>
                <View style={[styles.cropIconContainer, crop.id === 'add' && styles.addCropIcon]}>
                  {crop.id === 'add' ? (
                    getCropIcon('plus')
                  ) : (
                    <CropIcon crop={crop} size={48} />
                  )}
                </View>
                <Text style={styles.cropName} numberOfLines={1}>{crop.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Scan Now – Analyze seeds, fertilizers & pesticides */}
        <View style={styles.promoSection}>
          <TouchableOpacity
            style={styles.scanCard}
            onPress={() => setShowScanScreen(true)}
            activeOpacity={0.92}>
            <ImageBackground
              source={fertilizerBg}
              style={styles.scanCardBgImage}
              imageStyle={styles.scanCardBgImageStyle}>
              <View style={styles.scanCardInner}>
                <View style={styles.scanCardContent}>
                  <View style={styles.scanCardTopBlock}>
                    <Text style={styles.scanCardTitle}>Scan to analyze</Text>
                    <Text style={styles.scanCardSubtitle}>
                      Seeds, fertilizers & pesticides
                    </Text>
                  </View>
                  <View style={styles.scanCardCta}>
                  <Text style={styles.scanCardCtaText}>Scan now</Text>
                  <ArrowRightIcon size={20} color="#FFFFFF" />
                </View>
              </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* Quick Access Section */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity style={styles.quickAccessCard}>
              <SeedsIcon size={40} color="#8D6E63" />
              <Text style={styles.quickAccessText}>Seeds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessCard}>
              <FertilizerIcon size={40} color="#1565C0" />
              <Text style={styles.quickAccessText}>Fertilizers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessCard}>
              <PesticideIcon size={40} color="#558B2F" />
              <Text style={styles.quickAccessText}>Crop Protection</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessCard}>
              <WheatIcon size={40} color="#F9A825" />
              <Text style={styles.quickAccessText}>Crop Nutrition</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <TreeIcon size={28} color="#2D7D3E" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Dehaat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('analysis')}>
          <AnalysisIcon size={28} color="#666" />
          <Text style={styles.navLabel}>Analysis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <CartIcon size={28} color="#666" />
          <Text style={styles.navLabel}>Shop</Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D7D3E',
    flex: 1,
  },
  dropdownIcon: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  permissionBanner: {
    backgroundColor: '#C62828',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  targetIcon: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  allowButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  allowButtonText: {
    color: '#2D7D3E',
    fontSize: 16,
    fontWeight: '600',
  },
  cropSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginTop: 8,
  },
  cropScrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  cropCard: {
    alignItems: 'center',
    width: 90,
  },
  cropIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addCropIcon: {
    borderWidth: 2,
    borderColor: '#2D7D3E',
    borderStyle: 'dashed',
  },
  cropThumb: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  cropName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  promoSection: {
    padding: 16,
    paddingTop: 8,
    marginTop: -4,
  },
  scanCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#2D7D3E',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  scanCardBgImage: {
    width: '100%',
    minHeight: 340,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scanCardBgImageStyle: {
    borderRadius: 20,
    resizeMode: 'cover',
  },
  scanCardInner: {
    flex: 1,
    minHeight: 340,
    borderWidth: 1,
    borderColor: 'rgba(45, 125, 62, 0.2)',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  scanCardContent: {
    flex: 1,
    minHeight: 340,
    padding: 24,
    paddingTop: 12,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  scanCardTopBlock: {
    alignItems: 'center',
    marginTop: -8,
  },
  scanCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  scanCardSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
  },
  scanCardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D7D3E',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 10,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#2D7D3E',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  scanCardCtaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  quickAccessSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAccessCard: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  quickAccessText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  navItemActive: {},
  navLabelActive: {
    color: '#2D7D3E',
    fontWeight: '600',
  },
});

export default HomeScreen;
