import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, Text, View } from "react-native";
import { api, type Event } from "../api";
import { formatEventDate, formatPrice } from "../format";
import { errorMessage } from "../i18n";
import { colors, fontSize, radius, shadow, spacing } from "../theme";
import { useCurrentUser } from "../user-context";
import { PillButton } from "./PillButton";
import { QuantityStepper } from "./QuantityStepper";

const MAX_PER_BOOKING = 4;

export function EventCard({ event, onBooked }: { event: Event; onBooked: () => void }) {
  const { t, i18n } = useTranslation();
  const { userId } = useCurrentUser();
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);

  const soldOut = event.ticketsLeft === 0;
  const maxQuantity = Math.min(MAX_PER_BOOKING, event.ticketsLeft);

  async function book() {
    setBooking(true);
    try {
      const tickets = await api.bookTickets(userId, event.id, quantity);
      Alert.alert(
        t("booking.successTitle"),
        t("booking.successMessage", { count: tickets.length, event: event.name }),
        [
          { text: t("common.ok") },
          { text: t("booking.viewTickets"), onPress: () => router.navigate("/tickets") },
        ],
      );
      setQuantity(1);
    } catch (error) {
      Alert.alert(t("booking.failedTitle"), errorMessage(error, t));
    } finally {
      setBooking(false);
      // Refresh either way: after a failure (e.g. sold out) the list shows the real tickets left.
      onBooked();
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.dateChip}>
        <Ionicons name="calendar-outline" size={14} color={colors.primary} />
        <Text style={styles.dateText}>{formatEventDate(event.startsAt, i18n.language)}</Text>
      </View>

      <Text style={styles.name}>{event.name}</Text>
      <View style={styles.venueRow}>
        <Ionicons name="location-outline" size={16} color={colors.textMuted} />
        <Text style={styles.venue}>{event.venue}</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatPrice(event.price, event.currency, i18n.language)}</Text>
        <Text style={[styles.ticketsLeft, soldOut && styles.soldOutText]}>
          {soldOut ? t("events.soldOut") : t("events.ticketsLeft", { count: event.ticketsLeft })}
        </Text>
      </View>

      <View style={styles.actions}>
        {soldOut ? (
          <PillButton label={t("events.soldOut")} onPress={book} disabled />
        ) : (
          <>
            <QuantityStepper value={quantity} max={maxQuantity} onChange={setQuantity} disabled={booking} />
            <PillButton label={t("events.book")} onPress={book} loading={booking} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadow,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  dateText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.primary,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  venue: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  price: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.text,
  },
  ticketsLeft: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textMuted,
  },
  soldOutText: {
    color: colors.danger,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
});
