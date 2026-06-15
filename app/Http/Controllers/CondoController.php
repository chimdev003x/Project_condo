<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\View\View;

class CondoController extends Controller
{
    public function home(): View
    {
        return view('home', [
            'featured' => $this->propertiesQuery()->limit(3)->get(),
            'projects' => DB::table('projects')->limit(3)->get(),
            'stats' => [
                ['value' => '5,240+', 'label' => 'ประกาศทั้งหมด'],
                ['value' => '180+', 'label' => 'โครงการใหม่'],
                ['value' => '25K+', 'label' => 'ผู้ใช้งาน / เดือน'],
                ['value' => '99%', 'label' => 'ความพึงพอใจ'],
            ],
        ]);
    }

    public function listings(Request $request, string $type): View
    {
        return view('listings', [
            'type' => $type,
            'title' => $type === 'rent' ? 'เช่าคอนโด' : 'ซื้อคอนโด',
            'subtitle' => $type === 'rent' ? 'ค้นหาห้องเช่าพร้อมอยู่ในทำเลที่เหมาะกับคุณ' : 'ค้นหาประกาศขายคอนโดตามทำเล ราคา และรูปแบบห้องที่ต้องการ',
            'properties' => $this->filteredProperties($request, $type)->get(),
        ]);
    }

    public function property(string $id): View
    {
        $property = $this->propertiesQuery()->where('properties.id', $id)->firstOrFail();
        $amenities = DB::table('property_amenities')->where('property_id', $id)->pluck('amenity');
        $nearby = DB::table('property_nearby_places')->where('property_id', $id)->pluck('place_name');

        return view('property', compact('property', 'amenities', 'nearby'));
    }

    public function projects(): View
    {
        return view('projects', ['projects' => DB::table('projects')->get()]);
    }

    public function packages(): View
    {
        $packages = DB::table('packages')->where('is_active', true)->orderBy('price')->get();
        $features = DB::table('package_features')->orderBy('sort_order')->get()->groupBy('package_id');

        return view('packages', compact('packages', 'features'));
    }

    public function blog(): View
    {
        return view('blog', [
            'blogs' => DB::table('blogs')->where('is_published', true)->orderByDesc('published_date')->get(),
        ]);
    }

    public function contact(): View
    {
        return view('contact');
    }

    public function apiProperties(Request $request): JsonResponse
    {
        $type = $request->query('type');
        $properties = $this->filteredProperties($request, in_array($type, ['sell', 'rent'], true) ? $type : null)->get();

        return response()->json($properties);
    }

    public function apiProperty(string $id): JsonResponse
    {
        $property = $this->propertiesQuery()->where('properties.id', $id)->firstOrFail();

        return response()->json($property);
    }

    public function apiProjects(): JsonResponse
    {
        return response()->json(DB::table('projects')->get());
    }

    public function apiPackages(): JsonResponse
    {
        return response()->json(DB::table('packages')->where('is_active', true)->get());
    }

    public function apiBlogs(): JsonResponse
    {
        return response()->json(DB::table('blogs')->where('is_published', true)->get());
    }

    public function storeInquiry(Request $request): JsonResponse
    {
        $data = $request->validate([
            'property_id' => ['nullable', 'string'],
            'project_id' => ['nullable', 'string'],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'message' => ['nullable', 'string'],
        ]);

        DB::table('inquiries')->insert([
            ...$data,
            'id' => (string) Str::uuid(),
            'status' => 'new',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['ok' => true], 201);
    }

    private function filteredProperties(Request $request, ?string $type)
    {
        $query = $this->propertiesQuery();

        if ($type) {
            $query->where('type', $type);
        }

        if ($keyword = trim((string) $request->query('location'))) {
            $query->where(function ($nested) use ($keyword) {
                $nested->where('properties.location', 'like', "%{$keyword}%")
                    ->orWhere('properties.title', 'like', "%{$keyword}%")
                    ->orWhere('properties.project_name', 'like', "%{$keyword}%");
            });
        }

        if ($bedrooms = $request->query('bedrooms')) {
            $bedrooms >= 3 ? $query->where('bedrooms', '>=', 3) : $query->where('bedrooms', (int) $bedrooms);
        }

        return $query->orderByDesc('is_promoted')->orderByDesc('properties.created_at');
    }

    private function propertiesQuery()
    {
        return DB::table('properties')
            ->leftJoin('property_images', function ($join) {
                $join->on('properties.id', '=', 'property_images.property_id')->where('property_images.sort_order', 1);
            })
            ->where('is_published', true)
            ->select('properties.*', 'property_images.image_url as cover_image');
    }
}
