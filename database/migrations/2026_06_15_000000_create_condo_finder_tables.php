<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->unsignedInteger('price')->default(0);
            $table->unsignedInteger('listings_limit')->default(0);
            $table->unsignedInteger('duration_days')->default(0);
            $table->unsignedInteger('image_limit')->default(0);
            $table->boolean('is_premium')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('package_features', function (Blueprint $table) {
            $table->id();
            $table->string('package_id');
            $table->string('feature');
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreign('package_id')->references('id')->on('packages')->cascadeOnDelete();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('developer');
            $table->string('location');
            $table->unsignedInteger('starting_price');
            $table->string('status');
            $table->text('image_url')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('properties', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('project_id')->nullable();
            $table->string('title');
            $table->string('project_name');
            $table->string('location');
            $table->unsignedInteger('price');
            $table->string('type');
            $table->unsignedInteger('bedrooms')->default(1);
            $table->unsignedInteger('bathrooms')->default(1);
            $table->decimal('area', 8, 2);
            $table->unsignedInteger('floor')->nullable();
            $table->text('description')->nullable();
            $table->string('contact_name');
            $table->string('contact_phone');
            $table->string('contact_line')->nullable();
            $table->string('badge')->nullable();
            $table->boolean('is_promoted')->default(false);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->foreign('project_id')->references('id')->on('projects')->nullOnDelete();
            $table->index(['type', 'price']);
            $table->index('location');
            $table->index('bedrooms');
            $table->index(['is_promoted', 'created_at']);
        });

        Schema::create('property_images', function (Blueprint $table) {
            $table->id();
            $table->string('property_id');
            $table->text('image_url');
            $table->string('alt_text')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreign('property_id')->references('id')->on('properties')->cascadeOnDelete();
            $table->index(['property_id', 'sort_order']);
        });

        Schema::create('property_amenities', function (Blueprint $table) {
            $table->id();
            $table->string('property_id');
            $table->string('amenity');
            $table->foreign('property_id')->references('id')->on('properties')->cascadeOnDelete();
        });

        Schema::create('property_nearby_places', function (Blueprint $table) {
            $table->id();
            $table->string('property_id');
            $table->string('place_name');
            $table->foreign('property_id')->references('id')->on('properties')->cascadeOnDelete();
        });

        Schema::create('blogs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt');
            $table->string('category');
            $table->date('published_date');
            $table->text('image_url')->nullable();
            $table->text('content');
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->index(['category', 'published_date']);
        });

        Schema::create('inquiries', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('property_id')->nullable();
            $table->string('project_id')->nullable();
            $table->string('full_name');
            $table->string('email')->nullable();
            $table->string('phone');
            $table->text('message')->nullable();
            $table->string('status')->default('new');
            $table->timestamps();
            $table->foreign('property_id')->references('id')->on('properties')->nullOnDelete();
            $table->foreign('project_id')->references('id')->on('projects')->nullOnDelete();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiries');
        Schema::dropIfExists('blogs');
        Schema::dropIfExists('property_nearby_places');
        Schema::dropIfExists('property_amenities');
        Schema::dropIfExists('property_images');
        Schema::dropIfExists('properties');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('package_features');
        Schema::dropIfExists('packages');
    }
};
