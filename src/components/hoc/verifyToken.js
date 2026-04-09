import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';
import { RNToast } from '../../Library/Common';
import Toast from 'react-native-toast-message';
import { signOut } from '../../redux/features/user/userSlice';

// This function takes a component...
// i am trying to check the last time the user logine if its greater than an hour,
// else we log them out for security as the accessToken would have been expired
export default function verifyTokenWithoutApi(WrappedComponent) {
  return props => {
    const state = useSelector(state => state);
    const tokenSavedInRedux = state?.user?.accessToken;
    const lastTimeUserLoggedIn = state?.user?.lastLoginTime;
    const nowDate = Date.now();
    console.log(
      'nowwww',
      nowDate,
      lastTimeUserLoggedIn,
      nowDate - lastTimeUserLoggedIn,
    );

    const navigation = useNavigation();
    const dispatch = useDispatch();

    const checkLogin = () => {
      setTimeout(() => {
        if (nowDate - lastTimeUserLoggedIn >= 60 * 60 * 1000) {
          dispatch(signOut());

          RNToast(Toast, 'Session Expired, Please Login');
          navigation.navigate('Login');
        }
      }, 500);
    };

    useEffect(() => {
      checkLogin();
    }, [props, nowDate]);

    useEffect(() => {
      const focusUnSubscribe = navigation.addListener('focus', () =>
        checkLogin(),
      );
      return () => {
        try {
          focusUnSubscribe();
        } catch (e) {}
      };
    }, [nowDate]);

    return <WrappedComponent {...props} />;
  };
}
