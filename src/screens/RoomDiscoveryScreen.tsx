import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBookingStore } from '../stores/useBookingStore';
import { RoomCard } from '../components/RoomCard';
import { SearchBar } from '../components/SearchBar';
import { BuildingFilter } from '../components/BuildingFilter';
import { CapacityFilter } from '../components/CapacityFilter';
import { EquipmentFilter } from '../components/EquipmentFilter';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { filterRooms } from '../utils/filterUtils';
import { Room } from '../types/room';
import { AppStackParamList } from '../types/navigation';

export const RoomDiscoveryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const rooms = useBookingStore((s) => s.rooms);
  const roomsLoading = useBookingStore((s) => s.roomsLoading);
  const error = useBookingStore((s) => s.error);
  const loadRooms = useBookingStore((s) => s.loadRooms);
  const loadActiveBookings = useBookingStore((s) => s.loadActiveBookings);
  const profile = useBookingStore((s) => s.profile);

  // Filters from Zustand (persisted via AsyncStorage)
  const searchQuery = useBookingStore((s) => s.searchQuery);
  const selectedBuildings = useBookingStore((s) => s.selectedBuildings);
  const capacityFilter = useBookingStore((s) => s.capacityFilter);
  const selectedEquipment = useBookingStore((s) => s.selectedEquipment);

  const setSearchQuery = useBookingStore((s) => s.setSearchQuery);
  const toggleBuilding = useBookingStore((s) => s.toggleBuilding);
  const setCapacityFilter = useBookingStore((s) => s.setCapacityFilter);
  const toggleEquipment = useBookingStore((s) => s.toggleEquipment);
  const resetFilters = useBookingStore((s) => s.resetFilters);

  useEffect(() => {
    loadRooms();
    loadActiveBookings();
  }, []);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedBuildings.length > 0 ||
    capacityFilter !== 'all' ||
    selectedEquipment.length > 0;

  // Memoized filter pipeline
  const filteredRooms = useMemo(() => {
    return filterRooms(
      rooms,
      searchQuery,
      selectedBuildings,
      capacityFilter,
      selectedEquipment
    );
  }, [rooms, searchQuery, selectedBuildings, capacityFilter, selectedEquipment]);

  const handleRoomPress = useCallback(
    (room: Room) => {
      navigation.navigate('RoomDetail', { room });
    },
    [navigation]
  );

  const renderRoomItem: ListRenderItem<Room> = useCallback(
    ({ item }) => <RoomCard room={item} onPress={handleRoomPress} />,
    [handleRoomPress]
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  const handleRefresh = async () => {
    await Promise.all([loadRooms(), loadActiveBookings()]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Xin chào,</Text>
          <Text style={styles.userName}>
            {profile?.full_name || 'Sinh viên VKU'} 👋
          </Text>
        </View>
        <View style={styles.campusBadge}>
          <MaterialCommunityIcons name="map-marker-radius" size={14} color="#0284C7" />
          <Text style={styles.campusText}>VKU Campus</Text>
        </View>
      </View>

      <FlatList
        data={filteredRooms}
        renderItem={renderRoomItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={8}
        windowSize={5}
        maxToRenderPerBatch={10}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={roomsLoading && rooms.length > 0}
            onRefresh={handleRefresh}
            colors={['#0284C7']}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerComponent}>
            {/* Search Input */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />

            {/* Filter Section */}
            <BuildingFilter
              selectedBuildings={selectedBuildings}
              onToggleBuilding={toggleBuilding}
            />
            <CapacityFilter
              selectedCapacity={capacityFilter}
              onSelectCapacity={setCapacityFilter}
            />
            <EquipmentFilter
              selectedEquipment={selectedEquipment}
              onToggleEquipment={toggleEquipment}
            />

            {/* Results bar and Reset button */}
            <View style={styles.resultBar}>
              <Text style={styles.resultCount}>
                Hiển thị <Text style={styles.countHighlight}>{filteredRooms.length}</Text> phòng học
              </Text>
              {hasActiveFilters && (
                <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
                  <MaterialCommunityIcons name="filter-remove-outline" size={14} color="#EF4444" />
                  <Text style={styles.resetBtnText}>Xóa bộ lọc</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          roomsLoading && rooms.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0284C7" />
              <Text style={styles.loadingText}>Đang tải danh sách phòng...</Text>
            </View>
          ) : error ? (
            <ErrorState message={error} onRetry={loadRooms} />
          ) : (
            <EmptyState
              icon="home-search-outline"
              title="Không tìm thấy phòng phù hợp"
              message="Thử điều chỉnh từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc để có thêm kết quả."
            />
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  welcomeText: {
    fontSize: 13,
    color: '#64748B',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  campusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  campusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    marginLeft: 4,
  },
  headerComponent: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  resultBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resultCount: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  countHighlight: {
    color: '#0284C7',
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
});
