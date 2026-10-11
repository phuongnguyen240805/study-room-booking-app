import { Alert } from '../utils/alert';
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBookingStore } from '../stores/useBookingStore';
import { BookingCard } from '../components/BookingCard';
import { QRPassModal } from '../components/QRPassModal';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Booking } from '../types/booking';

type TabType = 'upcoming' | 'history';

export const MyBookingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [selectedQRBooking, setSelectedQRBooking] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const userBookings = useBookingStore((s) => s.userBookings);
  const bookingsLoading = useBookingStore((s) => s.bookingsLoading);
  const error = useBookingStore((s) => s.error);
  const loadUserBookings = useBookingStore((s) => s.loadUserBookings);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);

  useEffect(() => {
    loadUserBookings();
  }, []);

  const upcomingBookings = useMemo(() => {
    return userBookings.filter((b) => b.status === 'active');
  }, [userBookings]);

  const historyBookings = useMemo(() => {
    return userBookings.filter((b) => b.status === 'cancelled');
  }, [userBookings]);

  const displayedList = activeTab === 'upcoming' ? upcomingBookings : historyBookings;

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      Alert.alert('Thành công', 'Đã hủy lịch đặt phòng và giải phóng khung giờ.');
    } catch (err: any) {
      Alert.alert('Lỗi hủy phòng', err.message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Lịch Đặt Của Tôi</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="calendar-clock"
            size={18}
            color={activeTab === 'upcoming' ? '#0284C7' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Sắp tới ({upcomingBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="history"
            size={18}
            color={activeTab === 'history' ? '#0284C7' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Lịch sử ({historyBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <FlatList
        data={displayedList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onShowQR={(b) => setSelectedQRBooking(b)}
            onCancel={handleCancel}
            cancelling={cancellingId === item.id}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={bookingsLoading && userBookings.length > 0}
            onRefresh={loadUserBookings}
            colors={['#0284C7']}
          />
        }
        ListEmptyComponent={
          bookingsLoading && userBookings.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#0284C7" />
              <Text style={styles.loadingText}>Đang tải danh sách đặt phòng...</Text>
            </View>
          ) : error ? (
            <ErrorState message={error} onRetry={loadUserBookings} />
          ) : (
            <EmptyState
              icon={activeTab === 'upcoming' ? 'calendar-blank' : 'history'}
              title={
                activeTab === 'upcoming'
                  ? 'Không có lịch đặt sắp tới'
                  : 'Chưa có lịch sử hủy/hoàn thành'
              }
              message={
                activeTab === 'upcoming'
                  ? 'Bạn chưa đặt chỗ phòng học nào. Hãy tìm kiếm phòng trống và đặt chỗ ngay!'
                  : 'Các phòng bạn hủy hoặc đã hoàn thành sẽ hiển thị tại đây.'
              }
            />
          )
        }
      />

      {/* QR Modal */}
      <QRPassModal
        visible={!!selectedQRBooking}
        booking={selectedQRBooking}
        onClose={() => setSelectedQRBooking(null)}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: '#F8FAFC',
  },
  tabActive: {
    backgroundColor: '#E0F2FE',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
});
