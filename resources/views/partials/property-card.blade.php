<article class="card">
    <img src="{{ $property->cover_image }}" alt="{{ $property->title }}">
    <div class="card-body">
        @if($property->badge)
            <span class="badge">{{ $property->badge }}</span>
        @endif
        <h3>{{ $property->title }}</h3>
        <div class="price">
            {{ number_format($property->price) }} {{ $property->type === 'rent' ? 'บาท/เดือน' : 'บาท' }}
        </div>
        <p class="muted">{{ $property->project_name }} · {{ $property->location }}</p>
        <div class="meta">
            <span>{{ $property->bedrooms }} ห้องนอน</span>
            <span>{{ $property->bathrooms }} ห้องน้ำ</span>
            <span>{{ number_format($property->area) }} ตร.ม.</span>
        </div>
        <p><a class="btn outline" href="{{ route('properties.show', $property->id) }}">ดูรายละเอียด</a></p>
    </div>
</article>
