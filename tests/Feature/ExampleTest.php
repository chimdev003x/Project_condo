<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_properties_api_returns_seeded_listings(): void
    {
        $response = $this->getJson('/api/properties');

        $response->assertOk()->assertJsonCount(6);
    }

    public function test_public_requirement_pages_render(): void
    {
        foreach (['/buy', '/rent', '/projects', '/packages', '/blog', '/contact', '/login', '/register'] as $path) {
            $this->get($path)->assertOk();
        }
    }

    public function test_protected_listing_pages_redirect_guests(): void
    {
        foreach (['/post-property', '/my-listings', '/account'] as $path) {
            $this->get($path)->assertRedirect('/login');
        }
    }
}
