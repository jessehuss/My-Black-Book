import { defineStore } from "pinia";
import api from "../api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("auth_token") || null,
  }),

  actions: {
    async register(name, email, password) {
      await api.post("/register", { name, email, password });
    },

    async login(email, password) {
      const response = await api.post("/login", { email, password });
      this.token = response.data.token;
      this.user = response.data.user;
      console.log(this.user);
      localStorage.setItem("auth_token", this.token);
    },

    async fetchUser() {
      if (!this.token) return;
      try {
        const response = await api.get("/me", {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.user = response.data;
      } catch {
        this.logout();
      }
    },

    async logout() {
      await api.post("/logout", null, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      this.token = null;
      this.user = null;
      localStorage.removeItem("auth_token");
    },

    async updateProfile({ name, email }) {
      try {
        const response = await api.put('/profile', { name, email }, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.user = response.data;
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async updatePassword({ current_password, password, password_confirmation }) {
      try {
        const response = await api.put('/password', {
          current_password,
          password,
          password_confirmation
        }, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  },
});
