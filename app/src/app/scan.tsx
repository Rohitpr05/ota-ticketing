import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, ApiError } from "../api";
import { PillButton } from "../components/PillButton";
import { ScanResultCard, type ScanResult } from "../components/ScanResultCard";
import { colors, fontSize, radius, spacing } from "../theme";
import { useCurrentUser } from "../user-context";

const FRAME_SIZE = 260;
const FRAME_BORDER = 3;
const CIRCLE_BUTTON_SIZE = 44;

async function checkInCode(userId: number, code: string): Promise<ScanResult> {
  try {
    return { kind: "success", ticket: await api.checkIn(userId, code) };
  } catch (error) {
    if (error instanceof ApiError && typeof error.details.checkedInAt === "string") {
      return { kind: "alreadyCheckedIn", checkedInAt: error.details.checkedInAt };
    }
    // 400 means the QR code wasn't a usable ticket code at all, which is the same story for staff.
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return { kind: "notFound" };
    }
    return { kind: "error", error };
  }
}

type CircleButtonProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
};

function CircleButton({ icon, label, onPress }: CircleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.circleButton}
    >
      <Ionicons name={icon} size={24} color={colors.white} />
    </Pressable>
  );
}

export default function ScanScreen() {
  const { t } = useTranslation();
  const { userId } = useCurrentUser();
  const insets = useSafeAreaInsets();
  // Tabs stay mounted, so only run the camera while this tab is on screen.
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  // The camera reports a code many times per second; a ref (unlike state) blocks repeats immediately.
  const scanLocked = useRef(false);

  useEffect(() => {
    if (isFocused && permission?.status === "undetermined") {
      requestPermission();
    }
  }, [isFocused, permission, requestPermission]);

  async function handleScan({ data }: BarcodeScanningResult) {
    if (scanLocked.current) {
      return;
    }
    scanLocked.current = true;
    setResult({ kind: "checking" });
    setResult(await checkInCode(userId, data));
  }

  function scanNext() {
    setResult(null);
    scanLocked.current = false;
  }

  function close() {
    scanNext();
    setTorchOn(false);
    router.navigate("/");
  }

  const cameraReady = isFocused && permission?.granted === true;

  return (
    <View style={styles.screen}>
      {isFocused ? <StatusBar style="light" /> : null}
      {cameraReady ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchOn}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={result ? undefined : handleScan}
        />
      ) : null}

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <CircleButton icon="close" label={t("scan.close")} onPress={close} />
        <Text style={styles.title}>{t("scan.title")}</Text>
        <CircleButton
          icon={torchOn ? "flashlight" : "flashlight-outline"}
          label={t("scan.torch")}
          onPress={() => setTorchOn((on) => !on)}
        />
      </View>

      {permission && !permission.granted ? (
        <View style={styles.center}>
          <Ionicons name="camera-outline" size={48} color={colors.white} />
          <Text style={styles.permissionTitle}>{t("scan.permissionTitle")}</Text>
          <Text style={styles.hint}>{t("scan.permissionMessage")}</Text>
          {permission.canAskAgain ? (
            <PillButton label={t("scan.allowCamera")} onPress={requestPermission} />
          ) : (
            <PillButton label={t("scan.openSettings")} onPress={Linking.openSettings} />
          )}
        </View>
      ) : (
        <View style={styles.center}>
          <View style={styles.frame} />
          <Text style={styles.hint}>{t("scan.hint")}</Text>
        </View>
      )}

      {result ? <ScanResultCard result={result} onScanNext={scanNext} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.black,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.white,
  },
  circleButton: {
    width: CIRCLE_BUTTON_SIZE,
    height: CIRCLE_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.cameraButton,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing.xl,
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderWidth: FRAME_BORDER,
    borderRadius: radius.xl,
    borderColor: colors.scanFrame,
  },
  permissionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.white,
  },
  hint: {
    fontSize: fontSize.md,
    color: colors.white,
    textAlign: "center",
  },
});
