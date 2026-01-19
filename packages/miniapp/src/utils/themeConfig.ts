import type { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    // Use the dominant/mid-tone purple from your gradient
    colorPrimary: '#D946EF',           // bright magenta-purple start color

    // Hover: even brighter/lighter variant
    colorPrimaryHover: '#E879F9',      // lighter pinkish-purple

    // Active: deeper/darker
    colorPrimaryActive: '#C026D3',     // richer magenta

    // Ensures white text stays readable on bright backgrounds
    colorTextLightSolid: '#ffffff',

    // Makes buttons feel more "pill-like" (matches your original rounded image)
    borderRadius: 999,                 // extreme rounding for capsule shape
  },

  components: {
    Button: {
      // Extra rounding just for buttons (overrides global if needed)
      borderRadiusLG: 999,
      // Optional: taller buttons if your "Redeem" feels squat
      // controlHeightLG: 48,
    },
  },
};
