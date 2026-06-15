@extends('layouts.app')

@section('title', $property->title . ' | Condo Finder')

@section('content')
<section class="property-hero">
    <div class="container property-hero-grid">
        <div>
            <div class="eyebrow">Property Detail</div>
            <h1>{{ $property->title }}</h1>
            <p>{{ $property->project_name }} · {{ $property->location }}</p>
            <div class="detail-chips">
                <span>{{ $property->type === 'rent' ? 'ให้เช่า' : 'ขาย' }}</span>
                <span>{{ $property->bedrooms }} ห้องนอน</span>
                <span>{{ number_format($property->area) }} ตร.ม.</span>
            </div>
        </div>
        <aside class="price-panel">
            <span class="badge">{{ $property->badge }}</span>
            <div class="price">{{ number_format($property->price) }} {{ $property->type === 'rent' ? 'บาท/เดือน' : 'บาท' }}</div>
            <a class="btn" href="{{ route('contact') }}">สอบถามรายการนี้</a>
        </aside>
    </div>
</section>

<section class="section property-detail">
    <div class="container">
        <div class="detail-grid">
            <div>
                <div class="card media-card">
                    <img src="{{ $property->cover_image }}" alt="{{ $property->title }}">
                </div>

                <div class="card detail-copy">
                    <div class="card-body">
                        <h2>รายละเอียดรายการ</h2>
                        <p>{{ $property->description }}</p>
                        <div class="spec-grid">
                            <div><strong>{{ $property->bedrooms }}</strong><span>ห้องนอน</span></div>
                            <div><strong>{{ $property->bathrooms }}</strong><span>ห้องน้ำ</span></div>
                            <div><strong>{{ number_format($property->area) }}</strong><span>ตร.ม.</span></div>
                            <div><strong>{{ $property->floor ?: '-' }}</strong><span>ชั้น</span></div>
                        </div>
                    </div>
                </div>

                <div class="detail-grid two compact-detail">
                    <div class="card">
                        <div class="card-body">
                            <h3>สิ่งอำนวยความสะดวก</h3>
                            <p class="muted">{{ $amenities->join(' · ') ?: 'ยังไม่มีข้อมูล' }}</p>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h3>สถานที่ใกล้เคียง</h3>
                            <p class="muted">{{ $nearby->join(' · ') ?: 'ยังไม่มีข้อมูล' }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <aside class="card contact-card">
                <div class="card-body">
                    <h2>ติดต่อผู้ประกาศ</h2>
                    <p class="muted">สนใจรายการนี้ ติดต่อผู้ประกาศโดยตรง หรือส่งข้อความให้ทีมงานช่วยประสานงาน</p>
                    <div class="agent-box">
                        <strong>{{ $property->contact_name }}</strong>
                        <span>{{ $property->contact_phone }}</span>
                    </div>
                    <a class="btn" href="tel:{{ $property->contact_phone }}">โทรเลย</a>
                    <a class="btn outline" href="{{ route('contact') }}">ส่งข้อความ</a>
                </div>
            </aside>
        </div>
    </div>
</section>
@endsection
