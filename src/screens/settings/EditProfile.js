import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import ImageCropPicker from 'react-native-image-crop-picker';

import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import ScrollViewSpace from '../../components/common/ScrollViewSpace';
import FormInput from '../../components/form/FormInput';
import FormButton from '../../components/form/FormButton';
import HeaderTitle from '../../components/common/HeaderTitle';
import FixedBottomContainer from '../../components/common/FixedBottomContainer';
import { RNToast } from '../../Library/Common';
import axiosInstance from '../../utils/api-client';
import { updateUserProfile } from '../../redux/features/user/userSlice';
import { uploadProfilePictureToCloudinary } from '../../utils/CloudinaryUpload';

const EditProfile = () => {
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const state = useSelector(state => state);
  const loggedInUser = state?.user?.user;
  console.log('loggedInUser', loggedInUser);

  const [fullname, setFullname] = useState(
    loggedInUser?.fullname ? loggedInUser?.fullname : '',
  );
  const [username, setUsername] = useState(
    loggedInUser?.username ? loggedInUser?.username : '',
  );
  const [loading, setLoading] = useState(false);

  // Error states
  const [fullnameError, setFullnameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [formError, setFormError] = useState('');

  const [image, setImage] = useState(null);
  // console.log('image', image);

  const pickImages = async () => {
    try {
      const selected = await ImageCropPicker.openPicker({
        multiple: false,
        mediaType: 'photo',
        // maxFiles: MAX_IMAGES - images?.length,
        // width: 350,
        // height: 350,
        cropping: true,
        compressImageQuality: 0.1,
        compressImageMaxWidth: 800,
        compressImageMaxHeight: 800,
      });

      console.log('seleelee', selected);

      setImage(selected);
    } catch (err) {
      console.log('Image pick cancelled or failed', err);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);

      let uploadImage = null;

      if (image) {
        console.log('Uploading image...');

        uploadImage = await uploadProfilePictureToCloudinary(
          image,
          loggedInUser?._id,
        );

        console.log('Upload result:', uploadImage);
      }

      const profileData = {
        username,
        profilePicture: uploadImage?.secure_url
          ? uploadImage?.secure_url
          : loggedInUser?.profilePicture,
        profilePictureId: uploadImage?.public_id
          ? uploadImage?.public_id
          : loggedInUser?.profilePictureId,
      };

      console.log('Updating profile with data:', profileData);

      const res = await axiosInstance({
        url: '/api/auth/profile/',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        data: profileData,
      });

      console.log('updateProfileResponse', res);

      dispatch(updateUserProfile(res?.data));
      RNToast(Toast, 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Profile update error:', error?.response);
      RNToast(
        Toast,
        'An error occurred while updating your profile, Please try again later.',
      );
      setFormError(
        'An error occurred while updating your profile, Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaViewComponent>
      <HeaderTitle
        headerTitle={'Edit Profile'}
        leftIcon={'chevron-back-outline'}
        onLeftIconPress={() => {
          navigation.goBack();
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 10 }}
      >
        <View style={styles.profileSection}>
          <TouchableOpacity activeOpacity={0.9} onPress={pickImages}>
            <Image
              source={
                image
                  ? { uri: image?.path }
                  : loggedInUser?.profilePicture
                  ? { uri: loggedInUser?.profilePicture }
                  : require('../../assets/user-dummy-img.jpg')
              }
              style={styles.image}
            />
          </TouchableOpacity>
        </View>

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
          formInputTitle={'Full Name'}
          value={fullname}
          placeholder="Enter your full name"
          width={1.1}
          keyboardType="default"
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={txt => {
            setFullname(txt);
            setFormError('');
            setFullnameError('');
          }}
          errorMessage={fullnameError}
          editable={false}
        />

        <FormInput
          formInputTitle={'Email'}
          value={loggedInUser?.email}
          placeholder="Enter your email"
          width={1.1}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          //   onChangeText={txt => {
          //     setEmail(txt);
          //     setFormError('');
          //     setEmailError('');
          //   }}
          //   errorMessage={emailError}
          editable={false}
        />
        <ScrollViewSpace />

        <FixedBottomContainer top={1.6}>
          <FormButton
            title={'Update Profile'}
            width={1.1}
            onPress={updateProfile}
            disabled={loading}
            formError={formError}
            loading={loading}
          />
        </FixedBottomContainer>
      </ScrollView>
    </SafeAreaViewComponent>
  );
};

export default EditProfile;

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
    padding: 10,
    // backgroundColor: 'red',
  },
  profileDetails: {
    alignItems: 'center',
    // marginLeft: 20,
    // justifyContent: 'space-between',
    // backgroundColor: 'red',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
});
