<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q');
        
        // Ensure we have a search query
        if (empty($query)) {
            return response()->json([]);
        }
        
        $users = User::where('id', '!=', auth()->id())
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'email']);

        return response()->json($users);
    }
}