/**
 * SVG icons for each crop in the app.
 * Use getCropIcon(cropName, size, color) to render the right icon.
 */
import React from 'react';
import Svg, { Path, Circle, Rect, G, Ellipse } from 'react-native-svg';

const defaultSize = 64;
const defaultColor = '#4CAF50';

const makeCropIcon = (viewBox, content) =>
  function CropIcon({ size = defaultSize, color = defaultColor }) {
    return (
      <Svg width={size} height={size} viewBox={viewBox} fill="none">
        {typeof content === 'function' ? content(color) : content}
      </Svg>
    );
  };

// Spice crops
export const CuminIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill={c}>
    <Ellipse cx="12" cy="12" rx="3" ry="4" opacity="0.9" />
    <Ellipse cx="9" cy="11" rx="1.2" ry="1.8" />
    <Ellipse cx="15" cy="11" rx="1.2" ry="1.8" />
    <Path d="M12 8v1M12 15v1" stroke={c} strokeWidth="0.8" opacity="0.7" />
  </G>
));
export const TurmericIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill={c}>
    <Ellipse cx="12" cy="12" rx="4" ry="5" fill="#FF9800" />
    <Ellipse cx="10" cy="10" rx="2" ry="2.5" fill="#FFB74D" opacity="0.8" />
    <Path d="M12 5v14" stroke="#E65100" strokeWidth="1.2" strokeLinecap="round" />
  </G>
));
export const GingerIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#8D6E63" stroke="#6D4C41" strokeWidth="0.8">
    <Path d="M12 4c-2 2-1 6 1 8s5 2 6 0 0-4-2-6-3-4-5-2z" />
    <Path d="M10 8c1 1 3 0 4 2s0 4-2 5" opacity="0.8" />
    <Ellipse cx="12" cy="14" rx="3" ry="4" fill="#A1887F" opacity="0.7" />
  </G>
));
export const GarlicIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#FFF8E1" stroke="#FFE082" strokeWidth="0.8">
    <Circle cx="12" cy="10" r="4" />
    <Path d="M12 14v6" stroke="#FFD54F" strokeWidth="1" />
    <Circle cx="10" cy="8" r="1" fill="#FFECB3" />
    <Circle cx="14" cy="9" r="1" fill="#FFECB3" />
  </G>
));
export const CorianderIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill={c}>
    <Path d="M12 3c-2 4 0 8 2 10s6 1 8-2-1-6-3-8-5-2-7 0z" opacity="0.9" />
    <Ellipse cx="12" cy="14" rx="3" ry="2" />
    <Path d="M10 6l1 2M14 6l-1 2" stroke={c} strokeWidth="0.8" opacity="0.7" />
  </G>
));
export const ChilliIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#E53935" stroke="#C62828" strokeWidth="0.6">
    <Path d="M12 2l1 6 4 2-2 5 2 6-5-3-5 3 2-6-2-5 4-2 1-6z" />
    <Path d="M12 5v8" stroke="#FF8A80" strokeWidth="0.8" opacity="0.6" />
  </G>
));

// Pulses
export const ArharIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill={c}>
    <Ellipse cx="12" cy="12" rx="4" ry="3" />
    <Path d="M8 12h8" stroke="#81C784" strokeWidth="1" opacity="0.6" />
  </G>
));
export const GramIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#8D6E63">
    <Circle cx="12" cy="12" r="4" />
    <Ellipse cx="10" cy="11" rx="1.5" ry="2" fill="#A1887F" />
  </G>
));
export const LentilIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#D7CCC8">
    <Ellipse cx="12" cy="12" rx="4" ry="3" />
    <Ellipse cx="11" cy="11.5" rx="2" ry="1.5" fill="#BCAAA4" />
  </G>
));
export const GreenGramIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#7CB342">
    <Ellipse cx="12" cy="12" rx="4" ry="3" />
    <Path d="M9 12h6" stroke="#9CCC65" strokeWidth="0.8" opacity="0.7" />
  </G>
));
export const BlackGramIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#5D4037">
    <Ellipse cx="12" cy="12" rx="4" ry="3" />
    <Ellipse cx="11" cy="11" rx="2" ry="1.5" fill="#6D4C41" />
  </G>
));
export const SoybeanIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#558B2F">
    <Ellipse cx="12" cy="12" rx="3.5" ry="4" />
    <Path d="M12 8v8M9 11h6" stroke="#7CB342" strokeWidth="0.8" opacity="0.6" />
  </G>
));

