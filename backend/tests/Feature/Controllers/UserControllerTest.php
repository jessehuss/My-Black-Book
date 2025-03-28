<?php

namespace Tests\Feature\Controllers;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'testuser@domain.com'
        ]);
        $this->token = $this->user->createToken('auth_token')->plainTextToken;
    }

    public function test_user_can_search_users()
    {
        // Create users with specific names and emails to avoid accidental matches
        User::factory()->create([
            'name' => 'John Doe', 
            'email' => 'john@domain.com'
        ]);
        
        User::factory()->create([
            'name' => 'Jane Doe', 
            'email' => 'jane@domain.com'
        ]);
        
        User::factory()->create([
            'name' => 'Example User', 
            'email' => 'test@example.com'
        ]);
        
        // Test searching by name
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/users/search?q=Doe');

        $response->assertStatus(200)
            ->assertJsonCount(2);
        
        // Debug the response for the email search
        $emailResponse = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/users/search?q=example');
            
        // Dump the response to see what's being returned
        $users = $emailResponse->json();
        
        // Test searching by email
        $emailResponse->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_search_with_empty_query_returns_empty_array()
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/users/search?q=');
            
        $response->assertStatus(200)
            ->assertJson([]);
    }
}