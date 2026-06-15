@extends('layouts.app')

@section('title', 'สมัครสมาชิก | Condo Finder')

@section('content')
<section class="section auth-section">
    <div class="container narrow">
        <form class="card form-card" method="post" action="{{ route('register.store') }}">
            @csrf
            <div class="card-body">
                <div class="eyebrow">Create Account</div>
                <h1 class="form-title">สมัครสมาชิก</h1>
                <p class="muted">สร้างบัญชีเพื่อเลือกแพ็กเกจ ลงประกาศ และดูรายการของคุณ</p>

                <label>ชื่อผู้ใช้</label>
                <input name="name" value="{{ old('name') }}" required>
                @error('name')<div class="error">{{ $message }}</div>@enderror

                <label>อีเมล</label>
                <input name="email" type="email" value="{{ old('email') }}" required>
                @error('email')<div class="error">{{ $message }}</div>@enderror

                <label>เบอร์โทร</label>
                <input name="phone" value="{{ old('phone') }}" required>
                @error('phone')<div class="error">{{ $message }}</div>@enderror

                <div class="field-grid">
                    <div>
                        <label>รหัสผ่าน</label>
                        <input name="password" type="password" required>
                        @error('password')<div class="error">{{ $message }}</div>@enderror
                    </div>
                    <div>
                        <label>ยืนยันรหัสผ่าน</label>
                        <input name="password_confirmation" type="password" required>
                    </div>
                </div>

                <label class="check-row">
                    <input type="checkbox" name="terms" value="1" required>
                    <span>ยอมรับเงื่อนไขการใช้งาน</span>
                </label>
                @error('terms')<div class="error">{{ $message }}</div>@enderror

                <p class="card-action"><button class="btn" type="submit">สมัครสมาชิก</button></p>
                <p class="muted">มีบัญชีอยู่แล้ว? <a class="text-link" href="{{ route('login') }}">เข้าสู่ระบบ</a></p>
            </div>
        </form>
    </div>
</section>
@endsection
