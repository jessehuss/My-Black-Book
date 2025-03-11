<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use App\Models\BetCondition;
use App\Models\BetOutcome;
use App\Models\BetParticipant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BetController extends Controller
{
    /**
     * Display a listing of the bets.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $userId = Auth::id();

        $query = Bet::with(['participants.user', 'conditions', 'outcome'])
            ->whereHas('participants', function($query) use ($userId) {
                $query->where('user_id', $userId);
            });

        if ($status) {
            $query->where('status', $status);
        }

        $bets = $query->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $bets
        ]);
    }

    /**
     * Store a newly created bet.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'stake_amount' => 'required|numeric|min:0',
            'participants' => 'required|array|min:1',
            'participants.*.user_id' => 'required|exists:users,id',
            'participants.*.side' => 'required|in:for,against',
            'conditions' => 'required|array|min:1',
            'conditions.*.description' => 'required|string',
            'conditions.*.odds' => 'nullable|numeric',
        ]);

        try {
            DB::beginTransaction();

            // Create the bet
            $bet = Bet::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'stake_amount' => $validated['stake_amount'],
                'status' => 'pending',
                'created_by' => Auth::id(),
            ]);

            // Add creator as a participant
            BetParticipant::create([
                'bet_id' => $bet->id,
                'user_id' => Auth::id(),
                'role' => 'creator',
                'side' => 'for', // Default the creator to the "for" side
                'has_accepted' => true, // Creator automatically accepts
            ]);

            // Add other participants
            foreach ($validated['participants'] as $participant) {
                if ($participant['user_id'] != Auth::id()) { // Skip if it's the creator
                    BetParticipant::create([
                        'bet_id' => $bet->id,
                        'user_id' => $participant['user_id'],
                        'role' => 'challenger',
                        'side' => $participant['side'],
                        'has_accepted' => false,
                    ]);
                }
            }

            // Add conditions
            foreach ($validated['conditions'] as $condition) {
                BetCondition::create([
                    'bet_id' => $bet->id,
                    'description' => $condition['description'],
                    'odds' => $condition['odds'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bet created successfully',
                'data' => $bet->load(['participants.user', 'conditions'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create bet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified bet.
     */
    public function show(Bet $bet)
    {
        // Check if the user is a participant
        $isParticipant = $bet->participants()->where('user_id', Auth::id())->exists();
        
        if (!$isParticipant) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view this bet'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $bet->load(['participants.user', 'conditions', 'outcome', 'creator'])
        ]);
    }

    /**
     * Update the specified bet.
     */
    public function update(Request $request, Bet $bet)
    {
        // Check if the user is the creator
        if ($bet->created_by !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this bet'
            ], 403);
        }

        // Only allow updates if bet is in pending status
        if ($bet->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending bets can be updated'
            ], 400);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'stake_amount' => 'sometimes|numeric|min:0',
            'participants' => 'sometimes|array|min:1',
            'participants.*.user_id' => 'required|exists:users,id',
            'participants.*.side' => 'required|in:for,against',
            'conditions' => 'sometimes|array|min:1',
            'conditions.*.id' => 'sometimes|exists:bet_conditions,id',
            'conditions.*.description' => 'required|string',
            'conditions.*.odds' => 'nullable|numeric',
        ]);

        try {
            DB::beginTransaction();

            // Update the bet
            $bet->update([
                'title' => $validated['title'] ?? $bet->title,
                'description' => $validated['description'] ?? $bet->description,
                'stake_amount' => $validated['stake_amount'] ?? $bet->stake_amount,
            ]);

            // Update participants if provided
            if (isset($validated['participants'])) {
                // Remove participants who are not in the new list
                $currentParticipantIds = collect($validated['participants'])->pluck('user_id')->toArray();
                
                // Don't remove the creator
                $bet->participants()
                    ->where('role', 'challenger')
                    ->whereNotIn('user_id', $currentParticipantIds)
                    ->delete();

                // Add or update participants
                foreach ($validated['participants'] as $participant) {
                    BetParticipant::updateOrCreate(
                        [
                            'bet_id' => $bet->id,
                            'user_id' => $participant['user_id'],
                        ],
                        [
                            'side' => $participant['side'],
                            'role' => 'challenger',
                            'has_accepted' => false,
                        ]
                    );
                }
            }

            // Update conditions if provided
            if (isset($validated['conditions'])) {
                // Handle conditions that have IDs (update existing)
                $existingIds = [];
                foreach ($validated['conditions'] as $condition) {
                    if (isset($condition['id'])) {
                        BetCondition::where('id', $condition['id'])
                            ->where('bet_id', $bet->id)
                            ->update([
                                'description' => $condition['description'],
                                'odds' => $condition['odds'] ?? null,
                            ]);
                        $existingIds[] = $condition['id'];
                    } else {
                        // Create new condition
                        BetCondition::create([
                            'bet_id' => $bet->id,
                            'description' => $condition['description'],
                            'odds' => $condition['odds'] ?? null,
                        ]);
                    }
                }

                // Delete conditions not in the update
                if (!empty($existingIds)) {
                    BetCondition::where('bet_id', $bet->id)
                        ->whereNotIn('id', $existingIds)
                        ->delete();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bet updated successfully',
                'data' => $bet->fresh()->load(['participants.user', 'conditions'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update bet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Accept a bet invitation.
     */
    public function accept(Bet $bet)
    {
        $participant = $bet->participants()->where('user_id', Auth::id())->first();
        
        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a participant in this bet'
            ], 403);
        }

        if ($bet->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This bet is no longer pending'
            ], 400);
        }

        try {
            $participant->update(['has_accepted' => true]);

            // Check if all participants have accepted
            $allAccepted = $bet->participants()->where('has_accepted', false)->count() === 0;
            
            if ($allAccepted) {
                $bet->update(['status' => 'active']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Bet accepted successfully',
                'data' => $bet->fresh()->load(['participants.user', 'conditions'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept bet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Decline a bet invitation.
     */
    public function decline(Bet $bet)
    {
        $participant = $bet->participants()->where('user_id', Auth::id())->first();
        
        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a participant in this bet'
            ], 403);
        }

        if ($bet->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This bet is no longer pending'
            ], 400);
        }

        try {
            // Remove the participant
            $participant->delete();
            
            // Check if there are still participants
            $hasParticipants = $bet->participants()->where('role', 'challenger')->exists();
            
            if (!$hasParticipants) {
                $bet->update(['status' => 'canceled']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Bet declined successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to decline bet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a bet.
     */
    public function cancel(Bet $bet)
    {
        // Only the creator can cancel a bet
        if ($bet->created_by !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to cancel this bet'
            ], 403);
        }

        // Only pending or active bets can be canceled
        if (!in_array($bet->status, ['pending', 'active'])) {
            return response()->json([
                'success' => false,
                'message' => 'This bet cannot be canceled'
            ], 400);
        }

        try {
            $bet->update([
                'status' => 'canceled',
                'settled_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Bet canceled successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel bet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Settle a bet and record the outcome.
     */
    public function settle(Request $request, Bet $bet)
    {
        // Check if the user is the creator or a participant
        $isParticipant = $bet->participants()->where('user_id', Auth::id())->exists();
        
        if (!$isParticipant) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to settle this bet'
            ], 403);
        }

        // Only active bets can be settled
        if ($bet->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Only active bets can be settled'
            ], 400);
        }

        $validated = $request->validate([
            'winner_id' => [
                'required',
                Rule::exists('bet_participants', 'user_id')->where(function ($query) use ($bet) {
                    $query->where('bet_id', $bet->id);
                }),
            ],
            'outcome_description' => 'required|string',
            'proof' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Create the outcome
            BetOutcome::create([
                'bet_id' => $bet->id,
                'winner_id' => $validated['winner_id'],
                'outcome_description' => $validated['outcome_description'],
                'proof' => $validated['proof'] ?? null,
                'settled_by' => Auth::id(),
                'settled_at' => now(),
            ]);

            // Update the bet status
            $winnerSide = $bet->participants()->where('user_id', $validated['winner_id'])->value('side');
            $creatorSide = $bet->participants()->where('role', 'creator')->value('side');
            
            // Determine if the creator won or lost
            $status = ($winnerSide === $creatorSide) ? 'won' : 'lost';
            
            $bet->update([
                'status' => $status,
                'settled_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bet settled successfully',
                'data' => $bet->fresh()->load(['participants.user', 'conditions', 'outcome'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to settle bet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dispute a bet outcome.
     */
    public function dispute(Request $request, Bet $bet)
    {
        // Check if the user is a participant
        $isParticipant = $bet->participants()->where('user_id', Auth::id())->exists();
        
        if (!$isParticipant) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to dispute this bet'
            ], 403);
        }

        // Only settled bets can be disputed
        if (!in_array($bet->status, ['won', 'lost'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only settled bets can be disputed'
            ], 400);
        }

        $validated = $request->validate([
            'dispute_reason' => 'required|string',
        ]);

        try {
            // Update the bet status
            $bet->update([
                'status' => 'disputed'
            ]);

            // Update the outcome with the dispute reason
            $bet->outcome()->update([
                'dispute_reason' => $validated['dispute_reason'],
                'disputed_by' => Auth::id(),
                'disputed_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Bet marked as disputed',
                'data' => $bet->fresh()->load(['participants.user', 'conditions', 'outcome'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to dispute bet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a bet.
     */
    public function destroy(Bet $bet)
    {
        // Only the creator can delete a bet
        if ($bet->created_by !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete this bet'
            ], 403);
        }

        // Only pending bets can be deleted
        if ($bet->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending bets can be deleted'
            ], 400);
        }

        try {
            $bet->delete();

            return response()->json([
                'success' => true,
                'message' => 'Bet deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete bet',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 