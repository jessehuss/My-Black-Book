<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bet_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bet_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained();
            $table->enum('role', ['creator', 'challenger'])->default('challenger');
            $table->enum('side', ['for', 'against'])->nullable();
            $table->boolean('has_accepted')->default(false);
            $table->timestamps();
            $table->softDeletes();
            
            // Ensure a user can only participate once in a given bet
            $table->unique(['bet_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bet_participants');
    }
}; 