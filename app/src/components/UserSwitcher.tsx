import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, gradient, radius, shadow, spacing } from "../theme";
import { useCurrentUser } from "../user-context";
import { USERS } from "../users";

const AVATAR_SIZE = 40;
const RING_WIDTH = 2;

function Avatar({ name }: { name: string }) {
  return (
    <LinearGradient colors={gradient} style={styles.avatarRing}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>{name.charAt(0)}</Text>
      </View>
    </LinearGradient>
  );
}

// Tapping the avatar opens a picker of the seeded users, so the demo can act as different people.
export function UserSwitcher() {
  const { t } = useTranslation();
  const { userId, setUserId } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const currentUser = USERS.find((user) => user.id === userId) ?? USERS[0];

  function selectUser(id: number) {
    setUserId(id);
    setOpen(false);
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t("header.switchUser")}
      >
        <Avatar name={currentUser.name} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.title}>{t("users.title")}</Text>
            {USERS.map((user) => (
              <Pressable
                key={user.id}
                onPress={() => selectUser(user.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: user.id === userId }}
                style={[styles.row, user.id === userId && styles.activeRow]}
              >
                <Avatar name={user.name} />
                <View style={styles.rowText}>
                  <Text style={styles.name}>{user.name}</Text>
                  <Text style={styles.userId}>{t("users.id", { id: user.id })}</Text>
                </View>
                {user.id === userId ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    padding: RING_WIDTH,
    borderRadius: radius.pill,
  },
  avatar: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  avatarInitial: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.primary,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.backdrop,
  },
  sheet: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow,
  },
  title: {
    marginBottom: spacing.xs,
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  activeRow: {
    backgroundColor: colors.primarySoft,
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
  },
  userId: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
