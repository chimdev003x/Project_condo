@extends('layouts.app')

@section('title', 'ติดต่อเรา | Condo Finder')

@section('content')
<section class="hero-sub">
    <div class="container">
        <div class="eyebrow">Contact</div>
        <h1>ติดต่อเรา</h1>
        <p>ฝากข้อมูลให้ทีมงาน Condo Finder ติดต่อกลับ</p>
    </div>
</section>

<section class="section">
    <div class="container narrow">
        <form class="card form-card" method="post" action="{{ route('contact.store') }}">
            @csrf
            <div class="card-body">
                <label>ชื่อ</label>
                <input name="full_name" value="{{ old('full_name') }}" required>
                @error('full_name')<div class="error">{{ $message }}</div>@enderror

                <label>อีเมล</label>
                <input name="email" type="email" value="{{ old('email') }}">
                @error('email')<div class="error">{{ $message }}</div>@enderror

                <label>เบอร์โทร</label>
                <input name="phone" value="{{ old('phone') }}" required>
                @error('phone')<div class="error">{{ $message }}</div>@enderror

                <label>ข้อความ</label>
                <textarea name="message">{{ old('message') }}</textarea>
                @error('message')<div class="error">{{ $message }}</div>@enderror

                <p class="card-action"><button class="btn" type="submit">ส่งข้อความ</button></p>
            </div>
        </form>
    </div>
</section>
@endsection
