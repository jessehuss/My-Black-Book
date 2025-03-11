<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BetCondition extends Model
{
    use HasFactory;

    protected $fillable = [
        'bet_id',
        'description',
        'odds',
    ];

    protected $casts = [
        'odds' => 'decimal:2',
    ];

    /**
     * Get the bet that this condition belongs to.
     */
    public function bet(): BelongsTo
    {
        return $this->belongsTo(Bet::class);
    }
} 