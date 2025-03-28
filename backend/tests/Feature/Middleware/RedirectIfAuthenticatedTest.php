<?php

namespace Tests\Feature\Middleware;

use App\Http\Middleware\RedirectIfAuthenticated;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class RedirectIfAuthenticatedTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_is_redirected_to_home()
    {
        // Add a route specifically for this test
        $this->app['router']->get('/guest-only', function () {
            return 'guest-only';
        })->middleware('guest');
        
        // Create and authenticate a user
        $user = User::factory()->create();
        $this->actingAs($user);
        
        // Access the route that has the guest middleware
        $response = $this->get('/guest-only');
        
        // Should be redirected to HOME
        $response->assertRedirect(RouteServiceProvider::HOME);
    }
    
    public function test_unauthenticated_user_can_access_guest_route()
    {
        // Add a route specifically for this test
        $this->app['router']->get('/guest-only', function () {
            return 'guest-only';
        })->middleware('guest');
        
        // Make sure we're logged out
        Auth::logout();
        
        // Access the route that has the guest middleware
        $response = $this->get('/guest-only');
        
        // Should be able to access the route
        $response->assertStatus(200);
        $response->assertSee('guest-only');
    }
}