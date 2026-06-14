INSERT OR IGNORE INTO packages (id, name, price, listings_limit, duration_days, image_limit, is_premium) VALUES
  ('free', 'เริ่มต้น', 0, 1, 7, 5, 0),
  ('standard', 'มาตรฐาน', 299, 5, 30, 15, 0),
  ('premium', 'พรีเมียม', 599, 15, 60, 30, 1);

INSERT OR IGNORE INTO package_features (package_id, feature, sort_order) VALUES
  ('free', 'ลงประกาศได้ 1 รายการ', 1),
  ('free', 'แสดงผล 7 วัน', 2),
  ('free', 'อัปโหลดรูปได้ 5 รูป', 3),
  ('standard', 'ลงประกาศได้ 5 รายการ', 1),
  ('standard', 'แสดงผล 30 วัน', 2),
  ('standard', 'อัปโหลดรูปได้ 15 รูป', 3),
  ('standard', 'มี Badge แนะนำ', 4),
  ('premium', 'ลงประกาศได้ 15 รายการ', 1),
  ('premium', 'แสดงผล 60 วัน', 2),
  ('premium', 'ดันประกาศขึ้นด้านบน', 3),
  ('premium', 'มี Badge ประกาศพรีเมียม', 4);

INSERT OR IGNORE INTO projects (id, name, developer, location, starting_price, status, image_url, description) VALUES
  ('p1', 'The Line Sukhumvit 101', 'Sansiri', 'สุขุมวิท 101', 4200000, 'Ready to move', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80', 'โครงการพร้อมอยู่ ใกล้ BTS ปุณณวิถี พร้อมพื้นที่ส่วนกลางครบ'),
  ('p2', 'Life Asoke Rama 9', 'AP Thailand', 'พระราม 9', 4800000, 'Ready to move', 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80', 'คอนโดใจกลาง New CBD เชื่อมต่อ MRT และแหล่งงานสำคัญ'),
  ('p3', 'Origin Plug & Play Ramintra', 'Origin Property', 'รามอินทรา', 2990000, 'Under construction', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80', 'โครงการใหม่พร้อมฟังก์ชันสำหรับคนทำงานยุคใหม่');

INSERT OR IGNORE INTO users (id, full_name, email, phone, role, package_id, listings_count) VALUES
  ('u1', 'คุณสมชาย', 'owner@example.com', '081-234-5678', 'Owner', 'premium', 2),
  ('u2', 'Agent Nan', 'agent@example.com', '083-456-7890', 'Agent', 'standard', 1);

INSERT OR IGNORE INTO properties (
  id, owner_user_id, project_id, title, project_name, location, price, type,
  bedrooms, bathrooms, area, floor, description, contact_name, contact_phone,
  badge, is_promoted
) VALUES
  ('1', 'u1', 'p1', 'ห้องวิวเมือง แต่งครบ ใกล้ BTS ปุณณวิถี', 'The Line Sukhumvit 101', 'สุขุมวิท', 4500000, 'sell', 1, 1, 32, 24, 'คอนโดพร้อมอยู่ เดินทางสะดวก ใกล้ BTS ปุณณวิถี เหมาะสำหรับอยู่อาศัยและลงทุนปล่อยเช่า', 'คุณสมชาย', '081-234-5678', 'แนะนำ', 1),
  ('2', 'u1', 'p2', 'ห้องมุม New CBD พร้อมเฟอร์นิเจอร์', 'Life Asoke Rama 9', 'พระราม 9', 5200000, 'sell', 1, 1, 35, 31, 'ทำเลศูนย์กลางธุรกิจใหม่ ใกล้ MRT พระราม 9 และห้างหลักของย่าน', 'คุณวิไล', '089-876-5432', 'ขาย', 0),
  ('3', 'u2', NULL, 'ให้เช่าห้องวิวแม่น้ำ ชั้นสูง พร้อมเข้าอยู่', 'Rhythm Sathorn', 'สาทร', 25000, 'rent', 1, 1, 38, 29, 'ห้องตกแต่งครบ วิวแม่น้ำ เดินทางสะดวก ใกล้ BTS สะพานตากสิน', 'Agent Nan', '083-456-7890', 'เช่าดี', 0);

INSERT OR IGNORE INTO property_images (property_id, image_url, alt_text, sort_order) VALUES
  ('1', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80', 'The Line Sukhumvit 101 exterior', 1),
  ('2', 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80', 'Life Asoke Rama 9 bedroom', 1),
  ('3', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80', 'Rhythm Sathorn room', 1);

INSERT OR IGNORE INTO property_amenities (property_id, amenity) VALUES
  ('1', 'สระว่ายน้ำ'), ('1', 'ฟิตเนส'), ('1', 'Co-working space'),
  ('2', 'Sky Lounge'), ('2', 'สระว่ายน้ำ'), ('2', 'ฟิตเนส'),
  ('3', 'สระว่ายน้ำดาดฟ้า'), ('3', 'Sky Garden'), ('3', 'ฟิตเนส');

INSERT OR IGNORE INTO property_nearby_places (property_id, place_name) VALUES
  ('1', 'BTS ปุณณวิถี'), ('1', 'True Digital Park'),
  ('2', 'MRT พระราม 9'), ('2', 'Central Rama 9'),
  ('3', 'BTS สะพานตากสิน'), ('3', 'ICONSIAM');

INSERT OR IGNORE INTO blogs (id, title, slug, excerpt, category, published_date, image_url, content) VALUES
  ('b1', 'วิธีเลือกคอนโดใกล้รถไฟฟ้าให้คุ้มค่า', 'choose-condo-near-train', 'เช็กลิสต์เรื่องทำเล ระยะเดิน และค่าใช้จ่ายที่ควรรู้ก่อนตัดสินใจ', 'ความรู้เรื่องคอนโด', '2026-06-10', 'https://images.unsplash.com/photo-1449156001533-cb39c7324c60?auto=format&fit=crop&w=900&q=80', 'เริ่มจากกำหนดเส้นทางเดินทางประจำวัน แล้วเปรียบเทียบราคาเฉลี่ยของแต่ละสถานี'),
  ('b2', 'ซื้อคอนโดปล่อยเช่า ยังน่าสนใจไหม', 'condo-rental-investment', 'มองผลตอบแทนจากค่าเช่า อัตราว่าง และค่าใช้จ่ายระยะยาวแบบเข้าใจง่าย', 'การลงทุน', '2026-06-05', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80', 'ทำเลใกล้รถไฟฟ้าและแหล่งงานยังเป็นปัจจัยสำคัญในการปล่อยเช่า');
