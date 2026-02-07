import React from 'react';
import Svg, {Path, Circle, Rect, G, Ellipse, Polyline, Line} from 'react-native-svg';

export const LocationIcon = ({size = 20, color = '#2D7D3E'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      fill={color}
    />
  </Svg>
);

export const BellIcon = ({size = 20, color = '#333'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"
      fill={color}
    />
  </Svg>
);

export const MenuIcon = ({size = 20, color = '#333'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill={color} />
  </Svg>
);

export const SearchIcon = ({size = 20, color = '#666'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      fill={color}
    />
  </Svg>
);

export const MicIcon = ({size = 20, color = '#666'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"
      fill={color}
    />
  </Svg>
);

export const TargetIcon = ({size = 32, color = '#FFFFFF'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      fill={color}
    />
    <Circle cx="12" cy="9" r="1" fill="#C62828" />
  </Svg>
);

export const PlusIcon = ({size = 32, color = '#2D7D3E'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
      fill={color}
      stroke={color}
      strokeWidth="1"
    />
  </Svg>
);

export const WheatIcon = ({size = 32, color = '#F9A825'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3L8 7v3h1V7l3-3 3 3v3h1V7l-4-4zm0 6l-2 2v2h1v-2l1-1 1 1v2h1v-2l-2-2zm0 5l-1 1v2h1v-2l1 1v2h1v-2l-2-2zm-2 4l-2 2v2h1v-2l1-1 1 1v2h1v-2l-2-2z"
      fill={color}
    />
    <Ellipse cx="12" cy="5" rx="1.5" ry="2" fill={color} opacity="0.7"/>
    <Ellipse cx="10" cy="8" rx="1" ry="1.5" fill={color} opacity="0.6"/>
    <Ellipse cx="14" cy="8" rx="1" ry="1.5" fill={color} opacity="0.6"/>
    <Ellipse cx="12" cy="11" rx="1" ry="1.5" fill={color} opacity="0.6"/>
  </Svg>
);

export const CottonIcon = ({size = 32, color = '#E0E0E0'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="3.5" fill={color} />
    <Circle cx="9" cy="11" r="2.5" fill={color} />
    <Circle cx="15" cy="11" r="2.5" fill={color} />
    <Circle cx="12" cy="13" r="2.5" fill={color} />
    <Path d="M12 15v6" stroke="#8BC34A" strokeWidth="2" strokeLinecap="round" />
    <Path d="M11 17l-1 2 M13 17l1 2" stroke="#8BC34A" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const TurmericIcon = ({size = 32, color = '#FF9800'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Ellipse cx="12" cy="12" rx="4" ry="6" fill={color} />
    <Ellipse cx="10" cy="10" rx="2" ry="3" fill="#FFB74D" opacity="0.7" />
    <Path d="M12 6v12" stroke="#E65100" strokeWidth="1.5" strokeLinecap="round" />
    <Circle cx="12" cy="8" r="1" fill="#FFD54F" />
  </Svg>
);

export const SugarcaneIcon = ({size = 32, color = '#8BC34A'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="10" y="4" width="4" height="16" rx="2" fill={color} />
    <Line x1="10" y1="7" x2="14" y2="7" stroke="#689F38" strokeWidth="1.5" />
    <Line x1="10" y1="10" x2="14" y2="10" stroke="#689F38" strokeWidth="1.5" />
    <Line x1="10" y1="13" x2="14" y2="13" stroke="#689F38" strokeWidth="1.5" />
    <Line x1="10" y1="16" x2="14" y2="16" stroke="#689F38" strokeWidth="1.5" />
    <Path d="M9 3l-1 2 M15 3l1 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const SeedlingIcon = ({size = 40, color = '#4CAF50'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22c.55 0 1-.45 1-1v-7c3-1 5-3.5 5-6.5C18 5 15.76 3 13 3c-.79 0-1.54.2-2.21.55C9.93 2.61 8.5 2 7 2 4.24 2 2 4.24 2 7c0 3.5 3 6 6 6.5V21c0 .55.45 1 1 1h3z"
      fill={color}
    />
    <Path d="M12 3.5C13.93 3.5 15.5 5.07 15.5 7c0 1.93-1.57 3.5-3.5 3.5" fill="#81C784" opacity="0.7" />
  </Svg>
);

/** Seeds – seed-sprouting (from UXWing-style SVG) */
export const SeedsIcon = ({
  size = 40,
  green = '#51b53c',
  darkGreen = '#1f8e5b',
  brown = '#8c5d0f',
  lightBrown = '#af7311',
}) => (
  <Svg width={size} height={size} viewBox="0 0 122.88 100.47">
    <Path
      fillRule="evenodd"
      fill={green}
      d="M69.54,45.79l3.12-1C79.45,47.12,85.21,65.1,76,69.94c-11.34,6-13.69-8.4-24.38-1.5L46,71.54l-2.24-9.1c4.55-2.06,11.79-6.52,16.68-5.75,2.9.46,5.86,2.38,8.61,3.64,2.58,1.13,5.75-.36,4.1-4.73l-3.65-9.81Z"
    />
    <Path
      fillRule="evenodd"
      fill={darkGreen}
      d="M29.33,28.41c.55-2,9.76-3.94,11.87-4.36,10.94-2.17,24.55-1.14,28.32,11.66A9.47,9.47,0,0,1,69.17,41L49,34.35l18.53,9.21a16.1,16.1,0,0,1-10.12,5.26,24.29,24.29,0,0,1-21.22-8.15,25.15,25.15,0,0,1-2.74-3.76c-1-1.64-4.47-7.12-4.1-8.5Z"
    />
    <Path
      fillRule="evenodd"
      fill={darkGreen}
      d="M122.56,1.43c-1.71-2.57-15.51-1-18.65-.57C87.55,2.93,69,10.71,69.67,30.41,69.75,33,71,35.32,72.6,37.58L97.8,18.92,76.13,40.47a23.79,23.79,0,0,0,16.64,2.64A35.88,35.88,0,0,0,118.7,21.8a35.69,35.69,0,0,0,2.07-6.55c.62-2.75,3-12.06,1.79-13.82Z"
    />
    <Path
      fillRule="evenodd"
      fill={brown}
      d="M18.2,64.16c10-5.8,20.71-7.36,27.77-4.74l-.52,8.08,8.45,2.13c.43,8.07-6.67,18.23-18.18,24.87C21.64,102.63,6.31,102.42,1.47,94S4.12,72.28,18.2,64.16Z"
    />
    <Path
      fillRule="evenodd"
      fill={lightBrown}
      d="M43.44,58.46a2.27,2.27,0,1,1,4.31-1.4,16.91,16.91,0,0,1,.86,5.6,17.24,17.24,0,0,1-.3,2.86,19.07,19.07,0,0,1,3.71,1,15.36,15.36,0,0,1,5.35,3.42,2.26,2.26,0,0,1-3.17,3.23,10.85,10.85,0,0,0-3.79-2.43,16.23,16.23,0,0,0-5-1,2.25,2.25,0,0,1-2.07-3,13.09,13.09,0,0,0,.77-4.16,12.22,12.22,0,0,0-.64-4.13Z"
    />
  </Svg>
);

export const WeatherIcon = ({size = 40, color = '#03A9F4'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"
      fill={color}
    />
    <Path d="M9 14l2 2 4-4" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const MoneyIcon = ({size = 40, color = '#4CAF50'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
      fill={color}
    />
  </Svg>
);

export const NewsIcon = ({size = 40, color = '#FF5722'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H5c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z"
      fill={color}
    />
    <Rect x="7" y="8" width="10" height="2" rx="1" fill={color} />
    <Rect x="7" y="12" width="7" height="1.5" rx="0.75" fill={color} />
    <Rect x="7" y="15" width="6" height="1.5" rx="0.75" fill={color} />
  </Svg>
);

export const TreeIcon = ({size = 28, color = '#4CAF50'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="5" fill={color} />
    <Circle cx="8" cy="10" r="3" fill={color} opacity="0.8" />
    <Circle cx="16" cy="10" r="3" fill={color} opacity="0.8" />
    <Rect x="10.5" y="12" width="3" height="9" fill="#795548" />
    <Path d="M9 21h6v-2H9v2z" fill="#5D4037" />
  </Svg>
);

export const PeopleIcon = ({size = 28, color = '#666'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="8" r="3" fill={color} />
    <Path
      d="M9 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      fill={color}
    />
    <Circle cx="16.5" cy="8.5" r="2.5" fill={color} opacity="0.7" />
    <Path
      d="M16.5 12c-.75 0-1.59.15-2.41.38 1.14.72 1.91 1.61 1.91 2.62v3h7v-2c0-2.33-4.67-4-6.5-4z"
      fill={color}
      opacity="0.7"
    />
  </Svg>
);

export const CartIcon = ({size = 28, color = '#666'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
      fill={color}
    />
  </Svg>
);

export const ChevronDownIcon = ({size = 12, color = '#2D7D3E'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M7 10l5 5 5-5z" fill={color} />
  </Svg>
);

export const ChevronLeftIcon = ({size = 24, color = '#333'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill={color} />
  </Svg>
);

export const CameraIcon = ({size = 22, color = '#666'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
      fill={color}
    />
    <Circle cx="12" cy="12" r="3" fill={color} />
  </Svg>
);

export const UploadIcon = ({size = 24, color = '#2D7D3E'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"
      fill={color}
    />
  </Svg>
);

export const CheckCircleIcon = ({size = 80, color = '#4CAF50'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color} opacity="0.2" />
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      fill={color}
    />
  </Svg>
);

export const CloseIcon = ({size = 24, color = '#666'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      fill={color}
    />
  </Svg>
);

export const FamilyIcon = ({size = 80, color = '#5E35B1'}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="20" r="6" fill={color} />
    <Path d="M32 28c-4 0-12 2-12 6v4h24v-4c0-4-8-6-12-6z" fill={color} />
    <Circle cx="20" cy="24" r="5" fill={color} opacity="0.8" />
    <Path d="M20 31c-3 0-10 1.5-10 4.5v3h9v-3a8 8 0 011-3.8c-0.3-0.1-0.6-0.2-0-0.2z" fill={color} opacity="0.8" />
    <Circle cx="44" cy="24" r="5" fill={color} opacity="0.8" />
    <Path d="M44 31c3 0 10 1.5 10 4.5v3h-9v-3a8 8 0 00-1-3.8c0.3-0.1 0.6-0.2 0-0.2z" fill={color} opacity="0.8" />
    <Circle cx="32" cy="44" r="4" fill={color} opacity="0.9" />
    <Path d="M32 50c-2.5 0-7 1.2-7 3.5v2h14v-2c0-2.3-4.5-3.5-7-3.5z" fill={color} opacity="0.9" />
  </Svg>
);

/** Scan / camera with frame - for "Scan now" CTA */
export const ScanFrameIcon = ({size = 80, color = '#2D7D3E'}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Rect x="8" y="14" width="48" height="36" rx="6" stroke={color} strokeWidth="3" fill="none" />
    <Circle cx="32" cy="32" r="10" stroke={color} strokeWidth="2.5" fill="none" />
    <Circle cx="32" cy="32" r="4" fill={color} />
    <Rect x="26" y="6" width="12" height="8" rx="2" fill={color} />
    <Path d="M16 50l6-6 4 4 8-10 6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

/** Droplet / fertilizer */
export const FertilizerIcon = ({size = 28, color = '#2196F3'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.69l5.66 5.66a8 8 0 11-11.32 0L12 2.69z"
      fill={color}
      opacity={0.9}
    />
    <Path
      d="M12 5.5L9.5 8a4 4 0 105.66 0L12 5.5z"
      fill="#fff"
      opacity={0.5}
    />
  </Svg>
);

/** Shield / pesticide / spray */
export const PesticideIcon = ({size = 28, color = '#8BC34A'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
      fill={color}
      opacity={0.9}
    />
    <Path d="M12 8v8M9 11h6M9 14h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity={0.8} />
  </Svg>
);

/** Arrow right for CTA */
export const ArrowRightIcon = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" fill={color} />
  </Svg>
);

/** Analysis / history list */
export const AnalysisIcon = ({size = 28, color = '#666'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
      fill={color}
    />
  </Svg>
);
