import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from '../components/Icons';
import { fetchProductDetail, fetchProductByProductNameAndCategory } from '../utils/productsApi';

/** Ensure value is safe to render inside <Text> (never pass objects). */
function toText(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(toText).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const ProductDetailScreen = ({ productId, productName, categoryName, onBack }) => {
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data = null;
      if (productName != null && productName !== '' && categoryName != null && categoryName !== '') {
        data = await fetchProductByProductNameAndCategory(productName, categoryName);
      } else if (productId != null) {
        data = await fetchProductDetail(Number(productId), true);
      }
      setProduct(data);
    } catch (e) {
      setError(e.message || 'Failed to load');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId, productName, categoryName]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(12, insets.top) + 8 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ChevronLeftIcon size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2D7D3E" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(12, insets.top) + 8 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ChevronLeftIcon size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'Not found'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const p = product;
  const name = toText(p.product_name ?? p.productName ?? p.name ?? '');
  const brand = toText(p.brand_name ?? p.brand ?? p.brandName ?? p.brand_display_name ?? '');
  const shortDesc = toText(p.shortDescription ?? p.product_intro ?? p.introText ?? p.description ?? '');
  const fullDesc = toText(p.description ?? p.fullDescription ?? p.productIntro ?? '');
  const productIntro = toText(p.product_intro ?? p.productIntro ?? shortDesc);
  const imageUrl = p.product_image_url ?? p.imageUrl ?? p.image_url;
  let packSizes = [];
  if (Array.isArray(p.packSizes)) {
    packSizes = p.packSizes.map((x) => ({
      size: typeof x === 'object' && x != null ? toText(x.size ?? x.packSize ?? x.name) : toText(x),
      price: typeof x === 'object' && x != null ? x.price : p.price,
    }));
  } else if (Array.isArray(p.product_variants)) {
    packSizes = p.product_variants.map((v) => {
      const firstAttr = Array.isArray(v.attributes) && v.attributes[0] ? v.attributes[0] : null;
      const packName = firstAttr?.name ?? v.pack_size ?? v.size ?? v.attribute ?? v.name ?? '';
      return {
        variant_id: v.variant_id,
        size: toText(packName),
        price: v.price ?? p.price,
      };
    });
  } else if (p.packSizes && typeof p.packSizes === 'object' && !Array.isArray(p.packSizes)) {
    packSizes = Object.entries(p.packSizes).map(([size, price]) => ({ size, price }));
  }
  const defaultPrice = p.price != null ? p.price : (packSizes[0]?.price);
  const displayPrice = packSizes.length > 0 && selectedPackIndex < packSizes.length
    ? (packSizes[selectedPackIndex].price ?? defaultPrice)
    : defaultPrice;
  const packLabel = packSizes.length > 0 && selectedPackIndex < packSizes.length
    ? toText(packSizes[selectedPackIndex].size ?? packSizes[selectedPackIndex].packSize ?? '')
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name || 'Product'}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.productImagePlaceholderText}>{name.charAt(0) || 'P'}</Text>
            </View>
          )}

          <View style={styles.infoBlock}>
            {brand ? (
              <Text style={styles.brandLabel}>{brand.toUpperCase()}</Text>
            ) : null}
            <Text style={styles.productName}>{name}</Text>
            {shortDesc ? (
              <Text style={styles.shortDesc} numberOfLines={3}>{shortDesc}</Text>
            ) : null}
            {(productIntro || fullDesc) && (
              <TouchableOpacity
                onPress={() => setDescExpanded(!descExpanded)}
                style={styles.knowMoreWrap}
              >
                <Text style={styles.knowMoreLink}>Know More</Text>
              </TouchableOpacity>
            )}
            {packSizes.length > 0 ? (
              <>
                <Text style={styles.packLabel}>Select type of pack</Text>
                <View style={styles.packOptions}>
                  {packSizes.map((pack, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.packBtn, selectedPackIndex === i && styles.packBtnSelected]}
                      onPress={() => setSelectedPackIndex(i)}
                    >
                      <Text style={[styles.packBtnText, selectedPackIndex === i && styles.packBtnTextSelected]}>
                        {toText(pack.size ?? pack.packSize ?? '')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : null}
            {displayPrice != null && displayPrice !== '' ? (
              <Text style={styles.price}>₹ {toText(displayPrice)}</Text>
            ) : null}
            <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {p.target_dosages_crop_wise && typeof p.target_dosages_crop_wise === 'object' && !Array.isArray(p.target_dosages_crop_wise) ? (
          <View style={styles.dosageLabelSection}>
            <Text style={styles.dosageLabelTitle}>Dosage (crop-wise)</Text>
            {Object.entries(p.target_dosages_crop_wise).map(([cropLabel, dosage]) => (
              <View key={cropLabel} style={styles.dosageLabelRow}>
                <Text style={styles.dosageLabelKey}>{toText(cropLabel)}</Text>
                <Text style={styles.dosageLabelValue}>{toText(dosage)}</Text>
              </View>
            ))}
          </View>
        ) : p.target_dosages_crop_wise ? (
          <View style={styles.dosageLabelSection}>
            <Text style={styles.dosageLabelTitle}>Dosage (crop-wise)</Text>
            <Text style={styles.dosageLabelValue}>{toText(p.target_dosages_crop_wise)}</Text>
          </View>
        ) : null}

        {(productIntro || fullDesc) && descExpanded ? (
          <View style={styles.descSection}>
            <TouchableOpacity
              style={styles.descSectionHeader}
              onPress={() => setDescExpanded(!descExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.descSectionTitle}>Product description</Text>
              <Text style={styles.descSectionChevron}>▲</Text>
            </TouchableOpacity>
            <View style={styles.descSectionBody}>
              {productIntro ? (
                <>
                  <Text style={styles.descSubhead}>Product intro</Text>
                  <Text style={styles.bodyText}>{productIntro}</Text>
                </>
              ) : null}
              {fullDesc && fullDesc !== productIntro ? (
                <>
                  <Text style={styles.descSubhead}>Product description</Text>
                  <Text style={styles.bodyText}>{fullDesc}</Text>
                </>
              ) : fullDesc ? (
                <Text style={styles.bodyText}>{fullDesc}</Text>
              ) : null}
            </View>
          </View>
        ) : (productIntro || fullDesc) ? (
          <TouchableOpacity
            style={styles.descSectionHeader}
            onPress={() => setDescExpanded(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.descSectionTitle}>Product description</Text>
            <Text style={styles.descSectionChevron}>▼</Text>
          </TouchableOpacity>
        ) : null}

        {p.target_crops?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target crops</Text>
            <View style={styles.cropChips}>
              {p.target_crops.map((tc, i) => (
                <View key={i} style={styles.cropChip}>
                  {tc.image_url ? (
                    <Image source={{ uri: tc.image_url }} style={styles.cropChipImage} resizeMode="cover" />
                  ) : null}
                  <Text style={styles.cropChipName}>{toText(tc.display_name ?? tc.name)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {p.product_benefits?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            {p.product_benefits.map((b, i) => (
              <Text key={i} style={styles.bulletPoint}>• {toText(b)}</Text>
            ))}
          </View>
        ) : null}

        {p.how_to_use ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to use</Text>
            <Text style={styles.bodyText}>{toText(p.how_to_use)}</Text>
          </View>
        ) : null}

        {p.technical_content_name ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical content</Text>
            <Text style={styles.bodyText}>{toText(p.technical_content_name)}</Text>
          </View>
        ) : null}
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
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  headerRight: { width: 44 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: { fontSize: 14, color: '#C62828', textAlign: 'center' },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2D7D3E',
    borderRadius: 10,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  topRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  productImage: {
    width: 120,
    height: 160,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2D7D3E',
  },
  infoBlock: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-start',
  },
  brandLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  shortDesc: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 6,
  },
  knowMoreWrap: { marginBottom: 10 },
  knowMoreLink: {
    fontSize: 14,
    color: '#2D7D3E',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  packLabel: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
  },
  packOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  packBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D7D3E',
  },
  packBtnSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2D7D3E',
  },
  packBtnText: { fontSize: 14, color: '#2D7D3E', fontWeight: '500' },
  packBtnTextSelected: { color: '#2D7D3E', fontWeight: '600' },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: '#2D7D3E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  dosageLabelSection: {
    backgroundColor: '#E8F5E9',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2D7D3E',
  },
  dosageLabelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D7D3E',
    marginBottom: 10,
  },
  dosageLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 4,
  },
  dosageLabelKey: {
    fontSize: 14,
    color: '#1B5E20',
    flex: 1,
    fontWeight: '500',
  },
  dosageLabelValue: {
    fontSize: 14,
    color: '#2D7D3E',
    fontWeight: '600',
    marginLeft: 12,
  },
  descSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  descSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  descSectionTitle: {
    fontSize: 16,
    color: '#2D7D3E',
    fontWeight: '500',
  },
  descSectionChevron: {
    fontSize: 12,
    color: '#666',
  },
  descSectionBody: { paddingTop: 12 },
  descSubhead: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 12,
  },
  section: {
    padding: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  cropChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  cropChipImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  cropChipName: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
  },
  bulletPoint: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 4,
  },
});

export default ProductDetailScreen;
