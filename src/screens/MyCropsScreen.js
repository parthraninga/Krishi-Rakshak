import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeftIcon,
  SearchIcon,
  BellIcon,
  MenuIcon,
  TargetIcon,
  PlusIcon,
  ArrowRightIcon,
  SeedlingIcon,
  SeedsIcon,
  FertilizerIcon,
  PesticideIcon,
  PeopleIcon,
  MicIcon,
} from '../components/Icons';
import {CropIcon} from '../components/CropIcons';
import AddCropsScreen from './AddCropsScreen';
import CropProductsScreen from './CropProductsScreen';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Voice from '@react-native-voice/voice';
import { CHAT_API_BASE } from '../config';
import {
  UI_CATEGORY_SEEDS,
  UI_CATEGORY_FERTILIZERS,
  UI_CATEGORY_INSECTICIDE,
} from '../data/categoryMapping';
import Geolocation from '@react-native-community/geolocation';

const SELECTED_CROPS_KEY = '@KrishiRakshak/selectedCrops';
const HARDCODED_LOCATION = 'IIT Gandhinagar, Palaj, Gujarat';
const ASK_AI_HISTORY_KEY = '@KrishiRakshak/askAiHistory';
const MAX_CHAT_HISTORY = 50;

const LOCATION_PERMISSION =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

const MIC_PERMISSION =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.MICROPHONE
    : PERMISSIONS.ANDROID.RECORD_AUDIO;

const SOLVE_CROP_ACTIONS = [
  {
    id: 'pests',
    title: 'Pests & Diseases',
    subtitle: 'Know about all diseases in your crop',
    icon: SeedlingIcon,
    color: '#558B2F',
  },
  {
    id: 'seeds',
    title: 'Seeds',
    subtitle: 'Best seeds and sowing guidance',
    icon: SeedsIcon,
    color: '#8D6E63',
  },
  {
    id: 'fertilizers',
    title: 'Fertilizers',
    subtitle: 'Fertilizer recommendations and schedule',
    icon: FertilizerIcon,
    color: '#1565C0',
  },
  {
    id: 'insecticide',
    title: 'Insecticide details',
    subtitle: 'Crop protection and insecticide info',
    icon: PesticideIcon,
    color: '#2E7D32',
  },
  {
    id: 'expert',
    title: 'Ask agri expert',
    subtitle: 'Get direct solutions from agri experts',
    icon: PeopleIcon,
    color: '#2D7D3E',
  },
];

