import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: ViewStyle;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
  icon,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color={selected ? '#FFFFFF' : '#475569'}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
