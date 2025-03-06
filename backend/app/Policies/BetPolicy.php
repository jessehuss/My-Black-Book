<?php

namespace App\Policies;

use App\Models\Bet;
use App\Models\User;

class BetPolicy
{
    public function view(User $user, Bet $bet)
    {
        return $user->id === $bet->user_id || $bet->participants->contains($user->id);
    }

    public function update(User $user, Bet $bet)
    {
        // Allow both the creator and participants to update
        if ($user->id === $bet->user_id) {
            return true;
        }

        // For participants, only allow updates if the bet is pending
        // and they are actually a participant
        if ($bet->status === 'pending' && $bet->participants->contains($user->id)) {
            return true;
        }

        return false;
    }

    public function delete(User $user, Bet $bet)
    {
        // Only allow deletion if user is creator AND bet is not active
        return ($user->id === $bet->user_id || $bet->participants->contains($user->id)) && $bet->status !== 'active';
    }
} 