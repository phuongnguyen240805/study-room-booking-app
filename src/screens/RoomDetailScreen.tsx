import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';
import { useBookingStore } from '../stores/useBookingStore';
import { getUpcoming7Days } from '../utils/dateUtils';
import { DateSelector } from '../components/DateSelector';
import { TimeSlotGrid } from '../components/TimeSlotGrid';
import { BookingConfirmModal } from '../components/BookingConfirmModal';
import { QRPassModal } from '../components/QRPassModal';
import { TimeSlot } from '../constants/timeSlots';
import { EQUIPMENT_LIST } from '../constants/equipment';
import { Booking } from '../types/booking';

type RoomDetailRouteProp = RouteProp<AppStackParamList, 'RoomDetail'>;

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';

export const RoomDetailScreen: React.FC = () => {
  const route = useRoute<RoomDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { room } = route.params;

  const days = useMemo(() => getUpcoming7Days(), []);
  const [selectedDate, setSelectedDate] = useState(days[0].dateString);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);

  const activeBookings = useBookingStore((s) => s.activeBookings);
  const bookingSubmitting = useBookingStore((s) => s.bookingSubmitting);
  const createBooking = useBookingStore((s) => s.createBooking);

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleOpenConfirm = () => {
    if (!selectedSlot) {
      Alert.alert('Chưa chọn ca học', 'Vui lòng chọn một ca học còn trống để tiếp tục.');
      return;
    }
    setConfirmModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    try {
      const newBooking = await createBooking({
        roomId: room.id,
        bookingDate: selectedDate,
        slotId: selectedSlot.id,
      });

      setConfirmModalVisible(false);
      setSelectedSlot(null);
      // Hiển thị vé QR ngay sau khi đặt thành công
      setSuccessBooking(newBooking);
    } catch (err: any) {
      setConfirmModalVisible(false);
      Alert.alert('Đặt phòng không thành công', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: room.image_url || DEFAULT_IMAGE }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Room Header Info */}
        <View style={styles.infoCard}>
          <View style={styles.roomHeaderRow}>
            <Text style={styles.roomCode}>{room.code}</Text>
            <View style={styles.buildingBadge}>
              <Text style={styles.buildingBadgeText}>Tòa {room.building}</Text>
            </View>
          </View>

          <Text style={styles.roomName}>{room.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="floor-plan" size={18} color="#0284C7" />
              <Text style={styles.metaText}>Tầng {room.floor}</Text>
            </View>

            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="account-group" size={18} color="#0284C7" />
              <Text style={styles.metaText}>{room.capacity} chỗ ngồi</Text>
            </View>
          </View>

          {/* Equipment list */}
          <Text style={styles.sectionTitle}>Trang thiết bị có sẵn</Text>
          <View style={styles.equipmentWrap}>
            {room.equipment.map((eqKey) => {
              const eqItem = EQUIPMENT_LIST.find((item) => item.id === eqKey);
              return (
                <View key={eqKey} style={styles.equipmentPill}>
                  <MaterialCommunityIcons name="check-circle" size={14} color="#0284C7" />
                  <Text style={styles.equipmentPillText}>{eqItem ? eqItem.label : eqKey}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 7-Day Date Selector */}
        <DateSelector
          days={days}
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            setSelectedDate(d);
            setSelectedSlot(null); // Reset slot khi đổi ngày
          }}
        />

        {/* 4 Predefined Time Slots Grid */}
        <TimeSlotGrid
          roomId={room.id}
          selectedDate={selectedDate}
          selectedSlotId={selectedSlot?.id || null}
          activeBookings={activeBookings}
          onSelectSlot={handleSelectSlot}
        />
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.slotSummary}>
          <Text style={styles.summaryLabel}>Ca học đã chọn:</Text>
          <Text style={styles.summaryValue}>
            {selectedSlot ? `${selectedSlot.name} (${selectedSlot.start} - ${selectedSlot.end})` : 'Chưa chọn'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.reserveBtn, !selectedSlot && styles.btnDisabled]}
          onPress={handleOpenConfirm}
          disabled={!selectedSlot}
          activeOpacity={0.8}
        >
          <Text style={styles.reserveBtnText}>Đặt phòng</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <BookingConfirmModal
        visible={confirmModalVisible}
        room={room}
        date={selectedDate}
        slot={selectedSlot}
        loading={bookingSubmitting}
        onConfirm={handleConfirmBooking}
        onCancel={() => setConfirmModalVisible(false)}
      />

      {/* QR Pass Modal on Successful Booking */}
      <QRPassModal
        visible={!!successBooking}
        booking={successBooking}
        onClose={() => {
          setSuccessBooking(null);
          navigation.navigate('MainTabs');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  roomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomCode: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  buildingBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  buildingBadgeText: {
    color: '#0284C7',
    fontWeight: '700',
    fontSize: 13,
  },
  roomName: {
    fontSize: 16,
    color: '#475569',
    marginTop: 4,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  equipmentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  equipmentPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    marginLeft: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  slotSummary: {
    flex: 1,
    marginRight: 16,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  reserveBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  btnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  reserveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
