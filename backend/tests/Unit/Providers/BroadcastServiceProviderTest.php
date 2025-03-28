<?php

namespace Tests\Unit\Providers;

use App\Providers\BroadcastServiceProvider;
use Illuminate\Support\Facades\Broadcast;
use Tests\TestCase;

class BroadcastServiceProviderTest extends TestCase
{
    public function test_broadcast_provider_boots()
    {
        // Create a more complete mock of the Broadcast facade
        Broadcast::shouldReceive('routes')
            ->once()
            ->andReturn(null);
            
        // Also mock the channel method which is called in routes/channels.php
        Broadcast::shouldReceive('channel')
            ->withAnyArgs()
            ->andReturn(null);
            
        // Create and boot the provider
        $provider = new BroadcastServiceProvider($this->app);
        $provider->boot();
        
        // If we get here without exceptions, the test passes
        $this->assertTrue(true);
    }
}