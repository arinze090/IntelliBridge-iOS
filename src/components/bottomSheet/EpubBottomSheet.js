import { StyleSheet, Text } from 'react-native';
import React from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';

import { windowHeight } from '../../utils/Dimensions';

const EpubBottomSheet = ({
  bottomSheetRef,
  height,
  children,
  bottomsheetTitle,
}) => {
  return (
    <RBSheet
      ref={bottomSheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      height={windowHeight / (height || 1.2)}
      render
      customStyles={{
        wrapper: {
          //   backgroundColor: '#333',
        },
        draggableIcon: {
          backgroundColor: 'black',
        },
        container: {
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        },
      }}
    >
      <Text style={[styles.bottomSheetTitle]}>{bottomsheetTitle}</Text>
      {children}
    </RBSheet>
  );
};

export default EpubBottomSheet;

const styles = StyleSheet.create({
  bottomSheetTitle: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    fontSize: 17,
    fontWeight: '700',
    alignSelf: 'center',
    marginTop: 10,
    color: 'black',
    padding: 20,
  },
});
