<template>
  <transition-group 
    name="toast-fade" 
    tag="div" 
    class="toast-container"
  >
    <div 
      v-for="(toast, index) in toasts" 
      :key="index" 
      :class="['toast', `toast-${toast.type}`]"
    >
      <div class="toast-content">{{ toast.message }}</div>
      <button @click="removeToast(index)" class="toast-close">×</button>
    </div>
  </transition-group>
</template>

<script>
import { ref } from 'vue';

const toasts = ref([]);
let toastId = 0;

function addToast(message, type = 'info', timeout = 5000) {
  const id = toastId++;
  toasts.value.push({ id, message, type });
  
  if (timeout) {
    setTimeout(() => {
      removeToastById(id);
    }, timeout);
  }
}

function removeToastById(id) {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
}

function removeToast(index) {
  toasts.value.splice(index, 1);
}

// Export methods that can be used globally
export function useToast() {
  return {
    success: (message, timeout) => addToast(message, 'success', timeout),
    error: (message, timeout) => addToast(message, 'error', timeout),
    info: (message, timeout) => addToast(message, 'info', timeout),
    warning: (message, timeout) => addToast(message, 'warning', timeout),
  };
}

export default {
  name: 'SimpleToast',
  setup() {
    return {
      toasts,
      removeToast
    };
  }
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: white;
  cursor: default;
}

.toast-success {
  background-color: #10B981;
}

.toast-error {
  background-color: #EF4444;
}

.toast-info {
  background-color: #3B82F6;
}

.toast-warning {
  background-color: #F59E0B;
}

.toast-content {
  flex: 1;
  margin-right: 8px;
}

.toast-close {
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 