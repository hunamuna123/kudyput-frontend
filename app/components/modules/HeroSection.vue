<template>
  <section class="relative min-h-screen flex flex-col justify-center overflow-hidden -mt-20 pt-20">
    <div class="absolute w-[500px] h-[500px] rounded-full bg-accent/10 -top-20 right-[5%] blur-[120px] pointer-events-none animate-pulse"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-primary/5 -bottom-16 left-[8%] blur-[100px] pointer-events-none"></div>

    <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden px-4">
      <span class="font-heading text-center leading-[1.1] text-primary/[0.06]" style="font-size: clamp(2.2rem, 10vw, 10rem);">
        ПОЗВОЛЬ КРАЮ<br/>ПОЧУВСТВОВАТЬ<br/>ТЕБЯ
      </span>
    </div>

    <div class="container relative z-10 pt-28 pb-16">
      <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div class="flex-1 min-w-0 text-left">
          <span class="inline-block font-body font-bold text-[0.65rem] tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-4 py-1.5 rounded-full mb-5">
            Краснодарский край
          </span>

          <h1 class="font-heading text-primary leading-[1.25] mb-4" style="font-size: clamp(1.4rem, 3.5vw, 3rem);">
            Позволь краю<br/>
            <span class="text-accent">почувствовать</span> тебя
          </h1>

          <p class="font-body font-light text-primary-light text-[0.92rem] leading-relaxed max-w-md mx-0 mb-8">
            Персональные маршруты по скрытым местам Кубани — винодельни, горные тропы, фермы, — подобранные ИИ под ваш настрой.
          </p>

          <div class="flex gap-3 flex-wrap justify-start">
            <NuxtLink to="/start" class="font-body font-bold text-[0.85rem] text-white bg-accent border-2 border-accent rounded-full px-7 py-3 cursor-pointer transition-all duration-300 shadow-[0_6px_28px_rgba(164,190,79,0.3)] hover:bg-accent-dark hover:border-accent-dark hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(164,190,79,0.4)] no-underline">
              ✨ ИИ подберёт
            </NuxtLink>
            <NuxtLink to="/trip/new" class="font-body font-bold text-[0.85rem] text-primary bg-transparent border-2 border-primary/20 rounded-full px-7 py-3 cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:-translate-y-0.5 no-underline">
              🗺 Выберу сам
            </NuxtLink>
          </div>
        </div>

        <div class="flex-1 w-full max-w-lg hidden lg:block">
          <div class="aspect-[4/3]"></div>
        </div>
      </div>
    </div>

    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
      <div class="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"></div>
    </div>
  </section>
</template>
