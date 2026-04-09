import { Platform, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import CountryPicker, { DARK_THEME } from 'react-native-country-picker-modal';
import { windowHeight, windowWidth } from '../../utils/Dimensions';
import { useTheme } from '../../Context/ThemeContext';

const CountryPickerx = ({
  formInputTitle,
  setCountry,
  setFormError,
  setCountryObject,
}) => {
  const { theme, isDarkMode } = useTheme();

  const [countryCode, setCountryCode] = useState('');
  //   const [country, setCountry] = useState("");
  const [withCountryNameButton, setWithCountryNameButton] = useState(true);
  const [withFlag, setWithFlag] = useState(true);
  const [withEmoji, setWithEmoji] = useState(true);
  const [withFilter, setWithFilter] = useState(true);
  const [withAlphaFilter, setWithAlphaFilter] = useState(true);

  // Error states
  const [countryError, setCountryError] = useState('');

  const containerButtonStyle = {
    width: windowWidth / 1.2,
  };

  const onSelect = country => {
    console.log('ccocc', country);
    setCountryCode(country.cca2);
    setCountry(country?.name);
    setCountryError('');
    setFormError('');
    setCountryObject(country);
  };

  return (
    <View style={styles.auth}>
      <Text style={[styles.inputTitle, { color: theme?.text }]}>
        {formInputTitle}
      </Text>

      <View
        style={{
          padding: 5,
          flexDirection: 'row',
          borderRadius: 4,
          borderWidth: 1,
          borderColor: '#333',
          height: Platform.OS == 'android' ? 46 : windowHeight / 19,
          width: windowWidth / 1.1,
        }}
      >
        <CountryPicker
          {...{
            countryCode,
            withFilter,
            withFlag,
            withCountryNameButton,
            withAlphaFilter,
            withEmoji,
            onSelect,
            containerButtonStyle,
          }}
          // visible
          theme={isDarkMode && DARK_THEME}
        />
      </View>
      {countryError ? (
        <Text style={styles.validationError}>{countryError}</Text>
      ) : null}
    </View>
  );
};

export default CountryPickerx;

const styles = StyleSheet.create({
  auth: {
    width: windowWidth / 1.1,
    alignSelf: 'center',
    marginBottom: 20,
  },
  inputTitle: {
    marginBottom: 10,
    fontSize: 16,
    color: '#1E1E1E',
    fontWeight: '600',
  },
  validationError: {
    color: 'red',
    fontWeight: '500',
    marginBottom: 5,
    fontSize: 13,
    // textAlign: 'center',
  },
});
