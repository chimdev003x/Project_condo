# Condo Finder Laravel

เว็บประกาศซื้อ/เช่าคอนโดเวอร์ชัน Laravel ใช้ Blade + SQLite สำหรับพัฒนาในเครื่อง

## Requirements

- PHP 8.4+
- Composer

## Run Locally

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

เปิดเว็บ:

```text
http://127.0.0.1:8000
```

บัญชีทดสอบ:

```text
owner@example.com
password123
```

## Pages

- `/` หน้าแรก
- `/buy` ซื้อคอนโด
- `/rent` เช่าคอนโด
- `/properties/{id}` รายละเอียดประกาศ
- `/projects` โครงการใหม่
- `/packages` แพ็กเกจ
- `/post-property` ลงประกาศ
- `/my-listings` ประกาศของฉัน
- `/account` บัญชีของฉัน
- `/login` เข้าสู่ระบบ
- `/register` สมัครสมาชิก
- `/blog` บทความ
- `/contact` ติดต่อเรา

## API

- `GET /api/health`
- `GET /api/properties`
- `GET /api/properties/{id}`
- `GET /api/projects`
- `GET /api/packages`
- `GET /api/blogs`
- `POST /api/inquiries`

## Tests

```bash
php artisan test
vendor/bin/pint --test
```
