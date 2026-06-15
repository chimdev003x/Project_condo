@extends('layouts.app')

@section('title', 'โครงการใหม่ | Condo Finder')

@section('content')
<section class="hero-sub projects-hero">
    <div class="container">
        <div class="eyebrow">New Projects</div>
        <h1>โครงการคอนโดใหม่</h1>
        <p>รวมโครงการใหม่และโครงการพร้อมอยู่จาก Developer ชั้นนำ</p>
    </div>
</section>

<section class="section">
    <div class="container">
        <div class="grid">
            @foreach($projects as $project)
                <article class="card">
                    <img src="{{ $project->image_url }}" alt="{{ $project->name }}">
                    <div class="card-body">
                        <span class="badge">{{ $project->status }}</span>
                        <h3>{{ $project->name }}</h3>
                        <p class="muted">{{ $project->developer }} · {{ $project->location }}</p>
                        <p>{{ $project->description }}</p>
                        <div class="price">เริ่ม {{ number_format($project->starting_price) }} บาท</div>
                    </div>
                </article>
            @endforeach
        </div>
    </div>
</section>
@endsection
