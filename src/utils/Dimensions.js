import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Dimensions } from 'react-native';
export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;

export const screenHeight = Dimensions.get('screen').height;
export const screenWidth = Dimensions.get('screen').width;

export const useFeedItemHeight = () => {
  const tabBarHeight = useBottomTabBarHeight();
  return windowHeight - tabBarHeight;
};
