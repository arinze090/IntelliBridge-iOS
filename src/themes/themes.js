export const COLORS = {
  main: '#1974BA',
  black: '#000000',
  white: '#FFFFFF',
  pinky: '#F50157',
  purple: '#8E24AA',

  // legacybridge colors
  legacyBridgePrimary: '#d7b65d',
  legacyBridgeSecondary: '#000000',
  legacyBridgeRed: '#B60044',
  legacyBridgeBlue: '#042754',

  // status colors
  pendingColor: '#CFB001',
  pendingBgColor: '#FEFFD9',
  acceptedColor: '#039855',
  acceptedBgColor: '#F6FEF9',
  declinedColor: '#DB3304',
  declinedBgColor: '#FFF1EE',

  // darkMode colors
  darkModeTextColor: 'white',
  darkModeBgColor: 'black',
  darkModeBtnColor: 'white',
  darkModeBtnTextColor: 'black',
  darkModeIconColor: 'white',

  // light mode colors
  lightModeTextColor: 'black',
  lightModeBgColor: 'white',
  lightModeBtnColor: 'black',
  lightModeBtnTextColor: 'white',
  lightModeIconColor: 'black',

  // App colors
  splashBg: '#000000',
  splashBlack: '#000000',
  appBackground: '#fff',
  formTextColor: '#E9D800',
  appBlack: '#000917',
  appTextColor: 'black',

  // Form button colors
  formActionBtn: '#05A30B',
  formSecondaryBtn: '#FFFFFF',
  formSecondaryBtnText: '#000000',
  formButton: '#B60044',
  disabledFormButton: '#8DD784',

  // Text Colors
  descriptionText: '#5E5E5E',
  descriptionText2: '#5F5F5F',
  formSecondaryBtnBorderColor: '#000000',
  formActionBtnText: '#FFFFFF',
  appGrey: '#D7D7D7',
  appGrey2: '#7D8694',
  appGrey3: '#F7F7F7',
  appGrey4: '#F3F3F3',
  appGrey5: '#4B5563',

  // Action colors
  successBg: '#ECFFF1',
  sucessColor: '#00A400',

  primary: '#1974BA',
  whitesmoke: 'whitesmoke',

  transparent: 'transparent',

  btnBorderColor: '#333',
  btnBorderColor2: '#666',

  optionBorderColor: '#333',
  skeletonBgColor: '#000',
  skeletonHighlightColor: '#242323',

  success: '#6FCF97',
  secondaryRed: '#FEF2F2',
};

export const SIZES = {
  // global sizes
  base: 8,
  font: 14,
  radius: 10,
  padding: 14,

  // font sizes
  largeTitle: 40,
  h1: 30,
  h2: 22,
  h3: 18,
  h4: 14,
  h5: 12,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,

  // app dimensions
};
export const FONTS = {
  largeTitle: { fontFamily: 'Poppins-Black', fontSize: SIZES.largeTitle },
  h1: { fontFamily: 'Poppins-Bold', fontSize: SIZES.h1, lineHeight: 36 },
  h2: { fontFamily: 'Poppins-Bold', fontSize: SIZES.h2, lineHeight: 30 },
  h3: { fontFamily: 'Poppins-SemiBold', fontSize: SIZES.h3, lineHeight: 22 },
  h4: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: SIZES.h4,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  h5: { fontFamily: 'Poppins-SemiBold', fontSize: SIZES.h5, lineHeight: 22 },
  body1: {
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.body1,
    lineHeight: 36,
  },
  body2: {
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.body2,
    lineHeight: 30,
  },
  body3: {
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.body3,
    lineHeight: 22,
  },
  body4: {
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.body4,
    lineHeight: 22,
  },
  body5: {
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.body5,
    lineHeight: 22,
  },
};

const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;
