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
        <form class="search-panel" style="margin: 0 0 28px" method="get">
            <div class="search-grid">
                <div>
                    <label>คำค้นหา</label>
                    <input name="location" value="{{ request('location') }}" placeholder="ทำเลหรือชื่อโครงการ">
                </div>
                <div>
                    <label>ห้องนอน</label>
                    <select name="bedrooms">
                        <option value="">ทั้งหมด</option>
                        @foreach([1,2,3] as $bed)
                            <option value="{{ $bed }}" @selected(request('bedrooms') == $bed)>{{ $bed >= 3 ? '3 ห้องนอนขึ้นไป' : $bed . ' ห้องนอน' }}</option>
                        @endforeach
                    </select>
                </div>
                <div></div>
                <button class="btn" type="submit">ค้นหา</button>
            </div>
        </form>
        <div class="grid">
            @forelse($properties as $property)
                @include('partials.property-card', ['property' => $property])
            @empty
                <p class="muted">ยังไม่พบประกาศที่ตรงกับเงื่อนไข</p>
            @endforelse
        </div>
    </div>
</section>
@endsection
