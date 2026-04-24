import { FlatList, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';

import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import HeaderTitle from '../../components/common/HeaderTitle';
import { useTheme } from '../../Context/ThemeContext';
import BookCard2 from '../../components/cards/BookCard2';
import BookCard from '../../components/cards/BookCard';

const BookmarksScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const state = useSelector(state => state);
  const reduxBookmarkedBooks = state?.books?.bookmarkedBooks || [];

  const reduxBookmarkBooksPage = state?.books?.bookmarkBookPages;
  console.log('reduxBookmarkBooksPage', reduxBookmarkBooksPage);

  const renderItem = ({ item }) => {
    return (
      <BookCard
        props={item}
        bookProgress={item?.progress || 0}
        onPress={() => navigation.navigate('BookDetails', item)}
      />
    );
  };

  return (
    <SafeAreaViewComponent>
      <HeaderTitle
        headerTitle={'Bookmarks'}
        leftIcon={'chevron-back-outline'}
        onLeftIconPress={() => {
          navigation.goBack();
        }}
      />
      {reduxBookmarkedBooks && reduxBookmarkedBooks?.length > 0 ? (
        <FlatList
          data={reduxBookmarkedBooks || []}
          renderItem={renderItem}
          keyExtractor={item => item?._id.toString()}
          contentContainerStyle={styles.booksArray}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={[styles.noBooks, { color: theme?.text }]}>
          No books in your library at this moment. Start reading now!
        </Text>
      )}
    </SafeAreaViewComponent>
  );
};

export default BookmarksScreen;

const styles = StyleSheet.create({
  booksArray: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: 10,
  },
  noBooks: {
    fontSize: 14,
    marginTop: 40,
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    justifyContent: 'center',
    alignContent: 'center',
  },
});
