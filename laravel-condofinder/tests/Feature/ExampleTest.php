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

        $response->assertOk()->assertJsonCount(3);
    }
}
