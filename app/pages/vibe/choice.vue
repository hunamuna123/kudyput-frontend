<script setup lang="ts">
definePageMeta({
  middleware: [() => navigateTo("/start", { redirectCode: 301 })],
});
</script>

<template>
  <div></div>
</template>
