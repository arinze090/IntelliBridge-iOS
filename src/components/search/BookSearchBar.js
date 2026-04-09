import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, Keyboard, Button } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { windowWidth } from '../../utils/Dimensions';
import { COLORS } from '../../themes/themes';

const BookSearchBar = props => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View
        style={
          !props?.clicked
            ? styles.searchBar__unclicked
            : styles.searchBar__clicked
        }
      >
        {/* search Icon */}
        <Ionicons
          name="chevron-back-outline"
          size={30}
          backgroundColor={COLORS.legacyBridgePrimary}
          color="#fff"
          onPress={() => navigation.goBack()}
        />

        {/* Input field */}
        <TextInput
          style={styles.input}
          placeholder="Find Books ..."
          value={props.searchPhrase}
          onChangeText={props?.setSearchPhrase}
          placeholderTextColor="#757575"
          focusable={true}
          onFocus={() => {
            props?.setClicked(true);
          }}
          autoFocus={props?.autoFocus}

          //   clearTextOnFocus={true}
        />
        {/* cross Icon, depending on whether the search bar is clicked or not */}
        {props?.clicked && (
          <Ionicons
            name="close-outline"
            size={20}
            color="#ccc"
            style={{ padding: 1 }}
            onPress={() => {
              props?.setSearchPhrase('');
            }}
          />
        )}
      </View>
      {/* cancel button, depending on whether the search bar is clicked or not */}
      {props?.clicked && (
        <View>
          <Button
            title="Cancel"
            onPress={() => {
              Keyboard.dismiss();
              props?.setClicked(false);
              props?.setSearchPhrase('');
            }}
            color="#666"
          />
        </View>
      )}
    </View>
  );
};

export default BookSearchBar;

const styles = StyleSheet.create({
  container: {
    margin: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    width: windowWidth - 10,
    marginBottom: 0,
    marginTop: -10,
  },
  searchBar__unclicked: {
    padding: 7,
    flexDirection: 'row',
    width: '97%',
    backgroundColor: '#212121',
    borderRadius: 12,
    alignItems: 'center',
  },
  searchBar__clicked: {
    padding: 10,
    flexDirection: 'row',
    width: '80%',
    backgroundColor: '#212121',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  input: {
    fontSize: 16,
    marginLeft: 10,
    width: '90%',
    color: 'white',
  },
});
