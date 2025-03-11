<router-link
  to="/bets"
  class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white"
  :class="$route.path.startsWith('/bets') ? 'bg-gray-900 text-white' : 'text-gray-300'"
>
  Bets
</router-link> 