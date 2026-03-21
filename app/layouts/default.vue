<template>
  <div class="min-h-screen flex flex-col">
    <ModulesAppNavbar />
    <main class="flex-1 md:pt-16 pb-16 md:pb-0">
      <slot />
    </main>
    <ModulesAppFooter class="hidden md:block" />
    <ModulesMobileBottomNav />
  </div>
</template>
