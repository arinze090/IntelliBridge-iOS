import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import PassMeter from 'react-native-passmeter';
import Toast from 'react-native-toast-message';

import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import HeaderTitle from '../../components/common/HeaderTitle';
import FormInput from '../../components/form/FormInput';
import { checkPassword, checkPasswordMatch } from '../../Library/Validation';
import FixedBottomContainer from '../../components/common/FixedBottomContainer';
import FormButton from '../../components/form/FormButton';
import { windowWidth } from '../../utils/Dimensions';
import KeyboardAvoidingComponent from '../../components/form/KeyboardAvoidingComponent';
import { useTheme } from '../../Context/ThemeContext';
import { RNToast } from '../../Library/Common';
import axiosInstance from '../../utils/api-client';

const ResetPassword = ({ navigation, route }) => {
  const item = route?.params;
  console.log('item', item);

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
  const deviceWindow = Dimensions.get('window');

  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [rightIcon, setRightIcon] = useState('eye');
  const [formError, setFormError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validatedPassword = checkPassword(newPassword);

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

  const checkPasswords = checkPasswordMatch(newPassword, confirmPassword);
  console.log('checkPasswords', checkPasswords);

  const resetPassword = async () => {
    const codeData = {
      email: item?.email,
      otp: item?.otp,
      newPassword: newPassword,
    };
    if (!item?.otp || !item?.email || !newPassword) {
      setFormError(
        'Please provide all required information to reset your password.',
      );
    } else {
      setLoading(true);
      try {
        await axiosInstance({
          url: '/api/auth/resetpassword',
          method: 'PUT',
          data: codeData,
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(res => {
            console.log('resetPassword res', res);
            setLoading(false);
            if (res?.data) {
              console.log('resetPassword data', res?.data);

              RNToast(Toast, 'Great, Your password has been reset');

              navigation.navigate('Login');
            }
          })
          .catch(err => {
            console.log('resetPassword err', err?.response.data);
            setLoading(false);

            setFormError(
              'We could not reset your password at the moment, please try again later',
            );
          });
      } catch (error) {
        console.log('resetPassword error', error);
        setLoading(false);
        setFormError(
          'We could not reset your password at the moment, please try again later',
        );
      }
    }
  };

  return (
    <SafeAreaViewComponent>
      <KeyboardAvoidingComponent>
        <HeaderTitle
          onLeftIconPress={() => navigation.goBack()}
          leftIcon="arrow-back-outline"
          progress={100}
        />
        <View style={{ marginBottom: 20, padding: 20 }}>
          <Text
            style={{
              color: theme?.text,
              fontSize: 24,
              fontWeight: '600',
              lineHeight: 24,
            }}
          >
            Reset Password
          </Text>
          <Text style={{ color: theme?.text, fontSize: 16, fontWeight: '400' }}>
            Choose a strong password to keep your account secure.
          </Text>
        </View>

        <FormInput
          formInputTitle={'Password'}
          placeholder="Enter New password"
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={passwordVisibility}
          textContentType="password"
          rightIcon={rightIcon}
          iconColor="#1E1E1EB2"
          value={newPassword}
          onChangeText={text => {
            setNewPassword(text);
            setPasswordError('');
          }}
          // onChange={handleChange}
          handlePasswordVisibility={handlePasswordVisibility}
          marginBottom={10}
        />
        <Text
          style={{
            color: '#999',
            fontSize: 12,
            marginTop: newPassword?.length ? -6 : 5,
            padding: 10,
            marginBottom: 10,
          }}
        >
          Use at least 8 characters including 1 uppercase letter, a number and a
          special character like !@#$%%^&*
        </Text>
        <View
          style={{
            width: windowWidth / 1.1,
            overflow: 'hidden',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          {newPassword !== '' ? (
            <PassMeter
              showLabels
              password={newPassword}
              maxLength={MAX_LEN}
              minLength={MIN_LEN}
              labels={PASS_LABELS}
              backgroundColor={styles.bg}
            />
          ) : null}
        </View>
        {passwordError && (
          <Text style={styles.validationError}>{passwordError}</Text>
        )}

        <FormInput
          formInputTitle={'Confirm password'}
          placeholder="Enter New password"
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={passwordVisibility}
          textContentType="password"
          rightIcon={rightIcon}
          iconColor="#1E1E1EB2"
          value={confirmPassword}
          onChangeText={text => {
            setConfirmPassword(text);
            setPasswordError('');
          }}
          // onChange={handleChange}
          handlePasswordVisibility={handlePasswordVisibility}
        />

        {/* Buttons */}
        <FixedBottomContainer top={1.3}>
          <FormButton
            title={'Reset Password'}
            loading={loading}
            onPress={resetPassword}
            disabled={!newPassword || !confirmPassword || passwordError !== ''}
            formError={formError}
          />
        </FixedBottomContainer>
      </KeyboardAvoidingComponent>
    </SafeAreaViewComponent>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  validationError: {
    color: 'red',
    fontWeight: '500',
    marginBottom: 5,
    fontSize: 13,
    // textAlign: 'center',
  },
});
