import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

import { WaveTop, WaveBottom } from './WaveShape';
import { SeedSproutingIcon } from './DesignIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WAVE_HEIGHT = 56;
const HERO_HEIGHT = 140;

export function DesignHero() {
  return (
    <View style={styles.container}>
      {/* Top wave layer (template: top-wave1) */}
      <View style={styles.waveRow}>
        <WaveTop width={SCREEN_WIDTH + 100} height={WAVE_HEIGHT} color="#2D7D3E" style={styles.waveTop} />
      </View>
      {/* Between the waves: design icons (SVG file imports resolved to asset IDs, so use inline SVGs) */}
      <View style={styles.figuresRow}>
        <View style={styles.figureWrap}>
          <SeedSproutingIcon width={80} height={80} />
        </View>
        <View style={styles.figureWrapCenter}>
          <Text style={styles.heroTitle}>KrishiRakshak</Text>
        </View>
        <View style={styles.figureWrap}>
          <SeedSproutingIcon width={80} height={80} />
        </View>
      </View>
      {/* Bottom wave layer (template: top-wave2) */}
      <View style={styles.waveRowBottom}>
        <WaveBottom width={SCREEN_WIDTH + 100} height={44} color="#1B5E20" style={styles.waveBottom} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: -16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  waveRow: {
    height: WAVE_HEIGHT,
    marginTop: -1,
  },
  waveTop: {
    position: 'absolute',
    left: -50,
    top: 0,
  },
  figuresRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: HERO_HEIGHT,
    paddingBottom: 0,
  },
  figureWrap: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  figureWrapCenter: {
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  waveRowBottom: {
    height: 44,
    marginTop: -2,
  },
  waveBottom: {
    position: 'absolute',
    left: -50,
    bottom: 0,
  },
});
