import React from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Keyboard,
  Button,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { windowWidth } from '../../utils/Dimensions';
import { COLORS } from '../../themes/themes';
import { useTheme } from '../../Context/ThemeContext';

const SearchBar = ({
  clicked,
  setClicked,
  searchPlaceholder,
  searchPhrase,
  setSearchPhrase,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderColor: theme?.text }]}>
      <View
        style={
          !clicked ? styles.searchBar__unclicked : styles.searchBar__clicked
        }
        onPress={Keyboard.dismiss}
      >
        {/* search Icon */}
        <Ionicons name="search-outline" size={27} color={theme?.text} />

        {/* Input field */}
        <TextInput
          style={[styles.input, { color: theme?.text }]}
          placeholder={searchPlaceholder}
          value={searchPhrase}
          onChangeText={setSearchPhrase}
          placeholderTextColor="#757575"
          autoFocus={clicked}
          onFocus={() => setClicked(true)}
        />

        {/* cross Icon, depending on whether the search bar is clicked or not */}
        {clicked && (
          <Ionicons
            name="close-outline"
            size={20}
            color={COLORS.pinky}
            style={{ padding: 1 }}
            onPress={() => {
              setSearchPhrase('');
            }}
          />
        )}
      </View>
      {/* cancel button, depending on whether the search bar is clicked or not */}
      {/* {clicked && (
        <View>
          <Button
            title="Cancel"
            onPress={() => {
              Keyboard.dismiss();
              setClicked(false);
              setSearchPhrase("");
            }}
            color="#666"
          />
        </View>
      )} */}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    margin: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    width: windowWidth - 10,
    marginBottom: 10,
    marginTop: 10,
    // marginBottom: 10,
  },
  searchBar__unclicked: {
    padding: 7,
    flexDirection: 'row',
    width: '97%',
    backgroundColor: '#2465E10D',
    borderRadius: 8,
    alignItems: 'center',
  },
  searchBar__clicked: {
    padding: 7,
    flexDirection: 'row',
    width: '93%',
    backgroundColor: '#2465E10D',
    borderRadius: 8,
    alignItems: 'center',
    // justifyContent: "space-evenly",
  },
  input: {
    fontSize: 16,
    marginLeft: 10,
    width: '90%',
    color: 'black',
  },
});
