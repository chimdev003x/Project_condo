@extends('layouts.app')

@section('title', 'บทความ | Condo Finder')

@section('content')
<section class="hero-sub"><div class="container"><div class="eyebrow">Blog</div><h1>บทความคอนโด</h1><p>ความรู้เรื่องซื้อ ขาย เช่า และลงทุนคอนโดแบบเข้าใจง่าย</p></div></section>
<section class="section"><div class="container"><div class="grid">@foreach($blogs as $blog)<article class="card"><img src="{{ $blog->image_url }}" alt="{{ $blog->title }}"><div class="card-body"><span class="badge">{{ $blog->category }}</span><h3>{{ $blog->title }}</h3><p class="muted">{{ $blog->published_date }}</p><p>{{ $blog->excerpt }}</p></div></article>@endforeach</div></div></section>
@endsection
