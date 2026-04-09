import { FlatList, StyleSheet, Text } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';

import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import HeaderTitle from '../../components/common/HeaderTitle';
import { useTheme } from '../../Context/ThemeContext';
import BookCardWithPriceTag from '../../components/cards/BookCardWithPriceTag';

const WishlistScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const state = useSelector(state => state);
  const reduxWishlistBooks = state?.books?.wishlistsBooks || [];

  const renderItem = ({ item }) => {
    return (
      <BookCardWithPriceTag
        props={item}
        bookProgress={item?.progress || 0}
        onPress={() => navigation.navigate('BookDetails', item)}
      />
    );
  };

  return (
    <SafeAreaViewComponent>
      <HeaderTitle
        headerTitle={'Wishlists'}
        leftIcon={'chevron-back-outline'}
        onLeftIconPress={() => {
          navigation.goBack();
        }}
      />
      {reduxWishlistBooks && reduxWishlistBooks?.length > 0 ? (
        <FlatList
          data={reduxWishlistBooks || []}
          renderItem={renderItem}
          keyExtractor={item => item?._id.toString()}
          contentContainerStyle={styles.booksArray}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={[styles.noBooks, { color: theme?.text }]}>
          No books in your wishlist at this moment. {'\n'} Browse through our
          curated books
        </Text>
      )}
    </SafeAreaViewComponent>
  );
};

export default WishlistScreen;

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
