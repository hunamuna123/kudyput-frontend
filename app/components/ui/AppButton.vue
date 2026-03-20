<script setup lang="ts">
interface Props {
  label: string;
  variant?: 'accent' | 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

withDefaults(defineProps<Props>(), {
  variant: 'accent',
  size: 'md',
});
</script>

<template>
  <button
    class="app-btn"
    :class="[`app-btn--${variant}`, `app-btn--${size}`]"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.app-btn {
  font-family: var(--font-body);
  font-weight: 700;
  border: 2px solid transparent;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.app-btn--sm {
  padding: 8px 20px;
  font-size: 0.82rem;
}

.app-btn--md {
  padding: 14px 36px;
  font-size: 0.95rem;
}

.app-btn--lg {
  padding: 18px 48px;
  font-size: 1.1rem;
}

.app-btn--accent {
  background-color: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
  box-shadow: 0 6px 24px rgba(164, 190, 79, 0.3);
}

.app-btn--accent:hover {
  background-color: var(--color-accent-dark);
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(164, 190, 79, 0.4);
}

.app-btn--primary {
  background-color: var(--color-primary);
  color: var(--color-cream);
  border-color: var(--color-primary);
  box-shadow: 0 6px 24px rgba(40, 90, 113, 0.2);
}

.app-btn--primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(40, 90, 113, 0.3);
}

.app-btn--outline {
  background-color: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.app-btn--outline:hover {
  background-color: var(--color-primary);
  color: var(--color-cream);
  transform: translateY(-2px);
}
</style>
