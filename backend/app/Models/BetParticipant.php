<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BetParticipant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['bet_id', 'user_id'];

    public function bet(): BelongsTo
    {
        return $this->belongsTo(Bet::class);
    }
}
