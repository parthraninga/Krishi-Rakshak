import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  TextInput,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getScanHistory, updateScanNotes} from '../utils/scanHistory';
import {CloseIcon} from '../components/Icons';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const getStatusFromResult = (analysisResult) => {
  if (!analysisResult?.analysis) return { text: '—', color: '#999' };
  const isExpired = analysisResult.analysis.isExpired;
  const color = isExpired === true ? '#F44336' : isExpired === false ? '#4CAF50' : '#FF9800';
  const text = isExpired === true ? 'EXPIRED' : isExpired === false ? 'FRESH' : 'UNCERTAIN';
  return { text, color };
};

const renderAnalysisBlock = (analysisResult) => {
  if (!analysisResult?.analysis) return null;
  const {analysis} = analysisResult;
  const isExpired = analysis.isExpired;
  const statusColor = isExpired === true ? '#F44336' : isExpired === false ? '#4CAF50' : '#FF9800';
  const statusText = isExpired === true ? 'EXPIRED' : isExpired === false ? 'FRESH / VALID' : 'UNCERTAIN';

  return (
    <View style={styles.resultContainer}>
      <View style={[styles.statusBadge, {backgroundColor: statusColor}]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
      {analysis.confidence && (
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Confidence:</Text>
          <Text style={[styles.resultValue, {
            color: analysis.confidence === 'high' ? '#4CAF50' : analysis.confidence === 'medium' ? '#FF9800' : '#F44336',
          }]}>{analysis.confidence.toUpperCase()}</Text>
        </View>
      )}
      {analysis.expirationDate && (
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Expiration Date:</Text>
          <Text style={styles.resultValue}>{analysis.expirationDate}</Text>
        </View>
      )}
      {analysis.currentDate && (
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Current Date:</Text>
          <Text style={styles.resultValue}>{analysis.currentDate}</Text>
        </View>
      )}
      {analysis.visualIndicators && analysis.visualIndicators.length > 0 && (
        <View style={styles.indicatorsContainer}>
          <Text style={styles.indicatorsLabel}>Visual Indicators:</Text>
          {analysis.visualIndicators.map((indicator, index) => (
            <Text key={index} style={styles.indicatorText}>• {indicator}</Text>
          ))}
        </View>
      )}
      {analysis.recommendation && (
        <View style={styles.recommendationContainer}>
          <Text style={styles.recommendationLabel}>Recommendation:</Text>
          <Text style={styles.recommendationText}>{analysis.recommendation}</Text>
        </View>
      )}
      {analysis.reasoning && (
        <View style={styles.reasoningContainer}>
          <Text style={styles.reasoningLabel}>Analysis:</Text>
          <Text style={styles.reasoningText}>{analysis.reasoning}</Text>
        </View>
      )}
      {analysisResult.modelUsed && (
        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>Model: {analysisResult.modelUsed}</Text>
          {analysisResult.responseTime != null && (
            <Text style={styles.metaText}>Response Time: {(analysisResult.responseTime / 1000).toFixed(2)}s</Text>
          )}
        </View>
      )}
    </View>
  );
};

const AnalysisScreen = () => {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  const loadHistory = useCallback(async () => {
    const list = await getScanHistory();
    setHistory(list);
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const openDetail = (item) => {
    setSelected(item);
    setNotesDraft(item.notes || '');
  };

  const closeDetail = () => {
    setSelected(null);
    setNotesDraft('');
  };

  const saveNotes = useCallback(async () => {
    if (!selected?.id) return;
    setSavingNotes(true);
    const next = await updateScanNotes(selected.id, notesDraft);
    setHistory(next);
    setSelected((prev) => (prev ? { ...prev, notes: notesDraft } : null));
    setSavingNotes(false);
  }, [selected, notesDraft]);

  const imageSource = (item) => {
    if (item.imageBase64) {
      return { uri: `data:${item.mimeType || 'image/jpeg'};base64,${item.imageBase64}` };
    }
    if (item.imageUri) return { uri: item.imageUri };
    return null;
  };

  if (selected) {
    const src = imageSource(selected);
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#2D7D3E" barStyle="light-content" />
        <View style={[styles.detailHeader, {paddingTop: Math.max(14, insets.top) + 10}]}>
          <Text style={styles.detailHeaderTitle}>Analysis</Text>
          <TouchableOpacity onPress={closeDetail} style={styles.closeBtn}>
            <CloseIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailScrollContent}>
          {src && (
            <View style={styles.detailImageWrap}>
              <Image source={src} style={styles.detailImage} resizeMode="contain" />
            </View>
          )}
          <Text style={styles.dateLabel}>{formatDate(selected.date)}</Text>
          {renderAnalysisBlock(selected.analysisResult)}
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes (Kissan)</Text>
            <TextInput
              style={styles.notesInput}
              value={notesDraft}
              onChangeText={setNotesDraft}
              placeholder="Add your notes here..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={[styles.saveNotesBtn, savingNotes && styles.saveNotesBtnDisabled]}
              onPress={saveNotes}
              disabled={savingNotes}>
              <Text style={styles.saveNotesBtnText}>{savingNotes ? 'Saving...' : 'Save notes'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={[styles.header, {paddingTop: Math.max(16, insets.top) + 8}]}>
        <Text style={styles.headerTitle}>Analysis history</Text>
      </View>
      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No scan history yet.</Text>
          <Text style={styles.emptySubtext}>Complete a scan to see results here.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({item}) => {
            const status = getStatusFromResult(item.analysisResult);
            const src = imageSource(item);
            return (
              <TouchableOpacity style={styles.card} onPress={() => openDetail(item)} activeOpacity={0.8}>
                {src && (
                  <Image source={src} style={styles.cardThumb} resizeMode="cover" />
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
                  <View style={[styles.cardBadge, {backgroundColor: status.color}]}>
                    <Text style={styles.cardBadgeText}>{status.text}</Text>
                  </View>
                  {item.notes ? (
                    <Text style={styles.cardNotes} numberOfLines={2}>{item.notes}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardThumb: {
    width: '100%',
    height: 220,
    backgroundColor: '#E0E0E0',
  },
  cardBody: {
    padding: 16,
    minHeight: 88,
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  cardBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardNotes: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  detailHeader: {
    backgroundColor: '#2D7D3E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 8,
  },
  detailScroll: {
    flex: 1,
  },
  detailScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  detailImageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  detailImage: {
    width: '100%',
    height: 280,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    minHeight: 560,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
  resultValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  reasoningContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  reasoningLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  reasoningText: { fontSize: 14, color: '#666', lineHeight: 20 },
  recommendationContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  recommendationLabel: { fontSize: 14, fontWeight: '600', color: '#E65100', marginBottom: 8 },
  recommendationText: { fontSize: 14, color: '#E65100', lineHeight: 20 },
  indicatorsContainer: { marginTop: 12, padding: 12, backgroundColor: '#E3F2FD', borderRadius: 8 },
  indicatorsLabel: { fontSize: 14, fontWeight: '600', color: '#1976D2', marginBottom: 8 },
  indicatorText: { fontSize: 13, color: '#1565C0', marginTop: 4 },
  metaInfo: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  metaText: { fontSize: 12, color: '#999', marginTop: 4 },
  notesSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveNotesBtn: {
    backgroundColor: '#2D7D3E',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  saveNotesBtnDisabled: {
    opacity: 0.7,
  },
  saveNotesBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AnalysisScreen;
