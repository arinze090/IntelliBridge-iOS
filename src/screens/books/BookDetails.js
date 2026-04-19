import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { usePaystack } from 'react-native-paystack-webview';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { useIAP, ErrorCode, getAvailablePurchases } from 'react-native-iap';

import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import HeaderTitle from '../../components/common/HeaderTitle';
import { useTheme } from '../../Context/ThemeContext';
import { windowWidth } from '../../utils/Dimensions';
import { COLORS } from '../../themes/themes';
import FormButton from '../../components/form/FormButton';
import {
  formatToNaira,
  generateProductId,
  RNToast,
} from '../../Library/Common';
import ScrollViewSpace from '../../components/common/ScrollViewSpace';
import {
  removeBookFromBookmarks,
  saveBookmarkedBooks,
} from '../../redux/features/books/booksSlice';
import axiosInstance from '../../utils/api-client';
import CategoryCard from '../../components/cards/CategoryCard';
import BottomSheet from '../../components/bottomSheet/BottomSheet';
import PaymentButtons from '../../components/form/PaymentButtons';

const isIos = Platform.OS === 'ios';

const BookDetails = ({ navigation, route }) => {
  const item = route?.params;
  // console.log('hhfhf', item);

  const { theme } = useTheme();
  const bottomSheetRef = useRef();

  const dispatch = useDispatch();
  const state = useSelector(state => state);
  const loggedInUser = state?.user?.user;
  const bookmarkedBooks = state?.books?.bookmarkedBooks || [];
  const isBookBookmarked = bookmarkedBooks?.some(
    book => book?._id === item?._id,
  );

  const appleProductId = generateProductId(item?.bookTitle);
  // console.log('Generated Product ID:', appleProductId);

  const [appleProductData, setAppleProductData] = useState();
  // console.log('Generated appleProductData:', appleProductData);

  // Paystack Integration
  const { popup } = usePaystack();

  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [authorExpanded, setAuthorExpanded] = useState(false);
  const [showAuthorToggle, setShowAuthorToggle] = useState(false);
  const [loading, setLoading] = useState(false);

  const bookCheckout = async (paymentMethod, paymentReference, paymentData) => {
    const bookOrder = {
      paymentMethod: paymentMethod,
      transactionReference: paymentReference,
      items: [item?._id],
      paymentData: paymentData,
    };

    console.log('bookOrder', bookOrder);

    setLoading(true);

    try {
      await axiosInstance({
        url: '/api/orders/checkout',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: bookOrder,
      }).then(res => {
        setLoading(false);
        console.log('bookCheckout res', res);
        RNToast(Toast, 'Your purchase has been verified ✅');

        // save to redux the book purchased
        // dispatch(saveBoughtBooks(item));

        navigation.navigate('Home', { screen: 'HomeScreen' });

        // later on navigate to the Bookscreen to fetch and show the list of books the user bought and reading,
        // then navigate to the BookReader with the selected book details
        navigation.navigate('Books', {
          screen: 'BooksScreen',
          params: { item },
        });
      });
    } catch (error) {
      console.error('bookCheckout error:', error?.response);
      setLoading(false);
      // RNToast(Toast, 'An error occured purchase has been verified ✅');
      Alert.alert(
        'Payment Failed',
        `Your payment of ${formatToNaira(item?.price)} for ${
          item?.bookTitle
        } failed. If your account has been debited, please contact our support helpline to get it resolved`,
      );
    }
  };

  const buyBookNow = () => {
    // Close bottom sheet first so the Paystack popup can appear on top
    bottomSheetRef.current?.close();

    // Add a small delay to ensure bottom sheet is closed before showing popup
    setTimeout(() => {
      console.log('Book purchased:', item?.bookTitle);

      popup?.checkout({
        email: loggedInUser?.email,
        amount: item?.price,

        onSuccess: res => {
          console.log('Success:', res);
          const payStackPaymentReference = res?.reference;
          const paystackPaymentData = res;

          bookCheckout(
            'paystack',
            payStackPaymentReference,
            paystackPaymentData,
          );
        },
        onCancel: () => console.log('User cancelled'),
        onLoad: res => console.log('WebView Loaded:', res),
        onError: err => console.log('WebView Error:', err),
      });
    }, 300);
  };

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

  const payWithApplePay = async () => {
    // Implement Apple Pay logic here
    console.log('Paying with Apple Pay for:', item?.bookTitle);
    setLoading(true);
    requestPurchase({
      request: { apple: { sku: appleProductData?.[0]?.id } },
      type: 'in-app',
    });
  };

  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    validateReceipt,
  } = useIAP({
    onPurchaseSuccess: purchase => {
      console.log('Purchase successful:', purchase);
      // validate the purchase receipt with Apple and then
      // submit to the backend for verification and fulfillment (unlocking the book)
      validatePurchase(purchase);
    },
    onPurchaseError: error => {
      console.error('Purchase failed:', error);
      setLoading(false);

      // Handle purchase error
      if (error?.code === ErrorCode?.UserCancelled) {
        console.log('User cancelled the purchase');
      } else if (error?.code == 'duplicate-purchase') {
        const checkPurchases = async () => {
          const purchases = await getAvailablePurchases();
          console.log('Available purchases:', purchases);

          const alreadyOwned = purchases?.find(
            p => p.productId === appleProductId,
          );

          if (alreadyOwned) {
            console.log('Already owned:', alreadyOwned);

            // sync with backend
            bookCheckout('applepay', alreadyOwned?.transactionId, alreadyOwned);
          }
        };

        checkPurchases();
      } else {
        Alert.alert(
          'Purchase Failed',
          'An error occurred during the purchase. Please try again.',
        );
      }
    },
  });

  const validatePurchase = async purchase => {
    try {
      const result = await validateReceipt({
        apple: { sku: purchase?.productId },
      });

      if (result?.isValid) {
        console.log('Receipt is valid', result);
        // submit to the backend for verification and fulfillment (unlocking the book)
        bookCheckout('applepay', purchase?.transactionId, purchase);
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setLoading(false);
      Alert.alert(
        'Purchase Verification Failed',
        'An error occurred while verifying the purchase. Please try again.',
      );
    }
  };

  useEffect(() => {
    if (connected) {
      fetchProducts({
        skus: [appleProductId],
        type: 'in-app',
      });
    }
  }, [connected]);

  useEffect(() => {
    console.log('Products updated:', products);
    setAppleProductData(products);
  }, [products]);

  // useEffect(() => {
  //   if (connected) {
  //     console.log('Connected to IAP');

  //     const checkPurchases = async () => {
  //       const purchases = await getAvailablePurchases();
  //       console.log('Available purchases:', purchases);

  //       const alreadyOwned = purchases?.find(
  //         p => p.productId === appleProductId,
  //       );

  //       if (alreadyOwned) {
  //         console.log('Already owned:', alreadyOwned);

  //         // sync with backend
  //         bookCheckout('applepay', alreadyOwned.transactionId, alreadyOwned);
  //       }
  //     };

  //     checkPurchases();
  //   }
  // }, [connected]);

  return (
    <SafeAreaViewComponent>
      <HeaderTitle
        leftIcon={'chevron-back-outline'}
        onLeftIconPress={() => navigation.goBack()}
        rightIcon={isBookBookmarked ? 'bookmark' : 'bookmark-outline'}
        onRightIconPress={() => {
          bookmarkBook();
        }}
      />

      {/* Book Information */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bookInfoContainer}
      >
        <Image
          style={styles.bookDetailsImage}
          source={{ uri: item?.bookImage }}
        />
        <Text style={[styles.bookDetailsTitle, { color: theme?.text }]}>
          {item?.bookTitle}
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
            {item?.author}
          </Text>
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <CategoryCard
            iconName={'layers-outline'}
            props={item?.category?.name}
          />
          <CategoryCard
            iconName={'book-outline'}
            props={item?.bookFormat == 'epub' && 'E-book'}
          />
          {item?.isbn && (
            <CategoryCard
              iconName={'barcode-outline'}
              props={item?.isbn && `ISBN: ${item?.isbn}`}
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
          {item?.description}
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
          {item?.aboutAuthor}
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
        <ScrollViewSpace />
      </ScrollView>

      <View style={styles.btnSection}>
        {item?.isInLibrary ? (
          <FormButton
            title={'Read Now'}
            loading={loading}
            onPress={() => {
              navigation.navigate('Home', { screen: 'HomeScreen' });

              navigation.navigate('Books', {
                screen: 'BooksScreen',
                params: { item },
              });
            }}
          />
        ) : (
          <FormButton
            title={'Buy Now' + ` ${formatToNaira(item?.price)}`}
            loading={loading}
            // onPress={() => {
            //   bottomSheetRef.current.open();
            // }}
            onPress={isIos ? payWithApplePay : buyBookNow}
          />
        )}
      </View>

      <BottomSheet
        bottomSheetRef={bottomSheetRef}
        bottomsheetTitle={'Choose Payment Method'}
        height={isIos ? 3 : 4}
      >
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={{
              padding: 15,
              backgroundColor: COLORS.legacyBridgePrimary,
              borderRadius: 8,
              marginBottom: 10,
            }}
            onPress={buyBookNow}
          >
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              Pay with - Card or Bank Transfer
            </Text>
          </TouchableOpacity>

          {/* Add more payment options here */}
          {isIos && (
            <PaymentButtons
              onPress={payWithApplePay}
              paymentMethod="Pay"
              paymentMethodIcon="logo-apple"
            />
          )}
        </View>
      </BottomSheet>
    </SafeAreaViewComponent>
  );
};

export default BookDetails;

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
