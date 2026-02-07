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
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, ArrowRightIcon } from '../components/Icons';
import { fetchProductsByCropForList } from '../utils/productsApi';
import ProductDetailScreen from './ProductDetailScreen';

const UI_CATEGORY_TITLES = {
  seeds: 'Seeds',
  fertilizers: 'Fertilizers',
  insecticide: 'Insecticide details',
};

/** Product list uses name and image_url from API. */
function getProductName(product) {
  return product.name ?? product.product_name ?? '';
}
function getProductImageUrl(product) {
  return product.image_url ?? product.product_image_url ?? product.productImageUrl ?? null;
}

const CropProductsScreen = ({ crop, uiCategory, onBack }) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState({ brands: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!crop?.name) return;
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const result = await fetchProductsByCropForList(crop.name);
      setData(result);
    } catch (e) {
      setError(e.message || 'Failed to load');
      setData({ brands: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [crop?.name]);

  useEffect(() => {
    load();
  }, [load]);

  const title = UI_CATEGORY_TITLES[uiCategory] || uiCategory;
  const subtitle = `${crop?.name} – brands & products`;

  if (selectedProductId != null) {
    return (
      <ProductDetailScreen
        productId={selectedProductId}
        onBack={() => setSelectedProductId(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2D7D3E" />
          <Text style={styles.loadingText}>Loading products…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              colors={['#2D7D3E']}
            />
          }
        >
          {data.brands?.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySub}>
                No {title.toLowerCase()} for {crop?.name} in the catalog.
              </Text>
            </View>
          ) : (
            data.brands?.map((brand) => (
              <View key={brand.name} style={styles.brandBlock}>
                <View style={styles.brandHeader}>
                  {brand.image_url ? (
                    <Image
                      source={{ uri: brand.image_url }}
                      style={styles.brandLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.brandLogoPlaceholder}>
                      <Text style={styles.brandLogoText}>
                        {(brand.display_name || brand.name || '').slice(0, 2)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.brandName}>
                    {brand.display_name || brand.name}
                  </Text>
                </View>
                {(brand.products || []).map((product) => (
                  <TouchableOpacity
                    key={product.product_id}
                    style={styles.productRow}
                    onPress={() => setSelectedProductId(product.product_id)}
                    activeOpacity={0.7}
                  >
                    {getProductImageUrl(product) ? (
                      <Image
                        source={{ uri: getProductImageUrl(product) }}
                        style={styles.productThumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.productThumbPlaceholder}>
                        <Text style={styles.productThumbText}>
                          {(getProductName(product) || 'P').slice(0, 1)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {getProductName(product) || '—'}
                      </Text>
                      {product.category_display_name ? (
                        <Text style={styles.productCategory} numberOfLines={1}>
                          {product.category_display_name}
                        </Text>
                      ) : null}
                    </View>
                    <ArrowRightIcon size={20} color="#999" />
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}
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
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    width: 44,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2D7D3E',
    borderRadius: 10,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#666',
  },
  brandBlock: {
    marginBottom: 24,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  brandLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandLogoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  productThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  productThumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productThumbText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D7D3E',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  seedProductCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  seedProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seedProductImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 14,
  },
  seedImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  seedImagePlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D7D3E',
  },
  seedProductInfo: {
    flex: 1,
  },
  seedProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  seedBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seedBrandImage: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 8,
  },
  seedBrandImagePlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  seedBrandPlaceholderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  seedBrandName: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
});

export default CropProductsScreen;
