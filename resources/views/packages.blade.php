@extends('layouts.app')

@section('title', 'แพ็กเกจ | Condo Finder')

@section('content')
<section class="hero-sub">
    <div class="container">
        <div class="eyebrow">Packages</div>
        <h1>เลือกแพ็กเกจที่เหมาะกับคุณ</h1>
        <p>จัดการประกาศขายหรือเช่าคอนโดได้ตามจำนวนรายการและระยะเวลาที่ต้องการ</p>
    </div>
</section>

<section class="section">
    <div class="container">
        <div class="grid package-grid">
            @foreach($packages as $package)
                <article class="card package-card @if($package->is_premium) featured @endif">
                    @if($package->is_premium)
                        <span class="popular-pill">คุ้มที่สุด</span>
                    @endif
                    <div class="card-body">
                        <h2>{{ $package->name }}</h2>
                        <div class="price">{{ number_format($package->price) }} บาท</div>
                        <p class="muted">ลงได้ {{ $package->listings_limit }} รายการ · {{ $package->duration_days }} วัน · รูป {{ $package->image_limit }} รูป</p>
                        <ul class="feature-list">
                            @foreach(($features[$package->id] ?? []) as $feature)
                                <li>{{ $feature->feature }}</li>
                            @endforeach
                        </ul>
                        <form method="post" action="{{ route('packages.select', $package->id) }}" class="card-action">
                            @csrf
                            <button class="btn {{ $package->is_premium ? '' : 'outline' }}" type="submit">เลือกแพ็กเกจนี้</button>
                        </form>
                    </div>
                </article>
            @endforeach
        </div>
    </div>
</section>
@endsection
