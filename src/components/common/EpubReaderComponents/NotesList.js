import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';

const NotesList = ({ notes, onPressNotes }) => {
  return (
    <View style={{ flex: 1, padding: 10 }}>
      <ScrollView>
        {notes?.map((b, index) => (
          <TouchableOpacity
            activeOpacity={0.9}
            key={index}
            onPress={() => {
              onPressNotes(b);
            }}
            style={{
              padding: 15,
              borderBottomWidth: 1,
              borderColor: '#eee',
            }}
          >
            {/* <Text style={{ fontWeight: '600' }}>
              Page {b?.page || index + 1}
            </Text> */}

            {/* Optional snippet */}
            {b?.text && (
              <Text numberOfLines={2} style={{ color: '#666', marginTop: 4 }}>
                Highlighted:{' '}
                <Text style={{ fontWeight: '600', color: '#000' }}>
                  {b?.text}
                </Text>
              </Text>
            )}

            {b?.text && (
              <Text numberOfLines={2} style={{ color: '#666', marginTop: 4 }}>
                Added Note: <Text style={{ fontWeight: '600', color: '#000' }}>{b?.note}</Text>
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default NotesList;

const styles = StyleSheet.create({});
