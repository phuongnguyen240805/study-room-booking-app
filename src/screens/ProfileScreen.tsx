import { Alert } from '../utils/alert';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBookingStore } from '../stores/useBookingStore';
import { authService } from '../services/authService';

export const ProfileScreen: React.FC = () => {
  const [loggingOut, setLoggingOut] = useState(false);
  const profile = useBookingStore((s) => s.profile);
  const session = useBookingStore((s) => s.session);
  const userBookings = useBookingStore((s) => s.userBookings);
  const rooms = useBookingStore((s) => s.rooms);
  const loadBenchmarkRooms = useBookingStore((s) => s.loadBenchmarkRooms);
  const loadRooms = useBookingStore((s) => s.loadRooms);
  const roomsLoading = useBookingStore((s) => s.roomsLoading);

  const activeCount = userBookings.filter((b) => b.status === 'active').length;
  const totalCount = userBookings.length;

  const handleSignOut = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await authService.signOut();
          } catch (err: any) {
            Alert.alert('Lỗi đăng xuất', err.message);
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const userEmail = profile?.email || session?.user?.email || 'Chưa cập nhật';
  const userName = profile?.full_name || session?.user?.user_metadata?.full_name || 'Sinh viên VKU';
  const avatarUrl = profile?.avatar_url || session?.user?.user_metadata?.avatar_url;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ Sơ Cá Nhân</Text>
        </View>

        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={48} color="#0284C7" />
              </View>
            )}
          </View>

          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>

          <View style={styles.studentBadge}>
            <MaterialCommunityIcons name="check-decagram" size={16} color="#0284C7" />
            <Text style={styles.studentBadgeText}>Sinh viên chính quy VKU</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeCount}</Text>
            <Text style={styles.statLabel}>Lịch sắp tới</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Tổng lượt đặt</Text>
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin ứng dụng</Text>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#64748B" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Phiên bản</Text>
              <Text style={styles.infoSub}>1.0.0 (Expo SDK 57 / React Native)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="lightning-bolt-outline" size={20} color="#64748B" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Công nghệ đồng bộ</Text>
              <Text style={styles.infoSub}>Supabase Realtime PostgreSQL + RLS</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="bell-ring-outline" size={20} color="#64748B" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Nhắc nhở thông minh</Text>
              <Text style={styles.infoSub}>Expo Local Notifications (-15 phút)</Text>
            </View>
          </View>
        </View>

        {/* Developer & Benchmark Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Công cụ kiểm thử hiệu năng (Benchmark)</Text>
          <Text style={styles.benchmarkDesc}>
            Hiện tại đang nạp <Text style={{ fontWeight: '700', color: '#0284C7' }}>{rooms.length}</Text> phòng trong bộ nhớ.
          </Text>

          <TouchableOpacity
            style={styles.benchmarkBtn}
            onPress={() => {
              loadBenchmarkRooms(400);
              Alert.alert('Thành công', 'Đã nạp 400 phòng mẫu vào bộ nhớ để kiểm thử mượt mà FlatList 60 FPS!');
            }}
          >
            <MaterialCommunityIcons name="speedometer" size={18} color="#0284C7" />
            <Text style={styles.benchmarkBtnText}>Nạp 400 phòng mẫu (Stress Test FlatList)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.benchmarkBtn, styles.benchmarkResetBtn]}
            onPress={async () => {
              await loadRooms();
              Alert.alert('Đã làm mới', 'Đã tải lại danh sách phòng thực từ cơ sở dữ liệu Supabase.');
            }}
            disabled={roomsLoading}
          >
            {roomsLoading ? (
              <ActivityIndicator size="small" color="#64748B" />
            ) : (
              <>
                <MaterialCommunityIcons name="database-refresh-outline" size={18} color="#64748B" />
                <Text style={styles.benchmarkResetText}>Tải lại dữ liệu Supabase</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          disabled={loggingOut}
          activeOpacity={0.8}
        >
          {loggingOut ? (
            <ActivityIndicator color="#EF4444" size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
              <Text style={styles.signOutText}>Đăng xuất</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarContainer: {
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  studentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  studentBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0284C7',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  infoSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 4,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  signOutText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
  benchmarkDesc: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  benchmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 8,
  },
  benchmarkBtnText: {
    color: '#0284C7',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  benchmarkResetBtn: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    marginBottom: 0,
  },
  benchmarkResetText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
});
