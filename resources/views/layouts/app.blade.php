<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Condo Finder')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=K2D:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.1.0/css/bold/rounded.css">
    <link rel="stylesheet" href="/css/condofinder.css">
</head>
<body>
    <header class="nav">
        <div class="container nav-inner">
            <a class="brand" href="{{ route('home') }}" aria-label="Condo Finder">
                <span class="logo"><i class="fi fi-br-building"></i></span>
                <span>Condo Finder <small>ชี้เป้าคอนโดเด็ด</small></span>
            </a>

            <input class="nav-toggle" type="checkbox" id="nav-toggle" aria-label="เปิดเมนู">
            <label class="hamburger" for="nav-toggle" aria-label="เปิดเมนู">
                <i class="fi fi-br-menu-burger menu-open"></i>
                <i class="fi fi-br-cross-small menu-close"></i>
            </label>

            <div class="nav-panel">
                <nav class="menu" aria-label="เมนูหลัก">
                    <a href="{{ route('home') }}"><span class="nav-icon"><i class="fi fi-br-home"></i></span> หน้าแรก</a>
                    <a href="{{ route('buy') }}"><span class="nav-icon"><i class="fi fi-br-building"></i></span> ซื้อคอนโด</a>
                    <a href="{{ route('rent') }}"><span class="nav-icon"><i class="fi fi-br-key"></i></span> เช่าคอนโด</a>
                    <a href="{{ route('projects') }}"><span class="nav-icon"><i class="fi fi-br-city"></i></span> โครงการใหม่</a>
                    <a href="{{ route('packages') }}"><span class="nav-icon"><i class="fi fi-br-box-open"></i></span> แพ็กเกจ</a>
                    <a href="{{ route('blog') }}"><span class="nav-icon"><i class="fi fi-br-newspaper"></i></span> บทความ</a>
                    <a href="{{ route('contact') }}"><span class="nav-icon"><i class="fi fi-br-phone-call"></i></span> ติดต่อเรา</a>
                </nav>

                <div class="auth">
                    @auth
                        <a href="{{ route('post-property') }}" class="btn outline compact"><i class="fi fi-br-add"></i> ลงประกาศ</a>
                        <a href="{{ route('my-listings') }}" class="muted">ประกาศของฉัน</a>
                        <a href="{{ route('account') }}" class="muted"><i class="fi fi-br-circle-user"></i> {{ Auth::user()->name }}</a>
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
