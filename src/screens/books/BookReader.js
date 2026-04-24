import React from 'react';
import { View, Text } from 'react-native';

import PdfReader from '../../components/common/PdfReader';
import EpubReader from '../../components/common/EpubReader';
import EpubReader2 from '../../components/common/EpubReader2';

const BookReader = ({ route }) => {
  const bookItem = route?.params;
  console.log('Selected Book:', bookItem);

  const displayBook = () => {
    if (bookItem?.bookFormat === 'epub') {
      return (
        <EpubReader2
          bookUrl={bookItem?.bookUrl}
          bookId={bookItem?._id}
          bookTitle={bookItem?.bookTitle}
          props={bookItem}
        />
      );
    }

    if (bookItem?.bookFormat === 'pdf') {
      return <PdfReader props={bookItem} />;
    }
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            textAlign: 'center',
            color: 'red',
            fontSize: 18,
          }}
        >
          Unsupported format
        </Text>
      </View>
    );
  };

  return <View style={{ flex: 1 }}>{displayBook()}</View>;
};

export default BookReader;
