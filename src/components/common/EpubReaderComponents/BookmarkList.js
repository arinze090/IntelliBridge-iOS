import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';

const BookmarkList = ({ bookmarks, onPressBookmark }) => {
  return (
    <View style={{ flex: 1, padding: 10 }}>
      <ScrollView>
        {bookmarks?.map((b, index) => (
          <TouchableOpacity
            activeOpacity={0.9}
            key={index}
            onPress={() => {
              onPressBookmark(b);
            }}
            style={{
              padding: 15,
              borderBottomWidth: 1,
              borderColor: '#eee',
            }}
          >
            <Text style={{ fontWeight: '600' }}>
              Page {b?.page || index + 1}
            </Text>

            {/* Optional snippet */}
            {b?.text && (
              <Text numberOfLines={2} style={{ color: '#666' }}>
                {b?.text}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default BookmarkList;

const styles = StyleSheet.create({});
