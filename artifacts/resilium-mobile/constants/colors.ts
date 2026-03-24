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
  background: "#F8FAF9",
  surface: "#FFFFFF",
  surfaceElevated: "#EDF0EE",
  border: "#E4EAE7",
  borderLight: "#F0F3F1",
  primary: "#2D4A3E",
  primaryDark: "#1E3329",
  primaryMuted: "rgba(45, 74, 62, 0.10)",
  primaryBorder: "rgba(45, 74, 62, 0.25)",
  danger: "#DC2626",
  dangerMuted: "rgba(220, 38, 38, 0.10)",
  warning: "#D97706",
  warningMuted: "rgba(217, 119, 6, 0.10)",
  success: "#16A34A",
  successMuted: "rgba(22, 163, 74, 0.10)",
  text: "#1A2E24",
  textSecondary: "#4A6358",
  textMuted: "#8AA89B",
  white: "#FFFFFF",
  transparent: "transparent",
};

export const DarkColors: ColorsType = {
  background: "#0B1812",
  surface: "#0F2018",
  surfaceElevated: "#152E22",
  border: "#192E24",
  borderLight: "#1F3A2D",
  primary: "#2ECC8F",
  primaryDark: "#23A374",
  primaryMuted: "rgba(46, 204, 143, 0.12)",
  primaryBorder: "rgba(46, 204, 143, 0.30)",
  danger: "#F87171",
  dangerMuted: "rgba(248, 113, 113, 0.12)",
  warning: "#FCD34D",
  warningMuted: "rgba(252, 211, 77, 0.12)",
  success: "#4ADE80",
  successMuted: "rgba(74, 222, 128, 0.12)",
  text: "#E6EDE9",
  textSecondary: "#8BB5A0",
  textMuted: "#4D7A68",
  white: "#FFFFFF",
  transparent: "transparent",
};

export const Colors = DarkColors;
export default DarkColors;
