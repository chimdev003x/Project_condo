<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Condo Finder')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=K2D:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/condofinder.css">
</head>
<body>
    <header class="nav">
        <div class="container nav-inner">
            <a class="brand" href="{{ route('home') }}" aria-label="Condo Finder">
                <span class="logo">CF</span>
                <span>Condo Finder <small>ชี้เป้าคอนโดเด็ด</small></span>
            </a>

            <nav class="menu" aria-label="เมนูหลัก">
                <a href="{{ route('home') }}">⌂ หน้าแรก</a>
                <a href="{{ route('buy') }}">▣ ซื้อคอนโด</a>
                <a href="{{ route('rent') }}">◫ เช่าคอนโด</a>
                <a href="{{ route('projects') }}">◇ โครงการใหม่</a>
                <a href="{{ route('packages') }}">◉ แพ็กเกจ</a>
                <a href="{{ route('blog') }}">✎ บทความ</a>
                <a href="{{ route('contact') }}">☏ ติดต่อเรา</a>
            </nav>

            <div class="auth">
                @auth
                    <a href="{{ route('post-property') }}" class="btn outline compact">+ ลงประกาศ</a>
                    <a href="{{ route('my-listings') }}" class="muted">ประกาศของฉัน</a>
                    <a href="{{ route('account') }}" class="muted">{{ Auth::user()->name }}</a>
                    <form method="post" action="{{ route('logout') }}" class="inline-form">
                        @csrf
                        <button class="link-button" type="submit">ออกจากระบบ</button>
                    </form>
                @else
                    <a href="{{ route('login') }}" class="muted">Login</a>
                    <a href="{{ route('register') }}" class="btn compact">Register</a>
                @endauth
            </div>
        </div>
    </header>

    @if(session('status'))
        <div class="container">
            <div class="alert">{{ session('status') }}</div>
        </div>
    @endif

    @yield('content')

    <footer class="footer">
        <div class="container footer-grid">
            <div>
                <strong>Condo Finder</strong>
                <p class="muted">เว็บประกาศคอนโดสำหรับซื้อ ขาย เช่า และลงประกาศแบบใช้งานจริงบน Laravel</p>
            </div>
            <div>
                <a href="{{ route('buy') }}">ซื้อคอนโด</a>
                <a href="{{ route('rent') }}">เช่าคอนโด</a>
                <a href="{{ route('packages') }}">แพ็กเกจ</a>
            </div>
        </div>
    </footer>
</body>
</html>
