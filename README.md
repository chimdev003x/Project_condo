# Condo Finder

โปรเจกต์เว็บประกาศซื้อ/เช่าคอนโด มีทั้งเวอร์ชันเดิม Angular และเวอร์ชันใหม่ Laravel

## Laravel version

Laravel app อยู่ในโฟลเดอร์:

```bash
laravel-condofinder
```

รัน local:

```bash
cd laravel-condofinder
php artisan serve
```

เปิดเว็บ:

```text
http://127.0.0.1:8000
```

รีเซ็ตฐานข้อมูล SQLite และใส่ข้อมูลตัวอย่าง:

```bash
php artisan migrate:fresh --seed
```

API ตัวอย่าง:

```text
GET /api/health
GET /api/properties
GET /api/projects
GET /api/packages
GET /api/blogs
POST /api/inquiries
```

## Angular version

โค้ด Angular เดิมยังอยู่ที่ `src/` เพื่อใช้เทียบหน้าตาและย้าย feature เพิ่มเติมต่อได้

```bash
npm start
```

## Cloudflare

เอกสาร Cloudflare เดิมอยู่ที่:

```bash
docs/cloudflare-deployment.md
docs/cloudflare-d1-schema.md
```
