import "../i18n";

import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router/js-tabs";
import { StatusBar } from "expo-status-bar";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { AppHeader } from "../components/AppHeader";
import { colors, fontSize, radius, spacing } from "../theme";
import { UserProvider } from "../user-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(name: IconName) {
  return ({ focused, size }: { focused: boolean; size: number }) => (
    <Ionicons name={name} size={size} color={focused ? colors.primary : colors.textMuted} />
  );
}

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <UserProvider>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          header: () => <AppHeader />,
          sceneStyle: { backgroundColor: colors.background },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarActiveBackgroundColor: colors.primarySoft,
          tabBarItemStyle: { borderRadius: radius.md, marginHorizontal: spacing.sm, marginTop: spacing.xs },
          tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: "600" },
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: t("tabs.events"), tabBarIcon: tabIcon("calendar-outline") }}
        />
        <Tabs.Screen
          name="tickets"
          options={{ title: t("tabs.tickets"), tabBarIcon: tabIcon("ticket-outline") }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: t("tabs.scan"),
            tabBarIcon: tabIcon("scan-outline"),
            headerShown: false,
            tabBarStyle: { display: "none" },
          }}
        />
      </Tabs>
    </UserProvider>
  );
}
