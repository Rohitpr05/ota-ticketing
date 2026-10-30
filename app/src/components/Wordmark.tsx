import Svg, { Defs, LinearGradient, Stop, Text } from "react-native-svg";
import { fontSize, gradient } from "../theme";

const BRAND_NAME = "Ōta";
const WIDTH = 64;
const HEIGHT = 40;
// Leaves room above the letters for the macron on "Ō".
const BASELINE = 32;

// The brand wordmark as text filled with the sky-blue → purple gradient.
export function Wordmark() {
  return (
    <Svg width={WIDTH} height={HEIGHT} accessibilityLabel={BRAND_NAME}>
      <Defs>
        <LinearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={gradient[0]} />
          <Stop offset="1" stopColor={gradient[1]} />
        </LinearGradient>
      </Defs>
      <Text x={0} y={BASELINE} fontSize={fontSize.xxl} fontWeight="800" fill="url(#brand)">
        {BRAND_NAME}
      </Text>
    </Svg>
  );
}
