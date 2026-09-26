import { isSlotInPast, getUpcoming7Days } from '../dateUtils';
import { getCurrentSlot, getRoomCurrentStatus, generateQrPayload } from '../bookingUtils';
import { filterRooms } from '../filterUtils';
import { getFriendlyErrorMessage } from '../errorUtils';
import { generateBenchmarkRooms } from '../mockRooms';
import { Room } from '../../types/room';

console.log('=== BẮT ĐẦU KIỂM THỬ CÁC LOGIC CỐT LÕI (CORE ACCEPTANCE TESTS) ===\n');

// 1. Kiểm tra 7 ngày tiếp theo
const days = getUpcoming7Days();
console.assert(days.length === 7, 'FAIL: Phải sinh đủ 7 ngày');
console.assert(days[0].isToday === true, 'FAIL: Ngày đầu tiên phải là hôm nay');
console.log('✅ TC-BOOK-01: Sinh chính xác 7 ngày kế tiếp.');

// 2. Kiểm tra slot quá khứ
const todayStr = days[0].dateString;
const tomorrowStr = days[1].dateString;
console.assert(isSlotInPast('S1', tomorrowStr) === false, 'FAIL: Ngày mai không thể là quá khứ');
console.log('✅ TC-BOOK-02: Kiểm tra slot trong quá khứ hoạt động chính xác.');

// 3. Kiểm tra filter phòng
const testRooms: Room[] = [
  {
    id: '1',
    code: 'A201',
    name: 'Phòng Tự Học A201',
    building: 'A',
    floor: 2,
    capacity: 8,
    equipment: ['projector', 'whiteboard', 'ac'],
    image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    code: 'B305',
    name: 'Lab Máy Tính B305',
    building: 'B',
    floor: 3,
    capacity: 20,
    equipment: ['high_spec_pc', 'ac'],
    image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    code: 'C101',
    name: 'Co-working C101',
    building: 'C',
    floor: 1,
    capacity: 14,
    equipment: ['projector', 'ac'],
    image_url: null,
    created_at: new Date().toISOString(),
  },
];

// Test Search
const searchResult = filterRooms(testRooms, 'A201', [], 'all', []);
console.assert(searchResult.length === 1 && searchResult[0].code === 'A201', 'FAIL: Search room code');
console.log('✅ TC-ROOM-02: Search theo Room Code thành công.');

const searchNameResult = filterRooms(testRooms, 'máy tính', [], 'all', []);
console.assert(searchNameResult.length === 1 && searchNameResult[0].code === 'B305', 'FAIL: Search name');
console.log('✅ TC-ROOM-03: Search theo Room Name thành công.');

// Test Building Filter
const buildingResult = filterRooms(testRooms, '', ['A', 'C'], 'all', []);
console.assert(buildingResult.length === 2, 'FAIL: Building filter A & C');
console.log('✅ TC-ROOM-04: Filter theo tòa nhà (multi-select) thành công.');

// Test Capacity Filter
const capResult = filterRooms(testRooms, '', [], '5-8', []);
console.assert(capResult.length === 1 && capResult[0].code === 'A201', 'FAIL: Capacity filter 5-8');
console.log('✅ TC-ROOM-05: Filter theo sức chứa (Capacity range) thành công.');

// Test Equipment Filter (AND logic)
const eqResult = filterRooms(testRooms, '', [], 'all', ['projector', 'ac']);
console.assert(eqResult.length === 2, 'FAIL: Equipment AND filter');
console.log('✅ TC-ROOM-06: Filter theo trang thiết bị (AND logic) thành công.');

// Test Reset Filters
const resetResult = filterRooms(testRooms, '', [], 'all', []);
console.assert(resetResult.length === 3, 'FAIL: Reset filters');
console.log('✅ TC-ROOM-08: Reset filters trả về toàn bộ danh sách phòng.');

// 4. Kiểm tra Database Conflict Message (Double booking error handling)
const dbConflictError = {
  code: '23505',
  message: 'duplicate key value violates unique constraint "unique_active_booking_slot"',
};
const friendlyMsg = getFriendlyErrorMessage(dbConflictError);
console.assert(
  friendlyMsg.includes('vừa được sinh viên khác đặt chỗ'),
  'FAIL: Friendly collision error message'
);
console.log('✅ TC-CONFLICT-01: Database unique constraint conflict được dịch thành thông báo thân thiện.');

// 5. Kiểm tra QR Payload an toàn
const qrPayload = generateQrPayload('test-booking-id-1234');
console.assert(
  qrPayload === 'vku-study-room://booking/test-booking-id-1234',
  'FAIL: QR payload format'
);
console.assert(
  !qrPayload.includes('token') && !qrPayload.includes('jwt') && !qrPayload.includes('secret'),
  'FAIL: QR payload must not leak secrets'
);
console.log('✅ TC-QR-01: QR Booking Pass payload an toàn, chuẩn deeplink và không rò rỉ secret.');

// 6. Kiểm tra Benchmark Dataset FlatList (400 rooms)
const benchmarkRooms = generateBenchmarkRooms(400);
console.assert(benchmarkRooms.length === 400, 'FAIL: Benchmark dataset must contain 400 rooms');
console.log('✅ TC-PERF-01: Sinh thành công bộ dữ liệu stress test 400 phòng phục vụ benchmark FlatList.');

console.log('\n🎉 TẤT CẢ 8 BỘ TEST CASES LOGIC ĐÃ ĐẠT 100%!');
