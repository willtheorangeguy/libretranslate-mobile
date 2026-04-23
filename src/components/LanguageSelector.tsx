import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Language } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  languages: Language[];
  selectedLang: string;
  onSelect: (lang: string) => void;
  placeholder?: string;
}

function Separator() {
  return <View style={styles.separator} />;
}

export default function LanguageSelector({
  languages,
  selectedLang,
  onSelect,
  placeholder = 'Select language',
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const selectedLanguage = languages.find(lang => lang.code === selectedLang);
  const displayName = selectedLanguage?.name || placeholder;

  const handleSelect = (languageCode: string) => {
    onSelect(languageCode);
    setShowModal(false);
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selectedLang === item.code && styles.languageItemSelected,
      ]}
      onPress={() => handleSelect(item.code)}
    >
      <Text
        style={[
          styles.languageItemText,
          selectedLang === item.code && styles.languageItemTextSelected,
        ]}
      >
        {item.name}
      </Text>
      {selectedLang === item.code && (
        <MaterialIcons name="check" size={20} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Open language selector"
        style={styles.selector}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.selectorText} numberOfLines={1}>
          {displayName}
        </Text>
        <MaterialIcons name="expand-more" size={20} color="#007AFF" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={languages}
              keyExtractor={item => item.code}
              renderItem={renderLanguageItem}
              ItemSeparatorComponent={Separator}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginRight: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  languageItemSelected: {
    backgroundColor: '#E5F0FF',
  },
  languageItemText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  languageItemTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
});
