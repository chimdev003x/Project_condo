@extends('layouts.app')

@section('title', 'บัญชีของฉัน | Condo Finder')

@section('content')
<section class="hero-sub">
    <div class="container">
        <div class="eyebrow">Account</div>
        <h1>บัญชีของฉัน</h1>
        <p>จัดการข้อมูลสมาชิกและแพ็กเกจที่เลือกใช้งาน</p>
    </div>
</section>

<section class="section">
    <div class="container account-grid">
        <div class="card">
            <div class="card-body">
                <h2>ข้อมูลสมาชิก</h2>
                <p class="muted">ชื่อ: {{ Auth::user()->name }}</p>
                <p class="muted">อีเมล: {{ Auth::user()->email }}</p>
            </div>
        </div>
        <div class="card">
            <div class="card-body">
                <h2>แพ็กเกจปัจจุบัน</h2>
                @if($package)
                    <div class="price">{{ $package->name }}</div>
                    <p class="muted">ลงได้ {{ $package->listings_limit }} รายการ · {{ $package->duration_days }} วัน · รูป {{ $package->image_limit }} รูป</p>
                @else
                    <p class="muted">ยังไม่ได้เลือกแพ็กเกจ</p>
                    <a class="btn" href="{{ route('packages') }}">เลือกแพ็กเกจ</a>
                @endif
            </div>
        </div>
    </div>
</section>
@endsection
