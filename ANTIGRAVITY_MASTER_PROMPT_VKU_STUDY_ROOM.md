# MASTER IMPLEMENTATION PROMPT — VKU STUDY ROOM BOOKING

Bạn là **Senior React Native / Expo / TypeScript Engineer + Supabase Architect** chịu trách nhiệm triển khai hoàn chỉnh Mini-Project **VKU Real-time Study Room Booking App**.

Tôi đã cung cấp cho bạn file đặc tả và kế hoạch triển khai:

`ANTIGRAVITY_IMPLEMENTATION_PLAN_VKU_STUDY_ROOM.md`

## 1. NHIỆM VỤ ĐẦU TIÊN

Trước khi viết hoặc sửa bất kỳ code nào:

1. Đọc **TOÀN BỘ** file `ANTIGRAVITY_IMPLEMENTATION_PLAN_VKU_STUDY_ROOM.md`.
2. Không được chỉ đọc một phần hoặc suy đoán requirement.
3. Phân tích repository hiện tại:
   - cấu trúc thư mục,
   - `package.json`,
   - Expo SDK version,
   - TypeScript config,
   - navigation hiện tại,
   - dependencies,
   - code hiện có,
   - environment configuration,
   - Git status.
4. Đối chiếu repository hiện tại với implementation plan.
5. Xác định:
   - phần đã có,
   - phần chưa có,
   - phần sai kiến trúc,
   - phần cần refactor,
   - dependencies còn thiếu.
6. Sau đó mới bắt đầu triển khai.

**File plan là source of truth chính của project.**

Nếu code hiện tại khác với plan nhưng chưa có lý do kỹ thuật chính đáng, hãy điều chỉnh code để phù hợp với plan.

---

# 2. MỤC TIÊU CUỐI CÙNG

Xây dựng hoàn chỉnh ứng dụng:

**VKU Study Room Booking**

Stack bắt buộc:

- React Native
- Expo
- TypeScript
- React Navigation
- Zustand
- AsyncStorage
- Supabase Auth
- Google Login
- Supabase PostgreSQL
- Supabase Realtime
- Supabase Row Level Security
- Expo Notifications
- QR Booking Pass

Ứng dụng cuối cùng phải cho phép:

1. Đăng nhập bằng Google.
2. Restore session sau khi mở lại app.
3. Xem danh sách phòng bằng FlatList.
4. Search phòng.
5. Filter theo:
   - Building A/B/C/V,
   - Capacity,
   - Equipment.
6. Xem trạng thái Available / Occupied.
7. Mở Room Detail.
8. Chọn ngày trong 7 ngày tiếp theo.
9. Chọn một trong 4 time slot:
   - S1: 07:30–09:30
   - S2: 09:30–11:30
   - S3: 13:00–15:00
   - S4: 15:00–17:00
10. Disable slot đã được booking.
11. Disable slot trong quá khứ.
12. Booking phòng.
13. Database phải ngăn double booking.
14. Realtime cập nhật booking giữa nhiều thiết bị.
15. Hiển thị QR Booking Pass sau booking thành công.
16. Schedule local notification trước 15 phút.
17. Xem My Bookings.
18. Cancel booking.
19. Cancel notification tương ứng.
20. Slot được giải phóng realtime sau cancellation.
21. Logout.

---

# 3. KHÔNG ĐƯỢC THAY ĐỔI STACK TÙY Ý

Không thay Supabase bằng Firebase.

Không tự tạo:

- Node.js backend,
- Express backend,
- NestJS backend,
- custom REST server,

trừ khi có requirement mới từ tôi.

Supabase là Backend-as-a-Service chính.

Không thêm các feature ngoài scope như:

- AI recommendation,
- chat,
- payment,
- maps,
- rating,
- admin dashboard,
- QR scanner,
- push notification server,
- analytics dashboard,
- calendar synchronization.

Ưu tiên hoàn thiện 100% core requirement trước.

---

# 4. TRIỂN KHAI THEO ĐÚNG PHASE

Phải thực hiện theo thứ tự trong plan.

## PHASE 0 — INITIALIZATION

Kiểm tra và hoàn thiện:

- Expo TypeScript project
- strict TypeScript
- React Navigation
- folder architecture
- Supabase client
- `.env`
- `.env.example`
- `.gitignore`

Chỉ chuyển phase khi project chạy và TypeScript không lỗi nghiêm trọng.

---

## PHASE 1 — GOOGLE AUTH

Ưu tiên hoàn thành sớm.

Triển khai:

- Supabase Google Auth
- custom app scheme
- OAuth callback/deep linking
- LoginScreen
- session bootstrap
- protected navigation
- persistent session
- profile creation
- logout

