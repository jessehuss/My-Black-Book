<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function bets(): HasMany
    {
        return $this->hasMany(Bet::class);
    }

    public function participatedBets()
    {
        return $this->belongsToMany(Bet::class, 'bet_participants')
            ->withTimestamps();
    }

    public function allBets()
    {
        return Bet::where(function ($query) {
            $query->where('user_id', $this->id)
                  ->orWhereHas('participants', function ($query) {
                      $query->where('users.id', $this->id);
                  });
        });
    }
}
