<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BetOutcome extends Model
{
    use HasFactory;

    protected $fillable = [
        'bet_id',
        'winner_id',
        'outcome_description',
        'proof',
        'settled_by',
        'settled_at',
    ];

    protected $casts = [
        'settled_at' => 'datetime',
    ];

    /**
     * Get the bet that this outcome belongs to.
     */
    public function bet(): BelongsTo
    {
        return $this->belongsTo(Bet::class);
    }

    /**
     * Get the user who won the bet.
     */
    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_id');
    }

    /**
     * Get the user who settled the bet.
     */
    public function settledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'settled_by');
    }
} 