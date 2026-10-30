import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { api } from "../api";
import { EventCard } from "../components/EventCard";
import { PromoBanner } from "../components/PromoBanner";
import { EmptyState, ErrorState, LoadingState } from "../components/StateViews";
import { colors, fontSize, spacing } from "../theme";
import { useRequest } from "../use-request";
import { useCurrentUser } from "../user-context";

export default function EventsScreen() {
  const { t } = useTranslation();
  const { userId } = useCurrentUser();
  const loadEvents = useCallback(() => api.listEvents(userId), [userId]);
  const { data: events, error, refreshing, reload, refresh, retry } = useRequest(loadEvents);

  if (error) {
    return <ErrorState error={error} onRetry={retry} />;
  }
  if (!events) {
    return <LoadingState />;
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(event) => String(event.id)}
      renderItem={({ item }) => <EventCard event={item} onBooked={reload} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <PromoBanner />
          <Text style={styles.title}>{t("events.title")}</Text>
        </View>
      }
      ListEmptyComponent={<EmptyState title={t("events.empty")} />}
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
  header: {
    gap: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.text,
  },
});
