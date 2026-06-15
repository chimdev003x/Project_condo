<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\View\View;

class CondoController extends Controller
{
    public function home(): View
    {
        return view('home', [
            'featured' => $this->propertiesQuery()->limit(6)->get(),
            'projects' => DB::table('projects')->limit(3)->get(),
            'locations' => $this->popularLocations(),
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
            'subtitle' => $type === 'rent'
                ? 'ค้นหาห้องเช่าพร้อมอยู่ในทำเลที่เหมาะกับคุณ'
                : 'ค้นหาประกาศขายคอนโดตามทำเล ราคา และรูปแบบห้องที่ต้องการ',
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

    public function selectPackage(string $id): RedirectResponse
    {
        $package = DB::table('packages')->where('id', $id)->where('is_active', true)->firstOrFail();
        session(['package_id' => $package->id]);

        return redirect()->route(Auth::check() ? 'post-property' : 'register')
            ->with('status', "เลือกแพ็กเกจ {$package->name} แล้ว");
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

    public function login(): View
    {
        return view('auth.login');
    }

    public function authenticate(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, true)) {
            return back()->withErrors(['email' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'])->onlyInput('email');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('home'))->with('status', 'เข้าสู่ระบบสำเร็จ');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('status', 'ออกจากระบบแล้ว');
    }

    public function register(): View
    {
        return view('auth.register');
    }

    public function storeRegister(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:50'],
            'password' => ['required', 'confirmed', 'min:8'],
            'terms' => ['accepted'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route(session('package_id') ? 'post-property' : 'packages')
            ->with('status', 'สมัครสมาชิกสำเร็จ');
    }

    public function postProperty(): View|RedirectResponse
    {
        if (! Auth::check()) {
            return redirect()->route('login')->with('status', 'กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้');
        }

        if (! session('package_id')) {
            return redirect()->route('packages')->with('status', 'กรุณาเลือกแพ็กเกจก่อนลงประกาศ');
        }

        return view('post-property');
    }

    public function storeProperty(Request $request): RedirectResponse
    {
        if (! Auth::check()) {
            return redirect()->route('login')->with('status', 'กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้');
        }

        if (! session('package_id')) {
            return redirect()->route('packages')->with('status', 'กรุณาเลือกแพ็กเกจก่อนลงประกาศ');
        }

        $data = $request->validate([
            'type' => ['required', 'in:sell,rent'],
            'title' => ['required', 'string', 'max:255'],
            'project_name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:1'],
            'bedrooms' => ['required', 'integer', 'min:0'],
            'bathrooms' => ['required', 'integer', 'min:1'],
            'area' => ['required', 'numeric', 'min:1'],
            'floor' => ['nullable', 'integer', 'min:0'],
            'description' => ['required', 'string'],
            'image_url' => ['required', 'url'],
            'contact_phone' => ['required', 'string', 'max:50'],
        ]);

        $id = (string) Str::uuid();
        DB::table('properties')->insert([
            'id' => $id,
            'owner_id' => Auth::id(),
            'project_id' => null,
            'title' => $data['title'],
            'project_name' => $data['project_name'],
            'location' => $data['location'],
            'price' => $data['price'],
            'type' => $data['type'],
            'bedrooms' => $data['bedrooms'],
            'bathrooms' => $data['bathrooms'],
            'area' => $data['area'],
            'floor' => $data['floor'],
            'description' => $data['description'],
            'contact_name' => Auth::user()->name,
            'contact_phone' => $data['contact_phone'],
            'badge' => $data['type'] === 'rent' ? 'เช่า' : 'ขาย',
            'is_promoted' => false,
            'is_published' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('property_images')->insert([
            'property_id' => $id,
            'image_url' => $data['image_url'],
            'alt_text' => $data['title'],
            'sort_order' => 1,
        ]);

        return redirect()->route('properties.show', $id)->with('status', 'ลงประกาศเรียบร้อยแล้ว');
    }

    public function myListings(): View|RedirectResponse
    {
        if (! Auth::check()) {
            return redirect()->route('login')->with('status', 'กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้');
        }

        return view('my-listings', [
            'properties' => $this->propertiesQuery()->where('owner_id', Auth::id())->get(),
        ]);
    }

    public function account(): View|RedirectResponse
    {
        if (! Auth::check()) {
            return redirect()->route('login')->with('status', 'กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้');
        }

        $package = session('package_id')
            ? DB::table('packages')->where('id', session('package_id'))->first()
            : null;

        return view('account', compact('package'));
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

    public function storeInquiry(Request $request): JsonResponse|RedirectResponse
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

        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json(['ok' => true], 201);
        }

        return back()->with('status', 'ส่งข้อความเรียบร้อยแล้ว ทีมงานจะติดต่อกลับเร็ว ๆ นี้');
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

        if ($priceRange = $request->query('price_range')) {
            [$min, $max] = array_pad(explode('-', str_replace('+', '', $priceRange)), 2, null);
            $query->where('price', '>=', (int) $min);
            if (! str_ends_with($priceRange, '+') && $max) {
                $query->where('price', '<=', (int) $max);
            }
        }

        if ($request->query('sort') === 'price-low') {
            return $query->orderBy('price');
        }

        if ($request->query('sort') === 'price-high') {
            return $query->orderByDesc('price');
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

    private function popularLocations(): array
    {
        return [
            ['name' => 'สุขุมวิท', 'count' => 1280, 'image' => 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80'],
            ['name' => 'อโศก', 'count' => 820, 'image' => 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80'],
            ['name' => 'พระราม 9', 'count' => 760, 'image' => 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80'],
            ['name' => 'สาทร', 'count' => 640, 'image' => 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=900&q=80'],
        ];
    }
}
