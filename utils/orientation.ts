import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const isLandscape = () => width > height;
export const isPortrait = () => width < height;

export const getOrientation = () => {
  return width > height ? "landscape" : "portrait";
};

export const getScreenDimensions = () => {
  return { width, height };
};

export const isTablet = () => {
  const { width, height } = Dimensions.get("window");
  const aspectRatio = height / width;
  return aspectRatio <= 1.6;
};

export const getResponsiveValue = (
  portraitValue: number,
  landscapeValue: number
) => {
  return isLandscape() ? landscapeValue : portraitValue;
};
