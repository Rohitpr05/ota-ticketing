import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LANGUAGES } from "../i18n";
import { colors, fontSize, radius, spacing } from "../theme";

export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  return (
    <View style={styles.container} accessibilityLabel={t("header.language")}>
      {LANGUAGES.map(({ code, label }) => {
        const active = i18n.language === code;
        return (
          <Pressable
            key={code}
            onPress={() => i18n.changeLanguage(code)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.option, active && styles.activeOption]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: spacing.xs / 2,
    borderRadius: radius.pill,
    backgroundColor: colors.pill,
  },
  option: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  activeOption: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textMuted,
  },
  activeLabel: {
    color: colors.white,
  },
});