Google Login phải là authentication thật.

**Không được dùng fake/mock login.**

Nếu OAuth cần development build thì cấu hình đúng cho development build/APK.

---

## PHASE 2 — DATABASE + ROOMS

Triển khai schema:

- `profiles`
- `rooms`
- `bookings`

Bật RLS.

Tạo policies đúng quyền.

Seed room data.

Implement:

- room service
- RoomDiscoveryScreen
- RoomCard
- FlatList

Room data phải được load từ Supabase.

Không hardcode toàn bộ room feed trực tiếp trong UI.

---

## PHASE 3 — SEARCH + FILTER + ASYNCSTORAGE

Implement:

- search room,
- building multi-filter,
- capacity filter,
- equipment multi-filter,
- Reset Filters,
- `useMemo`,
- Zustand,
- AsyncStorage persistence.

Sau khi app restart, filter preferences phải được restore.

---

## PHASE 4 — BOOKING ENGINE

Implement:

- RoomDetailScreen
- 7-day selector
- 4 predefined slots
- booked slot detection
- past slot detection
- booking confirmation
- create booking
- My Bookings
- cancel booking

### QUAN TRỌNG

Không được chỉ chống booking trùng ở frontend.

Database bắt buộc phải có partial unique index tương đương:

```sql
create unique index if not exists unique_active_booking_slot
on public.bookings (
  room_id,
  booking_date,
  slot_id
)
where status = 'active';
```

Mục tiêu:

```text
room + date + slot
```

chỉ có tối đa **1 active booking**.

Nếu hai thiết bị book cùng lúc:

- một request được success,
- request còn lại phải bị database reject.

UI chuyển database conflict thành message dễ hiểu.

---

# 5. KHÔNG OPTIMISTIC SUCCESS CHO BOOKING

Không được:

```text
Press Book
→ UI báo success
→ database insert sau
```

Phải:

```text
Press Book
→ database INSERT
→ database xác nhận success
→ update Zustand
→ show Booking Pass
```

Booking correctness quan trọng hơn optimistic UI.

---

# 6. REALTIME LÀ REQUIREMENT THẬT

Supabase Realtime phải được sử dụng.

Scenario bắt buộc:

```text
Phone A:
Book A201 / 26-09 / S2

Phone B:
Không refresh
→ S2 tự chuyển sang Booked
```

Khi Phone A cancel:

```text
Phone B:
Không refresh
→ S2 tự chuyển lại Available
```

Subscribe booking changes đúng lifecycle.

Không tạo duplicate subscriptions.

Cleanup subscription khi logout/unmount phù hợp.

---

# 7. ZUSTAND ARCHITECTURE

Global store chính:

`useBookingStore`

Store quản lý:

- session/profile state dùng cho UI,
- rooms,
- bookings,
- filters,
- loading state,
- error state.

Nhưng:

**Supabase Auth mới là authentication source of truth.**

Không biến Zustand thành authentication backend.

---

# 8. ASYNCSTORAGE

AsyncStorage dùng cho:

- filters,
- search preferences nếu cần,
- notification mapping,
- lightweight UX persistence.

Không persist:

- loading,
- temporary modal state,
- transient errors.

Không tự lưu privileged authentication secret vào Zustand.

---

# 9. LOCAL NOTIFICATION

Sau booking thành công:

```text
booking start
-
15 minutes
=
local reminder time
```

Ví dụ:

```text
15:00 booking
→ 14:45 reminder
```

Sử dụng:

`expo-notifications`

Lưu mapping:

```text
bookingId -> notificationId
```

trong AsyncStorage.

Khi cancel booking:

- cancel scheduled notification,
- remove notification mapping.

Nếu user từ chối notification permission:

- booking vẫn phải thành công,
- app chỉ hiển thị warning phù hợp.

---

# 10. QR BOOKING PASS

Mỗi booking thành công phải có QR.

QR không được chứa:

- access token,
- refresh token,
- JWT,
- Google token,
- secret.

Payload nên chỉ chứa booking identifier, ví dụ:

```text
VKU:<booking-id>
```

hoặc:

```text
vku-study-room://booking/<booking-id>
```

QR modal hiển thị thêm:

- Room
- Building
- Date
- Time
- Booking reference

Không cần implement QR scanner.

---

# 11. FLATLIST PERFORMANCE

Performance là một Learning Objective bắt buộc.

Room feed phải dùng `FlatList`.

Áp dụng hợp lý:

- `React.memo(RoomCard)`
- `useMemo`
- `useCallback`
- stable `keyExtractor`
- optimized card
- optimized image
- suitable `initialNumToRender`
- suitable `windowSize`
- `getItemLayout` nếu card height cố định
- tránh unnecessary re-renders

