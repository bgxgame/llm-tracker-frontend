<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/api/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // 💡 只有当 Pinia 里没用户数据但有 Token 时才去后端同步，减少冗余请求
  if (authStore.token && !authStore.user) {
    try {
      const userData = await authApi.getMe()
      authStore.user = userData
    } catch (err) {
      // 只有接口报错（如 Token 伪造）才清理
      authStore.logout()
    }
  }
})
</script>
<template>
  <router-view />
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  background-color: #ffffff;

  /* 💡 核心：针对 Firefox */
  scrollbar-width: none;
  /* 💡 核心：针对 IE/Edge */
  -ms-overflow-style: none;
}

/* 💡 核心：针对 Chrome, Safari, Edge (Webkit) */
html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
}

#app {
  width: 100%;
}

/* 保持滚动功能，但移除视觉干扰 */
body {
  overflow-y: auto;
}
</style>