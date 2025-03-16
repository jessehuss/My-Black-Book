<?php

namespace Tests\Feature\Middleware;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthenticateTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_is_redirected_to_json_response()
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }
} 