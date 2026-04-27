import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { windowHeight } from '../../../utils/Dimensions';
import { COLORS } from '../../../themes/themes';
import FormButton from '../../form/FormButton';
import SecondaryBtn from '../../form/SecondaryBtn';
import AddNotesInput from './AddNotesInput';

const AddNotesModal = ({
  selectedText,
  noteInput,
  setNoteInput,
  onAddNotesPress,
  onCancelNotes,
}) => {
  return (
    <View style={styles.addNotesModalContainer}>
      <Text style={styles.highlightedTextHeader}>Add Note</Text>

      <Text style={styles.highlightedWordTitle}>
        Highlighted Word(s):{' '}
        <Text style={styles.highlightedWord}>{selectedText?.text}</Text>
      </Text>

      <AddNotesInput
        placeholder="Write note..."
        value={noteInput}
        onChangeText={setNoteInput}
        style={{ borderWidth: 1, marginTop: 10 }}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <SecondaryBtn
          width={5}
          height={50}
          title={'Cancel'}
          onPress={onCancelNotes}
        />
        <FormButton
          title={'Save'}
          width={5}
          height={50}
          onPress={onAddNotesPress}
        />
      </View>
    </View>
  );
};

export default AddNotesModal;

const styles = StyleSheet.create({
  addNotesModalContainer: {
    position: 'absolute',
    bottom: windowHeight / 3,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    zIndex: 50,
  },
  highlightedTextHeader: {
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
  highlightedWordTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
  },
  highlightedWord: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.legacyBridgePrimary,
  },
});
