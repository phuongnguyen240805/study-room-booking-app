import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { DayOption } from '../utils/dateUtils';

interface DateSelectorProps {
  days: DayOption[];
  selectedDate: string;
  onSelectDate: (dateString: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  days,
  selectedDate,
  onSelectDate,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn ngày</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((item) => {
          const isSelected = item.dateString === selectedDate;
          return (
            <TouchableOpacity
              key={item.dateString}
              style={[styles.dateItem, isSelected && styles.dateItemSelected]}
              onPress={() => onSelectDate(item.dateString)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayOfWeek, isSelected && styles.dayOfWeekSelected]}>
                {item.dayOfWeek}
              </Text>
              <Text style={[styles.dayOfMonth, isSelected && styles.dayOfMonthSelected]}>
                {item.dayOfMonth}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    marginHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginRight: 10,
  },
  dateItemSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  dayOfWeek: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  dayOfWeekSelected: {
    color: '#E0F2FE',
    fontWeight: '600',
  },
  dayOfMonth: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  dayOfMonthSelected: {
    color: '#FFFFFF',
  },
});
