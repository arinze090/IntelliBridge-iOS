import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import HeaderTitle from '../../components/common/HeaderTitle';
import { useTheme } from '../../Context/ThemeContext';
import { windowWidth } from '../../utils/Dimensions';
import { COLORS } from '../../themes/themes';
import FormButton from '../../components/form/FormButton';
import ScrollViewSpace from '../../components/common/ScrollViewSpace';
import {
  removeBookFromBookmarks,
  saveBookmarkedBooks,
} from '../../redux/features/books/booksSlice';
import CategoryCard from '../../components/cards/CategoryCard';
import ProgressBar from '../../components/common/ProgressBar';

const LibraryBookDetails = ({ navigation, route }) => {
  const item = route?.params;
  console.log('hhfhf', item);

  const { theme } = useTheme();

  const dispatch = useDispatch();
  const state = useSelector(state => state);
  const loggedInUser = state?.user?.user;
  const bookmarkedBooks = state?.books?.bookmarkedBooks || [];
  const isBookBookmarked = bookmarkedBooks?.some(
    book => book?._id === item?._id,
  );

  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [authorExpanded, setAuthorExpanded] = useState(false);
  const [showAuthorToggle, setShowAuthorToggle] = useState(false);
  const [loading, setLoading] = useState(false);

  const bookmarkBook = () => {
    // Implement your book bookmarking logic here
    console.log('Book bookmarked:', item?.title);
    if (isBookBookmarked) {
      // If the book is already bookmarked, remove it from bookmarks
      dispatch(removeBookFromBookmarks(item));
    } else {
      // If the book is not bookmarked, add it to bookmarks
      dispatch(saveBookmarkedBooks(item));
    }
  };

  return (
    <SafeAreaViewComponent>
      <HeaderTitle
        leftIcon={'chevron-back-outline'}
        onLeftIconPress={() => navigation.goBack()}
        rightIcon={isBookBookmarked ? 'bookmark' : 'bookmark-outline'}
        onRightIconPress={() => {
          bookmarkBook();
        }}
        progress={item?.progress}
      />

      {/* Book Information */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bookInfoContainer}
      >
        <Image
          style={styles.bookDetailsImage}
          source={{ uri: item?.bookInfo?.bookImage }}
        />
        <Text style={[styles.bookDetailsTitle, { color: theme?.text }]}>
          {item?.bookInfo?.bookTitle}
        </Text>
        <Text
          style={[
            styles.bookDetailsAuthor,
            {
              color: theme?.text,
              fontSize: 14,
              textAlign: 'center',
              marginBottom: 10,
            },
          ]}
        >
          By:{' '}
          <Text
            style={{
              color: theme?.secondaryText,
              fontSize: 15,
              fontWeight: '600',
            }}
          >
            {item?.bookInfo?.author}
          </Text>
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <CategoryCard
            iconName={'layers-outline'}
            props={item?.bookInfo?.category?.name}
          />
          <CategoryCard
            iconName={'book-outline'}
            props={item?.bookInfo?.bookFormat == 'epub' && 'E-book'}
          />
          {item?.isbn && (
            <CategoryCard
              iconName={'barcode-outline'}
              props={item?.bookInfo?.isbn && `ISBN: ${item?.bookInfo?.isbn}`}
            />
          )}
        </ScrollView>

        {/* Book Information */}
        <Text style={[styles.aboutAuthor, { color: theme?.text }]}>
          About the Book
        </Text>
        <Text
          numberOfLines={expanded ? undefined : 4}
          onTextLayout={e => {
            if (e.nativeEvent.lines.length > 3) {
              setShowToggle(true);
            }
          }}
          style={[styles.bookDetailsDescription, { color: theme?.text }]}
        >
          {item?.bookInfo?.description}
        </Text>
        {showToggle && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setExpanded(prev => !prev)}
          >
            <Text style={{ color: COLORS.legacyBridgePrimary, marginTop: 4 }}>
              {expanded ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.aboutAuthor, { color: theme?.text }]}>
          About the Author
        </Text>
        <Text
          numberOfLines={authorExpanded ? undefined : 4}
          onTextLayout={e => {
            if (e.nativeEvent.lines.length > 3) {
              setShowAuthorToggle(true);
            }
          }}
          style={[styles.bookDetailsDescription, { color: theme?.text }]}
        >
          {item?.bookInfo?.aboutAuthor}
        </Text>
        {showAuthorToggle && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setAuthorExpanded(prev => !prev)}
          >
            <Text style={{ color: COLORS.legacyBridgePrimary, marginTop: 4 }}>
              {authorExpanded ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Progress Segment */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            width: '80%',
          }}
        >
          <Text
            style={{ color: theme?.text, fontSize: 16, fontWeight: 'bold' }}
          >
            Progress:{' '}
            <Text style={{ color: theme?.text, fontSize: 12 }}>
              {item?.progress || 0}%
            </Text>
          </Text>
          <ProgressBar progress={item?.progress || 0} />
        </View>
        <ScrollViewSpace />
      </ScrollView>

      <View style={styles.btnSection}>
        <FormButton
          title={item?.isReading ? 'Continue Reading' : 'Start Reading'}
          loading={loading}
          onPress={() => navigation.navigate('BookReader', item?.bookInfo)}
        />
      </View>
    </SafeAreaViewComponent>
  );
};

export default LibraryBookDetails;

const styles = StyleSheet.create({
  bookInfoContainer: {
    padding: 20,
    // justifyContent: 'center',
    // alignItems: 'center',
    gap: 10,
  },
  bookDetailsImage: {
    width: windowWidth / 2,
    height: (windowWidth / 2) * 1.5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'red',
    alignContent: 'center',
    alignSelf: 'center',
  },
  bookDetailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  btnSection: {
    // flexDirection: 'row',
    justifyContent: 'center',
    // marginTop: windowHeight / 5,
    // height: windowHeight / 15,
    position: 'absolute',
    padding: 15,
    bottom: 25,
    width: windowWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // translucent
    //     // backgroundColor: '#18191a',
    // position: 'absolute',
    borderRadius: 60,
  },
  aboutAuthor: {
    fontSize: 17,
    marginTop: '20',
    fontWeight: '700',
  },
});
