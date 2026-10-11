-- ========================================================
-- VKU Real-time Study Room Booking App - Seed Data
-- ========================================================

-- Clean up existing room data for fresh seed (in dev)
-- truncate table public.rooms cascade;

insert into public.rooms (code, name, building, floor, capacity, equipment, image_url) values
-- Building A
('A101', 'Phòng Thảo luận A101', 'A', 1, 4, array['whiteboard', 'ac'], 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800'),
('A201', 'Phòng Tự học A201', 'A', 2, 8, array['projector', 'whiteboard', 'ac'], 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'),
('A202', 'Phòng Nhóm A202', 'A', 2, 6, array['whiteboard', 'ac'], 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800'),
('A301', 'Lab Đa phương tiện A301', 'A', 3, 16, array['projector', 'high_spec_pc', 'ac'], 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800'),
('A302', 'Phòng Hội thảo nhỏ A302', 'A', 3, 12, array['projector', 'whiteboard', 'ac'], 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800'),
('A401', 'Phòng Dự án sinh viên A401', 'A', 4, 10, array['projector', 'whiteboard', 'high_spec_pc', 'ac'], 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'),

-- Building B
('B102', 'Phòng Học nhóm B102', 'B', 1, 4, array['whiteboard'], 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800'),
('B201', 'Phòng Sáng tạo B201', 'B', 2, 8, array['projector', 'whiteboard', 'ac'], 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'),
('B203', 'Phòng Tự học yên tĩnh B203', 'B', 2, 6, array['whiteboard', 'ac'], 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'),
('B305', 'Computer Lab B305', 'B', 3, 20, array['high_spec_pc', 'projector', 'ac'], 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800'),
('B401', 'Phòng Nghiên cứu AI B401', 'B', 4, 12, array['high_spec_pc', 'projector', 'whiteboard', 'ac'], 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'),
('B402', 'Phòng Seminar B402', 'B', 4, 15, array['projector', 'whiteboard', 'ac'], 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'),

-- Building C
('C101', 'Không gian Co-working C101', 'C', 1, 16, array['projector', 'whiteboard', 'ac'], 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800'),
('C201', 'Phòng Họp nhóm C201', 'C', 2, 6, array['whiteboard', 'ac'], 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800'),
('C202', 'Phòng Tự học C202', 'C', 2, 8, array['projector', 'whiteboard', 'ac'], 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'),
('C301', 'Lab Mạng và IoT C301', 'C', 3, 18, array['high_spec_pc', 'projector', 'ac'], 'https://images.unsplash.com/photo-1562774053-701939374585?w=800'),
('C302', 'Phòng Báo cáo C302', 'C', 3, 10, array['projector', 'whiteboard', 'ac'], 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'),
('C405', 'Phòng Ý tưởng khởi nghiệp C405', 'C', 4, 8, array['whiteboard', 'ac'], 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800'),

-- Building V
('V101', 'Phòng Đọc và tra cứu V101', 'V', 1, 14, array['whiteboard', 'ac'], 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800'),
('V201', 'Phòng Lab thiết kế đồ họa V201', 'V', 2, 16, array['high_spec_pc', 'projector', 'ac'], 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800'),
('V204', 'Phòng Thảo luận chuyên đề V204', 'V', 2, 8, array['projector', 'whiteboard', 'ac'], 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800'),
('V301', 'Phòng Học nhóm V301', 'V', 3, 4, array['whiteboard', 'ac'], 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'),
('V302', 'Phòng Nghiên cứu khoa học V302', 'V', 3, 10, array['projector', 'high_spec_pc', 'whiteboard', 'ac'], 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'),
('V401', 'Hội trường mini V401', 'V', 4, 20, array['projector', 'whiteboard', 'ac'], 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800')
on conflict (code) do update set
  name = excluded.name,
  building = excluded.building,
  floor = excluded.floor,
  capacity = excluded.capacity,
  equipment = excluded.equipment,
  image_url = excluded.image_url;
