export type ColorsType = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryDark: string;
  primaryMuted: string;
  primaryBorder: string;
  danger: string;
  dangerMuted: string;
  warning: string;
  warningMuted: string;
  success: string;
  successMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  white: string;
  transparent: string;
};

export const LightColors: ColorsType = {
  background: "#FBF5EB",
  surface: "#FFFCF7",
  surfaceElevated: "#F0E6D4",
  border: "#DDD0BE",
  borderLight: "#EDE5D5",
  primary: "#B85C25",
  primaryDark: "#8B4418",
  primaryMuted: "rgba(184, 92, 37, 0.10)",
  primaryBorder: "rgba(184, 92, 37, 0.25)",
  danger: "#CC3A1A",
  dangerMuted: "rgba(204, 58, 26, 0.10)",
  warning: "#C47A20",
  warningMuted: "rgba(196, 122, 32, 0.10)",
  success: "#2A7A3A",
  successMuted: "rgba(42, 122, 58, 0.10)",
  text: "#1A2340",
  textSecondary: "#4A5A7A",
  textMuted: "#8A9AB8",
  white: "#FFFFFF",
  transparent: "transparent",
};

export const DarkColors: ColorsType = {
  background: "#0D1225",
  surface: "#141B30",
  surfaceElevated: "#1E2B48",
  border: "#253158",
  borderLight: "#1A2440",
  primary: "#E08040",
  primaryDark: "#B86025",
  primaryMuted: "rgba(224, 128, 64, 0.12)",
  primaryBorder: "rgba(224, 128, 64, 0.30)",
  danger: "#F87171",
  dangerMuted: "rgba(248, 113, 113, 0.12)",
  warning: "#FCD34D",
  warningMuted: "rgba(252, 211, 77, 0.12)",
  success: "#4ADE80",
  successMuted: "rgba(74, 222, 128, 0.12)",
  text: "#EAD9BE",
  textSecondary: "#B0A890",
  textMuted: "#6A6070",
  white: "#FFFFFF",
  transparent: "transparent",
};

export const Colors = DarkColors;
export default DarkColors;
