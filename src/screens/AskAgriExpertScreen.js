import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ChevronLeftIcon, PeopleIcon, TreeIcon} from '../components/Icons';

const TOPICS = [
  { id: 'pest', label: 'Pest & Disease' },
  { id: 'fertilizer', label: 'Fertilizer' },
  { id: 'irrigation', label: 'Irrigation' },
  { id: 'market', label: 'Market & Price' },
  { id: 'other', label: 'Other' },
];

const AskAgriExpertScreen = ({onBack}) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [topic, setTopic] = useState('');
  const [crop, setCrop] = useState('');
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // In a real app: send to backend / Agri expert queue
    setSubmitted(true);
  };

  const isValid = name.trim().length > 0 && phone.trim().length >= 10 && question.trim().length > 0;

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#2D7D3E" barStyle="light-content" />
        {onBack && (
          <TouchableOpacity style={[styles.backBtn, {paddingTop: Math.max(12, insets.top) + 8}]} onPress={onBack}>
            <ChevronLeftIcon size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <View style={styles.successWrap}>
          <View style={styles.successIconWrap}>
            <TreeIcon size={64} color="#2D7D3E" />
          </View>
          <Text style={styles.successTitle}>Request sent</Text>
          <Text style={styles.successMessage}>
            An agri expert will get back to you soon. We may call you on the number you shared.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2D7D3E" barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        {onBack && (
          <TouchableOpacity style={[styles.backBtn, {paddingTop: Math.max(12, insets.top) + 8}]} onPress={onBack}>
            <ChevronLeftIcon size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        {/* Hero header */}
        <View style={[styles.hero, {paddingTop: 12}]}>
          <View style={styles.heroIconWrap}>
            <PeopleIcon size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Ask Agri Expert</Text>
          <Text style={styles.heroSubtitle}>
            Get advice on crops, pests, fertilizers & more from our experts
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + 100}]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your details</Text>

            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Phone number *</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <Text style={styles.label}>Village / Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Village, district or area"
              placeholderTextColor="#999"
              value={village}
              onChangeText={setVillage}
            />

            <Text style={styles.label}>Topic</Text>
            <View style={styles.topicRow}>
              {TOPICS.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTopic(t.id)}
                  style={[styles.topicChip, topic === t.id && styles.topicChipActive]}>
                  <Text style={[styles.topicChipText, topic === t.id && styles.topicChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Crop (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Wheat, Cotton, Paddy"
              placeholderTextColor="#999"
              value={crop}
              onChangeText={setCrop}
            />

            <Text style={styles.label}>Your question *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your issue or question in detail. The more you share, the better our experts can help."
              placeholderTextColor="#999"
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!isValid}
              activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>Submit to expert</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
  },
  hero: {
    backgroundColor: '#2D7D3E',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#1A5526',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E8F5E9',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#F8FAF8',
    borderWidth: 1.5,
    borderColor: '#E0E8E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  topicChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F7F0',
    borderWidth: 1.5,
    borderColor: '#E0E8E0',
  },
  topicChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2D7D3E',
  },
  topicChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  topicChipTextActive: {
    color: '#2D7D3E',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#2D7D3E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    elevation: 2,
    shadowColor: '#2D7D3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D7D3E',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  backBtn: {
    position: 'absolute',
    left: 8,
    zIndex: 20,
    padding: 8,
  },
});

export default AskAgriExpertScreen;
