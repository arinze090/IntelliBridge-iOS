import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import ImageView from 'react-native-image-viewing';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import { useTheme } from '../../Context/ThemeContext';
import ScrollViewSpace from '../../components/common/ScrollViewSpace';
import ProfileOptionsDisplay from '../../components/common/ProfileOptionsDisplay';
import { signOut } from '../../redux/features/user/userSlice';
import BottomSheet from '../../components/bottomSheet/BottomSheet';
import FormInput from '../../components/form/FormInput';
import FormButton from '../../components/form/FormButton';
import axiosInstance from '../../utils/api-client';
import { RNToast } from '../../Library/Common';
import { COLORS } from '../../themes/themes';
import verifyTokenWithoutApi from '../../components/hoc/verifyToken';

const settings = [
  {
    iconName: 'person-outline',
    name: 'Edit Profile',
    navigate: 'EditProfile',
  },
  {
    iconName: 'bookmarks-outline',
    name: 'Bookmarks',
    navigate: 'Bookmarks',
  },
  {
    iconName: 'heart-outline',
    name: 'Wishlists',
    navigate: 'Wishlists',
  },
  {
    iconName: 'receipt-outline',
    name: 'Orders',
    navigate: 'BookOrders',
  },
  // {
  //   iconName: 'person-outline',
  //   name: 'My Account',
  //   navigate: 'MyAccount',
  // },
  {
    iconName: 'information-circle-outline',
    name: 'About Us',
    navigate: 'AboutUs',
  },
  {
    iconName: 'chatbubbles-outline',
    name: 'FAQs',
    navigate: 'FAQs',
  },
];

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { toggleTheme, isDarkMode, theme } = useTheme();

  const bottomSheetRef = useRef();

  const dispatch = useDispatch();
  const state = useSelector(state => state);
  const loggedInUser = state?.user?.user;
  console.log('loggedInUser', loggedInUser);

  const transformedData = [loggedInUser?.profilePicture]?.map(item => ({
    uri: item,
  }));
  const [visible, setIsVisible] = useState(false);

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [rightIcon, setRightIcon] = useState('eye');

  // Error states
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

  const logout = () => {
    dispatch(signOut());
    // dispatch(clearBoughtBooks());
    // navigation.navigate('Home', { screen: 'HomeScreen' });
  };

  const deactivateAccount = () => {
    Alert.alert(
      'Confirm Deactivation',
      'Are you sure you want to deactivate your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: () => {
            console.log('Account deactivated console log');
            bottomSheetRef?.current.open();
          },
        },
      ],
    );
  };

  const deactivateAccountConfirmation = async () => {
    setLoading(true);

    try {
      await axiosInstance({
        url: '/api/auth/deactivate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: { email: loggedInUser?.email, password: password },
      }).then(res => {
        setLoading(false);
        console.log('deactivateAccountConfirmation', res);
        RNToast(Toast, 'Account Deactivated Successfully');
        logout();
      });
    } catch (error) {
      console.error('deactivateAccountConfirmation  error:', error?.response);
      setLoading(false);
      setFormError(
        error?.response?.data || 'An error occurred. Please try again later.',
      );
    }
  };

  return (
    <SafeAreaViewComponent>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 10 }}
      >
        <View style={styles.profileSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (loggedInUser?.profilePicture) {
                setIsVisible(true);
              }
            }}
          >
            {loading && loggedInUser?.profilePicture ? (
              <SkeletonPlaceholder
                highlightColor={COLORS.skeletonBgColor}
                backgroundColor={COLORS.skeletonHighlightColor}
                speed={1900}
              >
                <Image style={styles.image} source={''} />
              </SkeletonPlaceholder>
            ) : (
              <Image
                source={
                  loggedInUser?.profilePicture
                    ? { uri: loggedInUser?.profilePicture }
                    : require('../../assets/user-dummy-img.jpg')
                }
                style={styles.image}
                // onPress={() => {
                //   setIsVisible(true);
                // }}
              />
            )}
          </TouchableOpacity>
          <View style={styles.profileDetails}>
            <Text style={[styles.profileName, { color: theme?.text }]}>
              {loggedInUser?.username}
            </Text>
            <Text style={[styles.profileEmail, { color: theme?.text }]}>
              {loggedInUser?.email}
            </Text>
          </View>
        </View>

        {settings?.map((cur, i) => (
          <ProfileOptionsDisplay
            key={i}
            onPress={() => navigation.navigate(cur?.navigate)}
            title={cur?.name}
            iconName={cur?.iconName}
          />
        ))}

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.set, { borderBottomColor: theme?.borderColor }]}
        >
          <View style={styles.setsContent}>
            <Ionicons
              name={isDarkMode ? 'moon-outline' : 'sunny-outline'}
              color={'#292D32'}
              size={20}
            />
            <Text style={[styles.settingsText, { color: theme?.text }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ccc', true: '#05A30B' }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.set, { borderBottomColor: theme?.borderColor }]}
          onPress={logout}
        >
          <View style={styles.setsContent}>
            <Ionicons name="log-out-outline" size={20} color={'#292D32'} />
            <Text style={[styles.settingsText, { color: theme?.text }]}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.set, { borderBottomColor: theme?.borderColor }]}
          onPress={deactivateAccount}
        >
          <View style={styles.setsContent}>
            <Ionicons name="trash-outline" size={20} color={'red'} />
            <Text style={[styles.settingsText, { color: 'red' }]}>
              Deactivate Account
            </Text>
          </View>
        </TouchableOpacity>
        <ScrollViewSpace />
      </ScrollView>

      {/* Deactivate account */}
      <BottomSheet
        height={2.5}
        bottomSheetRef={bottomSheetRef}
        bottomsheetTitle={'Account Deactivation'}
      >
        <Text style={[styles.deactivateAccountText, { color: theme?.text }]}>
          Please provide your password for verification.
        </Text>

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

        <FormButton
          title={'Deactivate Account'}
          width={1.1}
          onPress={deactivateAccountConfirmation}
          disabled={!password || loading}
          formError={formError}
          loading={loading}
        />
      </BottomSheet>

      <ImageView
        images={transformedData}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />
    </SafeAreaViewComponent>
  );
};

export default verifyTokenWithoutApi(SettingsScreen);

const styles = StyleSheet.create({
  settings: {
    margin: 5,
    marginTop: 30,
    borderTopWidth: 1,
    marginBottom: 20,
    borderColor: '#999',
  },
  set: {
    marginBottom: 0,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // backgroundColor: 'pink',
  },
  setsContent: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    margin: 5,
    marginTop: 10,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginLeft: 17,
  },
  deactivateAccountText: {
    fontSize: 16,
    marginBottom: 20,
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    justifyContent: 'center',
    alignContent: 'center',
  },
  profileSection: {
    display: 'flex',
    // flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileDetails: {
    alignItems: 'center',
    // marginLeft: 20,
    // justifyContent: 'space-between',
    // backgroundColor: 'red',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    // lineHeight: 24,
  },
  profileEmail: {
    fontSize: 14,
    fontWeight: '400',
    // lineHeight: 24,
    color: '#1E1E1E80',
  },
});
