<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { roadmapApi } from '@/api/roadmap'
import { workspaceApi } from '@/api/workspace'
import { useAuthStore } from '@/store/auth'
import { useLocaleStore } from '@/store/locale'
import type { RoadmapNode, WorkspaceSearchNoteItem, WorkspaceSearchResponse, WorkspaceSearchRoadmapItem } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const localeStore = useLocaleStore()

const loading = ref(false)
const errorMessage = ref('')
const searchTerm = ref('')
const searchResults = ref<WorkspaceSearchResponse | null>(null)
const roadmapNodes = ref<RoadmapNode[]>([])

let searchTimer: ReturnType<typeof setTimeout> | null = null

const copy = computed(() =>
  localeStore.isChinese
    ? {
        kicker: '搜索',
        title: '搜索内容',
        summary: '搜索路线图和笔记。',
        placeholder: '搜索节点标题、研究结论、方法、成员信息',
        loading: '正在搜索...',
        loadError: '搜索失败，请稍后重试',
        empty: '输入关键词后，这里会返回路线图节点和笔记结果。',
        noResults: '没有找到匹配内容。',
        roadmap: '路线图结果',
        notes: '笔记结果',
        openRoadmap: '进入路线图',
        openNote: '打开笔记',
        noSummary: '这条笔记还没有摘要。',
        unknownNode: '未关联节点',
        linkedNode: '关联节点',
        updatedAt: '最近更新',
        createdAt: '创建时间',
        theory: '理论',
        coding: '编码',
        project: '项目',
        todo: '待开始',
        inProgress: '进行中',
        completed: '已完成',
      }
    : {
        kicker: 'Search',
        title: 'Search content',
        summary: 'Search roadmap and notes.',
        placeholder: 'Search node titles, findings, methods, or members',
        loading: 'Searching...',
        loadError: 'Unable to search right now',
        empty: 'Type a keyword and this page will return roadmap nodes and notes.',
        noResults: 'No results matched the current query.',
        roadmap: 'Roadmap results',
        notes: 'Note results',
        openRoadmap: 'Open roadmap',
        openNote: 'Open note',
        noSummary: 'This note does not have a summary yet.',
        unknownNode: 'No linked node',
        linkedNode: 'Linked node',
        updatedAt: 'Updated',
        createdAt: 'Created',
        theory: 'Theory',
        coding: 'Coding',
        project: 'Project',
        todo: 'Todo',
        inProgress: 'In progress',
        completed: 'Completed',
      }
)

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(localeStore.locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const typeLabel = (type: string) => {
  if (type === 'coding') return copy.value.coding
  if (type === 'project') return copy.value.project
  return copy.value.theory
}

const statusLabel = (status: string) => {
  if (status === 'completed') return copy.value.completed
  if (status === 'in_progress') return copy.value.inProgress
  return copy.value.todo
}

const resolveNodeTitle = (nodeId: number | null) => {
  if (!nodeId) return copy.value.unknownNode
  return roadmapNodes.value.find((node) => node.id === nodeId)?.title ?? `${copy.value.linkedNode} #${nodeId}`
}

const fetchRoadmapNodes = async () => {
  if (!authStore.activeWorkspaceId) {
    roadmapNodes.value = []
    return
  }

  try {
    roadmapNodes.value = await roadmapApi.getNodes()
  } catch {
    roadmapNodes.value = []
  }
}

const performSearch = async () => {
  const q = searchTerm.value.trim()

  if (!authStore.activeWorkspaceId || !q) {
    searchResults.value = null
    errorMessage.value = ''
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    searchResults.value = await workspaceApi.searchWorkspace(authStore.activeWorkspaceId, q)
  } catch (error: any) {
    searchResults.value = null
    errorMessage.value = error.message || copy.value.loadError
  } finally {
    loading.value = false
  }
}

const openRoadmapResult = (item: WorkspaceSearchRoadmapItem) => {
  router.push({ name: 'admin-roadmap', query: { search: item.title } })
}

const openNoteResult = (item: WorkspaceSearchNoteItem) => {
  router.push(item.href)
}

watch(
  () => route.query.q,
  (value) => {
    searchTerm.value = typeof value === 'string' ? value : ''
    performSearch()
  },
  { immediate: true }
)

watch(
  () => authStore.activeWorkspaceId,
  () => {
    fetchRoadmapNodes()
    performSearch()
  },
  { immediate: true }
)

watch(searchTerm, () => {
  if (searchTimer) clearTimeout(searchTimer)

  searchTimer = setTimeout(() => {
    const q = searchTerm.value.trim()
    router.replace({ name: 'admin-search', query: q ? { q } : {} })
  }, 220)
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <div class="admin-page">
    <header class="max-w-4xl">
      <div class="admin-kicker">{{ copy.kicker }}</div>
      <h1 class="admin-headline mt-3">{{ copy.title }}</h1>
      <p class="admin-subtitle mt-5">{{ copy.summary }}</p>
    </header>

    <section class="admin-card mt-6 p-6">
      <input v-model="searchTerm" type="text" class="admin-input !text-base" :placeholder="copy.placeholder" />
    </section>

    <div v-if="errorMessage" class="product-error mt-5 px-5 py-4 text-sm font-semibold">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="admin-empty mt-6">
      {{ copy.loading }}
    </div>

    <div v-else-if="!searchTerm.trim()" class="admin-empty mt-6">
      {{ copy.empty }}
    </div>

    <div v-else-if="searchResults && searchResults.total_results === 0" class="admin-empty mt-6">
      {{ copy.noResults }}
    </div>

    <template v-else-if="searchResults">
      <section class="mt-6 grid gap-6 xl:grid-cols-2">
        <article class="admin-card p-6">
          <div class="admin-card-title">{{ copy.roadmap }}</div>
          <div class="mt-5 space-y-3">
            <article v-for="item in searchResults.roadmap_results" :key="item.id" class="admin-list-card">
              <div class="flex flex-wrap gap-2">
                <span class="admin-chip-warm">{{ typeLabel(item.node_type) }}</span>
                <span class="admin-chip">{{ statusLabel(item.status) }}</span>
              </div>
              <div class="mt-3 text-lg font-semibold text-[var(--ink-strong)]">{{ item.title }}</div>
              <p class="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{{ item.description || item.title }}</p>
              <div class="mt-3 text-xs text-[var(--ink-soft)]">{{ copy.updatedAt }} {{ formatDate(item.updated_at) }}</div>
              <button class="mt-4 text-sm font-semibold text-[var(--ink-strong)]" type="button" @click="openRoadmapResult(item)">
                {{ copy.openRoadmap }}
              </button>
            </article>
          </div>
        </article>

        <article class="admin-card p-6">
          <div class="admin-card-title">{{ copy.notes }}</div>
          <div class="mt-5 space-y-3">
            <article v-for="item in searchResults.note_results" :key="item.id" class="admin-list-card">
              <span class="admin-chip">{{ copy.linkedNode }} {{ resolveNodeTitle(item.node_id) }}</span>
              <div class="mt-3 text-lg font-semibold text-[var(--ink-strong)]">{{ item.title }}</div>
              <p class="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{{ item.summary || copy.noSummary }}</p>
              <div class="mt-3 text-xs text-[var(--ink-soft)]">{{ copy.createdAt }} {{ formatDate(item.created_at) }}</div>
              <button class="mt-4 text-sm font-semibold text-[var(--ink-strong)]" type="button" @click="openNoteResult(item)">
                {{ copy.openNote }}
              </button>
            </article>
          </div>
        </article>
      </section>
    </template>
  </div>
</template>