const MyCropsScreen = ({ onBack, initialCrop }) => {
  const insets = useSafeAreaInsets();
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(initialCrop || null);
  const [showAddCrops, setShowAddCrops] = useState(false);
  const [location, setLocation] = useState(null);
  const [showLocationBanner, setShowLocationBanner] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [askInput, setAskInput] = useState('');
  const [voiceMode, setVoiceMode] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [cropProductsUiCategory, setCropProductsUiCategory] = useState(null);
  const chatScrollRef = useRef(null);
  const askAiWithQueryRef = useRef(null);

  const loadCrops = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(SELECTED_CROPS_KEY);
      const saved = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(saved) ? saved : [];
      setCrops(list);
      setSelectedCrop((prev) => {
        if (list.length === 0) return null;
        if (!prev) return list[0];
        if (!list.some((c) => c.id === prev.id)) return list[0];
        return prev;
      });
    } catch {
      setCrops([]);
      setSelectedCrop(null);
    }
  }, []);

  const loadChatHistory = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(ASK_AI_HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(list) ? list : [];
      setChatHistory(arr.map((item, i) => ({ ...item, id: item.id || `${Date.now()}-${i}` })));
    } catch {
      setChatHistory([]);
    }
  }, []);

  const saveChatHistory = useCallback(async (history) => {
    try {
      const toSave = history.slice(-MAX_CHAT_HISTORY);
      await AsyncStorage.setItem(ASK_AI_HISTORY_KEY, JSON.stringify(toSave));
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadCrops();
  }, [loadCrops]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  useEffect(() => {
    if (initialCrop) setSelectedCrop(initialCrop);
  }, [initialCrop]);

  const updateLocation = useCallback(async () => {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        async () => {
          setLocation(HARDCODED_LOCATION);
          setShowLocationBanner(false);
          resolve(true);
        },
        () => resolve(false),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const status = await check(LOCATION_PERMISSION);
      if (cancelled) return;
      if (status !== RESULTS.GRANTED) setShowLocationBanner(true);
      else await updateLocation();
    })();
    return () => { cancelled = true; };
  }, [updateLocation]);

  const requestLocation = async () => {
    setLocationLoading(true);
    try {
      const status = await request(LOCATION_PERMISSION);
      if (status === RESULTS.GRANTED) await updateLocation();
    } finally {
      setLocationLoading(false);
    }
  };

  const askAi = useCallback(async (overrideQuery) => {
    const query = (overrideQuery != null ? String(overrideQuery).trim() : askInput.trim()) || '';
    if (!query) return;
    setAskError(null);
    setAskLoading(true);
    if (overrideQuery == null) setAskInput('');
    try {
      const res = await fetch(`${CHAT_API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAskError(data.message || data.error || `Error ${res.status}`);
        return;
      }
      const responseText = data.response ?? data.reply ?? data.answer ?? JSON.stringify(data);
      const newEntry = { id: Date.now(), query, response: responseText };
      setChatHistory((prev) => {
        const next = [...prev, newEntry].slice(-MAX_CHAT_HISTORY);
        saveChatHistory(next);
        return next;
      });
      if (overrideQuery == null) setAskInput('');
    } catch (e) {
      setAskError(e.message || 'Network error');
    } finally {
      setAskLoading(false);
    }
  }, [askInput]);

  askAiWithQueryRef.current = askAi;

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechError = (e) => {
      setIsListening(false);
      if (e.error?.code !== 'no-speech') setAskError(e.error?.message || 'Voice error');
    };
    Voice.onSpeechResults = (e) => {
      const results = e.value;
      const transcript = Array.isArray(results) && results.length > 0 ? results[0] : '';
      if (transcript && askAiWithQueryRef.current) {
        askAiWithQueryRef.current(transcript);
      }
    };
    return () => {
      Voice.destroy().catch(() => {});
      Voice.onSpeechStart = null;
      Voice.onSpeechEnd = null;
      Voice.onSpeechError = null;
      Voice.onSpeechResults = null;
    };
  }, []);

  const startVoiceInput = useCallback(async () => {
    if (askLoading || isListening) return;
    const status = await check(MIC_PERMISSION);
    if (status !== RESULTS.GRANTED) {
      const newStatus = await request(MIC_PERMISSION);
      if (newStatus !== RESULTS.GRANTED) {
        setAskError('Microphone permission needed for voice');
        return;
      }
    }
    setAskError(null);
    try {
      await Voice.start('en-IN');
    } catch (err) {
      setAskError(err.message || 'Could not start voice');
      setIsListening(false);
    }
  }, [askLoading, isListening]);

  const stopVoiceInput = useCallback(async () => {
    if (!isListening) return;
    try {
      await Voice.stop();
    } catch (_) {}
    setIsListening(false);
  }, [isListening]);

  if (showAddCrops) {
    return (
      <AddCropsScreen
        onBack={() => {
          setShowAddCrops(false);
          loadCrops();
        }}
        onContinue={() => {
          setShowAddCrops(false);
          loadCrops();
        }}
      />
    );
  }

  const displayCrop = selectedCrop || crops[0];
  if (cropProductsUiCategory && displayCrop) {
    return (
      <CropProductsScreen
        crop={displayCrop}
        uiCategory={cropProductsUiCategory}
        onBack={() => setCropProductsUiCategory(null)}
      />
    );
  }
  const cropList = [{ id: 'add', name: 'Add Crop', icon: 'plus' }, ...crops];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.headerBack}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Crops</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <SearchIcon size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <BellIcon size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MenuIcon size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {showLocationBanner && (
        <View style={styles.locationBanner}>
          <TargetIcon size={24} color="#C62828" />
          <Text style={styles.locationBannerText}>
            Location permission is off.{' '}
            {location ? `Default: ${location}` : 'Set location for better advice.'}
          </Text>
          <TouchableOpacity
            style={styles.allowBtn}
            onPress={requestLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="#2D7D3E" />
            ) : (
              <Text style={styles.allowBtnText}>Allow</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Crop strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cropStrip}
        >
          {cropList.map((crop) => (
            <TouchableOpacity
              key={crop.id === 'add' ? 'add' : `c-${crop.id}`}
              style={[styles.cropCard, selectedCrop?.id === crop.id && styles.cropCardSelected]}
              onPress={() => {
                if (crop.id === 'add') setShowAddCrops(true);
                else setSelectedCrop(crop);
              }}
            >
              <View style={[
                styles.cropThumbWrap,
                crop.id === 'add' && styles.addThumbWrap,
                selectedCrop?.id === crop.id && styles.cropThumbWrapSelected,
              ]}>
                {crop.id === 'add' ? (
                  <PlusIcon size={32} color="#2D7D3E" />
                ) : (
                  <CropIcon crop={crop} size={48} />
                )}
              </View>
              <Text style={[
                styles.cropCardName,
                selectedCrop?.id === crop.id && styles.cropCardNameSelected,
              ]} numberOfLines={1}>
                {crop.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {displayCrop ? (
          <>
            <Text style={styles.sectionTitle}>
              {displayCrop.name} – Solve Crop Problem
            </Text>
            {SOLVE_CROP_ACTIONS.map((action) => {
              const IconComp = action.icon;
              const openProducts =
                action.id === 'seeds'
                  ? () => setCropProductsUiCategory(UI_CATEGORY_SEEDS)
                  : action.id === 'fertilizers'
                    ? () => setCropProductsUiCategory(UI_CATEGORY_FERTILIZERS)
                    : action.id === 'insecticide'
                      ? () => setCropProductsUiCategory(UI_CATEGORY_INSECTICIDE)
                      : null;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  activeOpacity={0.7}
                  onPress={openProducts || undefined}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: `${action.color}18` }]}>
                    <IconComp size={28} color={action.color} />
                  </View>
                  <View style={styles.actionTextWrap}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </View>
                  <ArrowRightIcon size={20} color="#999" />
                </TouchableOpacity>
              );
            })}

            <Text style={styles.sectionTitle}>Ask AI about your crops</Text>
            <View style={styles.askAiCard}>
              <ScrollView
                ref={chatScrollRef}
                style={styles.askAiCardScroll}
                contentContainerStyle={styles.askAiCardScrollContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
              >
                {chatHistory.map((item) => (
                  <View key={item.id} style={styles.chatBubbleWrap}>
                    <View style={styles.chatBubbleUser}>
                      <Text style={styles.chatBubbleText}>{item.query}</Text>
                    </View>
                    <View style={styles.chatBubbleAi}>
                      <Text style={styles.chatBubbleText}>{item.response}</Text>
                    </View>
                  </View>
                ))}
                <TextInput
                  style={styles.askInput}
                  placeholder="Ask about pests, seeds, weather..."
                  placeholderTextColor="#999"
                  value={askInput}
                  onChangeText={setAskInput}
                  multiline
                  editable={!askLoading}
                />
                {askError ? <Text style={styles.askError}>{askError}</Text> : null}
                <View style={styles.askAiFooter}>
                  <TouchableOpacity
                    style={[styles.voiceBtn, (voiceMode || isListening) && styles.voiceBtnActive]}
                    onPress={() => {
                      if (isListening) {
                        stopVoiceInput();
                      } else if (voiceMode) {
                        startVoiceInput();
                      } else {
                        setVoiceMode(true);
                      }
                    }}
                    onLongPress={() => !isListening && setVoiceMode((v) => !v)}
                    disabled={askLoading}
                  >
                    <MicIcon size={24} color={voiceMode || isListening ? '#2D7D3E' : '#666'} />
                    <Text style={[styles.voiceLabel, (voiceMode || isListening) && styles.voiceLabelActive]}>
                      {isListening ? 'Listening…' : `Voice ${voiceMode ? 'on' : 'off'}`}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.askSubmitBtn, askLoading && styles.askSubmitBtnDisabled]}
                    onPress={() => askAi()}
                    disabled={askLoading}
                  >
                    {askLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.askSubmitText}>Ask AI</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No crops added</Text>
            <Text style={styles.emptySub}>Tap "Add Crop" above to add your crops.</Text>
            <TouchableOpacity
              style={styles.addFirstBtn}
              onPress={() => setShowAddCrops(true)}
            >
              <Text style={styles.addFirstBtnText}>Add Crop</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerBack: {
    padding: 8,
    marginLeft: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  locationBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#C62828',
  },
  allowBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  allowBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D7D3E',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  cropStrip: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cropCard: {
    alignItems: 'center',
    width: 80,
  },
  cropCardSelected: {
    opacity: 1,
  },
  cropThumbWrapSelected: {
    borderWidth: 2,
    borderColor: '#2D7D3E',
    backgroundColor: '#E8F5E9',
  },
  cropThumbWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  addThumbWrap: {
    borderWidth: 2,
    borderColor: '#2D7D3E',
    borderStyle: 'dashed',
  },
  cropThumbImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cropCardName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  cropCardNameSelected: {
    color: '#2D7D3E',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D7D3E',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  askAiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  askAiCardScroll: {
    maxHeight: Dimensions.get('window').height * 0.48,
  },
  askAiCardScrollContent: {
    paddingBottom: 16,
  },
  chatBubbleWrap: {
    marginBottom: 12,
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '88%',
    marginBottom: 4,
  },
  chatBubbleAi: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '88%',
  },
  chatBubbleText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  askInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  askAiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  voiceBtnActive: {},
  voiceLabel: {
    fontSize: 14,
    color: '#666',
  },
  voiceLabelActive: {
    color: '#2D7D3E',
    fontWeight: '600',
  },
  askSubmitBtn: {
    backgroundColor: '#2D7D3E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  askSubmitBtnDisabled: {
    opacity: 0.7,
  },
  askError: {
    fontSize: 13,
    color: '#C62828',
    marginTop: 10,
  },
  askSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  addFirstBtn: {
    backgroundColor: '#2D7D3E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MyCropsScreen;
