<article class="card property-card">
    <a class="card-media" href="{{ route('properties.show', $property->id) }}">
        <img src="{{ $property->cover_image }}" alt="{{ $property->title }}">
        @if($property->badge)
            <span class="badge floating">{{ $property->badge }}</span>
        @endif
    </a>
    <div class="card-body">
        <h3>{{ $property->title }}</h3>
        <div class="price">
            {{ number_format($property->price) }} {{ $property->type === 'rent' ? 'บาท/เดือน' : 'บาท' }}
        </div>
        <p class="muted">{{ $property->project_name }} · {{ $property->location }}</p>
        <div class="meta">
            <span><span class="mini-icon">B</span>{{ $property->bedrooms }} ห้องนอน</span>
            <span><span class="mini-icon">W</span>{{ $property->bathrooms }} ห้องน้ำ</span>
            <span><span class="mini-icon">M</span>{{ number_format($property->area) }} ตร.ม.</span>
        </div>
        <p class="card-action"><a class="btn outline" href="{{ route('properties.show', $property->id) }}">ดูรายละเอียดรายการ</a></p>
    </div>
</article>
