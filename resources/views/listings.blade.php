@extends('layouts.app')

@section('title', $title . ' | Condo Finder')

@section('content')
<section class="hero-sub">
    <div class="container">
        <div class="eyebrow">{{ $type === 'rent' ? 'Rent Condo' : 'Buy Condo' }}</div>
        <h1>{{ $title }}</h1>
        <p>{{ $subtitle }}</p>
    </div>
</section>

<section class="section">
    <div class="container">
        <form class="search-panel inline-search" method="get">
            <div class="search-grid listing-search">
                <div>
                    <label>⌖ คำค้นหา</label>
                    <input name="location" value="{{ request('location') }}" placeholder="ทำเลหรือชื่อโครงการ">
                </div>
                <div>
                    <label>▤ ช่วงราคา</label>
                    <select name="price_range">
                        <option value="">ทุกช่วงราคา</option>
                        <option value="0-5000000" @selected(request('price_range') === '0-5000000')>ไม่เกิน 5 ล้าน</option>
                        <option value="5000000-8000000" @selected(request('price_range') === '5000000-8000000')>5 - 8 ล้าน</option>
                        <option value="8000000+" @selected(request('price_range') === '8000000+')>8 ล้านขึ้นไป</option>
                    </select>
                </div>
                <div>
                    <label>▣ ห้องนอน</label>
                    <select name="bedrooms">
                        <option value="">ทั้งหมด</option>
                        @foreach([1, 2, 3] as $bed)
                            <option value="{{ $bed }}" @selected(request('bedrooms') == $bed)>{{ $bed >= 3 ? '3 ห้องนอนขึ้นไป' : $bed . ' ห้องนอน' }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label>↕ เรียงตาม</label>
                    <select name="sort">
                        <option value="">แนะนำ</option>
                        <option value="price-low" @selected(request('sort') === 'price-low')>ราคาต่ำไปสูง</option>
                        <option value="price-high" @selected(request('sort') === 'price-high')>ราคาสูงไปต่ำ</option>
                    </select>
                </div>
                <button class="btn search-btn" type="submit">⌕ ค้นหา</button>
            </div>
        </form>

        <div class="grid">
            @forelse($properties as $property)
                @include('partials.property-card', ['property' => $property])
            @empty
                <div class="empty-state">
                    <h3>ยังไม่พบประกาศที่ตรงกับเงื่อนไข</h3>
                    <p class="muted">ลองเปลี่ยนทำเล ช่วงราคา หรือจำนวนห้องนอนอีกครั้ง</p>
                </div>
            @endforelse
        </div>
    </div>
</section>
@endsection
