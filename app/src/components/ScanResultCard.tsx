import Ionicons from "@expo/vector-icons/Ionicons";
import type { TFunction } from "i18next";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { Ticket } from "../api";
import { formatTime } from "../format";
import { errorMessage } from "../i18n";
import { colors, fontSize, radius, spacing } from "../theme";
import { PillButton } from "./PillButton";

export type ScanResult =
  | { kind: "checking" }
  | { kind: "success"; ticket: Ticket }
  | { kind: "alreadyCheckedIn"; checkedInAt: string }
  | { kind: "notFound" }
  | { kind: "error"; error: unknown };

type Appearance = {
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  background: string;
  title: string;
  message: string;
};

type FinalResult = Exclude<ScanResult, { kind: "checking" }>;

function describe(result: FinalResult, t: TFunction, language: string): Appearance {
  switch (result.kind) {
    case "success":
      return {
        icon: "checkmark-circle",
        color: colors.success,
        background: colors.successSoft,
        title: t("scan.successTitle"),
        message: `${result.ticket.event.name} · ${result.ticket.code}`,
      };
    case "alreadyCheckedIn":
      return {
        icon: "time",
        color: colors.warning,
        background: colors.warningSoft,
        title: t("scan.alreadyTitle"),
        message: t("scan.alreadyMessage", { time: formatTime(result.checkedInAt, language) }),
      };
    case "notFound":
      return {
        icon: "close-circle",
        color: colors.danger,
        background: colors.dangerSoft,
        title: t("scan.notFoundTitle"),
        message: t("scan.notFoundMessage"),
      };
    case "error":
      return {
        icon: "alert-circle",
        color: colors.danger,
        background: colors.dangerSoft,
        title: t("scan.errorTitle"),
        message: errorMessage(result.error, t),
      };
  }
}

export function ScanResultCard({ result, onScanNext }: { result: ScanResult; onScanNext: () => void }) {
  const { t, i18n } = useTranslation();

  if (result.kind === "checking") {
    return (
      <View style={[styles.card, styles.checking]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.message}>{t("scan.checking")}</Text>
      </View>
    );
  }

  const { icon, color, background, title, message } = describe(result, t, i18n.language);
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: background }]}>
        <Ionicons name={icon} size={40} color={color} />
      </View>
      <Text style={[styles.title, { color }]}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <PillButton label={t("scan.scanNext")} onPress={onScanNext} />
    </View>
  );
}

const ICON_CIRCLE_SIZE = 72;

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xxl,
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  checking: {
    flexDirection: "row",
    justifyContent: "center",
  },
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: "center",
  },
});
