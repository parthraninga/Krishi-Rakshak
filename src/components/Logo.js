import React from 'react';
import Svg, {Circle, Path, Ellipse, G, Text as SvgText} from 'react-native-svg';

const Logo = ({width = 200, height = 200, showText = true}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 200" fill="none">
      {/* Background Circle */}
      <Circle cx="100" cy="100" r="95" fill="#2D7D3E" opacity="0.1" />

      {/* Shield Base */}
      <Path
        d="M100 35 L150 55 L150 110 C150 140 130 165 100 185 C70 165 50 140 50 110 L50 55 L100 35 Z"
        fill="#2D7D3E"
        stroke="#1A5526"
        strokeWidth="3"
      />

      {/* Inner Shield Highlight */}
      <Path
        d="M100 50 L140 65 L140 105 C140 128 125 145 100 162 C75 145 60 128 60 105 L60 65 L100 50 Z"
        fill="#3AA34A"
        opacity="0.3"
      />

      {/* Center Leaf */}
      <G transform="translate(100, 90)">
        <Ellipse cx="0" cy="15" rx="16" ry="35" fill="#8BC34A" />
        <Path
          d="M 0 -20 Q 4 0, 0 50 M 0 -20 Q -4 0, 0 50"
          stroke="#6BA839"
          strokeWidth="2"
          fill="none"
        />
      </G>

      {/* Left Leaf */}
      <G transform="translate(75, 105) rotate(-35)">
        <Ellipse cx="0" cy="10" rx="12" ry="25" fill="#9CCC65" />
        <Path
          d="M 0 -15 Q 3 0, 0 35"
          stroke="#7BA856"
          strokeWidth="1.5"
          fill="none"
        />
      </G>

      {/* Right Leaf */}
      <G transform="translate(125, 105) rotate(35)">
        <Ellipse cx="0" cy="10" rx="12" ry="25" fill="#9CCC65" />
        <Path
          d="M 0 -15 Q -3 0, 0 35"
          stroke="#7BA856"
          strokeWidth="1.5"
          fill="none"
        />
      </G>

      {/* Bottom Left Leaf */}
      <G transform="translate(82, 125) rotate(-25)">
        <Ellipse cx="0" cy="8" rx="10" ry="20" fill="#AED581" />
        <Path
          d="M 0 -12 Q 2 0, 0 28"
          stroke="#8DB86A"
          strokeWidth="1.2"
          fill="none"
        />
      </G>

      {/* Bottom Right Leaf */}
      <G transform="translate(118, 125) rotate(25)">
        <Ellipse cx="0" cy="8" rx="10" ry="20" fill="#AED581" />
        <Path
          d="M 0 -12 Q -2 0, 0 28"
          stroke="#8DB86A"
          strokeWidth="1.2"
          fill="none"
        />
      </G>

      {/* Stem */}
      <Path
        d="M 100 70 L 100 145"
        stroke="#6BA839"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Root/Ground Element */}
      <Ellipse cx="100" cy="145" rx="10" ry="5" fill="#5E8C4F" opacity="0.6" />

      {/* Decorative Dots */}
      <Circle cx="80" cy="135" r="3" fill="#DCEDC8" />
      <Circle cx="120" cy="135" r="3" fill="#DCEDC8" />
      <Circle cx="88" cy="148" r="2.5" fill="#DCEDC8" />
      <Circle cx="112" cy="148" r="2.5" fill="#DCEDC8" />
      <Circle cx="100" cy="155" r="2" fill="#DCEDC8" opacity="0.7" />

      {/* Text Elements - Only if showText is true */}
      {showText && (
        <>
          <SvgText
            x="100"
            y="175"
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            fill="#2D7D3E">
            KrishiRakshak
          </SvgText>
          <SvgText
            x="100"
            y="190"
            fontSize="9"
            textAnchor="middle"
            fill="#5E8C4F"
            opacity="0.8">
            Agricultural Guardian
          </SvgText>
        </>
      )}
    </Svg>
  );
};

export default Logo;
