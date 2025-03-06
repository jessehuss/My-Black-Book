<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bet;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class BetController extends Controller
{
    public function index()
    {
        return response()->json(
            Auth::user()
                ->allBets()
                ->with('participants')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'wager' => 'required|numeric|min:0',
            'participants' => 'required|array',
            'participants.*' => 'exists:users,id',
            'status' => 'required|in:pending,active,completed',
        ]);

        $bet = Auth::user()->bets()->create([
            'title' => $data['title'],
            'description' => $data['description'],
            'wager' => $data['wager'],
            'status' => $data['status'],
        ]);

        $bet->participants()->attach($data['participants']);

        return response()->json($bet->load('participants'), 201);
    }

    public function show(Bet $bet)
    {
        $this->authorize('view', $bet);
        return response()->json($bet->load('participants'));
    }

    public function update(Request $request, Bet $bet)
    {
        $this->authorize('update', $bet);
        
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'wager' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,active,completed',
        ]);

        // If user is a participant (not the creator) and bet is pending
        if ($bet->user_id !== Auth::id() && $bet->status === 'pending') {
            // Participants can only update wager and status (to active)
            $allowedUpdates = array_intersect_key($data, array_flip(['wager', 'status']));
            
            // Ensure status can only be changed to 'active'
            if (isset($allowedUpdates['status']) && $allowedUpdates['status'] !== 'active') {
                return response()->json(['message' => 'Participants can only set status to active'], 403);
            }
            
            $bet->update($allowedUpdates);
        } else {
            // Creator can update all fields
            $bet->update($data);
        }

        return response()->json($bet->load('participants'));
    }

    public function destroy(Bet $bet)
    {
        if ($bet->status === 'active') {
            return response()->json([
                'message' => 'Active bets cannot be deleted'
            ], 403);
        }
        
        $this->authorize('delete', $bet);
        
        // Soft delete all participant records
        $bet->betParticipants()->delete();
        
        // Soft delete the bet
        $bet->delete();
        
        return response()->json(['message' => 'Bet deleted']);
    }
}