import { StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';

import FormInput from '../../components/form/FormInput';
import FormButton from '../../components/form/FormButton';
import { emailValidator } from '../../Library/Validation';
import HeaderTitle from '../../components/common/HeaderTitle';

import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import { COLORS } from '../../themes/themes';
import { windowHeight, windowWidth } from '../../utils/Dimensions';
import FixedBottomContainer from '../../components/common/FixedBottomContainer';

import { useTheme } from '../../Context/ThemeContext';
import axiosInstance from '../../utils/api-client';
import { normalizeEmail, RNToast } from '../../Library/Common';
import { setUserDestination } from '../../redux/features/user/userSlice';

const ForgetPassword = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');

  const sendOTPToEmail = async () => {
    try {
      setLoading(true);
      await axiosInstance({
        url: '/api/auth/forgotpassword',
        method: 'POST',
        data: { email: normalizeEmail(email) },
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
          console.log('res', res);
          setLoading(false);
          if (res?.data) {
            console.log('sendOTPToEmail data', res?.data);
            RNToast(Toast, 'A verification code has been sent to your email');
            navigation.navigate('EmailVerification', {
              email: normalizeEmail(email),
            });
            dispatch(setUserDestination('ResetPassword'));
          }
        })
        .catch(err => {
          console.log('sendOTPToEmail err', err?.response);
          setLoading(false);
          if (err?.response?.data?.message.includes('Too many requests')) {
            setFormError('Too many attempts. Please try again later.');
          } else if (err?.response?.data?.message.includes('no user')) {
            setFormError(
              'The email address is invalid. Please try again later with a registered email.',
            );
          }
        });
    } catch (error) {
      console.log('sendOTPToEmail error', error?.response);
    }
  };

  return (
    <SafeAreaViewComponent>
      <HeaderTitle
        leftIcon={'arrow-back-outline'}
        onLeftIconPress={() => {
          navigation.goBack();
        }}
      />
      <View style={{ marginBottom: 20, padding: 20 }}>
        <Text
          style={{
            color: theme?.text,
            fontSize: 24,
            fontWeight: '700',
          }}
        >
          Forgot Password
        </Text>
        <Text
          style={{
            color: theme?.text,
            fontSize: 13,
            fontWeight: '500',
            marginTop: 10,
          }}
        >
          Enter the email address associated with your account and we'll send
          you an OTP then you can reset your password
        </Text>
      </View>

      <FormInput
        formInputTitle={'Email'}
        value={email}
        placeholder="Email"
        width={1.1}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={txt => {
          setEmail(txt);
          setFormError('');
          setEmailError('');

          if (!emailValidator(txt)) {
            setEmailError('Please enter a valid email');
          } else {
            setEmailError('');
          }
        }}
        placeholderTextColor="#ccc"
        errorMessage={emailError}
      />

      {/* Buttons */}
      <FixedBottomContainer top={1.3}>
        <FormButton
          title={'Next'}
          formError={formError}
          onPress={() => {
            sendOTPToEmail();
          }}
          disabled={!emailValidator(email) || loading}
          loading={loading}
        />
      </FixedBottomContainer>
    </SafeAreaViewComponent>
  );
};

export default ForgetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.appBackground,
  },
  imageBg: {
    padding: 20,
    height: windowHeight / 4,
    backgroundColor: 'red',
  },
  logo: {
    width: windowWidth / 1.2,
    height: windowHeight / 8,
  },
  logoContainer: {
    // backgroundColor: COLORS.formButton,
    width: windowWidth / 1.2,
    height: windowHeight / 10,
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  auth: {
    // width: windowWidth / 1.1,
    // alignSelf: "center",
    marginTop: 30,
    marginLeft: 20,
  },
  error: {
    color: 'red',
    fontWeight: '500',
    alignSelf: 'center',
    marginBottom: 7,
    fontSize: 13,
  },
  alreadySection: {
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
  },
  alreadyText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  signup: {
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    // backgroundColor: "red",
    // marginTop: 10,
  },
  validationError: {
    color: COLORS.formButton,
    fontWeight: '500',
    marginBottom: 15,
    fontSize: 13,
    // textAlign: 'center',
  },
});
