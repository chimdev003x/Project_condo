@extends('layouts.app')

@section('title', 'เข้าสู่ระบบ | Condo Finder')

@section('content')
<section class="section auth-section">
    <div class="container narrow">
        <form class="card form-card" method="post" action="{{ route('login.store') }}">
            @csrf
            <div class="card-body">
                <div class="eyebrow">Member</div>
                <h1 class="form-title">เข้าสู่ระบบ</h1>
                <p class="muted">ใช้บัญชีสำหรับลงประกาศและจัดการรายการของคุณ</p>

                <label>อีเมล</label>
                <input name="email" type="email" value="{{ old('email') }}" required autofocus>
                @error('email')<div class="error">{{ $message }}</div>@enderror

                <label>รหัสผ่าน</label>
                <input name="password" type="password" required>
                @error('password')<div class="error">{{ $message }}</div>@enderror

                <p class="card-action"><button class="btn" type="submit">เข้าสู่ระบบ</button></p>
                <p class="muted">ยังไม่มีบัญชี? <a class="text-link" href="{{ route('register') }}">สมัครสมาชิก</a></p>
            </div>
        </form>
    </div>
</section>
@endsection
