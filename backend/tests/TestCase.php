<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Artisan;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure we're using the sqlite_testing connection
        config(['database.default' => 'sqlite_testing']);
        
        // Run migrations for the in-memory database
        Artisan::call('migrate:fresh');
    }
}