Tạo development dataset khoảng:

```text
300–500 rooms
```

để stress test.

Không được tuyên bố 60fps nếu chưa kiểm tra thực tế.

---

# 12. CODE STRUCTURE

Bám cấu trúc trong plan.

Tối thiểu phân tách:

```text
components/
screens/
navigation/
stores/
services/
hooks/
utils/
constants/
types/
```

Không để:

- Supabase query,
- navigation logic,
- UI rendering,
- booking business logic

dồn hết vào một screen file.

Không over-engineer bằng quá nhiều abstraction không cần thiết.

---

# 13. TYPESCRIPT

Yêu cầu:

- strict TypeScript,
- typed navigation,
- typed Supabase entities,
- typed services,
- typed Zustand store.

Tránh `any`.

Nếu bắt buộc dùng `any`, phải có lý do cụ thể.

---

# 14. SECURITY

Bắt buộc:

- RLS cho exposed tables.
- Client chỉ dùng Supabase publishable key phù hợp.
- Không đưa service role key vào app.
- Không đưa Google Client Secret vào app.
- Không đưa DB password vào app.
- User chỉ cancel/update booking của chính mình.
- Rooms chỉ read từ mobile app.

Kiểm tra `.gitignore` trước commit.

---

# 15. ERROR HANDLING

App phải xử lý ít nhất:

- Google login cancelled
- Google login failed
- no internet
- session restore error
- room load error
- booking conflict
- unauthorized action
- booking cancel error
- notification permission denied
- Supabase unavailable
- realtime reconnect/disconnect scenario cơ bản

Không show raw PostgreSQL error cho end user.

---

# 16. UX STATES

Mỗi màn hình quan trọng phải có:

- loading state,
- empty state,
- error state.

Ví dụ My Bookings trống:

```text
No upcoming reservations.
Find a room and make your first booking.
```

Search không có kết quả:

```text
No rooms found.
Try changing your search or filters.
```

---

# 17. KIỂM THỬ SAU MỖI PHASE

Sau mỗi phase phải:

1. chạy TypeScript/typecheck,
2. chạy app,
3. kiểm tra runtime errors,
4. kiểm tra flow của phase,
5. sửa lỗi trước khi đi tiếp.

Không tích lũy hàng loạt lỗi rồi mới xử lý cuối project.

---

# 18. TEST CASE BẮT BUỘC

Đọc toàn bộ test cases trong plan và thực hiện.

Đặc biệt phải test:

### Conflict Test

Hai client cùng book:

```text
same room
same date
same slot
```

Expected:

```text
active booking count = 1
```

### Realtime Test

Phone A book:

```text
Phone B tự lock slot
```

Phone A cancel:

```text
Phone B tự release slot
```

### Persistence Test

Set filter:

```text
Building A
Capacity 5–8
Projector
```

Restart app.

Expected:

```text
filters vẫn còn
```

---

# 19. GIT

Không commit kiểu:

```text
fix
fix2
final
update
done
```

Ưu tiên commit dạng:

```text
chore: initialize Expo TypeScript application

feat(auth): configure Google authentication with Supabase

feat(auth): add session restoration and protected navigation

feat(rooms): implement room discovery FlatList

feat(filters): add persistent room search and filters

feat(booking): implement room reservation flow

feat(booking): prevent duplicate active bookings

feat(realtime): synchronize booking availability

feat(qr): add booking pass QR modal

feat(notifications): schedule reservation reminders

perf(rooms): optimize FlatList rendering

docs: add project setup and architecture
```

---

# 20. KHÔNG TỰ Ý VIẾT LẠI TOÀN BỘ PROJECT

Nếu repository đã có code:

1. phân tích trước,
2. reuse phần tốt,
3. refactor phần sai,
4. chỉ rewrite khi thật sự cần thiết.

Mục tiêu là implementation ổn định, không phải thay đổi nhiều nhất có thể.

---

# 21. KHI CẦN CÀI PACKAGE

Đối với native Expo packages, ưu tiên:

```bash
npx expo install <package>
```

để giữ version tương thích Expo SDK.

Không tự ý upgrade toàn project lên version mới chỉ vì có version mới hơn.

---

# 22. KHI API / PACKAGE KHÁC VỚI KIẾN THỨC HIỆN CÓ

Nếu Supabase, Expo, Google OAuth hoặc package API đã thay đổi:

1. kiểm tra official documentation hiện tại,
2. áp dụng API tương thích version đang sử dụng,
3. không copy API cũ một cách mù quáng.

Plan mô tả **architecture và behavior bắt buộc**; syntax implementation có thể điều chỉnh theo current official API.

