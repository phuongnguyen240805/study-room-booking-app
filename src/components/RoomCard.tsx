import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Room, Equipment } from '../types/room';
import { useRoomAvailability } from '../hooks/useRoomAvailability';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
}

const EQUIPMENT_ICONS: Record<Equipment, keyof typeof MaterialCommunityIcons.glyphMap> = {
  projector: 'projector',
  whiteboard: 'human-male-board',
  high_spec_pc: 'desktop-classic',
  ac: 'air-conditioner',
};

const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600';

export const RoomCard: React.FC<RoomCardProps> = memo(({ room, onPress }) => {
  const availability = useRoomAvailability(room.id);

  const getStatusBadge = () => {
    switch (availability) {
      case 'occupied':
        return (
          <View style={[styles.statusBadge, styles.statusOccupied]}>
            <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.statusText, { color: '#B91C1C' }]}>Đang có người</Text>
          </View>
        );
      case 'available':
        return (
          <View style={[styles.statusBadge, styles.statusAvailable]}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.statusText, { color: '#047857' }]}>Đang trống</Text>
          </View>
        );
      case 'no_slot':
      default:
        return (
          <View style={[styles.statusBadge, styles.statusNeutral]}>
            <View style={[styles.statusDot, { backgroundColor: '#64748B' }]} />
            <Text style={[styles.statusText, { color: '#475569' }]}>Ngoài giờ học</Text>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress(room)}
    >
      <Image
        source={{ uri: room.image_url || DEFAULT_ROOM_IMAGE }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.roomCode}>{room.code}</Text>
          {getStatusBadge()}
        </View>

        <Text style={styles.roomName} numberOfLines={1}>
          {room.name}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="office-building" size={15} color="#64748B" />
            <Text style={styles.metaText}>Tòa {room.building} · Tầng {room.floor}</Text>
          </View>

          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account-group" size={15} color="#64748B" />
            <Text style={styles.metaText}>{room.capacity} người</Text>
          </View>
        </View>

        {room.equipment.length > 0 && (
          <View style={styles.equipmentRow}>
            {room.equipment.map((eq) => (
              <View key={eq} style={styles.equipmentBadge}>
                <MaterialCommunityIcons
                  name={EQUIPMENT_ICONS[eq] || 'check-circle-outline'}
                  size={13}
                  color="#0284C7"
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

RoomCard.displayName = 'RoomCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#E2E8F0',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  roomName: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusAvailable: {
    backgroundColor: '#ECFDF5',
  },
  statusOccupied: {
    backgroundColor: '#FEF2F2',
  },
  statusNeutral: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  equipmentBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
});
