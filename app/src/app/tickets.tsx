import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, RefreshControl, StyleSheet, Text } from "react-native";
import { api } from "../api";
import { EmptyState, ErrorState, LoadingState } from "../components/StateViews";
import { TicketCard } from "../components/TicketCard";
import { colors, fontSize, spacing } from "../theme";
import { useRequest } from "../use-request";
import { useCurrentUser } from "../user-context";

export default function TicketsScreen() {
  const { t } = useTranslation();
  const { userId } = useCurrentUser();
  const loadTickets = useCallback(() => api.listMyTickets(userId), [userId]);
  const { data: tickets, error, refreshing, refresh, retry } = useRequest(loadTickets);

  if (error) {
    return <ErrorState error={error} onRetry={retry} />;
  }
  if (!tickets) {
    return <LoadingState />;
  }

  return (
    <FlatList
      data={tickets}
      keyExtractor={(ticket) => ticket.id}
      renderItem={({ item }) => <TicketCard ticket={item} />}
      ListHeaderComponent={<Text style={styles.title}>{t("tickets.title")}</Text>}
      ListEmptyComponent={<EmptyState title={t("tickets.empty")} hint={t("tickets.emptyHint")} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
      }
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.text,
  },
});
