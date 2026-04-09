import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

import { useTheme } from '../../Context/ThemeContext';
import BookCard2 from '../../components/cards/BookCard2';
import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import { dummyBooks } from '../../data/dummyData';
import BookCard from '../../components/cards/BookCard';

const StoreBooks = ({ navigation }) => {
  const { theme } = useTheme();

  const [isGrid, setIsGrid] = useState(true);

  const toggleLayout = () => {
    setIsGrid(!isGrid);
  };

  const renderItem = ({ item }) =>
    isGrid ? (
      <BookCard
        props={item}
        onPress={() => navigation.navigate('BookDetails', item)}
      />
    ) : (
      <BookCard2
        props={item}
        onPress={() => navigation.navigate('BookDetails', item)}
      />
    );

  return (
    <SafeAreaViewComponent>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 20,
          alignItems: 'center',
        }}
      >
        <Text style={[styles.appName, { color: theme?.text }]}>BookStore</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <Ionicons
            name="search-outline"
            size={30}
            color={theme?.text}
            onPress={() => navigation.navigate('Search')}
          />
          <TouchableOpacity activeOpacity={0.9} onPress={toggleLayout}>
            {isGrid ? (
              <Ionicons name="list-outline" size={30} color={theme?.text} />
            ) : (
              <Ionicons name="grid-outline" size={30} color={theme?.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={dummyBooks}
        renderItem={renderItem}
        keyExtractor={item => item?._id.toString()}
        contentContainerStyle={styles.booksArray}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaViewComponent>
  );
};

export default StoreBooks;

const styles = StyleSheet.create({
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 100,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  booksArray: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: 10,
  },
  logoImage: {
    width: 60,
    height: 60,
    // objectFit: 'contain',
  },
  noBooks: {
    fontSize: 16,
    marginTop: 20,
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
