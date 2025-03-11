<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BetParticipant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'bet_id',
        'user_id',
        'role',
        'side',
        'has_accepted',
    ];

    protected $casts = [
        'has_accepted' => 'boolean',
    ];

    /**
     * Get the bet that this participant belongs to.
     */
    public function bet(): BelongsTo
    {
        return $this->belongsTo(Bet::class);
    }

    /**
     * Get the user that is participating in the bet.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
