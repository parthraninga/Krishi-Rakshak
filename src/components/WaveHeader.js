import React, {useEffect, useRef} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const WAVE_EASING = Easing.bezier(0.36, 0.45, 0.63, 0.53);
const BACK_WAVE_DURATION = 25000;
const FRONT_WAVE_DURATION = 18000;

const backWaveImg = require('../../assets/wave/top-wave2.png');
const frontWaveImg = require('../../assets/wave/top-wave1.png');
const farmerLeftImg = require('../../assets/wave/topcouple-left.svg');
const farmerCenterImg = require('../../assets/wave/topfarmer-center.svg');
const farmerRightImg = require('../../assets/wave/topcouple-right.svg');

const defaultColors = ['#2D7D3E', '#1B5E20'];

/**
 * WaveHeader – IFFCO "Story of IFFCO" style hero section.
 * Layers (back → front): gradient, back wave (tiled, animated), farmer SVGs, front wave (tiled, animated), content, bottom curve.
 * Requires: react-native-linear-gradient.
 * Assets in assets/wave/: top-wave1.png, top-wave2.png, topcouple-left.svg, topfarmer-center.svg, topcouple-right.svg.
 */
function WaveHeader({
  height = 300,
  colors = defaultColors,
  children,
  showFarmers = true,
}) {
  const backTranslateX = useRef(new Animated.Value(0)).current;
  const frontTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const runBack = () => {
      backTranslateX.setValue(0);
      Animated.timing(backTranslateX, {
        toValue: -SCREEN_WIDTH,
        duration: BACK_WAVE_DURATION,
        easing: WAVE_EASING,
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) runBack();
      });
    };
    const runFront = () => {
      frontTranslateX.setValue(0);
      Animated.timing(frontTranslateX, {
        toValue: -SCREEN_WIDTH,
        duration: FRONT_WAVE_DURATION,
        easing: WAVE_EASING,
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) runFront();
      });
    };
    runBack();
    runFront();
  }, [backTranslateX, frontTranslateX]);

  return (
    <View style={[styles.container, {height}]}>
      {/* 1. Gradient background – full bleed */}
      <LinearGradient
        colors={colors}
        style={StyleSheet.absoluteFill}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
      />

      {/* 2. Back wave – tiled 4×, animated left, 60% opacity */}
      <View style={styles.waveRow} pointerEvents="none">
        <Animated.View
          style={[
            styles.waveTiles,
            {transform: [{translateX: backTranslateX}]},
          ]}>
          {[0, 1, 2, 3].map((i) => (
            <Image
              key={`back-${i}`}
              source={backWaveImg}
              style={[styles.waveTile, styles.backWaveOpacity]}
              resizeMode="stretch"
            />
          ))}
        </Animated.View>
      </View>

      {/* 3. Farmer illustrations – absolute bottom, static */}
      {showFarmers && (
        <View style={styles.farmersRow} pointerEvents="none">
          <Image
            source={farmerLeftImg}
            style={[styles.farmerImg, styles.farmerLeft]}
            resizeMode="contain"
          />
          <Image
            source={farmerCenterImg}
            style={[styles.farmerImg, styles.farmerCenter]}
            resizeMode="contain"
          />
          <Image
            source={farmerRightImg}
            style={[styles.farmerImg, styles.farmerRight]}
            resizeMode="contain"
          />
        </View>
      )}

      {/* 4. Front wave – tiled 4×, animated left (faster), 85% opacity */}
      <View style={styles.waveRow} pointerEvents="none">
        <Animated.View
          style={[
            styles.waveTiles,
            {transform: [{translateX: frontTranslateX}]},
          ]}>
          {[0, 1, 2, 3].map((i) => (
            <Image
              key={`front-${i}`}
              source={frontWaveImg}
              style={[styles.waveTile, styles.frontWaveOpacity]}
              resizeMode="stretch"
            />
          ))}
        </Animated.View>
      </View>

      {/* 5. Bottom curve – white rounded transition (below content) */}
      <View style={styles.bottomCurve} />

      {/* 6. Content overlay – above all */}
      {children != null && (
        <View style={styles.contentOverlay}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  waveRow: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  waveTiles: {
    flexDirection: 'row',
    height: '100%',
    width: SCREEN_WIDTH * 4,
  },
  waveTile: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  backWaveOpacity: {
    opacity: 0.6,
  },
  frontWaveOpacity: {
    opacity: 0.85,
  },
  farmersRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 0,
  },
  farmerImg: {
    position: 'absolute',
    bottom: 0,
    height: '70%',
    width: '33%',
  },
  farmerLeft: {
    left: 0,
    width: '28%',
  },
  farmerCenter: {
    left: '36%',
    width: '28%',
  },
  farmerRight: {
    right: 0,
    left: undefined,
    width: '28%',
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCurve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});

export default WaveHeader;
