import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import BookOrdersCard from '../../components/cards/BookOrdersCard';
import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import HeaderTitle from '../../components/common/HeaderTitle';
import { useTheme } from '../../Context/ThemeContext';
import axiosInstance from '../../utils/api-client';
import { saveUserOrders } from '../../redux/features/user/userSlice';

const BookOrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const state = useSelector(state => state);
  const reduxOrders = state?.user?.userOrders;
  console.log('reduxOrders', reduxOrders);

  const [loading, setLoading] = useState(false);

  const renderItem = ({ item }) => {
    return <BookOrdersCard props={item} />;
  };

  const fetchUserOrders = async () => {
    try {
      await axiosInstance('/api/orders/my-orders')
        .then(res => {
          console.log('fetchUserOrders res', res);
          dispatch(saveUserOrders(res?.data));
          setLoading(false);
        })
        .catch(error => {
          console.error('fetchUserOrders error:', error?.response);
          setLoading(false);
        });
    } catch (error) {
      console.error('fetchUserOrders error:', error?.response);
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setLoading(true);
    fetchUserOrders();
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchUserOrders();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaViewComponent>
      <HeaderTitle
        leftIcon={'chevron-back-outline'}
        onLeftIconPress={() => navigation.goBack()}
        headerTitle={'Book Orders'}
      />

      <FlatList
        data={reduxOrders}
        renderItem={renderItem}
        keyExtractor={item => item?._id.toString()}
        contentContainerStyle={styles.booksArray}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      />
    </SafeAreaViewComponent>
  );
};

export default BookOrdersScreen;

const styles = StyleSheet.create({});
