import { colors } from "@/theme/tokens";
import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const Sats = (props: SvgProps) => {
  return (
    <Svg
      className='fill-inherit text-inherit'
      viewBox='0 0 18 18'
      width={24}
      preserveAspectRatio='xMidYMid meet'
      fill={colors.muted}
      {...props}
    >
      <Path d='M5.75 15.5V18H4.25V15.5H5.75Z' />
      <Path d='M10 13.75H0V12.25H10V13.75Z' />
      <Path d='M10 9.74989H0V8.24989H10V9.74989Z' />
      <Path d='M10 5.75H0V4.25H10V5.75Z' />
      <Path d='M5.75 0V2.5H4.25V0H5.75Z' />
    </Svg>
  );
};
export default Sats;
