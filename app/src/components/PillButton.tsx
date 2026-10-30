import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, fontSize, radius, spacing } from "../theme";

type PillButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PillButton({ label, onPress, disabled = false, loading = false }: PillButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 96,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.pill,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.white,
  },
  disabledLabel: {
    color: colors.textMuted,
  },
});
