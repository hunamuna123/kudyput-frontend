<template>
  <div class="layout">
    <ModulesAppNavbar />
    <main class="layout__main">
      <slot />
    </main>
    <ModulesAppFooter />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout__main {
  flex: 1;
}
</style>
