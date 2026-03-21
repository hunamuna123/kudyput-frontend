<template>
  <div class="min-h-screen flex items-center justify-center bg-cream-light relative overflow-hidden px-5">
    <div class="absolute w-[400px] h-[400px] rounded-full pointer-events-none blur-[120px] -top-25 right-[10%] bg-accent/12"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full pointer-events-none blur-[120px] -bottom-25 left-[10%] bg-primary/8"></div>

    <div class="relative z-10 w-full max-w-[420px] flex flex-col items-center">
      <NuxtLink to="/" class="font-body font-bold text-[1.4rem] text-primary no-underline mb-8 tracking-wide transition-colors duration-200 hover:text-accent">
        КудыТуды
      </NuxtLink>
      <slot />
    </div>
  </div>
</template>
