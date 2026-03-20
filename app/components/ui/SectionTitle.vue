<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

withDefaults(defineProps<Props>(), {
  align: 'center',
});
</script>

<template>
  <div class="section-title" :class="`section-title--${align}`">
    <h2 class="section-title__heading">{{ title }}</h2>
    <p v-if="subtitle" class="section-title__sub">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.section-title {
  margin-bottom: 48px;
}

.section-title--center {
  text-align: center;
}

.section-title--left {
  text-align: left;
}

.section-title__heading {
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 4vw, 3rem);
  color: var(--color-primary);
  line-height: 1.15;
  margin-bottom: 12px;
}

.section-title__sub {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: clamp(0.95rem, 1.5vw, 1.15rem);
  color: var(--color-primary-light);
  max-width: 520px;
  line-height: 1.6;
}

.section-title--center .section-title__sub {
  margin-inline: auto;
}
</style>
