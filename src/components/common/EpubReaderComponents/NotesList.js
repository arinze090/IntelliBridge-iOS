import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';

const NotesList = ({ notes, onPressNotes }) => {
  const normalizedNotes = Array.isArray(notes)
    ? notes
    : notes && typeof notes === 'object'
    ? [notes]
    : [];

  const renderText = item => {
    if (typeof item === 'string') return item;
    if (item == null) return '';
    if (typeof item === 'object') return JSON.stringify(item);
    return String(item);
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <ScrollView>
        {normalizedNotes?.map((b, index) => (
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

            {b?.text ? (
              <Text numberOfLines={2} style={{ color: '#666', marginTop: 4 }}>
                Highlighted:{' '}
                <Text style={{ fontWeight: '600', color: '#000' }}>
                  {renderText(b?.text)}
                </Text>
              </Text>
            ) : null}

            {b?.note ? (
              <Text numberOfLines={2} style={{ color: '#666', marginTop: 4 }}>
                Added Note:{' '}
                <Text style={{ fontWeight: '600', color: '#000' }}>
                  {renderText(b?.note)}
                </Text>
              </Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default NotesList;

const styles = StyleSheet.create({});
