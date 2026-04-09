import {
  StyleSheet,
  Platform,
  SafeAreaView as RNSafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView as ContextSafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { useTheme } from '../../Context/ThemeContext';

const SafeAreaViewComponent = ({ children, backgroundColor, onPress }) => {
  const { theme } = useTheme();

  const Container =
    Platform.OS === 'ios' ? RNSafeAreaView : ContextSafeAreaView;

  const content = (
    <Container
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor
            ? backgroundColor
            : theme?.background,
        },
      ]}
    >
      {children}
    </Container>
  );

  if (onPress) {
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        {content}
      </TouchableWithoutFeedback>
    );
  }

  return content;
};

export default SafeAreaViewComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: Platform.OS == 'android' ? 0 : 20,
  },
});
