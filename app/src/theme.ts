// Visual language borrowed from the Ota Life app: airy light background, white rounded cards,
// sky-blue accent and blue→purple gradients.
export const colors = {
  primary: "#0EA5E9",
  primarySoft: "#E0F2FE",
  purple: "#7C3AED",
  background: "#F6F8FC",
  surface: "#FFFFFF",
  border: "#E6EAF2",
  text: "#111827",
  textMuted: "#6B7280",
  pill: "#F1F3F6",
  white: "#FFFFFF",
  success: "#16A34A",
  successSoft: "#DCFCE7",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
  scanFrame: "#3B6EF6",
  cameraButton: "rgba(0, 0, 0, 0.45)",
  whiteTranslucent: "rgba(255, 255, 255, 0.2)",
  backdrop: "rgba(17, 24, 39, 0.4)",
  black: "#000000",
} as const;

export const gradient = [colors.primary, colors.purple] as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 30,
} as const;

export const shadow = {
  shadowColor: "#1E293B",
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;
