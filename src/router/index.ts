import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'roadmap',
      component: () => import('@/views/roadmap/RoadmapView.vue')
    },
    {
      path: '/note/:id',
      name: 'note-detail',
      component: () => import('@/views/note/NoteDetail.vue')
    },
    {
      path: '/note/create',
      name: 'note-create',
      component: () => import('@/views/note/NoteEditor.vue')
    },
  ]
})

export default router