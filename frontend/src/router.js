import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "./stores/auth";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
import Home from "./views/Home.vue";
import Profile from "./views/Profile.vue";
import Friends from "./views/Friends.vue";

const routes = [
  { 
    path: "/login", 
    component: Login,
    meta: { requiresGuest: true }
  },
  { 
    path: "/register", 
    component: Register,
    meta: { requiresGuest: true }
  },
  { 
    path: "/", 
    component: Home,
    meta: { requiresAuth: true }
  },
  { 
    path: "/profile", 
    component: Profile,
    meta: { requiresAuth: true }
  },
  { 
    path: "/friends", 
    component: Friends,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  
  if (to.meta.requiresAuth && !auth.token) {
    next('/login');
  } else if (to.meta.requiresGuest && auth.token) {
    next('/');
  } else {
    next();
  }
});

export default router;
