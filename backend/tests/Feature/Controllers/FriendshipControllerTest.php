<?php

namespace Tests\Feature\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FriendshipControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('auth_token')->plainTextToken;
    }

    public function test_user_can_send_friend_request()
    {
        $friend = User::factory()->create();
        
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/friends/request', [
                'friend_id' => $friend->id
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Friend request sent']);
            
        $this->assertDatabaseHas('friendships', [
            'user_id' => $this->user->id,
            'friend_id' => $friend->id,
            'status' => 'pending'
        ]);
    }

    public function test_user_can_accept_friend_request()
    {
        $friend = User::factory()->create();
        
        $friendship = Friendship::create([
            'user_id' => $friend->id,
            'friend_id' => $this->user->id,
            'status' => 'pending'
        ]);
        
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/friends/accept/' . $friendship->id);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Friend request accepted']);
            
        $this->assertDatabaseHas('friendships', [
            'id' => $friendship->id,
            'status' => 'accepted'
        ]);
    }

    public function test_user_can_remove_friend()
    {
        $friend = User::factory()->create();
        
        $friendship = Friendship::create([
            'user_id' => $this->user->id,
            'friend_id' => $friend->id,
            'status' => 'accepted'
        ]);
        
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->deleteJson('/api/friends/remove/' . $friend->id);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Friend removed']);
            
        $this->assertDatabaseMissing('friendships', [
            'id' => $friendship->id
        ]);
    }

    public function test_user_can_list_friends()
    {
        $friend1 = User::factory()->create();
        $friend2 = User::factory()->create();
        
        Friendship::create([
            'user_id' => $this->user->id,
            'friend_id' => $friend1->id,
            'status' => 'accepted'
        ]);
        
        Friendship::create([
            'user_id' => $friend2->id,
            'friend_id' => $this->user->id,
            'status' => 'accepted'
        ]);
        
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/friends');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_user_can_list_pending_requests()
    {
        $friend1 = User::factory()->create();
        $friend2 = User::factory()->create();
        
        // Incoming request
        Friendship::create([
            'user_id' => $friend1->id,
            'friend_id' => $this->user->id,
            'status' => 'pending'
        ]);
        
        // Outgoing request
        Friendship::create([
            'user_id' => $this->user->id,
            'friend_id' => $friend2->id,
            'status' => 'pending'
        ]);
        
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/friends/pending');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_cannot_send_duplicate_friend_request()
    {
        $friend = User::factory()->create();
        
        // Send first request
        Friendship::create([
            'user_id' => $this->user->id,
            'friend_id' => $friend->id,
            'status' => 'pending'
        ]);
        
        // Try to send duplicate request
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/friends/request', [
                'friend_id' => $friend->id
            ]);
            
        $response->assertStatus(400)
            ->assertJson(['message' => 'Friend request already sent']);
    }
} 