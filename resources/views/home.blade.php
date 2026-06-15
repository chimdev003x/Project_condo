@extends('layouts.app')

@section('title', 'Condo Finder | ค้นหาคอนโดที่ใช่')

@section('content')
<section class="hero">
    <div class="container hero-content">
        <div class="eyebrow">Condo Finder | ซื้อคอนโดได้เด็ด</div>
        <h1>ค้นหาคอนโดที่ใช่<br>ในทำเลที่คุณต้องการ</h1>
        <p>รวมประกาศขายและให้เช่าคอนโดคุณภาพ ค้นหาง่าย เปรียบเทียบสะดวก พร้อมข้อมูลครบก่อนตัดสินใจ</p>
    </div>
</section>

<div class="container">
    <form class="search-panel" action="{{ route('buy') }}" method="get">
        <div class="tabs">
            <a class="tab active" href="{{ route('buy') }}">ซื้อคอนโด</a>
            <a class="tab" href="{{ route('rent') }}">เช่าคอนโด</a>
        </div>
        <div class="search-grid">
            <div>
                <label>ทำเล / BTS / MRT / ชื่อโครงการ</label>
                <input name="location" placeholder="เช่น สุขุมวิท, อารีย์, พระราม 9">
            </div>
            <div>
                <label>ห้องนอน</label>
                <select name="bedrooms">
                    <option value="">ทั้งหมด</option>
                    <option value="1">1 ห้องนอน</option>
                    <option value="2">2 ห้องนอน</option>
                    <option value="3">3 ห้องนอนขึ้นไป</option>
                </select>
            </div>
            <div>
                <label>เรียงตาม</label>
                <select name="sort">
                    <option value="">แนะนำ</option>
                    <option value="price-low">ราคาต่ำไปสูง</option>
                    <option value="price-high">ราคาสูงไปต่ำ</option>
                </select>
            </div>
            <button class="btn" type="submit">ค้นหา</button>
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

<section class="section" style="background: var(--soft)">
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
@endsection
