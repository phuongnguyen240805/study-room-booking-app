import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BUILDINGS, Building } from '../constants/buildings';
import { FilterChip } from './FilterChip';

interface BuildingFilterProps {
  selectedBuildings: Building[];
  onToggleBuilding: (building: Building) => void;
}

export const BuildingFilter: React.FC<BuildingFilterProps> = ({
  selectedBuildings,
  onToggleBuilding,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tòa nhà</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {BUILDINGS.map((building) => {
          const isSelected = selectedBuildings.includes(building);
          return (
            <FilterChip
              key={building}
              label={`Tòa ${building}`}
              icon="office-building"
              selected={isSelected}
              onPress={() => onToggleBuilding(building)}
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
