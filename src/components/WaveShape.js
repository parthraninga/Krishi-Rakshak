import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * Simple wave shape for hero section (replaces top-wave1.png / top-wave2.png from template).
 */
export function WaveTop({ width = 400, height = 80, color = '#2D7D3E', style }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 400 80" fill="none" style={style}>
      <Path
        d="M0 40 Q100 0 200 40 T400 40 L400 80 L0 80 Z"
        fill={color}
      />
    </Svg>
  );
}

/**
 * Softer wave for lower edge of hero (second wave layer).
 */
export function WaveBottom({ width = 400, height = 60, color = '#1B5E20', style }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 400 60" fill="none" style={style}>
      <Path
        d="M0 30 Q80 60 160 30 T320 30 T400 30 L400 60 L0 60 Z"
        fill={color}
      />
    </Svg>
  );
}
