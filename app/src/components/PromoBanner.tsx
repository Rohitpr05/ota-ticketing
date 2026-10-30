import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, gradient, radius, spacing } from "../theme";

export function PromoBanner() {
  const { t } = useTranslation();
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
      <View style={styles.icon}>
        <Ionicons name="sparkles" size={22} color={colors.white} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{t("banner.title")}</Text>
        <Text style={styles.subtitle}>{t("banner.subtitle")}</Text>
      </View>
    </LinearGradient>
  );
}

const ICON_SIZE = 44;

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.whiteTranslucent,
  },
  text: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.white,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
});
