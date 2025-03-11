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
        Schema::create('bet_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bet_id')->constrained()->onDelete('cascade');
            $table->text('description');
            $table->decimal('odds', 8, 2)->nullable(); // Optional odds for this condition
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bet_conditions');
    }
}; 