import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CapacityFilter as CapacityType } from '../types/room';
import { FilterChip } from './FilterChip';

interface CapacityFilterProps {
  selectedCapacity: CapacityType;
  onSelectCapacity: (capacity: CapacityType) => void;
}

const CAPACITY_OPTIONS: { id: CapacityType; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: '2-4', label: '2 - 4 người' },
  { id: '5-8', label: '5 - 8 người' },
  { id: '9-12', label: '9 - 12 người' },
  { id: '13-20', label: '13 - 20 người' },
];

export const CapacityFilter: React.FC<CapacityFilterProps> = ({
  selectedCapacity,
  onSelectCapacity,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sức chứa</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {CAPACITY_OPTIONS.map((option) => (
          <FilterChip
            key={option.id}
            label={option.label}
            icon="account-group"
            selected={selectedCapacity === option.id}
            onPress={() => onSelectCapacity(option.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scroll: {
    flexDirection: 'row',
  },
});
