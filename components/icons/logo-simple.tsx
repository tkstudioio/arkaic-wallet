import { useTheme } from "@react-navigation/native";
import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const LogoSimple = (props: SvgProps) => {
  const theme = useTheme();

  return (
    <Svg
      viewBox='0 0 76 68'
      width={76}
      height={68}
      preserveAspectRatio='xMidYMid meet' // mantiene proporzioni
      {...props}
    >
      <Path
        d='M43.7076 5.54365C43.0824 4.46583 42.185 3.57117 41.1052 2.94926C40.0255 2.32735 38.8013 2 37.5553 2C36.3092 2 35.0851 2.32735 34.0053 2.94926C32.9256 3.57117 32.0282 4.46583 31.4029 5.54365L2.9529 55.3313C2.32895 56.412 2.00032 57.6378 2 58.8857C1.99968 60.1336 2.32768 61.3596 2.95107 62.4406C3.57446 63.5216 4.4713 64.4196 5.55152 65.0444C6.63174 65.6692 7.85733 65.9987 9.10522 66H66.0053C67.2532 65.9987 68.4788 65.6692 69.559 65.0444C70.6392 64.4196 71.5361 63.5216 72.1595 62.4406C72.7828 61.3596 73.1108 60.1336 73.1105 58.8857C73.1102 57.6378 72.7816 56.412 72.1576 55.3313L43.7076 5.54365Z'
        stroke={theme.colors.primary}
        stroke-width='4'
      />
    </Svg>
  );
};
export default LogoSimple;