// Cereals
export const PaddyIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill={c}>
    <Path d="M12 2l-2 4v3h1V6l1-2 1 2v3h1V6l-2-4z" />
    <Path d="M12 9l-1 2v2h1v-2l1-2z" opacity="0.9" />
    <Path d="M12 14l-1 1v2h1v-2l1-1z" opacity="0.8" />
    <Path d="M10 18v2h4v-2" stroke={c} strokeWidth="1" />
  </G>
));
export const WheatIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#F9A825">
    <Path d="M12 2l-3 4v2h1V6l2-2 2 2v2h1V6l-3-4z" />
    <Path d="M12 8l-2 2v2h1v-2l1-1 1 1v2h1v-2l-2-2z" />
    <Path d="M12 14l-1 1v2h1v-2l1 1v2h1v-2l-2-2z" />
    <Path d="M11 19v2h2v-2" stroke="#FBC02D" strokeWidth="1" />
  </G>
));
export const MaizeIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#FFB300">
    <Rect x="10" y="4" width="4" height="16" rx="1" />
    <Path d="M11 7h2M11 10h2M11 13h2M11 16h2" stroke="#FFA000" strokeWidth="0.8" />
    <Path d="M9 5l1 2M15 5l-1 2" stroke={c} strokeWidth="1" />
  </G>
));
export const BajraIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#8D6E63">
    <Path d="M12 3l-2 3v4h1V7l1-2 1 2v4h1V6l-2-3z" />
    <Ellipse cx="12" cy="15" rx="2.5" ry="3" />
    <Path d="M10 18v2h4v-2" stroke="#A1887F" strokeWidth="1" />
  </G>
));
export const JowarIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#795548">
    <Path d="M12 2l-1 5v3h1V8l1-3 1 3v3h1V7l-2-5z" />
    <Ellipse cx="12" cy="15" rx="3" ry="3.5" />
    <Path d="M10 19v1h4v-1" stroke="#6D4C41" strokeWidth="1" />
  </G>
));

// Vegetables
export const TomatoIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#E53935">
    <Circle cx="12" cy="12" r="5" />
    <Path d="M12 5c-1 1 0 3 0 4" stroke="#C62828" strokeWidth="0.8" />
    <Path d="M12 7v2" stroke="#FF8A80" strokeWidth="0.6" opacity="0.6" />
    <Path d="M10 4l2 1 2-1" stroke="#5D4037" strokeWidth="1" fill="none" />
  </G>
));
export const OnionIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#FFF8E1" stroke="#FFE082" strokeWidth="0.6">
    <Circle cx="12" cy="12" r="5" />
    <Circle cx="12" cy="12" r="3" fill="none" stroke="#FFECB3" strokeWidth="0.8" />
    <Path d="M12 6v2M12 16v2M8 12h2M14 12h2" stroke="#FFD54F" strokeWidth="0.6" opacity="0.7" />
  </G>
));
export const PotatoIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#8D6E63" stroke="#6D4C41" strokeWidth="0.6">
    <Ellipse cx="12" cy="12" rx="5" ry="6" />
    <Ellipse cx="10" cy="10" rx="2" ry="2.5" fill="#A1887F" opacity="0.6" />
    <Ellipse cx="14" cy="13" rx="1.5" ry="2" fill="#A1887F" opacity="0.5" />
  </G>
));
export const CabbageIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#66BB6A" stroke="#4CAF50" strokeWidth="0.6">
    <Circle cx="12" cy="12" r="5" />
    <Path d="M12 8c2 0 3 2 3 4s-1 4-3 4-3-2-3-4 1-4 3-4z" fill="#81C784" opacity="0.8" />
    <Path d="M9 11c0 2 1.5 3 3 3s3-1 3-3" stroke="#A5D6A7" strokeWidth="0.6" fill="none" />
  </G>
));
export const BrinjalIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#7B1FA2" stroke="#6A1B9A" strokeWidth="0.6">
    <Ellipse cx="12" cy="13" rx="4" ry="6" />
    <Path d="M12 6v2" stroke="#9C27B0" strokeWidth="0.8" />
    <Path d="M10 5l2 1 2-1" stroke="#5D4037" strokeWidth="0.8" fill="none" />
  </G>
));

// Fruits
export const MangoIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#FF9800" stroke="#F57C00" strokeWidth="0.5">
    <Path d="M12 4c-2 2-3 6-2 9 0 4 2 7 4 7s4-3 4-7c1-3 0-7-2-9-1-1-2-1-4 0z" />
    <Path d="M12 7v6" stroke="#FFB74D" strokeWidth="0.6" opacity="0.5" />
  </G>
));
export const BananaIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#FFEB3B" stroke="#FBC02D" strokeWidth="0.5">
    <Path d="M8 6c-1 2-1 5 0 8 1 4 3 6 5 6 2 0 4-2 5-5 1-3 0-6-1-8-2-2-5-2-9-1z" />
    <Path d="M10 9v6" stroke="#FFF59D" strokeWidth="0.5" opacity="0.6" />
  </G>
));
export const AppleIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#E53935" stroke="#C62828" strokeWidth="0.5">
    <Path d="M12 3c-2 1-3 4-3 6 0 4 2 7 4 7s3-2 3-5 0-5-1-6c-1-1-2-1-3-2z" />
    <Path d="M12 5c1 0 2 2 2 4s-1 4-2 4-2-2-2-4 1-4 2-4z" fill="#EF5350" opacity="0.7" />
    <Path d="M11 4l1 1 1-1" stroke="#5D4037" strokeWidth="0.6" fill="none" />
  </G>
));
export const GrapesIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#7B1FA2">
    <Circle cx="9" cy="10" r="2.5" />
    <Circle cx="15" cy="10" r="2.5" />
    <Circle cx="12" cy="14" r="2.5" />
    <Circle cx="9" cy="17" r="2" opacity="0.9" />
    <Circle cx="15" cy="17" r="2" opacity="0.9" />
    <Path d="M11 20v1M13 20v1" stroke="#5D4037" strokeWidth="0.8" />
  </G>
));

