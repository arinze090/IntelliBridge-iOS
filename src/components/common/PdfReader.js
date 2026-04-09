import React, { useState, useEffect } from 'react';
import Pdf from 'react-native-pdf';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { windowHeight, windowWidth } from '../../utils/Dimensions';
import HeaderTitle from './HeaderTitle';
import SafeAreaViewComponent from './SafeAreaViewComponent';

const PdfReader = ({ props }) => {
  const navigation = useNavigation();

  console.log('Selected Book props:', props);
  const [initialPage, setInitialPage] = useState(1);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const data = await AsyncStorage.getItem(`progress_${props?.id}`);
    console.log('Loaded progress data:', data);
    if (data) {
      const parsed = JSON.parse(data);
      setInitialPage(parsed.page || 1);
    }
  };

  return (
    <SafeAreaViewComponent>
      <HeaderTitle
        headerTitle={props?.title}
        leftIcon={'chevron-back-outline'}
        onLeftIconPress={() => {
          navigation.goBack();
        }}
      />
      <Pdf
        source={{
          uri: 'https://res.cloudinary.com/dj16pc6ym/image/upload/v1771635204/06-07_The_Subnet_Mask_v1a3s0.pdf',
          cache: true,
        }}
        style={{
          flex: 1,
          width: windowWidth,
          height: windowHeight,
        }}
        initialPage={initialPage}
        onPageChanged={async (page, totalPages) => {
          const percentage = Math.floor((page / totalPages) * 100);
          console.log(`Current page: ${page}, ${totalPages} total pages`);

          await AsyncStorage.setItem(
            `progress_${props?._id}`,
            JSON.stringify({
              page,
              progress: percentage,
            }),
          );
        }}
        // onPageChanged={(page, numberOfPages) => {
        //   console.log(`Current page: ${page}, ${numberOfPages} total pages`);
        // }}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`Number of pages: ${numberOfPages}, ${filePath}`);
        }}
        onError={error => {
          console.log('Pdf error:', error);
        }}
      />
    </SafeAreaViewComponent>
  );
};
export default PdfReader;
