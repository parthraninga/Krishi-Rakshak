import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {CameraIcon, UploadIcon, CloseIcon, CheckCircleIcon} from '../components/Icons';

const example1 = require('../../assets/example-1.png');
const example2 = require('../../assets/example-2.png');

const ScanScreen = ({onClose, onSaveToHistory}) => {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mimeType, setMimeType] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showExamplesModal, setShowExamplesModal] = useState(false);

  const handleClose = () => {
    if (analysisResult && (imageBase64 || imageUri) && typeof onSaveToHistory === 'function') {
      const entry = {
        id: Date.now().toString(),
        imageUri: imageUri || null,
        imageBase64: imageBase64 || null,
        mimeType: mimeType || 'image/jpeg',
        analysisResult,
        date: new Date().toISOString(),
        notes: '',
      };
      onSaveToHistory(entry);
    }
    onClose();
  };

  const requestCameraPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const handleCamera = async () => {
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to scan products.',
        [{text: 'OK'}]
      );
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
      saveToPhotos: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to capture image');
        return;
      }
      
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64);
        setMimeType(asset.type || 'image/jpeg');
        setAnalysisResult(null);
      }
    });
  };

  const handleUpload = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to select image');
        return;
      }
      
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64);
        setMimeType(asset.type || 'image/jpeg');
        setAnalysisResult(null);
      }
    });
  };

  const handleExampleClick = async (exampleSource) => {
    try {
      setShowExamplesModal(false);
      setIsAnalyzing(true);
      setAnalysisResult(null);

      // Get the asset source
      const resolvedSource = Image.resolveAssetSource(exampleSource);
      
      // Set the image URI for preview
      setImageUri(resolvedSource.uri);
      setMimeType('image/png');

      // Fetch the image and convert to base64
      const imageResponse = await fetch(resolvedSource.uri);
      const blob = await imageResponse.blob();
      
      // Convert blob to base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      setImageBase64(base64Data);

      // Automatically trigger analysis
      const requestBody = {
        image: base64Data,
        mimeType: 'image/png',
      };

      const response = await fetch(
        'https://ac8h6rneq4.execute-api.ap-south-1.amazonaws.com/check-expiration',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      
      if (data.success && data.result) {
        setAnalysisResult(data.result);
      } else {
        Alert.alert('Analysis Failed', 'Unable to analyze the image. Please try again.');
      }
    } catch (error) {
      console.error('Example Analysis Error:', error);
      Alert.alert('Error', 'Failed to analyze the example image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      Alert.alert('No Image', 'Please capture or select an image first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const requestBody = {
        image: imageBase64,
        mimeType: mimeType || 'image/jpeg',
      };

      const response = await fetch(
        'https://ac8h6rneq4.execute-api.ap-south-1.amazonaws.com/check-expiration',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      
      if (data.success && data.result) {
        setAnalysisResult(data.result);
      } else {
        Alert.alert('Analysis Failed', 'Unable to analyze the image. Please try again.');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Failed to connect to the analysis service. Please check your internet connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAnalysisResult = () => {
    if (!analysisResult || !analysisResult.analysis) return null;

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
              color: analysis.confidence === 'high' ? '#4CAF50' : 
                     analysis.confidence === 'medium' ? '#FF9800' : '#F44336'
            }]}>
              {analysis.confidence.toUpperCase()}
            </Text>
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

        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>Model: {analysisResult.modelUsed}</Text>
          <Text style={styles.metaText}>
            Response Time: {(analysisResult.responseTime / 1000).toFixed(2)}s
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2D7D3E" barStyle="light-content" />
      
      {/* Header - padding so it doesn't collide with status/notch */}
      <View style={[styles.header, {paddingTop: Math.max(16, insets.top) + 12}]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Analyze Seeds, Fertilizers</Text>
          <Text style={styles.headerTitle}>and Pesticides</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.examplesButton} 
            onPress={() => setShowExamplesModal(true)}>
            <Text style={styles.examplesButtonText}>Examples</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <CloseIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Examples Modal */}
      <Modal
        visible={showExamplesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExamplesModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Example Images</Text>
              <TouchableOpacity 
                onPress={() => setShowExamplesModal(false)}
                style={styles.modalCloseButton}>
                <CloseIcon size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleLabel}>Example 1 - Tap to Analyze</Text>
                <TouchableOpacity 
                  onPress={() => handleExampleClick(example1)}
                  activeOpacity={0.8}>
                  <Image 
                    source={example1} 
                    style={styles.exampleImage}
                    resizeMode="contain"
                  />
                  <View style={styles.exampleOverlay}>
                    <View style={styles.exampleBadge}>
                      <Text style={styles.exampleBadgeText}>Tap to Analyze</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
              
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleLabel}>Example 2 - Tap to Analyze</Text>
                <TouchableOpacity 
                  onPress={() => handleExampleClick(example2)}
                  activeOpacity={0.8}>
                  <Image 
                    source={example2} 
                    style={styles.exampleImage}
                    resizeMode="contain"
                  />
                  <View style={styles.exampleOverlay}>
                    <View style={styles.exampleBadge}>
                      <Text style={styles.exampleBadgeText}>Tap to Analyze</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalCloseButtonBottom}
                onPress={() => setShowExamplesModal(false)}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input image - always show when we have image (or result), so it's visible on final analysis page */}
        {(imageUri || (analysisResult && imageBase64)) ? (
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.inputImageLabel}>Input image</Text>
            <Image
              source={
                imageBase64
                  ? { uri: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` }
                  : { uri: imageUri }
              }
              style={styles.imagePreview}
            />
            {!analysisResult && (
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  setImageUri(null);
                  setImageBase64(null);
                  setAnalysisResult(null);
                }}>
                <CloseIcon size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <CameraIcon size={80} color="#CCCCCC" />
            <Text style={styles.placeholderText}>
              No image selected
            </Text>
            <Text style={styles.placeholderSubtext}>
              Capture or upload an image to analyze
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {!analysisResult && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCamera}>
              <CameraIcon size={32} color="#2D7D3E" />
              <Text style={styles.actionButtonText}>Scan QR / Capture</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleUpload}>
              <UploadIcon size={32} color="#2D7D3E" />
              <Text style={styles.actionButtonText}>Upload from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Analyze Button */}
        {imageUri && !analysisResult && (
          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={isAnalyzing}>
            {isAnalyzing ? (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.analyzeButtonText}>AI Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.analyzeButtonText}>Submit for Analysis</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Analysis Result */}
        {renderAnalysisResult()}

        {/* Retry Button */}
        {analysisResult && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setImageUri(null);
              setImageBase64(null);
              setAnalysisResult(null);
            }}>
            <Text style={styles.retryButtonText}>Analyze Another Image</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2D7D3E',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  examplesButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  examplesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputImageLabel: {
    position: 'absolute',
    top: 10,
    left: 12,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  placeholderContainer: {
    height: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  analyzeButton: {
    backgroundColor: '#2D7D3E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#81C784',
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    minHeight: 420,
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
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reasoningContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  reasoningLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  reasoningText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  recommendationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  indicatorsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  indicatorsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  indicatorText: {
    fontSize: 13,
    color: '#1565C0',
    marginTop: 4,
  },
  metaInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2D7D3E',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D7D3E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    padding: 20,
  },
  exampleContainer: {
    marginBottom: 24,
  },
  exampleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  exampleImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  exampleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
  },
  exampleBadge: {
    backgroundColor: 'rgba(45, 125, 62, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exampleBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCloseButtonBottom: {
    backgroundColor: '#2D7D3E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ScanScreen;
