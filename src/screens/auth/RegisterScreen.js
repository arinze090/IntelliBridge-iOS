import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import PassMeter from 'react-native-passmeter';

import { windowWidth } from '../../utils/Dimensions';
import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import { useTheme } from '../../Context/ThemeContext';
import FormInput from '../../components/form/FormInput';
import FormButton from '../../components/form/FormButton';
import FixedBottomContainer from '../../components/common/FixedBottomContainer';
import KeyboardAvoidingComponent from '../../components/form/KeyboardAvoidingComponent';
import { setUserDestination } from '../../redux/features/user/userSlice';
import { COLORS } from '../../themes/themes';
import { RNToast } from '../../Library/Common';
import axiosInstance from '../../utils/api-client';
import ScrollViewSpace from '../../components/common/ScrollViewSpace';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  // Passmeter validation
  const MAX_LEN = 15,
    MIN_LEN = 8,
    PASS_LABELS = [
      '  Too Short',
      '  Must include a lower, uppercase, number and special character like !@#$%%^&*',
      '  Must include a lower, uppercase, number and special character like !@#$%%^&*',
      '  Must include a lower, uppercase, number and special character like !@#$%%^&*',
      '  Perfecto !',
    ];

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [rightIcon, setRightIcon] = useState('eye');

  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
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

  const register = async () => {
    const registerData = {
      email: email,
      fullname: fullName,
      username: username,
      password: password,
    };

    setLoading(true);
    console.log('registerData', registerData);

    try {
      await axiosInstance({
        url: '/api/auth/signup/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: registerData,
      }).then(res => {
        setLoading(false);
        console.log('registerResponse', res);
        if (res?.status === 201 && res?.data) {
          RNToast(Toast, 'Registration Successful');
          navigation.navigate('EmailVerification', { email: email });
        } else {
          RNToast(Toast, 'Registration Failed. Please check your credentials.');
          setFormError('Registration Failed. Please check your credentials.');
        }
      });
    } catch (error) {
      console.error('Register check error:', error?.response);
      setLoading(false);

      if (error?.response?.data?.message?.includes('already exists')) {
        Alert.alert(
          'Signup Failed',
          'The username or email you chose already exists in our platform, try using another username or email',
        );
        setFormError(
          'The username or email you chose already exists in our platform, try using another username or email',
        );
      } else if (
        error?.response?.data?.message?.includes('Account already exists')
      ) {
        Alert.alert(
          'Signup Failed',
          'You already have an account with us, please login to enjoy our services',
        );
        setFormError(
          'You already have an account with us, please login to enjoy our services',
        );
      } else if (
        error?.response?.data?.message?.includes('Username already exists')
      ) {
        Alert.alert(
          'Signup Failed',
          'The username you chose already exists in our platform, try using another username',
        );
        setFormError(
          'The username you chose already exists in our platform, try using another username',
        );
      } else if (error?.response?.data?.message?.includes('Password must be')) {
        Alert.alert(
          'Signup Failed',
          'Password must be at least 8 characters long',
        );
        setFormError('Password must be at least 8 characters long');
      } else {
        Alert.alert(
          'Signup Failed',
          'Something went wrong, please try again later',
        );
      }
    }
  };

  return (
    <SafeAreaViewComponent>
      <KeyboardAvoidingComponent>
        <ScrollView showsVerticalScrollIndicator={false} vertical>
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
              Create an Account
            </Text>
            <Text
              style={{
                color: theme?.secondaryText,
                fontSize: 16,
                fontWeight: '400',
              }}
            >
              Please fill in your information to create an account{' '}
            </Text>
          </View>

          <FormInput
            formInputTitle={'Full Name'}
            value={fullName}
            placeholder="Enter your full name"
            width={1.1}
            keyboardType="default"
            autoCapitalize="words"
            autoCorrect={false}
            onChangeText={txt => {
              setFullName(txt);
              setFormError('');
              setFullNameError('');
            }}
            errorMessage={fullNameError}
          />

          <FormInput
            formInputTitle={'Username'}
            value={username}
            placeholder="Enter your username"
            width={1.1}
            keyboardType="default"
            autoCapitalize="words"
            autoCorrect={false}
            onChangeText={txt => {
              setUsername(txt);
              setFormError('');
              setUsernameError('');
            }}
            errorMessage={usernameError}
          />

          <FormInput
            formInputTitle={'Email Address'}
            value={email}
            placeholder="Enter your email address"
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
            placeholder="Password"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={passwordVisibility}
            textContentType="password"
            rightIcon={rightIcon}
            iconColor="#1E1E1EB2"
            value={password}
            onChangeText={text => {
              setPassword(text);
              setPasswordError('');
              setFormError('');
            }}
            // onChange={handleChange}
            handlePasswordVisibility={handlePasswordVisibility}
            marginBottom={10}
          />
          <View
            style={{
              width: windowWidth / 1.1,
              overflow: 'hidden',
              alignItems: 'center',
              alignSelf: 'center',
            }}
          >
            {password !== '' ? (
              <PassMeter
                showLabels
                password={password}
                maxLength={MAX_LEN}
                minLength={MIN_LEN}
                labels={PASS_LABELS}
                backgroundColor={styles.bg}
              />
            ) : null}
          </View>
          <Text
            style={{
              color: '#999',
              fontSize: 12,
              marginTop: password?.length ? -6 : 5,
              padding: 10,
              marginBottom: 10,
            }}
          >
            Use at least 8 characters including 1 uppercase letter, a number and
            a special character like !@#$%%^&*
          </Text>
          {passwordError && (
            <Text style={styles.validationError}>{passwordError}</Text>
          )}

          <ScrollViewSpace />
        </ScrollView>

        <FixedBottomContainer top={1.35}>
          <FormButton
            title={'Sign Up'}
            width={1.1}
            onPress={register}
            disabled={!email || !password || !fullName || !username || loading}
            formError={formError}
            loading={loading}
          />

          <View style={styles.alreadySection}>
            <Text style={[styles.alreadyText, { color: theme?.secondaryText }]}>
              Already have an account?{'  '}
            </Text>
            <TouchableOpacity
              style={styles.signup}
              onPress={() => {
                dispatch(setUserDestination('Login'));
                navigation.navigate('Login');
              }}
            >
              <Text
                style={{
                  color: COLORS.legacyBridgePrimary,
                  fontSize: 16,
                  fontWeight: '500',
                }}
              >
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </FixedBottomContainer>
      </KeyboardAvoidingComponent>
    </SafeAreaViewComponent>
  );
};

export default RegisterScreen;

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