---

# 23. CÁCH BÁO CÁO TIẾN ĐỘ

Sau mỗi phase, báo ngắn gọn theo format:

```text
PHASE X — COMPLETED

Implemented:
- ...
- ...
- ...

Files created/changed:
- ...
- ...

Verification:
- TypeScript: PASS/FAIL
- Runtime: PASS/FAIL
- Feature tests: PASS/FAIL

Remaining issues:
- ...

Next:
PHASE X+1
```

Không cần viết giải thích dài nếu không có lỗi.

---

# 24. NẾU GẶP BLOCKER

Không dừng ngay khi gặp lỗi.

Hãy:

1. đọc error,
2. xác định root cause,
3. kiểm tra current docs nếu liên quan external API,
4. thử phương án đúng kỹ thuật,
5. verify lại.

Chỉ yêu cầu tôi can thiệp nếu blocker thực sự cần thông tin hoặc credential mà agent không thể tự có, ví dụ:

- Supabase project URL/key chưa được cung cấp,
- Google Cloud OAuth credential cần owner tạo,
- user cần thao tác dashboard thủ công,
- signing credential cần quyền của tôi.

Nếu cần tôi thao tác, hãy đưa đúng:

```text
WHERE:
menu/path cụ thể

WHAT:
giá trị cần nhập

WHY:
tại sao cần

THEN:
agent sẽ làm gì tiếp
```

Không chỉ nói chung chung kiểu:

```text
Please configure Google OAuth.
```

---

# 25. ƯU TIÊN KỸ THUẬT

Thứ tự ưu tiên:

```text
1. Correctness
2. Security
3. Required functionality
4. Realtime consistency
5. Performance
6. Maintainability
7. Visual polish
8. Optional features
```

---

# 26. KHÔNG ĐƯỢC BỎ QUA CÁC ĐIỂM SAU

Dù project có chạy UI đẹp, vẫn chưa hoàn thành nếu thiếu bất kỳ mục nào:

- Google login thật
- session restoration
- Supabase database
- RLS
- database-level double booking prevention
- realtime multi-device booking state
- Zustand
- AsyncStorage
- FlatList optimization
- QR booking pass
- local notification
- cancellation
- notification cancellation

---

# 27. FINAL ACCEPTANCE WORKFLOW

Trước khi tuyên bố project hoàn thành, chạy đầy đủ workflow:

```text
Open App
↓
Google Login
↓
Room Discovery
↓
Search
↓
Filter
↓
Open Room
↓
Select Date
↓
Select Available Slot
↓
Confirm Booking
↓
Database Insert
↓
QR Pass
↓
Notification Scheduled
↓
My Bookings
↓
Second Device Receives Realtime Lock
↓
Cancel Booking
↓
Notification Cancelled
↓
Second Device Receives Realtime Release
↓
Restart App
↓
Session Restored
↓
Filters Restored
↓
Logout
↓
LoginScreen
```

Nếu một bước fail, project chưa được xem là hoàn tất.

---

# 28. SUBMISSION OUTPUT

Sau implementation, chuẩn bị project để đáp ứng 3 deliverables:

### 1. Demo

- Android APK/development build nếu phù hợp.
- Video demo 2–3 phút.

### 2. GitHub

- public repository,
- clean architecture,
- meaningful commits,
- README đầy đủ,
- không có secret.

### 3. Technical Report

Chuẩn bị thông tin/screenshots cần thiết cho PDF 2–4 trang:

- features,
- architecture,
- screenshots,
- database design,
- conflict prevention,
- realtime,
- FlatList optimization,
- notification,
- QR.

---

# 29. NGUYÊN TẮC CUỐI CÙNG

**Không chỉ tạo skeleton hoặc mockup.**

Tôi cần một application hoạt động end-to-end.

Đừng dừng ở:

```text
UI completed
```

nếu:

```text
database chưa chạy
Google login chưa chạy
realtime chưa chạy
notifications chưa chạy
conflict protection chưa chạy
```

Đọc kỹ toàn bộ file:

`ANTIGRAVITY_IMPLEMENTATION_PLAN_VKU_STUDY_ROOM.md`

sau đó thực hiện project **phase by phase cho đến khi đạt Definition of Done và Acceptance Criteria đã quy định trong file**.

Bắt đầu bằng:

1. đọc toàn bộ implementation plan,
2. audit repository,
3. báo cáo ngắn current project status,
4. bắt đầu **PHASE 0**,
5. tiếp tục tuần tự sang các phase sau.

Không thay đổi scope hoặc architecture chính nếu chưa có lý do kỹ thuật rõ ràng.
