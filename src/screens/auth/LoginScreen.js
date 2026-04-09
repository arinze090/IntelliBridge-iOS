import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { windowWidth } from '../../utils/Dimensions';
import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import { useTheme } from '../../Context/ThemeContext';
import FormInput from '../../components/form/FormInput';
import FormButton from '../../components/form/FormButton';
import FixedBottomContainer from '../../components/common/FixedBottomContainer';
import KeyboardAvoidingComponent from '../../components/form/KeyboardAvoidingComponent';
import {
  getUser,
  saveAccessToken,
  setUserDestination,
} from '../../redux/features/user/userSlice';
import { COLORS } from '../../themes/themes';
import { RNToast } from '../../Library/Common';
import Toast from 'react-native-toast-message';
import axiosInstance from '../../utils/api-client';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [rightIcon, setRightIcon] = useState('eye');

  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  // This function handles the password visibility displaying the icons
  const handlePasswordVisibility = () => {
    if (rightIcon === 'eye') {
      setRightIcon('eye-off');
      setPasswordVisibility(!passwordVisibility);
    } else if (rightIcon === 'eye-off') {
      setRightIcon('eye');
      setPasswordVisibility(!passwordVisibility);
    }
  };

  const login = async () => {
    const loginData = {
      email: email,
      password: password,
    };

    setLoading(true);

    try {
      await axiosInstance({
        url: '/api/auth/login/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: loginData,
      }).then(res => {
        setLoading(false);
        console.log('loginResponse', res);
        if (res?.status === 200) {
          RNToast(Toast, 'Login Successful');
          dispatch(getUser(res?.data));
          dispatch(saveAccessToken(res?.data?.token));
        } else {
          RNToast(Toast, 'Login Failed. Please check your credentials.');
          setFormError('Login Failed. Please check your credentials.');
        }
      });
    } catch (error) {
      console.error('Login check error:', error?.response);
      setLoading(false);
      if (error?.response?.status === 401) {
        RNToast(Toast, 'Invalid email or password. Please try again.');
        setFormError('Invalid email or password. Please try again.');
      } else {
        RNToast(
          Toast,
          'An error occurred during login. Please try again later.',
        );
        setFormError('An error occurred during login. Please try again later.');
      }
    }
  };

  return (
    <SafeAreaViewComponent>
      <KeyboardAvoidingComponent>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/IntelliBridgeTransparentLogo.png')}
            style={styles.intelliBridgeLogo}
          />
        </View>

        <View style={{ marginBottom: 20, padding: 20 }}>
          <Text
            style={{
              color: theme?.text,
              fontSize: 24,
              fontWeight: '600',
              lineHeight: 24,
              marginBottom: 10,
            }}
          >
            Welcome,
          </Text>
          <Text
            style={{
              color: theme?.secondaryText,
              fontSize: 16,
              fontWeight: '400',
            }}
          >
            Sign In to access your account.{' '}
          </Text>
        </View>

        <FormInput
          formInputTitle={'Email'}
          value={email}
          placeholder="Enter your email"
          width={1.1}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={txt => {
            setEmail(txt);
            setFormError('');
            setEmailError('');
            // if (!emailValidator(txt)) {
            //   setEmailError("Please enter a valid email");
            // } else {
            //   setEmailError("");
            // }
          }}
          // placeholderTextColor="#ccc"
          errorMessage={emailError}
        />

        <FormInput
          formInputTitle={'Password'}
          value={password}
          placeholder="Password"
          width={1.1}
          autoCorrect={false}
          rightIcon={rightIcon}
          iconColor="black"
          // placeholderTextColor="#000"
          autoCapitalize="none"
          secureTextEntry={passwordVisibility}
          textContentType="password"
          onChangeText={txt => {
            setPassword(txt);
            setFormError('');
            setPasswordError('');
          }}
          handlePasswordVisibility={handlePasswordVisibility}
          marginBottom={0}
          errorMessage={passwordError}
        />

        <Text
          onPress={() => {
            navigation.navigate('ForgetPassword');
          }}
          style={{
            color: COLORS.legacyBridgeRed,
            fontWeight: '700',
            justifyContent: 'center',
            alignContent: 'flex-end',
            alignSelf: 'flex-end',
            padding: 0,
            marginRight: 20,
          }}
        >
          Forget Password ?
        </Text>

        <FixedBottomContainer top={1.6}>
          <FormButton
            title={'Sign In'}
            width={1.1}
            onPress={login}
            disabled={!email || !password || loading}
            formError={formError}
            loading={loading}
          />

          <View style={styles.alreadySection}>
            <Text style={[styles.alreadyText, { color: theme?.secondaryText }]}>
              Don’t have an account?{'  '}
            </Text>
            <TouchableOpacity
              style={styles.signup}
              onPress={() => {
                dispatch(setUserDestination('Registration'));
                navigation.navigate('Register');
              }}
            >
              <Text
                style={{
                  color: COLORS.legacyBridgePrimary,
                  fontSize: 16,
                  fontWeight: '500',
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </FixedBottomContainer>
      </KeyboardAvoidingComponent>
    </SafeAreaViewComponent>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    marginTop: 40,
    marginBottom: 20,
    // backgroundColor: 'red',
  },
  intelliBridgeLogo: {
    width: windowWidth / 1.4,
    height: 70,
    objectFit: 'contain',
  },
  alreadySection: {
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    // position: "absolute",
    bottom: 0,
    flexDirection: 'row',
    marginTop: 20,
  },
  alreadyText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
  },
  signup: {
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    // backgroundColor: "red",
    // marginTop: 10,
  },
});
