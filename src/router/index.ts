// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'roadmap', component: () => import('@/views/roadmap/RoadmapView.vue') },
    { path: '/note/:id', name: 'note-detail', component: () => import('@/views/note/NoteDetail.vue') },
    { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('@/views/auth/RegisterView.vue') },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      redirect: '/admin/roadmap',
      meta: { requiresAuth: true },
      children: [
        { path: 'roadmap', name: 'admin-roadmap', component: () => import('@/views/admin/NodeManager.vue') },
        {
          path: 'notes',
          name: 'admin-notes',
          component: () => import('@/views/admin/NoteManager.vue') // 💡 新指向我们的管理页
        },
        { path: 'note/create', name: 'admin-note-create', component: () => import('@/views/note/NoteEditor.vue') },
        {
          path: 'note/edit/:id', // 💡 新增：支持编辑已有笔记
          name: 'admin-note-edit',
          component: () => import('@/views/note/NoteEditor.vue')
        }
      ]
    }
  ]
})

// 💡 采用现代写法，不再使用 next()
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // 如果目标路由需要登录 且 用户未登录
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 如果用户已登录 且 尝试访问登录/注册页
  if (authStore.isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    return { name: 'admin-roadmap' }
  }
})

export default router