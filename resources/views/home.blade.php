@extends('layouts.app')

@section('title', 'Condo Finder | ค้นหาคอนโดที่ใช่')

@section('content')
<section class="hero">
    <div class="container hero-content">
        <div class="eyebrow">Condo Finder | ชี้เป้าคอนโดเด็ด</div>
        <h1>ค้นหาคอนโดที่ใช่<br>ในทำเลที่คุณต้องการ</h1>
        <p>รวมประกาศขายและให้เช่าคอนโดคุณภาพ ค้นหาง่าย เปรียบเทียบสะดวก พร้อมข้อมูลครบก่อนตัดสินใจ</p>
    </div>
</section>

<div class="container hero-stack">
    <form class="search-panel" action="{{ route('buy') }}" method="get">
        <div class="tabs">
            <a class="tab active" href="{{ route('buy') }}">ซื้อคอนโด</a>
            <a class="tab" href="{{ route('rent') }}">เช่าคอนโด</a>
        </div>
        <div class="search-grid home-search">
            <div>
                <label>⌖ ทำเล / BTS / MRT / ชื่อโครงการ</label>
                <input name="location" placeholder="เช่น สุขุมวิท, อารีย์, พระราม 9">
            </div>
            <div>
                <label>▤ ช่วงราคา</label>
                <select name="price_range">
                    <option value="">ทุกช่วงราคา</option>
                    <option value="0-5000000">ไม่เกิน 5 ล้าน</option>
                    <option value="5000000-8000000">5 - 8 ล้าน</option>
                    <option value="8000000+">8 ล้านขึ้นไป</option>
                </select>
            </div>
            <div>
                <label>▣ ห้องนอน</label>
                <select name="bedrooms">
                    <option value="">ทั้งหมด</option>
                    <option value="1">1 ห้องนอน</option>
                    <option value="2">2 ห้องนอน</option>
                    <option value="3">3 ห้องนอนขึ้นไป</option>
                </select>
            </div>
            <button class="btn search-btn" type="submit">⌕ ค้นหา</button>
        </div>
    </form>

    <div class="stats">
        @foreach($stats as $stat)
            <div class="stat"><strong>{{ $stat['value'] }}</strong>{{ $stat['label'] }}</div>
        @endforeach
    </div>
</div>

<section class="section">
    <div class="container">
        <div class="section-head">
            <div>
                <div class="eyebrow">Featured Listings</div>
                <h2>ประกาศคอนโดแนะนำ</h2>
            </div>
            <a class="btn outline" href="{{ route('buy') }}">ดูประกาศทั้งหมด</a>
        </div>
        <div class="grid">
            @foreach($featured as $property)
                @include('partials.property-card', ['property' => $property])
            @endforeach
        </div>
    </div>
</section>

<section class="section soft-band">
    <div class="container">
        <div class="section-head">
            <div>
                <div class="eyebrow">Popular Locations</div>
                <h2>ทำเลยอดนิยม</h2>
            </div>
        </div>
        <div class="location-grid">
            @foreach($locations as $location)
                <a class="location-card" href="{{ route('buy', ['location' => $location['name']]) }}">
                    <img src="{{ $location['image'] }}" alt="{{ $location['name'] }}">
                    <span>{{ $location['name'] }}</span>
                    <small>{{ number_format($location['count']) }} ประกาศ</small>
                </a>
            @endforeach
        </div>
    </div>
</section>

<section class="section">
    <div class="container">
        <div class="section-head">
            <div>
                <div class="eyebrow">New Projects</div>
                <h2>โครงการคอนโดใหม่</h2>
            </div>
            <a class="btn outline" href="{{ route('projects') }}">ดูโครงการทั้งหมด</a>
        </div>
        <div class="grid">
            @foreach($projects as $project)
                <article class="card">
                    <img src="{{ $project->image_url }}" alt="{{ $project->name }}">
                    <div class="card-body">
                        <span class="badge">{{ $project->status }}</span>
                        <h3>{{ $project->name }}</h3>
                        <p class="muted">{{ $project->developer }} · {{ $project->location }}</p>
                        <div class="price">เริ่ม {{ number_format($project->starting_price) }} บาท</div>
                    </div>
                </article>
            @endforeach
        </div>
    </div>
</section>

<section class="section soft-band">
    <div class="container">
        <div class="section-head">
            <div>
                <div class="eyebrow">Why Condo Finder</div>
                <h2>ช่วยให้ตัดสินใจง่ายขึ้น</h2>
            </div>
        </div>
        <div class="why-grid">
            <div class="feature-box"><strong>⌕ ค้นหาละเอียด</strong><p class="muted">กรองทำเล ราคา ห้องนอน และเรียงผลลัพธ์ได้ทันที</p></div>
            <div class="feature-box"><strong>▣ ข้อมูลครบ</strong><p class="muted">ดูราคา พื้นที่ ชั้น สิ่งอำนวยความสะดวก และสถานที่ใกล้เคียง</p></div>
            <div class="feature-box"><strong>◇ โครงการใหม่</strong><p class="muted">รวมโครงการพร้อมอยู่และกำลังก่อสร้างจาก Developer ชั้นนำ</p></div>
            <div class="feature-box"><strong>+ ลงประกาศง่าย</strong><p class="muted">เลือกแพ็กเกจ สมัครสมาชิก แล้วลงประกาศได้ด้วยฟอร์มเดียว</p></div>
        </div>
    </div>
</section>
@endsection
