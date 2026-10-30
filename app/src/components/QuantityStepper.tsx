import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, radius, spacing } from "../theme";

type QuantityStepperProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const MIN_QUANTITY = 1;
const STEP_BUTTON_SIZE = 32;

export function QuantityStepper({ value, max, onChange, disabled = false }: QuantityStepperProps) {
  const { t } = useTranslation();
  const canDecrease = !disabled && value > MIN_QUANTITY;
  const canIncrease = !disabled && value < max;

  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(value - 1)}
        disabled={!canDecrease}
        accessibilityRole="button"
        accessibilityLabel={t("events.decrease")}
        style={styles.step}
      >
        <Ionicons name="remove" size={18} color={canDecrease ? colors.primary : colors.border} />
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        onPress={() => onChange(value + 1)}
        disabled={!canIncrease}
        accessibilityRole="button"
        accessibilityLabel={t("events.increase")}
        style={styles.step}
      >
        <Ionicons name="add" size={18} color={canIncrease ? colors.primary : colors.border} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.pill,
  },
  step: {
    width: STEP_BUTTON_SIZE,
    height: STEP_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  value: {
    minWidth: spacing.xl,
    fontSize: fontSize.md,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text,
  },
});
