import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import PickerSelect from './PickerSelect';
import { windowWidth } from '../../utils/Dimensions';

export default function SearchablePicker({
  items,
  onValueChange,
  formInputTitle,
  errorMessage,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    const filtered = items.filter(item =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  return (
    <View style={styles.container}>
      {formInputTitle && (
        <Text style={styles.inputTitle}>{formInputTitle}</Text>
      )}
      <TextInput
        style={styles.searchInput}
        onChangeText={setSearchTerm}
        value={searchTerm}
        placeholder="Search and select from the picker below..."
      />
      <PickerSelect onValueChange={onValueChange} items={filteredItems} />
      {errorMessage && (
        <Text style={styles.validationError}>{errorMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    // marginBottom: 10,
    width: windowWidth / 1.1,
    alignSelf: 'center',
  },
  inputTitle: {
    marginBottom: 10,
    fontSize: 16,
    color: '#1E1E1E',
    fontWeight: '600',
  },
  validationError: {
    color: 'red',
    fontWeight: '500',
    marginBottom: 5,
    fontSize: 13,
    // textAlign: 'center',
    marginTop: -10,
  },
});
