<?php

use App\Http\Controllers\CondoController;
use Illuminate\Support\Facades\Route;

Route::get('/', [CondoController::class, 'home'])->name('home');
Route::get('/buy', [CondoController::class, 'listings'])->defaults('type', 'sell')->name('buy');
Route::get('/rent', [CondoController::class, 'listings'])->defaults('type', 'rent')->name('rent');
Route::get('/properties/{id}', [CondoController::class, 'property'])->name('properties.show');
Route::get('/projects', [CondoController::class, 'projects'])->name('projects');
Route::get('/packages', [CondoController::class, 'packages'])->name('packages');
Route::get('/blog', [CondoController::class, 'blog'])->name('blog');
Route::get('/contact', [CondoController::class, 'contact'])->name('contact');

Route::prefix('api')->group(function () {
    Route::get('/health', fn () => response()->json(['ok' => true]));
    Route::get('/properties', [CondoController::class, 'apiProperties']);
    Route::get('/properties/{id}', [CondoController::class, 'apiProperty']);
    Route::get('/projects', [CondoController::class, 'apiProjects']);
    Route::get('/packages', [CondoController::class, 'apiPackages']);
    Route::get('/blogs', [CondoController::class, 'apiBlogs']);
    Route::post('/inquiries', [CondoController::class, 'storeInquiry']);
});
