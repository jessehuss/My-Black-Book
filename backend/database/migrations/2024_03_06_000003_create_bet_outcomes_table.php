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
        Schema::create('bet_outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bet_id')->constrained()->onDelete('cascade');
            $table->foreignId('winner_id')->nullable()->constrained('users');
            $table->text('outcome_description');
            $table->text('proof')->nullable(); // Could be a link to an image or other evidence
            $table->foreignId('settled_by')->constrained('users');
            $table->timestamp('settled_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bet_outcomes');
    }
}; 