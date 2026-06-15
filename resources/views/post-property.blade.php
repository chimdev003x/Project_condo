@extends('layouts.app')

@section('title', 'ลงประกาศ | Condo Finder')

@section('content')
<section class="hero-sub">
    <div class="container">
        <div class="eyebrow">Post Property</div>
        <h1>ลงประกาศคอนโด</h1>
        <p>กรอกข้อมูลสำคัญให้ครบ เพื่อให้ผู้ซื้อหรือผู้เช่าตัดสินใจได้ง่ายขึ้น</p>
    </div>
</section>

<section class="section">
    <div class="container narrow-wide">
        <form class="card form-card" method="post" action="{{ route('post-property.store') }}">
            @csrf
            <div class="card-body">
                <div class="field-grid">
                    <div>
                        <label>ประเภทประกาศ</label>
                        <select name="type" required>
                            <option value="sell" @selected(old('type') === 'sell')>ขาย</option>
                            <option value="rent" @selected(old('type') === 'rent')>เช่า</option>
                        </select>
                        @error('type')<div class="error">{{ $message }}</div>@enderror
                    </div>
                    <div>
                        <label>ราคา</label>
                        <input name="price" type="number" min="1" value="{{ old('price') }}" required>
                        @error('price')<div class="error">{{ $message }}</div>@enderror
                    </div>
                </div>

                <label>หัวข้อประกาศ</label>
                <input name="title" value="{{ old('title') }}" placeholder="เช่น ห้องวิวเมือง แต่งครบ ใกล้ BTS" required>
                @error('title')<div class="error">{{ $message }}</div>@enderror

                <div class="field-grid">
                    <div>
                        <label>ชื่อโครงการ</label>
                        <input name="project_name" value="{{ old('project_name') }}" required>
                        @error('project_name')<div class="error">{{ $message }}</div>@enderror
                    </div>
                    <div>
                        <label>ทำเล</label>
                        <input name="location" value="{{ old('location') }}" required>
                        @error('location')<div class="error">{{ $message }}</div>@enderror
                    </div>
                </div>

                <div class="field-grid three">
                    <div>
                        <label>ห้องนอน</label>
                        <input name="bedrooms" type="number" min="0" value="{{ old('bedrooms', 1) }}" required>
                        @error('bedrooms')<div class="error">{{ $message }}</div>@enderror
                    </div>
                    <div>
                        <label>ห้องน้ำ</label>
                        <input name="bathrooms" type="number" min="1" value="{{ old('bathrooms', 1) }}" required>
                        @error('bathrooms')<div class="error">{{ $message }}</div>@enderror
                    </div>
                    <div>
                        <label>พื้นที่ (ตร.ม.)</label>
                        <input name="area" type="number" min="1" step="0.01" value="{{ old('area') }}" required>
                        @error('area')<div class="error">{{ $message }}</div>@enderror
                    </div>
                </div>

                <label>ชั้น</label>
                <input name="floor" type="number" min="0" value="{{ old('floor') }}">
                @error('floor')<div class="error">{{ $message }}</div>@enderror

                <label>URL รูปภาพหลัก</label>
                <input name="image_url" type="url" value="{{ old('image_url') }}" placeholder="https://images.unsplash.com/..." required>
                @error('image_url')<div class="error">{{ $message }}</div>@enderror

                <label>รายละเอียด</label>
                <textarea name="description" required>{{ old('description') }}</textarea>
                @error('description')<div class="error">{{ $message }}</div>@enderror

                <label>เบอร์ติดต่อ</label>
                <input name="contact_phone" value="{{ old('contact_phone') }}" required>
                @error('contact_phone')<div class="error">{{ $message }}</div>@enderror

                <p class="card-action"><button class="btn" type="submit">บันทึกประกาศ</button></p>
            </div>
        </form>
    </div>
</section>
@endsection
