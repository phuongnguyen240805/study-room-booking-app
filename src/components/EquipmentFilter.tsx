import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { EQUIPMENT_LIST } from '../constants/equipment';
import { Equipment } from '../types/room';
import { FilterChip } from './FilterChip';

interface EquipmentFilterProps {
  selectedEquipment: Equipment[];
  onToggleEquipment: (equipment: Equipment) => void;
}

const EQUIPMENT_ICONS: Record<Equipment, any> = {
  projector: 'projector',
  whiteboard: 'human-male-board',
  high_spec_pc: 'desktop-classic',
  ac: 'air-conditioner',
};

export const EquipmentFilter: React.FC<EquipmentFilterProps> = ({
  selectedEquipment,
  onToggleEquipment,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thiết bị phòng</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {EQUIPMENT_LIST.map((item) => {
          const isSelected = selectedEquipment.includes(item.id as Equipment);
          return (
            <FilterChip
              key={item.id}
              label={item.label}
              icon={EQUIPMENT_ICONS[item.id as Equipment]}
              selected={isSelected}
              onPress={() => onToggleEquipment(item.id as Equipment)}
            />
          );
        })}
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
