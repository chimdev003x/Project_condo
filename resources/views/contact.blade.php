@extends('layouts.app')

@section('title', 'ติดต่อเรา | Condo Finder')

@section('content')
<section class="hero-sub"><div class="container"><div class="eyebrow">Contact</div><h1>ติดต่อเรา</h1><p>ฝากข้อมูลให้ทีมงาน Condo Finder ติดต่อกลับ</p></div></section>
<section class="section"><div class="container"><form class="card" style="padding: 24px; max-width: 720px" method="post" action="/api/inquiries">@csrf<label>ชื่อ</label><input name="full_name" required><label>อีเมล</label><input name="email" type="email"><label>เบอร์โทร</label><input name="phone" required><label>ข้อความ</label><textarea name="message"></textarea><p><button class="btn" type="submit">ส่งข้อความ</button></p></form></div></section>
@endsection