// Oil seed
export const GroundnutIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#8D6E63" stroke="#6D4C41" strokeWidth="0.5">
    <Ellipse cx="12" cy="12" rx="5" ry="3" />
    <Path d="M7 12h10" stroke="#A1887F" strokeWidth="0.6" />
    <Ellipse cx="10" cy="11" rx="1.5" ry="1" fill="#5D4037" />
    <Ellipse cx="14" cy="13" rx="1.5" ry="1" fill="#5D4037" />
  </G>
));
export const MustardIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#F9A825">
    <Circle cx="12" cy="10" r="3" />
    <Circle cx="10" cy="9" r="1.2" fill="#FFEB3B" />
    <Circle cx="14" cy="9" r="1.2" fill="#FFEB3B" />
    <Path d="M11 13v4h2v-4" stroke="#FBC02D" strokeWidth="0.8" />
    <Path d="M12 17l-1 2h2l-1-2z" fill="#795548" />
  </G>
));

// Cash crops
export const CottonIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="0.5">
    <Circle cx="12" cy="8" r="3.5" />
    <Circle cx="9" cy="11" r="2.5" />
    <Circle cx="15" cy="11" r="2.5" />
    <Circle cx="12" cy="13" r="2.5" />
    <Path d="M12 15v5" stroke="#8BC34A" strokeWidth="1.2" strokeLinecap="round" />
    <Path d="M10 18l-1 2M14 18l1 2" stroke="#8BC34A" strokeWidth="1" strokeLinecap="round" />
  </G>
));
export const SugarcaneIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#8BC34A" stroke="#689F38" strokeWidth="0.5">
    <Rect x="10" y="3" width="4" height="17" rx="1.5" />
    <Path d="M10 6h4M10 9h4M10 12h4M10 15h4" stroke="#689F38" strokeWidth="0.8" />
    <Path d="M9 2l-1 2M15 2l1 2" stroke={c} strokeWidth="1" strokeLinecap="round" />
  </G>
));
export const TobaccoIcon = makeCropIcon('0 0 24 24', (c) => (
  <G fill="#8D6E63" stroke="#6D4C41" strokeWidth="0.5">
    <Path d="M12 3v16" strokeWidth="2" />
    <Ellipse cx="12" cy="8" rx="4" ry="2.5" fill="#A1887F" opacity="0.8" />
    <Ellipse cx="12" cy="14" rx="4" ry="2.5" fill="#A1887F" opacity="0.8" />
    <Path d="M10 4l2 2 2-2" stroke="#5D4037" strokeWidth="0.6" fill="none" />
  </G>
));

/** Normalize crop name for lookup (lowercase, trim) */
const normalizeName = (name) => (name || '').toLowerCase().trim().replace(/\s+/g, ' ');

const CROP_ICON_MAP = {
  cumin: CuminIcon,
  turmeric: TurmericIcon,
  ginger: GingerIcon,
  garlic: GarlicIcon,
  coriander: CorianderIcon,
  chilli: ChilliIcon,
  arhar: ArharIcon,
  gram: GramIcon,
  lentil: LentilIcon,
  'green gram': GreenGramIcon,
  'black gram': BlackGramIcon,
  soybean: SoybeanIcon,
  paddy: PaddyIcon,
  wheat: WheatIcon,
  maize: MaizeIcon,
  bajra: BajraIcon,
  jowar: JowarIcon,
  tomato: TomatoIcon,
  onion: OnionIcon,
  potato: PotatoIcon,
  cabbage: CabbageIcon,
  brinjal: BrinjalIcon,
  mango: MangoIcon,
  banana: BananaIcon,
  apple: AppleIcon,
  grapes: GrapesIcon,
  groundnut: GroundnutIcon,
  mustard: MustardIcon,
  cotton: CottonIcon,
  sugarcane: SugarcaneIcon,
  tobacco: TobaccoIcon,
};

/** Get the SVG component for a crop by name. Returns WheatIcon as fallback. */
export function getCropIconComponent(cropName) {
  const key = normalizeName(cropName);
  return CROP_ICON_MAP[key] || WheatIcon;
}

/** Render the crop icon for the given crop (object with .name) or crop name string. */
export function CropIcon({ crop, name, size = defaultSize, color }) {
  const cropName = typeof crop === 'object' && crop != null ? crop.name : name;
  const Icon = getCropIconComponent(cropName || '');
  return <Icon size={size} color={color} />;
}

export default CropIcon;
