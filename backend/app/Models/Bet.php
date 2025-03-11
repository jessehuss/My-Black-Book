<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Bet extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'stake_amount',
        'status',
        'created_by',
        'settled_at',
    ];

    protected $casts = [
        'stake_amount' => 'decimal:2',
        'settled_at' => 'datetime',
    ];

    /**
     * Get the user who created the bet.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the participants of the bet.
     */
    public function participants(): HasMany
    {
        return $this->hasMany(BetParticipant::class);
    }

    /**
     * Get the conditions of the bet.
     */
    public function conditions(): HasMany
    {
        return $this->hasMany(BetCondition::class);
    }

    /**
     * Get the outcome of the bet.
     */
    public function outcome(): HasOne
    {
        return $this->hasOne(BetOutcome::class);
    }

    /**
     * Scope a query to only include active bets.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include pending bets.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include settled bets.
     */
    public function scopeSettled($query)
    {
        return $query->whereIn('status', ['won', 'lost', 'canceled']);
    }
}
