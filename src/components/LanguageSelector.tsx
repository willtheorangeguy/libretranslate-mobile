import React, { useMemo, useState } from 'react';
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
import { useThemeColors, ThemeColors } from '../theme';

interface Props {
  languages: Language[];
  selectedLang: string;
  onSelect: (lang: string) => void;
  placeholder?: string;
}

function LanguageDivider() {
  const colors = useThemeColors();
  const dividerStyles = useMemo(
    () =>
      StyleSheet.create({
        line: { height: 1, backgroundColor: colors.borderSubtle },
      }),
    [colors]
  );
  return <View style={dividerStyles.line} />;
}

export default function LanguageSelector({
  languages,
  selectedLang,
  onSelect,
  placeholder = 'Select language',
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
        <MaterialIcons name="check" size={20} color={colors.primary} />
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
        <MaterialIcons name="expand-more" size={20} color={colors.primary} />
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
                <MaterialIcons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={languages}
              keyExtractor={item => item.code}
              renderItem={renderLanguageItem}
              ItemSeparatorComponent={LanguageDivider}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    selector: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: c.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    selectorText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: c.textPrimary,
      marginRight: 6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: c.overlay,
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: c.surface,
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
      borderBottomColor: c.borderSubtle,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: c.textPrimary,
    },
    languageItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    languageItemSelected: {
      backgroundColor: c.surfaceAlt,
    },
    languageItemText: {
      flex: 1,
      fontSize: 16,
      color: c.textPrimary,
    },
    languageItemTextSelected: {
      fontWeight: '600',
      color: c.primary,
    },
  });
