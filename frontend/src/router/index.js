// ... existing code ...

// Add this to your routes array
{
  path: '/bets',
  name: 'bets',
  component: () => import('../views/BetsPage.vue'),
  meta: { requiresAuth: true }
},

// ... existing code ... 