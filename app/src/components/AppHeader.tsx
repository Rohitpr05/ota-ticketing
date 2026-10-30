import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../theme";
import { LanguageToggle } from "./LanguageToggle";
import { UserSwitcher } from "./UserSwitcher";
import { Wordmark } from "./Wordmark";

const ICON_BUTTON_SIZE = 40;

export function AppHeader() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Wordmark />
      <View style={styles.actions}>
        <LanguageToggle />
        <Pressable
          onPress={() => router.navigate("/scan")}
          accessibilityRole="button"
          accessibilityLabel={t("header.scan")}
          style={styles.scanButton}
        >
          <Ionicons name="scan-outline" size={20} color={colors.success} />
        </Pressable>
        <UserSwitcher />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  scanButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
  },
});
