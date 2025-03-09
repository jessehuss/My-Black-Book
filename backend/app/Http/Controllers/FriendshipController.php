<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;

class FriendshipController extends Controller {
    public function sendRequest(Request $request) {
        $request->validate(['friend_id' => 'required|exists:users,id']);

        if (Friendship::where('user_id', auth()->id())->where('friend_id', $request->friend_id)->exists()) {
            return response()->json(['message' => 'Friend request already sent'], 400);
        }

        Friendship::create([
            'user_id' => auth()->id(),
            'friend_id' => $request->friend_id,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Friend request sent']);
    }

    public function acceptRequest($id) {
        $friendship = Friendship::where('friend_id', auth()->id())
            ->where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->update(['status' => 'accepted']);

        return response()->json(['message' => 'Friend request accepted']);
    }

    public function removeFriend($id) {
        $friendship = Friendship::where(function ($query) use ($id) {
            $query->where('user_id', auth()->id())->where('friend_id', $id);
        })->orWhere(function ($query) use ($id) {
            $query->where('friend_id', auth()->id())->where('user_id', $id);
        })->firstOrFail();

        $friendship->delete();

        return response()->json(['message' => 'Friend removed']);
    }

    public function listFriends() {
        $friends = Friendship::where('status', 'accepted')
            ->where(function ($query) {
                $query->where('user_id', auth()->id())->orWhere('friend_id', auth()->id());
            })
            ->with('user', 'friend')
            ->get()
            ->map(function ($friendship) {
                return $friendship->user_id === auth()->id() ? $friendship->friend : $friendship->user;
            });

        return response()->json($friends);
    }

    public function pendingRequests() {
        $incomingRequests = Friendship::where('friend_id', auth()->id())
            ->where('status', 'pending')
            ->with('user')
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'user' => $request->user,
                    'type' => 'incoming'
                ];
            });

        $outgoingRequests = Friendship::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->with('friend')
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'user' => $request->friend,
                    'type' => 'outgoing'
                ];
            });

        return response()->json($incomingRequests->concat($outgoingRequests));
    }
}
