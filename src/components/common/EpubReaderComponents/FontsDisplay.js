import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import React, { useState } from 'react';
import Slider from '@react-native-community/slider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { windowWidth } from '../../../utils/Dimensions';
import { COLORS } from '../../../themes/themes';

const FONT_OPTIONS = [
  { label: 'Literata', family: 'Literata' },
  { label: 'Palatino', family: 'Palatino' },
  { label: 'Crimson Pro', family: 'Crimson Pro' },
  { label: 'Lora', family: 'Lora' },
  { label: 'Merriweather', family: 'Merriweather' },
  { label: 'Playfair Display', family: 'Playfair Display' },

  // { label: 'Open Sans', family: 'Open Sans' },
  { label: 'Garamond', family: 'Garamond' },
  // { label: 'Poppins', family: 'Poppins' },
  // { label: 'Nunito', family: 'Nunito' },
  { label: 'Source Sans 3', family: 'Source Sans 3' },

  // { label: 'Atkinson Hyperlegible', family: 'Atkinson Hyperlegible' },
  // { label: 'OpenDyslexic', family: 'OpenDyslexic' },

  { label: 'JetBrains Mono', family: 'JetBrains Mono' },
  // { label: 'Fira Code', family: 'Fira Code' },
  // { label: 'Courier Prime', family: 'Courier Prime' },
  { label: 'IBM Plex Mono', family: 'IBM Plex Mono' },

  { label: 'Georgia', family: 'Georgia' },
  { label: 'Arial', family: 'Arial' },
  { label: 'Times New Roman', family: 'Times New Roman' },
];

const FontsDisplay = ({
  onFontChange,
  selectedFont,
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
  hyphenation,
  onHyphenationChange,
  onViewNotes,
}) => {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          padding: 10,
          //   backgroundColor: 'red',
        }}
      >
        {FONT_OPTIONS?.map(f => {
          const isActive = selectedFont === f.family;
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              key={f?.family}
              onPress={() => onFontChange(f?.family)}
              style={{
                padding: 2,
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
                marginRight: 2,
              }}
            >
              <Text
                style={{
                  fontFamily: f.family,
                  fontSize: 18,
                  color: isActive ? COLORS?.legacyBridgePrimary : 'black',
                }}
              >
                Aa
              </Text>
              <Text
                numberOfLines={2}
                style={{
                  fontFamily: f.family,
                  fontSize: 14,
                  width: 70,
                  // backgroundColor: 'green',
                  textAlign: 'center',
                  color: isActive ? COLORS?.legacyBridgePrimary : 'black',
                }}
              >
                {f?.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Font size */}
      <View style={styles.sliderArea}>
        <Text style={styles.fontBtnLg}>A-</Text>
        <Slider
          style={{ width: windowWidth / 1.3, height: 40 }}
          minimumValue={20}
          maximumValue={50}
          step={1}
          value={fontSize}
          onValueChange={onFontSizeChange}
          minimumTrackTintColor={COLORS?.legacyBridgeSecondary}
          maximumTrackTintColor="#ccc"
        />
        <Text style={styles.fontBtnLg}>A+</Text>
      </View>

      {/* Spacing size */}
      <View style={styles.sliderArea}>
        <MaterialIcons
          name="format-line-spacing"
          size={20}
          style={{ padding: 10 }}
        />
        <Slider
          style={{ width: windowWidth / 1.3, height: 40 }}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={lineHeight}
          onValueChange={onLineHeightChange}
          minimumTrackTintColor={COLORS?.legacyBridgeSecondary}
          maximumTrackTintColor="#ccc"
        />
        <MaterialIcons
          name="format-line-spacing"
          size={20}
          style={{ padding: 10 }}
        />
      </View>

      {/* hyphenation */}
      <View style={[styles.set]}>
        <Text style={[styles.settingsText]}>Hyphenation</Text>
        <Switch
          value={hyphenation}
          onValueChange={onHyphenationChange}
          trackColor={{ false: '#ccc', true: '#05A30B' }}
          thumbColor={hyphenation ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* View Notes */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onViewNotes}
        style={[styles.set, { marginTop: 0 }]}
      >
        <Text style={[styles.settingsText]}>View Notes</Text>
        <Ionicons name="reader-outline" size={20} />
      </TouchableOpacity>
    </View>
  );
};

export default FontsDisplay;

const styles = StyleSheet.create({
  fontBtnLg: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    padding: 10,
  },
  sliderArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    width: windowWidth / 1.1,
    //   backgroundColor: 'red',
    //   margin: 10,
    //   padding: 5,
    alignSelf: 'center',
  },
  set: {
    marginBottom: 0,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    alignContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  setsContent: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    margin: 5,
    marginTop: 10,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    // marginLeft: 17,
  },
});
