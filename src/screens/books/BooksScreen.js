import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../Context/ThemeContext';
import ReadingBookCard from '../../components/cards/ReadingBookCard';
import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import axiosInstance from '../../utils/api-client';
import { saveLibraryBooks } from '../../redux/features/books/booksSlice';

const BooksScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const state = useSelector(state => state);
  const booksState = state?.books;
  const reduxLibraryBooks = state?.books?.librarybooks;
  const boughtAndReadingbooks = booksState?.bookLocations;
  console.log('reduxLibraryBooks', reduxLibraryBooks, boughtAndReadingbooks);

  // Convert reading books from object to array
  const reduxReadingBooks = Object?.values(boughtAndReadingbooks || {});

  // Combine bought and reading books without duplicates
  const allBooks = [];
  const seenBookIds = new Set();

  // Add reading books first (prioritize books being read)
  reduxReadingBooks?.forEach(readingBook => {
    const bookId = readingBook?.bookInfo?._id;
    if (bookId && !seenBookIds?.has(bookId)) {
      allBooks?.push({
        ...readingBook,
        isReading: true,
      });
      seenBookIds?.add(bookId);
    }
  });

  // Add bought books that aren't already in the list
  reduxLibraryBooks?.forEach(libBook => {
    const bookId = libBook?.book?._id;
    if (bookId && !seenBookIds?.has(bookId)) {
      allBooks?.push({
        bookInfo: libBook?.book,
        progress: 0,
        lastPage: 0,
        isReading: false,
      });
      seenBookIds?.add(bookId);
    }
  });

  console.log('Combined Books (no duplicates):', allBooks);
  console.log('Bought and Reading Books:', boughtAndReadingbooks);

  const [isGrid, setIsGrid] = useState(true);
  const [loading, setLoading] = useState(false);

  const toggleLayout = () => {
    setIsGrid(!isGrid);
  };

  const renderItem = ({ item }) => {
    return (
      <ReadingBookCard
        props={item?.bookInfo}
        bookProgress={item?.progress || 0}
        onPress={() => navigation.navigate('BookReader', item?.bookInfo)}
      />
    );
  };

  const fetchLibraryBooks = async () => {
    try {
      await axiosInstance('/api/orders/my-library')
        .then(res => {
          console.log('fetchLibraryBooks res', res);
          dispatch(saveLibraryBooks(res?.data));
          setLoading(false);
        })
        .catch(error => {
          console.error('fetchLibraryBooks error:', error?.response);
          setLoading(false);
        });
    } catch (error) {
      console.error('fetchLibraryBooks error:', error?.response);
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setLoading(true);
    fetchLibraryBooks();
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchLibraryBooks();
    }

    return () => {
      isMounted = false;
    };
  }, []);

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
        <Text style={[styles.appName, { color: theme?.text }]}>Library</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <Ionicons
            name="search-outline"
            size={30}
            color={theme?.text}
            // onPress={() => navigation.navigate('Search', { books: allBooks })}
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

      {allBooks && allBooks?.length ? (
        <FlatList
          data={allBooks}
          renderItem={renderItem}
          keyExtractor={item => item?.bookInfo?._id.toString()}
          contentContainerStyle={styles.booksArray}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
        />
      ) : (
        <ScrollView
          vertical
          showsVerticalScrollIndicator
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
        >
          <View>
            <Text style={[styles.noBooks, { color: theme?.text }]}>
              No books in your library at this moment. Start reading now!
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaViewComponent>
  );
};

export default BooksScreen;

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
