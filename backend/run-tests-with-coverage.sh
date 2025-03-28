#!/bin/bash

# Run PHPUnit tests with coverage
php artisan test --coverage

# If you want to run specific tests with coverage
# php artisan test --coverage --filter=YourTestName 