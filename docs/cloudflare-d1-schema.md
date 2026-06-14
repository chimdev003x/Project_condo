# Cloudflare D1 Schema

ฐานข้อมูลสำหรับโปรเจกต์ Condo Finder ใช้ Cloudflare D1 ชื่อแนะนำ `condo-finder-db` และ binding แนะนำ `DB`

## ตารางหลัก

- `properties`: ประกาศขาย/เช่าคอนโด
- `property_images`: รูปภาพของประกาศ
- `property_amenities`: สิ่งอำนวยความสะดวกของประกาศ
- `property_nearby_places`: สถานที่ใกล้เคียง
- `projects`: โครงการคอนโดใหม่
- `packages`: แพ็กเกจลงประกาศ
- `package_features`: รายละเอียด feature ของแต่ละแพ็กเกจ
- `users`: ผู้ใช้ เจ้าของประกาศ เอเจนต์ และแอดมิน
- `blogs`: บทความ
- `favorites`: รายการโปรดของผู้ใช้
- `inquiries`: ข้อความติดต่อ/สอบถามประกาศหรือโครงการ

## คำสั่งใช้งานกับ Wrangler

ติดตั้ง/เรียก Wrangler:

```bash
npx wrangler login
npx wrangler d1 create condo-finder-db
```

นำ `database_id` ที่ได้ไปใส่ใน `wrangler.toml` โดยคัดลอกจาก `wrangler.example.toml`

Apply schema:

```bash
npx wrangler d1 migrations apply condo-finder-db --remote
```

ทดสอบ query:

```bash
npx wrangler d1 execute condo-finder-db --remote --command "SELECT id, title, price, type FROM properties LIMIT 5;"
```

## รัน API และเว็บในเครื่อง

เปิด terminal แรกสำหรับ Worker API:

```bash
npm run worker:dev
```

เปิด terminal ที่สองสำหรับ Angular:

```bash
npm start
```

`npm start` ใช้ `proxy.conf.json` เพื่อส่ง request `/api` ไปที่ `http://127.0.0.1:8787`

ทดสอบ API:

```bash
curl http://127.0.0.1:8787/api/health
curl "http://127.0.0.1:8787/api/properties?type=sell"
```

## Deploy Worker

บัญชี Cloudflare ต้องตั้ง Workers subdomain ครั้งแรกก่อน deploy ไป `workers.dev`:

https://dash.cloudflare.com/044e1cfd0b5cc63030e0f77917f625ce/workers/onboarding

หลังตั้ง subdomain แล้ว deploy:

```bash
npm run worker:deploy
```

## Query ที่หน้าเว็บน่าจะใช้

ค้นหาประกาศขาย:

```sql
SELECT
  p.*,
  (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY sort_order LIMIT 1) AS cover_image
FROM properties p
WHERE p.is_published = 1
  AND p.type = 'sell'
  AND p.location LIKE '%' || ? || '%'
  AND p.price BETWEEN ? AND ?
ORDER BY p.is_promoted DESC, p.created_at DESC;
```

ดึงรายละเอียดประกาศ:

```sql
SELECT * FROM properties WHERE id = ?;
SELECT image_url, alt_text FROM property_images WHERE property_id = ? ORDER BY sort_order;
SELECT amenity FROM property_amenities WHERE property_id = ?;
SELECT place_name FROM property_nearby_places WHERE property_id = ?;
```
