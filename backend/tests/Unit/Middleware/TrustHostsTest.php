<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\TrustHosts;
use Illuminate\Contracts\Foundation\Application;
use Tests\TestCase;

class TrustHostsTest extends TestCase
{
    public function test_hosts_method_returns_array()
    {
        // Get the application instance from the test environment
        $app = $this->app;
        
        // Create the middleware with the application instance
        $middleware = new TrustHosts($app);
        
        // Test the hosts method
        $hosts = $middleware->hosts();
        
        $this->assertIsArray($hosts);
        $this->assertNotEmpty($hosts);
    }
}