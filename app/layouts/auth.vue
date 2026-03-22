<template>
  <div class="min-h-screen flex flex-col items-center justify-start bg-white border border-accent/40 relative overflow-hidden px-4 pt-12 pb-16 md:pb-0">
    <div class="absolute w-[400px] h-[400px] rounded-full pointer-events-none blur-[120px] -top-25 right-[10%] bg-accent/12"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full pointer-events-none blur-[120px] -bottom-25 left-[10%] bg-primary/8"></div>

    <div class="relative z-10 w-full max-w-[400px] flex flex-col items-center">
      <NuxtLink to="/" class="font-body font-bold text-2xl text-primary no-underline mb-6 tracking-wide transition-colors duration-200 hover:text-accent">
        КудыТуды
      </NuxtLink>
      <slot />
    </div>

    <ModulesMobileBottomNav />
  </div>
</template>
