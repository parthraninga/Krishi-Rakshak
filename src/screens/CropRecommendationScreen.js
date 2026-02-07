import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import {CHAT_API_BASE} from '../config';

const PH_MIN = 4;
const PH_MAX = 9;
const RAINFALL_MIN = 0;
const RAINFALL_MAX = 2000;
const TEMP_MIN = 10;
const TEMP_MAX = 45;
const HUMIDITY_MIN = 10;
const HUMIDITY_MAX = 100;

const CropRecommendationScreen = () => {
  const insets = useSafeAreaInsets();
  const [ph, setPh] = useState(6.5);
  const [rainfall, setRainfall] = useState(100);
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(80);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGetRecommendation = async () => {
    if (!CHAT_API_BASE) {
      setError('API not configured. Set CHAT_API_BASE in config.');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const url = `${CHAT_API_BASE.replace(/\/$/, '')}/api/soil-predict`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          ph: Math.round(ph * 10) / 10,
          temperature: Math.round(temperature),
          rainfall: Math.round(rainfall),
          humidity: Math.round(humidity),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || data.error || `Error ${res.status}`);
        return;
      }
      setResult(data);
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2D7D3E" barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + 100}]}
        showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, {paddingTop: Math.max(12, insets.top) + 12}]}>
          <Text style={styles.heroTitle}>Crop Advice</Text>
          <Text style={styles.heroSubtitle}>
            Set your soil and climate parameters to get crop recommendations
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Soil & climate parameters</Text>

          <View style={styles.sliderRow}>
            <Text style={styles.label}>Soil pH ({PH_MIN} – {PH_MAX})</Text>
            <Text style={styles.value}>{ph.toFixed(1)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={PH_MIN}
            maximumValue={PH_MAX}
            value={ph}
            onValueChange={setPh}
            minimumTrackTintColor="#2D7D3E"
            maximumTrackTintColor="#E0E8E0"
            thumbTintColor="#2D7D3E"
            step={0.1}
          />

          <View style={styles.sliderRow}>
            <Text style={styles.label}>Annual rainfall (mm) ({RAINFALL_MIN} – {RAINFALL_MAX})</Text>
            <Text style={styles.value}>{Math.round(rainfall)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={RAINFALL_MIN}
            maximumValue={RAINFALL_MAX}
            value={rainfall}
            onValueChange={setRainfall}
            minimumTrackTintColor="#2D7D3E"
            maximumTrackTintColor="#E0E8E0"
            thumbTintColor="#2D7D3E"
            step={10}
          />

          <View style={styles.sliderRow}>
            <Text style={styles.label}>Optimal temperature (°C) ({TEMP_MIN} – {TEMP_MAX})</Text>
            <Text style={styles.value}>{Math.round(temperature)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={TEMP_MIN}
            maximumValue={TEMP_MAX}
            value={temperature}
            onValueChange={setTemperature}
            minimumTrackTintColor="#2D7D3E"
            maximumTrackTintColor="#E0E8E0"
            thumbTintColor="#2D7D3E"
            step={1}
          />

          <View style={styles.sliderRow}>
            <Text style={styles.label}>Relative humidity (%) ({HUMIDITY_MIN} – {HUMIDITY_MAX})</Text>
            <Text style={styles.value}>{Math.round(humidity)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={HUMIDITY_MIN}
            maximumValue={HUMIDITY_MAX}
            value={humidity}
            onValueChange={setHumidity}
            minimumTrackTintColor="#2D7D3E"
            maximumTrackTintColor="#E0E8E0"
            thumbTintColor="#2D7D3E"
            step={1}
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleGetRecommendation}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Get recommendation</Text>
            )}
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.resultCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {result != null && !error ? (
          <>
            {result.top_recommendation ? (
              <View style={styles.topRecCard}>
                <Text style={styles.topRecLabel}>Top recommendation</Text>
                <Text style={styles.topRecCrop}>{result.top_recommendation}</Text>
              </View>
            ) : null}
            {Array.isArray(result.predictions) && result.predictions.length > 0 ? (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>All recommendations</Text>
                {result.predictions.map((item, i) => {
                  const level = (item.confidence_level || '').toLowerCase();
                  const confidenceColor =
                    level === 'high' ? '#2E7D32' : level === 'medium' ? '#F9A825' : '#757575';
                  const confidence =
                    typeof item.confidence === 'number'
                      ? item.confidence.toFixed(1)
                      : String(item.confidence);
                  const isLast = i === result.predictions.length - 1;
                  return (
                    <View
                      key={i}
                      style={[styles.predictionRow, isLast && styles.predictionRowLast]}>
                      <View style={styles.predictionRank}>
                        <Text style={styles.predictionRankText}>#{item.rank ?? i + 1}</Text>
                      </View>
                      <View style={styles.predictionContent}>
                        <Text style={styles.predictionCrop}>{item.crop ?? '—'}</Text>
                        <View style={styles.predictionMeta}>
                          <Text style={[styles.predictionConfidence, {color: confidenceColor}]}>
                            {confidence}% {item.confidence_level ?? ''}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}
            {result.input_parameters && (
              <View style={styles.paramsCard}>
                <Text style={styles.paramsTitle}>Parameters used</Text>
                <Text style={styles.paramsText}>
                  pH {result.input_parameters.ph} · {result.input_parameters.rainfall} mm rainfall ·{' '}
                  {result.input_parameters.temperature}°C · {result.input_parameters.humidity}% humidity
                </Text>
              </View>
            )}
            {!result.top_recommendation &&
              !(Array.isArray(result.predictions) && result.predictions.length > 0) && (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Response</Text>
                <Text style={styles.resultBody}>
                  {result.message || JSON.stringify(result)}
                </Text>
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  hero: {
    backgroundColor: '#2D7D3E',
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#1A5526',
    shadowOffset: {width: 0, height: 2},
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
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D7D3E',
    marginLeft: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  submitBtn: {
    backgroundColor: '#2D7D3E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    elevation: 2,
    shadowColor: '#2D7D3E',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  topRecCard: {
    backgroundColor: '#2D7D3E',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  topRecLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topRecCrop: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2D7D3E',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 14,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  predictionRowLast: {
    borderBottomWidth: 0,
  },
  predictionRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  predictionRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D7D3E',
  },
  predictionContent: {
    flex: 1,
  },
  predictionCrop: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  predictionMeta: {
    marginTop: 2,
  },
  predictionConfidence: {
    fontSize: 13,
    fontWeight: '500',
  },
  paramsCard: {
    backgroundColor: '#F8FAF8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  paramsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  paramsText: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
  },
  resultBody: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 15,
    color: '#C62828',
    lineHeight: 22,
  },
});

export default CropRecommendationScreen;
