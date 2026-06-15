@extends('layouts.app')

@section('title', 'แพ็กเกจ | Condo Finder')

@section('content')
<section class="hero-sub"><div class="container"><div class="eyebrow">Packages</div><h1>เลือกแพ็กเกจที่เหมาะกับคุณ</h1><p>จัดการประกาศขายหรือเช่าคอนโดได้ตามจำนวนรายการและระยะเวลาที่ต้องการ</p></div></section>
<section class="section"><div class="container"><div class="grid">@foreach($packages as $package)<article class="card package-card @if($package->is_premium) featured @endif"><div class="card-body"><h2>{{ $package->name }}</h2><div class="price">{{ number_format($package->price) }} บาท</div><p class="muted">ลงได้ {{ $package->listings_limit }} รายการ · {{ $package->duration_days }} วัน · รูป {{ $package->image_limit }} รูป</p><ul class="feature-list">@foreach(($features[$package->id] ?? []) as $feature)<li>{{ $feature->feature }}</li>@endforeach</ul><p><a class="btn" href="{{ route('contact') }}">เลือกแพ็กเกจนี้</a></p></div></article>@endforeach</div></div></section>
@endsection
