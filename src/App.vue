<script setup lang="ts">
// 这里可以放全局导航栏
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <header class="mx-auto max-w-6xl mb-8">
      <h1 class="text-3xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        LLM LEARNING TRACKER
      </h1>
    </header>

    <main class="mx-auto max-w-6xl">
      <!-- 路由出口 -->
      <router-view />
    </main>
  </div>
</template>