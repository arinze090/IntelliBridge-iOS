import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import SafeAreaViewComponent from '../components/common/SafeAreaViewComponent';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme } from '../Context/ThemeContext';
import BookSearchBar from '../components/search/BookSearchBar';
import { windowHeight } from '../utils/Dimensions';
import BookCardWithPriceTag from '../components/cards/BookCardWithPriceTag';

const SearchScreen = ({ navigation, route }) => {
  const item = route?.params?.books;
  console.log('SearchScreen item', item);

  const { theme } = useTheme();

  const state = useSelector(state => state);
  const reduxBooks = state?.books?.books;
  console.log('reduxBooks', reduxBooks);

  // Search filter states
  const [clicked, setClicked] = useState(false);
  const [search, setSearch] = useState('');
  const [masterDataSource, setMasterDataSource] = useState(item);
  const [filteredDataSource, setFilteredDataSource] = useState(item);

  const searchFilterFunction = text => {
    if (text) {
      const newData = masterDataSource?.filter(item => {
        const itemData = item?.bookTitle
          ? item?.bookTitle?.toUpperCase()
          : ''.toUpperCase();
        const textData = text?.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with masterDataSource
      setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  return (
    <SafeAreaViewComponent>
      {/* SearchBar Section */}
      <BookSearchBar
        searchPhrase={search}
        setSearchPhrase={text => searchFilterFunction(text)}
        clicked={clicked}
        setClicked={setClicked}
        autoFocus={true}
      />

      {search === '' ? (
        <View style={styles.searchCat}>
          <Text style={[styles.searchCatText, { color: theme?.text }]}>
            Search for your favorite books
          </Text>
        </View>
      ) : (
        <ScrollView vertical contentContainerStyle={styles.scrollviewContainer}>
          {filteredDataSource?.map((cur, i) => {
            return (
              <View key={cur?._id + '-' + cur?.bookTitle + '-' + i}>
                <BookCardWithPriceTag
                  props={cur}
                  onPress={() => navigation.navigate('BookDetails', cur)}
                />
              </View>
            );
          })}
          <View
            style={[
              styles.section,
              { marginTop: windowHeight / 2, minHeight: 200 },
            ]}
          />
        </ScrollView>
      )}
    </SafeAreaViewComponent>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 5,
    marginLeft: 6,
    marginTop: 10,
  },
  searchCat: {
    margin: 20,
    // backgroundColor: 'pink',
    marginTop: 30,
  },
  searchCatText: {
    color: '#ccc',
    fontSize: 15,
    fontWeight: '700',
  },
});
