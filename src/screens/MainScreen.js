import React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { COLORS } from '../themes/themes';
import { useTheme } from '../Context/ThemeContext';

import LoginScreen from './auth/LoginScreen';
import HomeScreen from './HomeScreen';
import RegisterScreen from './auth/RegisterScreen';
import SettingsScreen from './settings/SettingsScreen';
import ResetPassword from './auth/ResetPassword';
import ForgetPassword from './auth/ForgetPassword';
import EmailVerificationScreen from './auth/EmailVerificationScreen';
import BooksScreen from './books/BooksScreen';
import BookDetails from './books/BookDetails';
import BookReader from './books/BookReader';
import FAQsScreen from './settings/FAQsScreen';
import AboutUsScreen from './settings/AboutUsScreen';
import SearchScreen from './SearchScreen';
import BookmarksScreen from './settings/BookmarksScreen';
import AudioBooksScreen from './books/AudioBooksScreen';
import WishlistScreen from './settings/WishlistScreen';
import BookOrdersScreen from './settings/BookOrdersScreen';
import EditProfile from './settings/EditProfile';
import LibraryBookDetails from './books/LibraryBookDetails';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = ({ navigation }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{
        headerShown: false,
        headerBackTitleVisible: false,
        headerLeft: () => (
          <View style={{ marginLeft: 10 }}>
            <Ionicons
              name="menu-outline"
              size={30}
              color="#333"
              onPress={() => navigation.navigate('Drawer')}
            />
          </View>
        ),
      }}
    />
    <Stack.Screen
      name="Search"
      component={SearchScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{
        headerShown: false,
      }}
    />

    <Stack.Screen
      name="EmailVerification"
      component={EmailVerificationScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="ForgetPassword"
      component={ForgetPassword}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="ResetPassword"
      component={ResetPassword}
      options={{
        headerShown: false,
      }}
    />

    {/* books */}
    <Stack.Screen
      name="BookDetails"
      component={BookDetails}
      options={{
        headerShown: false,
        headerBackTitleVisible: false,
      }}
    />
    <Stack.Screen
      name="BookReader"
      component={BookReader}
      options={{
        headerShown: false,
        headerBackTitleVisible: false,
      }}
    />
  </Stack.Navigator>
);

const BooksStack = ({ navigation }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="BooksScreen"
      component={BooksScreen}
      options={{
        headerShown: false,
        headerBackTitleVisible: false,
      }}
    />
    <Stack.Screen
      name="Search"
      component={SearchScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="BookDetails"
      component={BookDetails}
      options={{
        headerShown: false,
        headerBackTitleVisible: false,
      }}
    />
    <Stack.Screen
      name="LibraryBookDetails"
      component={LibraryBookDetails}
      options={{
        headerShown: false,
        headerBackTitleVisible: false,
      }}
    />
    <Stack.Screen
      name="BookReader"
      component={BookReader}
      options={{
        headerShown: false,
        headerBackTitleVisible: false,
      }}
    />
  </Stack.Navigator>
);

const AudioBooksStack = ({ navigation }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="AudioBooksScreen"
      component={AudioBooksScreen}
      options={{
        headerShown: false,
        headerBackTitleVisible: false,
      }}
    />
    <Stack.Screen
      name="Search"
      component={SearchScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="BookDetails"
      component={BookDetails}
      options={{
        headerShown: false,
        headerBackTitleVisible: false,
      }}
    />
  </Stack.Navigator>
);

const SettingsStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTitleStyle: {
            color: theme?.text,
          },
        }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />

      <Stack.Screen
        name="Wishlists"
        component={WishlistScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="BookDetails"
        component={BookDetails}
        options={{
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />

      <Stack.Screen
        name="FAQs"
        component={FAQsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AboutUs"
        component={AboutUsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BookOrders"
        component={BookOrdersScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const MainScreen = () => {
  const state = useSelector(state => state);
  const loggedInUserRole = state?.user?.userRole;
  const userProfle = state?.user?.user?.profile;

  const { theme } = useTheme();

  console.log('loggedInUserRole', loggedInUserRole, userProfle, theme);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarStyle: (route => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';
          const routeWithNoTarBar = [
            'BookDetails',
            'Login',
            'Register',
            'LibraryBookDetails',
            'EditProfile',
          ];
          if (routeWithNoTarBar.includes(routeName)) {
            return { display: 'none' };
          }
          return {
            backgroundColor: theme.background,
            borderTopColor: theme.background,
          };
        })(route),
        tabBarActiveTintColor: COLORS.legacyBridgePrimary,
        tabBarColor: COLORS.legacyBridgePrimary,
        tabBarInActiveBackgroundColor: COLORS.legacyBridgePrimary,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={({ route }) => ({
          tabBarLabel: 'BookStore',
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-outline" color={color} size={28} />
          ),
          headerShown: false,
        })}
      />

      <Tab.Screen
        name="Books"
        component={BooksStack}
        options={{
          tabBarLabel: 'Library',
          tabBarIcon: ({ color }) => (
            <Ionicons name="library-outline" color={color} size={28} />
          ),
          headerShown: false,
          headerStyle: {
            backgroundColor: 'black',
          },
          headerTitleStyle: {
            color: '#ccc',
          },
        }}
      />

      <Tab.Screen
        name="AudioBooks"
        component={AudioBooksStack}
        options={{
          tabBarLabel: 'AudioBooks',
          tabBarIcon: ({ color }) => (
            <Ionicons name="headset-outline" color={color} size={28} />
          ),
          headerShown: false,
          headerStyle: {
            backgroundColor: 'black',
          },
          headerTitleStyle: {
            color: '#ccc',
          },
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" color={color} size={28} />
          ),
          headerShown: false,
          headerStyle: {
            backgroundColor: 'black',
          },
          headerTitleStyle: {
            color: '#ccc',
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default MainScreen;
