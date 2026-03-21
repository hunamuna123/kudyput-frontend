<template>
  <div class="min-h-screen flex flex-col">
    <ModulesAppNavbar />
    <main class="flex-1">
      <slot />
    </main>
    <ModulesAppFooter />
  </div>
</template>
