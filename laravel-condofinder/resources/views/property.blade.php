@extends('layouts.app')

@section('title', $property->title . ' | Condo Finder')

@section('content')
<section class="section">
    <div class="container">
        <div class="grid" style="grid-template-columns: 1.3fr .7fr">
            <div class="card">
                <img src="{{ $property->cover_image }}" alt="{{ $property->title }}" style="height: 460px">
            </div>
            <aside class="card">
                <div class="card-body">
                    <span class="badge">{{ $property->badge }}</span>
                    <h2>{{ $property->title }}</h2>
                    <div class="price">{{ number_format($property->price) }} {{ $property->type === 'rent' ? 'บาท/เดือน' : 'บาท' }}</div>
                    <p class="muted">{{ $property->project_name }} · {{ $property->location }}</p>
                    <div class="meta">
                        <span>{{ $property->bedrooms }} ห้องนอน</span>
                        <span>{{ $property->bathrooms }} ห้องน้ำ</span>
                        <span>{{ number_format($property->area) }} ตร.ม.</span>
                        <span>ชั้น {{ $property->floor }}</span>
                    </div>
                    <hr>
                    <p>{{ $property->description }}</p>
                    <h3>ติดต่อ</h3>
                    <p>{{ $property->contact_name }}<br>{{ $property->contact_phone }}</p>
                </div>
            </aside>
        </div>

        <div class="grid" style="margin-top: 24px; grid-template-columns: 1fr 1fr">
            <div class="card"><div class="card-body"><h3>สิ่งอำนวยความสะดวก</h3><p class="muted">{{ $amenities->join(' · ') }}</p></div></div>
            <div class="card"><div class="card-body"><h3>สถานที่ใกล้เคียง</h3><p class="muted">{{ $nearby->join(' · ') }}</p></div></div>
        </div>
    </div>
</section>
@endsection
