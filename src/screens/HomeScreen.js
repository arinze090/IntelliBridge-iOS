import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import SafeAreaViewComponent from '../components/common/SafeAreaViewComponent';
import { useTheme } from '../Context/ThemeContext';
import BookCardWithPriceTag from '../components/cards/BookCardWithPriceTag';
import axiosInstance from '../utils/api-client';
import { getGreeting } from '../Library/Common';
import { getBooks } from '../redux/features/books/booksSlice';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const state = useSelector(state => state);
  const loggedInUser = state?.user?.user;
  const reduxBooks = state?.books?.books;
  console.log('reduxBooks', reduxBooks);

  const [isGrid, setIsGrid] = useState(true);
  const [loading, setLoading] = useState(false);

  const toggleLayout = () => {
    setIsGrid(!isGrid);
  };

  const renderItem = ({ item }) => {
    return (
      <BookCardWithPriceTag
        props={item}
        onPress={() => navigation.navigate('BookDetails', item)}
      />
    );
  };

  const fetchIntelliBooks = async () => {
    try {
      await axiosInstance('/api/books')
        .then(res => {
          console.log('fetchIntelliBooks res', res);
          dispatch(getBooks(res?.data));
          setLoading(false);
        })
        .catch(error => {
          console.error('fetchIntelliBooks error:', error?.response);
          setLoading(false);
        });
    } catch (error) {
      console.error('fetchIntelliBooks error:', error?.response);
      setLoading(false);
    }
  };

  const fetchBooksData = async () => {
    try {
      setLoading(true);

      const [intelliRes, libraryRes] = await Promise.all([
        axiosInstance('/api/books'),
        axiosInstance('/api/orders/my-library'),
      ]);

      const intelliBooks = intelliRes?.data || [];
      const libraryBooks = libraryRes?.data || [];
      // console.log('intelliBooks', intelliBooks);
      // console.log('libraryBooks', libraryBooks);

      // ✅ Extract IDs properly
      const libraryIds = new Set(
        libraryBooks.map(item => item?.book?._id)?.filter(Boolean),
      );

      console.log('libraryIds', [...libraryIds]);

      // 👉 Merge + Tag
      const mergedBooks = intelliBooks?.map(book => ({
        ...book,
        isInLibrary: libraryIds?.has(book?._id),
      }));

      console.log('mergedBooks', mergedBooks);

      dispatch(getBooks(mergedBooks));

      setLoading(false);
    } catch (error) {
      console.error('fetchBooksData error:', error?.response);
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchBooksData();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = () => {
    setLoading(true);
    fetchBooksData();
  };

  return (
    <SafeAreaViewComponent>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: theme?.text, fontSize: 15 }}>
          {getGreeting()} {'\n'}
          <Text
            style={{ color: theme?.text, fontSize: 17, fontWeight: 'bold' }}
          >
            {loggedInUser?.username}
          </Text>
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <Ionicons
            name="search-outline"
            size={30}
            color={theme?.text}
            onPress={() => navigation.navigate('Search', { books: reduxBooks })}
          />
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('Settings', {
                screen: 'EditProfile',
              })
            }
          >
            <Image
              source={
                loggedInUser?.profilePicture
                  ? { uri: loggedInUser?.profilePicture }
                  : require('../assets/user-dummy-img.jpg')
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading && reduxBooks?.length === 0 ? (
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
      ) : (
        <FlatList
          data={reduxBooks}
          renderItem={renderItem}
          keyExtractor={item => item?._id.toString()}
          contentContainerStyle={styles.booksArray}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              style={{ color: theme?.text }}
            />
          }
          ListEmptyComponent={
            !loading && (
              <Text style={[styles.noBooks, { color: theme?.text }]}>
                Please wait while we aggregate the best books for you. This may
                take a moment.
              </Text>
            )
          }
        />
      )}
    </SafeAreaViewComponent>
  );
};

export default HomeScreen;

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
    justifyContent: 'center',
    alignContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});
