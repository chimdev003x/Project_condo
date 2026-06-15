<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        DB::table('packages')->upsert([
            ['id' => 'free', 'name' => 'เริ่มต้น', 'price' => 0, 'listings_limit' => 1, 'duration_days' => 7, 'image_limit' => 5, 'is_premium' => false, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 'standard', 'name' => 'มาตรฐาน', 'price' => 299, 'listings_limit' => 5, 'duration_days' => 30, 'image_limit' => 15, 'is_premium' => false, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 'premium', 'name' => 'พรีเมียม', 'price' => 599, 'listings_limit' => 15, 'duration_days' => 60, 'image_limit' => 30, 'is_premium' => true, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ], ['id']);

        DB::table('package_features')->insertOrIgnore([
            ['package_id' => 'free', 'feature' => 'ลงประกาศได้ 1 รายการ', 'sort_order' => 1],
            ['package_id' => 'free', 'feature' => 'แสดงผล 7 วัน', 'sort_order' => 2],
            ['package_id' => 'free', 'feature' => 'อัปโหลดรูปได้ 5 รูป', 'sort_order' => 3],
            ['package_id' => 'standard', 'feature' => 'ลงประกาศได้ 5 รายการ', 'sort_order' => 1],
            ['package_id' => 'standard', 'feature' => 'แสดงผล 30 วัน', 'sort_order' => 2],
            ['package_id' => 'standard', 'feature' => 'อัปโหลดรูปได้ 15 รูป', 'sort_order' => 3],
            ['package_id' => 'standard', 'feature' => 'มี Badge แนะนำ', 'sort_order' => 4],
            ['package_id' => 'premium', 'feature' => 'ลงประกาศได้ 15 รายการ', 'sort_order' => 1],
            ['package_id' => 'premium', 'feature' => 'แสดงผล 60 วัน', 'sort_order' => 2],
            ['package_id' => 'premium', 'feature' => 'ดันประกาศขึ้นด้านบน', 'sort_order' => 3],
            ['package_id' => 'premium', 'feature' => 'มี Badge ประกาศพรีเมียม', 'sort_order' => 4],
        ]);

        DB::table('projects')->upsert([
            ['id' => 'p1', 'name' => 'The Line Sukhumvit 101', 'developer' => 'Sansiri', 'location' => 'สุขุมวิท 101', 'starting_price' => 4200000, 'status' => 'Ready to move', 'image_url' => 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', 'description' => 'โครงการพร้อมอยู่ ใกล้ BTS ปุณณวิถี พร้อมพื้นที่ส่วนกลางครบ', 'created_at' => $now, 'updated_at' => $now],
            ['id' => 'p2', 'name' => 'Life Asoke Rama 9', 'developer' => 'AP Thailand', 'location' => 'พระราม 9', 'starting_price' => 4800000, 'status' => 'Ready to move', 'image_url' => 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80', 'description' => 'คอนโดใจกลาง New CBD เชื่อมต่อ MRT และแหล่งงานสำคัญ', 'created_at' => $now, 'updated_at' => $now],
            ['id' => 'p3', 'name' => 'Origin Plug & Play Ramintra', 'developer' => 'Origin Property', 'location' => 'รามอินทรา', 'starting_price' => 2990000, 'status' => 'Under construction', 'image_url' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'description' => 'โครงการใหม่พร้อมฟังก์ชันสำหรับคนทำงานยุคใหม่', 'created_at' => $now, 'updated_at' => $now],
        ], ['id']);

        DB::table('properties')->upsert([
            ['id' => '1', 'project_id' => 'p1', 'title' => 'ห้องวิวเมือง แต่งครบ ใกล้ BTS ปุณณวิถี', 'project_name' => 'The Line Sukhumvit 101', 'location' => 'สุขุมวิท', 'price' => 4500000, 'type' => 'sell', 'bedrooms' => 1, 'bathrooms' => 1, 'area' => 32, 'floor' => 24, 'description' => 'คอนโดพร้อมอยู่ เดินทางสะดวก เหมาะสำหรับอยู่อาศัยและลงทุนปล่อยเช่า', 'contact_name' => 'คุณสมชาย', 'contact_phone' => '081-234-5678', 'contact_line' => null, 'badge' => 'แนะนำ', 'is_promoted' => true, 'is_published' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => '2', 'project_id' => 'p2', 'title' => 'ห้องมุม New CBD พร้อมเฟอร์นิเจอร์', 'project_name' => 'Life Asoke Rama 9', 'location' => 'พระราม 9', 'price' => 5200000, 'type' => 'sell', 'bedrooms' => 1, 'bathrooms' => 1, 'area' => 35, 'floor' => 31, 'description' => 'ทำเลศูนย์กลางธุรกิจใหม่ ใกล้ MRT พระราม 9 และห้างหลักของย่าน', 'contact_name' => 'คุณวิไล', 'contact_phone' => '089-876-5432', 'contact_line' => null, 'badge' => 'ขาย', 'is_promoted' => false, 'is_published' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => '3', 'project_id' => null, 'title' => 'ให้เช่าห้องวิวแม่น้ำ ชั้นสูง พร้อมเข้าอยู่', 'project_name' => 'Rhythm Sathorn', 'location' => 'สาทร', 'price' => 25000, 'type' => 'rent', 'bedrooms' => 1, 'bathrooms' => 1, 'area' => 38, 'floor' => 29, 'description' => 'ห้องตกแต่งครบ วิวแม่น้ำ เดินทางสะดวก ใกล้ BTS สะพานตากสิน', 'contact_name' => 'Agent Nan', 'contact_phone' => '083-456-7890', 'contact_line' => null, 'badge' => 'เช่าดี', 'is_promoted' => false, 'is_published' => true, 'created_at' => $now, 'updated_at' => $now],
        ], ['id']);

        DB::table('property_images')->insertOrIgnore([
            ['property_id' => '1', 'image_url' => 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', 'alt_text' => 'Condo exterior', 'sort_order' => 1],
            ['property_id' => '2', 'image_url' => 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80', 'alt_text' => 'Bright bedroom', 'sort_order' => 1],
            ['property_id' => '3', 'image_url' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', 'alt_text' => 'Rental room', 'sort_order' => 1],
        ]);

        DB::table('property_amenities')->insertOrIgnore([
            ['property_id' => '1', 'amenity' => 'สระว่ายน้ำ'], ['property_id' => '1', 'amenity' => 'ฟิตเนส'], ['property_id' => '1', 'amenity' => 'Co-working space'],
            ['property_id' => '2', 'amenity' => 'Sky Lounge'], ['property_id' => '2', 'amenity' => 'สระว่ายน้ำ'], ['property_id' => '2', 'amenity' => 'ฟิตเนส'],
            ['property_id' => '3', 'amenity' => 'สระว่ายน้ำดาดฟ้า'], ['property_id' => '3', 'amenity' => 'Sky Garden'], ['property_id' => '3', 'amenity' => 'ฟิตเนส'],
        ]);

        DB::table('property_nearby_places')->insertOrIgnore([
            ['property_id' => '1', 'place_name' => 'BTS ปุณณวิถี'], ['property_id' => '1', 'place_name' => 'True Digital Park'],
            ['property_id' => '2', 'place_name' => 'MRT พระราม 9'], ['property_id' => '2', 'place_name' => 'Central Rama 9'],
            ['property_id' => '3', 'place_name' => 'BTS สะพานตากสิน'], ['property_id' => '3', 'place_name' => 'ICONSIAM'],
        ]);

        DB::table('blogs')->upsert([
            ['id' => 'b1', 'title' => 'วิธีเลือกคอนโดใกล้รถไฟฟ้าให้คุ้มค่า', 'slug' => 'choose-condo-near-train', 'excerpt' => 'เช็กลิสต์เรื่องทำเล ระยะเดิน และค่าใช้จ่ายที่ควรรู้ก่อนตัดสินใจ', 'category' => 'ความรู้เรื่องคอนโด', 'published_date' => '2026-06-10', 'image_url' => 'https://images.unsplash.com/photo-1449156001533-cb39c7324c60?auto=format&fit=crop&w=1200&q=80', 'content' => 'เริ่มจากกำหนดเส้นทางเดินทางประจำวัน แล้วเปรียบเทียบราคาเฉลี่ยของแต่ละสถานี', 'is_published' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 'b2', 'title' => 'ซื้อคอนโดปล่อยเช่า ยังน่าสนใจไหม', 'slug' => 'condo-rental-investment', 'excerpt' => 'มองผลตอบแทนจากค่าเช่า อัตราว่าง และค่าใช้จ่ายระยะยาวแบบเข้าใจง่าย', 'category' => 'การลงทุน', 'published_date' => '2026-06-05', 'image_url' => 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80', 'content' => 'ทำเลใกล้รถไฟฟ้าและแหล่งงานยังเป็นปัจจัยสำคัญในการปล่อยเช่า', 'is_published' => true, 'created_at' => $now, 'updated_at' => $now],
        ], ['id']);
    }
}
