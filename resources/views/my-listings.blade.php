@extends('layouts.app')

@section('title', 'ประกาศของฉัน | Condo Finder')

@section('content')
<section class="hero-sub">
    <div class="container">
        <div class="eyebrow">My Listings</div>
        <h1>ประกาศของฉัน</h1>
        <p>ตรวจสอบรายการที่คุณลงประกาศไว้ใน Condo Finder</p>
    </div>
</section>

<section class="section">
    <div class="container">
        <div class="section-head">
            <div>
                <h2>รายการประกาศ</h2>
                <p class="muted">บัญชี Demo มีข้อมูลตัวอย่างให้ทดสอบ: owner@example.com / password123</p>
            </div>
            <a class="btn" href="{{ route('post-property') }}">+ ลงประกาศใหม่</a>
        </div>

        <div class="grid">
            @forelse($properties as $property)
                @include('partials.property-card', ['property' => $property])
            @empty
                <div class="empty-state">
                    <h3>ยังไม่มีประกาศ</h3>
                    <p class="muted">เลือกแพ็กเกจและเริ่มลงประกาศแรกของคุณได้ทันที</p>
                </div>
            @endforelse
        </div>
    </div>
</section>
@endsection
