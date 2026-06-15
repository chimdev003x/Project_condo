@extends('layouts.app')

@section('title', $property->title . ' | Condo Finder')

@section('content')
<section class="section property-detail">
    <div class="container">
        <div class="detail-grid">
            <div class="card media-card">
                <img src="{{ $property->cover_image }}" alt="{{ $property->title }}">
            </div>
            <aside class="card">
                <div class="card-body">
                    <span class="badge">{{ $property->badge }}</span>
                    <h2>{{ $property->title }}</h2>
                    <div class="price">{{ number_format($property->price) }} {{ $property->type === 'rent' ? 'บาท/เดือน' : 'บาท' }}</div>
                    <p class="muted">{{ $property->project_name }} · {{ $property->location }}</p>
                    <div class="meta detail-meta">
                        <span>▣ {{ $property->bedrooms }} ห้องนอน</span>
                        <span>▤ {{ $property->bathrooms }} ห้องน้ำ</span>
                        <span>□ {{ number_format($property->area) }} ตร.ม.</span>
                        @if($property->floor)
                            <span>↑ ชั้น {{ $property->floor }}</span>
                        @endif
                    </div>
                    <hr>
                    <p>{{ $property->description }}</p>
                    <h3>ติดต่อ</h3>
                    <p>{{ $property->contact_name }}<br>{{ $property->contact_phone }}</p>
                    <a class="btn" href="{{ route('contact') }}">สอบถามประกาศนี้</a>
                </div>
            </aside>
        </div>

        <div class="detail-grid two" style="margin-top: 24px">
            <div class="card"><div class="card-body"><h3>สิ่งอำนวยความสะดวก</h3><p class="muted">{{ $amenities->join(' · ') ?: 'ยังไม่มีข้อมูล' }}</p></div></div>
            <div class="card"><div class="card-body"><h3>สถานที่ใกล้เคียง</h3><p class="muted">{{ $nearby->join(' · ') ?: 'ยังไม่มีข้อมูล' }}</p></div></div>
        </div>
    </div>
</section>
@endsection
