import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import {
  DrawerItem,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { COLORS } from '../../themes/themes';
import { windowHeight } from '../../utils/Dimensions';
import { signOut } from '../../redux/features/user/userSlice';
import { useTheme } from '../../Context/ThemeContext';

const drawerNav = [
  {
    iconName: 'home-outline',
    name: 'Home',
    navigate: 'HomeScreen',
  },
];

const notLoggedInDrawerNav = [
  {
    iconName: 'home-outline',
    name: 'Home',
    navigate: 'HomeScreen',
  },
  {
    iconName: 'newspaper-outline',
    name: 'Blogs & News Feed',
    navigate: 'Blog',
  },
];

const CustomDrawer = ({ props, iconColor }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const state = useSelector(state => state);
  const user = state?.user?.user?.profile;

  const { toggleTheme, isDarkMode, theme } = useTheme();

  const onSignOut = () => {
    dispatch(signOut());
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <DrawerContentScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        {...props}
        contentContainerStyle={{
          height: windowHeight,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            // backgroundColor: 'green',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {user ? (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Profile');
              }}
              style={styles.login}
            >
              <View style={styles.person}>
                <Image
                  source={{ uri: user?.profile_pictures[0] }}
                  style={styles.image}
                />
                {/* <Ionicons name="person-outline" size={16} color="black" /> */}
              </View>

              <View style={{ flexDirection: 'row', marginLeft: 6 }}>
                <Text
                  style={[
                    styles.userName,
                    {
                      fontSize: 14,
                      fontWeight: '500',
                      color: theme?.text,
                    },
                  ]}
                >
                  Welcome,{' '}
                </Text>
                <Text style={[styles.userName, { color: theme?.text }]}>
                  {user?.username}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.login}>
              <Image
                style={{
                  width: 180,
                  height: 40,
                  resizeMode: 'contain',
                }}
                source={require('../../assets/legacyBridgeDarkLogo.png')}
              />
            </View>
          )}
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() => {
              toggleTheme();
            }}
          >
            <Ionicons
              name={isDarkMode ? 'moon' : 'sunny-outline'}
              color={theme.text}
              size={20}
            />
          </TouchableOpacity>
        </View>
        {user
          ? drawerNav?.map((cur, i) => (
              <DrawerItem
                key={i}
                style={{ marginBottom: 0 }}
                label={cur?.name}
                onPress={() => {
                  if (user) {
                    navigation.navigate('Home', { screen: cur?.navigate });
                  } else if (cur?.name == 'Tours') {
                    navigation.navigate('Login', {
                      destination: cur?.navigate,
                    });
                  } else {
                    navigation.navigate('Home', { screen: cur?.navigate });
                  }
                }}
                activeBackgroundColor={COLORS.pinky}
                inactiveTintColor="white"
                // inactiveBackgroundColor={COLORS.btnBorderColor}
                icon={() => (
                  <Ionicons
                    name={cur?.iconName}
                    size={20}
                    color={theme?.text}
                  />
                )}
                labelStyle={{
                  // marginLeft: -15,
                  fontSize: 16,
                  fontWeight: '500',
                  color: theme?.text,
                }}
              />
            ))
          : notLoggedInDrawerNav?.map((cur, i) => (
              <DrawerItem
                key={i}
                style={{ marginBottom: 0 }}
                label={cur?.name}
                onPress={() => {
                  if (user) {
                    navigation.navigate('Home', { screen: cur?.navigate });
                  } else if (cur?.name == 'Tours') {
                    navigation.navigate('Login', {
                      destination: cur?.navigate,
                    });
                  } else {
                    navigation.navigate('Home', { screen: cur?.navigate });
                  }
                }}
                activeBackgroundColor={COLORS.pinky}
                inactiveTintColor="white"
                // inactiveBackgroundColor={COLORS.btnBorderColor}
                icon={() => (
                  <Ionicons
                    name={cur?.iconName}
                    size={20}
                    color={theme?.text}
                  />
                )}
                labelStyle={{
                  // marginLeft: -15,
                  fontSize: 16,
                  fontWeight: '500',
                  color: theme?.text,
                }}
              />
            ))}
      </DrawerContentScrollView>
      <View
        style={{
          padding: 15,
          paddingBottom: 0,
        }}
      >
        {user ? (
          <View
            style={{
              borderTopColor: '#333',
              borderTopWidth: 1,
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.set}
              onPress={() => navigation.navigate('Subscription')}
            >
              <View style={styles.setsContent}>
                <Ionicons name="diamond-outline" size={20} color={theme.text} />
                <Text style={[styles.settingsText, { color: theme?.text }]}>
                  Your Plan
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.set}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={styles.setsContent}>
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={theme.text}
                />
                <Text style={[styles.settingsText, { color: theme?.text }]}>
                  Profile Settings
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.set}
              onPress={onSignOut}
            >
              <View style={styles.setsContent}>
                <Ionicons name="log-in-outline" size={20} color={theme.text} />
                <Text style={[styles.settingsText, { color: theme?.text }]}>
                  Log Out
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  person: {
    // backgroundColor: 'white',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 10,
  },
  login: {
    margin: 15,
    flexDirection: 'row',
    // marginBottom: 30,
    alignItems: 'center',
    // backgroundColor: 'pink',
  },
  welcomeContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  userName: {
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  welcome: {
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
  },
  set: {
    marginBottom: 10,
    // borderBottomColor: '#333',
    // borderBottomWidth: 1,
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
    // marginBottom: 18,

    // padding: 10,

    // margin: 5,
    // marginTop: 10,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginLeft: 17,
  },
  celebProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    // marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.purple,
  },
});
