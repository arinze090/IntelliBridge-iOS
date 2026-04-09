import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';

import HeaderTitle from '../../components/common/HeaderTitle';
import OTPInput from '../../components/form/OTPInput';
import ResendTimer from '../../components/form/ResendTimer';
import { COLORS } from '../../themes/themes';
import { windowHeight, windowWidth } from '../../utils/Dimensions';
import FormButton from '../../components/form/FormButton';
import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import FixedBottomContainer from '../../components/common/FixedBottomContainer';
import { obscureEmail, RNToast } from '../../Library/Common';
import axiosInstance from '../../utils/api-client';
import { useTheme } from '../../Context/ThemeContext';

const EmailVerificationScreen = ({ navigation, props, route }) => {
  const item = route?.params;
  const { theme } = useTheme();

  const state = useSelector(state => state);
  const reduxUserDestination = state?.user?.destination;

  const [verifyCode, setVerifyCode] = useState('');

  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // state for resending email to the user after the time elapses
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  // resend timer state
  const [timeLeft, setTimeLeft] = useState(null);
  const [targetTime, setTargetTime] = useState(null);
  const [activeResend, setActiveResend] = useState(false);
  let resendTimeInterval;

  // To display the countdown time
  const calculateTimeLeft = finaltime => {
    const difference = finaltime - +new Date();
    if (difference >= 0) {
      setTimeLeft(Math.round(difference / 1000));
    } else {
      setTimeLeft(null);
      clearInterval(resendTimeInterval);
      setActiveResend(true);
    }
  };

  const triggerTimer = (targetTimeInSeconds = 120) => {
    setTargetTime(targetTimeInSeconds);
    setActiveResend(false);

    const finalTime = +new Date() + targetTimeInSeconds * 1000;
    resendTimeInterval = setInterval(
      () => (calculateTimeLeft(finalTime), 1000),
    );
  };

  const startCountDownTimer = () => {
    triggerTimer();

    return () => {
      clearInterval(resendTimeInterval);
    };
  };

  useEffect(() => {
    startCountDownTimer();
  }, []);

  const resendEmail = async () => {
    startCountDownTimer();
    resendVerificationCode();
  };

  const resendVerificationCode = async () => {
    const codeVerificationData = {
      email: item?.email,
    };
    try {
      setLoading(true);
      await axiosInstance({
        url: '/api/auth/resend-verification',
        method: 'POST',
        data: codeVerificationData,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
          console.log('res', res);
          setLoading(false);
          console.log('status', res?.status);
          if (res?.data) {
            console.log('resendCode data', res?.data);
            RNToast(Toast, 'A Verification code has been sent to your email');
          }
        })
        .catch(err => {
          console.log('resendCode err', err?.response);
          setLoading(false);
          if (err?.response.data?.message.includes('Too many requests')) {
            setFormError('Too many attempts. Please try again later.');
          }
        });
    } catch (error) {
      console.log('resendCode error', error?.response);
    }
  };

  const onCodeVerification = async () => {
    const codeData = {
      email: item?.email,
      otp: verifyCode,
    };

    if (verifyCode === '' && verifyCode?.length > 6) {
      setFormError('Code must be 6 digit');
    } else if (reduxUserDestination == 'ResetPassword' && verifyCode) {
      navigation.navigate('ResetPassword', {
        email: item?.email,
        otp: verifyCode,
      });
    } else {
      setLoading(true);
      try {
        await axiosInstance({
          url: '/api/auth/verify-email',
          method: 'POST',
          data: codeData,
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(res => {
            console.log('res', res);
            setLoading(false);
            if (res?.data) {
              console.log('verify email data', res?.data);

              RNToast(Toast, 'Great, Your account has been verified');

              navigation.navigate('Login');
              // reduxUserDestination == 'ResetPassword'
              //   ? navigation.navigate('ResetPassword', {
              //       email: item?.email,
              //       otp: verifyCode,
              //     })
              //   :
            }
          })
          .catch(err => {
            console.log('Verify err', err?.response);
            setLoading(false);

            if (err?.response.data?.message.includes('expired')) {
              setFormError(
                'Verification code has expired. Please request a new code.',
              );
            } else if (err?.response?.data?.message.includes('Invalid')) {
              setFormError('Invalid verification code. Please try again.');
            } else {
              setFormError(
                'We could not verify your account at the moment, please try again later',
              );
            }
          });
      } catch (error) {
        console.log('Verify email error', error);
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaViewComponent
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <HeaderTitle
        onLeftIconPress={() => navigation.goBack()}
        leftIcon="arrow-back-outline"
      />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={{ marginBottom: 20, padding: 20 }}>
          <Text
            style={{
              color: theme?.text,
              fontSize: 24,
              fontWeight: '600',
              lineHeight: 24,
            }}
          >
            Verify Code
          </Text>
          <Text
            style={{
              color: theme?.text,
              fontSize: 16,
              fontWeight: '400',
            }}
          >
            Please enter the code sent to email{' '}
            <Text
              style={{ color: COLORS.legacyBridgePrimary, fontWeight: '500' }}
            >
              {obscureEmail(item?.email)}
            </Text>
          </Text>
        </View>

        {/* Authentications */}
        <View style={styles.auth}>
          <OTPInput
            code={verifyCode}
            maxLength={6}
            setCode={text => {
              setVerifyCode(text);
              setFormError('');
            }}
          />
        </View>

        <ResendTimer
          activeResend={activeResend}
          resendingEmail={resendingEmail}
          resendStatus={resendStatus}
          timeLeft={timeLeft}
          targetTime={targetTime}
          resendEmail={resendEmail}
        />
      </TouchableOpacity>

      {/* Buttons */}
      <FixedBottomContainer top={1.25}>
        <FormButton
          title={'Verify Email'}
          loading={loading}
          onPress={onCodeVerification}
          disabled={loading || verifyCode === '' || verifyCode?.length < 6}
          formError={formError}
        />
      </FixedBottomContainer>
    </SafeAreaViewComponent>
  );
};

export default EmailVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  logo: {
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    marginTop: 120,
  },
  btn: {
    width: windowWidth / 1.2,
    height: windowHeight / 17,
    borderRadius: 10,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.pinky,
    justifyContent: 'center',
    alignContent: 'center',
  },
  btnText: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    alignContent: 'center',
  },
  bioBtn: {
    backgroundColor: '#131A22',
    width: 288,
    height: 58,
    borderRadius: 10,
    alignSelf: 'center',
    alignContent: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bioBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 20,
  },
  biometrics: {
    marginTop: 20,
    flexDirection: 'row',
  },
  register: {
    flexDirection: 'row',
    margin: 20,
    alignSelf: 'center',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 10,
    textAlign: 'center',
    width: '90%',
  },
  otp: {
    backgroundColor: '#131A22',
    width: 88,
    height: 38,
    borderRadius: 22,
    alignSelf: 'center',
    marginLeft: 10,
  },
  otpText: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    alignContent: 'center',
    marginTop: 13,
  },
  logoImage: {
    width: windowWidth / 2,
    height: windowHeight / 7,
    resizeMode: 'contain',
    marginBottom: 10,
    // backgroundColor: 'red',
    justifyContent: 'center',
    alignSelf: 'center',

    // marginTop: windowHeight / 9,
  },
  auth: {
    width: windowWidth / 1.2,
    alignSelf: 'center',
    marginTop: 30,
    // marginBottom: 30,
  },
  inputTitle: {
    marginBottom: 10,
    fontSize: 15,
    color: 'white',
    fontWeight: '700',
  },
  logoSection: {
    flexDirection: 'row',
    margin: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  hr: {
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 20,
    width: windowWidth / 4.5,
    alignSelf: 'center',
    alignItems: 'center',
  },
  forgotPassword: {
    color: COLORS.pinky,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    marginRight: 40,
  },
  already: {
    flexDirection: 'row',
    margin: 5,
    marginTop: 0,
  },
  alreadyText: {
    color: 'white',
    marginLeft: 25,
    marginRight: 10,
    fontWeight: '500',
    fontSize: 14,
  },
  registerText: {
    color: COLORS.pinky,
    fontWeight: '700',
    fontSize: 14,
  },
  forgetSlogan: {
    color: '#ccc',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 10,
    textAlign: 'center',
  },
  forgetTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 24,
    marginLeft: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
});
