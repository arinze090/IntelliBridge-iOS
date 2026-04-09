import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../themes/themes';

const SelectedTags = ({ items, onRemove }) => {
  const handleRemove = item => {
    onRemove(item);
  };

  return (
    <View style={styles.selectedTags}>
      {items.map((item, index) => (
        <View key={index} style={styles.tag}>
          <Text style={styles.tagText}>{item}</Text>
          <TouchableOpacity
            onPress={() => handleRemove(item)}
            style={styles.removeBtn}
          >
            <Text style={styles.removeBtnText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5dbe1',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: COLORS?.legacyBridgePrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  removeBtn: {
    marginLeft: 8,
  },
  removeBtnText: {
    color: 'black',
    fontSize: 16,
  },
});

export default SelectedTags;
