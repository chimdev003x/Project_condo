<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Condo Finder')</title>
    <link rel="stylesheet" href="/css/condofinder.css">
</head>
<body>
    <header class="nav">
        <div class="container nav-inner">
            <a class="brand" href="{{ route('home') }}">
                <span class="logo">CF</span>
                <span>Condo Finder <small>ซื้อคอนโดได้เด็ด</small></span>
            </a>
            <nav class="menu">
                <a href="{{ route('home') }}">หน้าแรก</a>
                <a href="{{ route('buy') }}">ซื้อคอนโด</a>
                <a href="{{ route('rent') }}">เช่าคอนโด</a>
                <a href="{{ route('projects') }}">โครงการใหม่</a>
                <a href="{{ route('packages') }}">แพ็กเกจ</a>
                <a href="{{ route('blog') }}">บทความ</a>
                <a href="{{ route('contact') }}">ติดต่อเรา</a>
            </nav>
            <div class="auth">
                <a href="#" class="muted">Login</a>
                <a href="#" class="btn">Register</a>
            </div>
        </div>
    </header>

    @yield('content')

    <footer class="footer">
        <div class="container">
            Condo Finder Laravel Edition · เว็บประกาศคอนโดพร้อมฐานข้อมูล SQLite
        </div>
    </footer>
</body>
</html>
