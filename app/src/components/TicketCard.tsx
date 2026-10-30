import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import type { Ticket } from "../api";
import { formatEventDate } from "../format";
import { colors, fontSize, radius, shadow, spacing } from "../theme";

const QR_SIZE = 160;

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const { t, i18n } = useTranslation();
  const checkedIn = ticket.checkedInAt !== null;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.name}>{ticket.event.name}</Text>
        {checkedIn ? (
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.badgeText}>{t("tickets.checkedIn")}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.detail}>{formatEventDate(ticket.event.startsAt, i18n.language)}</Text>
      <Text style={styles.detail}>{ticket.event.venue}</Text>

      <View style={styles.divider} />

      {/* A used ticket's QR is dimmed so it reads as spent at a glance. */}
      <View style={[styles.qr, checkedIn && styles.usedQr]}>
        <QRCode value={ticket.code} size={QR_SIZE} />
        <Text style={styles.code}>{ticket.code}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadow,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.success,
  },
  detail: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  divider: {
    marginVertical: spacing.md,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  qr: {
    alignItems: "center",
    gap: spacing.sm,
  },
  usedQr: {
    opacity: 0.35,
  },
  code: {
    fontSize: fontSize.md,
    fontWeight: "600",
    letterSpacing: 2,
    color: colors.text,
  },
});
