<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { VueFlow } from '@vue-flow/core'
import { workspaceApi } from '@/api/workspace'
import { useLocaleStore } from '@/store/locale'
import type { RoadmapNode, WorkspaceSharedNote, WorkspaceSharedRoadmap } from '@/types'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const route = useRoute()
const router = useRouter()
const localeStore = useLocaleStore()

const roadmap = ref<WorkspaceSharedRoadmap | null>(null)
const notes = ref<WorkspaceSharedNote[]>([])
const selectedNode = ref<RoadmapNode | null>(null)
const loading = ref(true)
const loadingNotes = ref(false)
const errorMessage = ref('')

const token = computed(() => String(route.params.token || ''))
const presetNodeId = computed(() => {
  const value = Number(route.query.nodeId)
  return Number.isFinite(value) && value > 0 ? value : null
})

const copy = computed(() =>
  localeStore.isChinese
    ? {
        title: '路线图',
        summary: '先看主线，再点节点继续阅读对应内容。',
        loading: '正在加载路线图...',
        notesLoading: '正在加载笔记...',
        loadError: '这个分享页面已失效或不存在。',
        notesTitle: '公开内容',
        noNotes: '这个节点下还没有公开笔记。',
        noDescription: '这个节点还没有补充说明。',
        emptyHint: '点一个节点，继续往下看内容。',
        openNote: '进入阅读',
        shareTag: '公开分享',
        registerAction: '立即免费使用',
        loginAction: '登录',
        openCanvas: '点节点展开内容',
        theory: '理论',
        coding: '编码',
        project: '项目',
        todo: '待开始',
        inProgress: '进行中',
        completed: '已完成',
      }
    : {
        title: 'Roadmap',
        summary: 'See the path first, then continue into the linked public content.',
        loading: 'Loading roadmap...',
        notesLoading: 'Loading notes...',
        loadError: 'This shared page is no longer available.',
        notesTitle: 'Public content',
        noNotes: 'There are no public notes under this node yet.',
        noDescription: 'No description yet.',
        emptyHint: 'Click a node and continue into the content below.',
        openNote: 'Open note',
        shareTag: 'Public share',
        registerAction: 'Start free',
        loginAction: 'Sign in',
        openCanvas: 'Click a node to open content',
        theory: 'Theory',
        coding: 'Coding',
        project: 'Project',
        todo: 'Todo',
        inProgress: 'In progress',
        completed: 'Completed',
      }
)

const flowNodes = computed(() =>
  (roadmap.value?.nodes ?? []).map((node) => ({
    id: String(node.id),
    label: node.title,
    data: node,
    position: {
      x: node.node_type === 'theory' ? 80 : node.node_type === 'coding' ? 340 : 600,
      y: node.sort_order * 176 + 56,
    },
    class: `share-node share-node-${node.status} ${selectedNode.value?.id === node.id ? 'share-node-selected' : ''}`,
  }))
)

const flowEdges = computed(() =>
  (roadmap.value?.nodes ?? [])
    .filter((node) => node.parent_id)
    .map((node) => ({
      id: `edge-${node.parent_id}-${node.id}`,
      source: String(node.parent_id),
      target: String(node.id),
      animated: node.status === 'in_progress',
      type: 'smoothstep',
      style: { stroke: '#d1d5db', strokeWidth: 2.5 },
    }))
)

const typeLabel = (type: RoadmapNode['node_type']) => {
  if (type === 'coding') return copy.value.coding
  if (type === 'project') return copy.value.project
  return copy.value.theory
}

const statusLabel = (status: RoadmapNode['status']) => {
  if (status === 'completed') return copy.value.completed
  if (status === 'in_progress') return copy.value.inProgress
  return copy.value.todo
}

const notePreview = (note: WorkspaceSharedNote) => {
  const source = note.summary?.trim() || note.content.trim()
  const normalized = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return normalized.length > 120 ? `${normalized.slice(0, 120)}...` : normalized
}

const loadRoadmap = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    roadmap.value = await workspaceApi.getSharedRoadmap(token.value)
    const preset = presetNodeId.value
    if (preset) {
      const targetNode = roadmap.value.nodes.find((node) => node.id === preset)
      if (targetNode) {
        await loadNotes(targetNode)
      }
    }
  } catch (error: any) {
    roadmap.value = null
    errorMessage.value = error.message || copy.value.loadError
  } finally {
    loading.value = false
  }
}

const loadNotes = async (node: RoadmapNode) => {
  selectedNode.value = node
  loadingNotes.value = true

  try {
    const response = await workspaceApi.getSharedNodeNotes(token.value, node.id)
    notes.value = response.notes
    setTimeout(() => {
      document.getElementById('shared-roadmap-notes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  } catch {
    notes.value = []
  } finally {
    loadingNotes.value = false
  }
}

const handleNodeClick = async (payload: { node: { data: RoadmapNode } }) => {
  await loadNotes(payload.node.data)
}

const openNote = (noteId: number) => {
  router.push({
    path: `/share/${token.value}/notes/${noteId}`,
    query: selectedNode.value ? { nodeId: String(selectedNode.value.id) } : {},
  })
}

onMounted(() => {
  loadRoadmap()
})
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#fafaf8_0%,#f4f6f8_100%)] px-3 py-3 md:px-4 md:py-4">
    <section class="relative overflow-hidden rounded-[32px] border border-[rgba(15,23,42,0.06)] bg-white">
      <div class="shared-hero">
        <div class="min-w-0">
          <div class="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            {{ copy.shareTag }}
          </div>
          <h1 class="mt-3 text-[2.2rem] font-black tracking-[-0.07em] text-[var(--ink-strong)] md:text-[3rem]">
            {{ roadmap?.workspace_name || copy.title }}
          </h1>
          <p class="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] md:text-base">
            {{ copy.summary }}
          </p>
        </div>

        <div class="shared-actions">
          <button class="product-button-secondary !px-4 !py-2.5" type="button" @click="router.push('/login')">
            {{ copy.loginAction }}
          </button>
          <button class="product-button-dark !px-4 !py-2.5" type="button" @click="router.push('/register')">
            {{ copy.registerAction }}
          </button>
        </div>
      </div>

      <div class="shared-canvas-shell">
        <div v-if="loading" class="admin-empty !border-none !bg-transparent !p-0">{{ copy.loading }}</div>

        <VueFlow
          v-else-if="roadmap"
          class="h-full w-full bg-transparent"
          :nodes="flowNodes"
          :edges="flowEdges"
          :default-viewport="{ x: 0, y: 0, zoom: 0.82 }"
          :min-zoom="0.48"
          :max-zoom="1.3"
          :nodes-draggable="false"
          :elements-selectable="false"
          @node-click="handleNodeClick"
        >
          <Background pattern-color="#e5e7eb" :gap="26" variant="dots" />
          <Controls />
        </VueFlow>

        <div v-if="!loading && roadmap" class="shared-canvas-hint">
          {{ selectedNode ? selectedNode.title : copy.openCanvas }}
        </div>
      </div>
    </section>

    <div v-if="errorMessage" class="product-error mx-auto mt-4 max-w-6xl px-5 py-4 text-sm font-semibold">
      {{ errorMessage }}
    </div>

    <section
      id="shared-roadmap-notes"
      class="mx-auto mt-4 max-w-6xl rounded-[32px] border border-[rgba(15,23,42,0.06)] bg-white px-6 py-6 md:px-8"
    >
      <template v-if="selectedNode">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap gap-2">
              <span class="admin-chip-warm">{{ typeLabel(selectedNode.node_type) }}</span>
              <span :class="selectedNode.status === 'completed' ? 'admin-chip-green' : selectedNode.status === 'in_progress' ? 'admin-chip-blue' : 'admin-chip'">
                {{ statusLabel(selectedNode.status) }}
              </span>
            </div>

            <h2 class="mt-4 text-3xl font-bold tracking-[-0.04em] text-[var(--ink-strong)]">{{ selectedNode.title }}</h2>
            <p class="mt-3 max-w-3xl text-base leading-8 text-[var(--ink-soft)]">{{ selectedNode.description || copy.noDescription }}</p>
          </div>
        </div>

        <div class="mt-8 text-sm font-semibold text-[var(--ink-main)]">{{ copy.notesTitle }}</div>

        <div v-if="loadingNotes" class="admin-empty mt-4">{{ copy.notesLoading }}</div>
        <div v-else-if="notes.length > 0" class="grid gap-4 md:grid-cols-2">
          <button
            v-for="note in notes"
            :key="note.id"
            type="button"
            class="admin-list-card shared-note-card block text-left"
            @click="openNote(note.id)"
          >
            <div class="flex flex-wrap gap-2">
              <span class="admin-chip-warm">{{ typeLabel(selectedNode.node_type) }}</span>
              <span class="admin-chip">{{ new Date(note.created_at).toLocaleDateString(localeStore.locale) }}</span>
            </div>
            <div class="mt-4 text-lg font-semibold tracking-[-0.03em] text-[var(--ink-strong)]">{{ note.title }}</div>
            <p class="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{{ notePreview(note) }}</p>
            <div v-if="note.tags?.length" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="tag in note.tags.slice(0, 3)"
                :key="tag"
                class="rounded-full bg-[rgba(15,23,42,0.05)] px-3 py-1 text-[11px] font-bold text-[var(--ink-main)]"
              >
                #{{ tag }}
              </span>
            </div>
            <div class="mt-5 text-sm font-semibold text-[var(--ink-strong)]">{{ copy.openNote }}</div>
          </button>
        </div>
        <div v-else class="admin-empty mt-4">{{ copy.noNotes }}</div>
      </template>

      <div v-else class="admin-empty">{{ copy.emptyHint }}</div>
    </section>
  </div>
</template>

<style scoped>
.shared-hero {
  display: flex;
  flex-direction: column;
  gap: 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  padding: 20px;
}

.shared-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.shared-canvas-shell {
  position: relative;
  height: calc(100vh - 188px);
  min-height: 620px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 247, 245, 0.94));
}

.shared-canvas-hint {
  position: absolute;
  left: 22px;
  top: 22px;
  z-index: 5;
  pointer-events: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  padding: 10px 14px;
  color: var(--ink-main);
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.shared-note-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 250, 248, 0.96));
}

:deep(.share-node) {
  min-width: 220px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.98);
  padding: 18px 20px;
  color: var(--ink-strong);
  font-size: 15px;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05);
}

:deep(.share-node-selected) {
  border-color: rgba(229, 106, 43, 0.4);
  box-shadow: 0 0 0 5px rgba(229, 106, 43, 0.08), 0 16px 28px rgba(15, 23, 42, 0.08);
}

:deep(.share-node-in_progress) {
  border-color: rgba(15, 23, 42, 0.36);
  box-shadow: 0 0 0 6px rgba(15, 23, 42, 0.04), 0 14px 30px rgba(15, 23, 42, 0.08);
}

:deep(.share-node-completed) {
  border-color: rgba(21, 128, 61, 0.2);
  background: rgba(248, 255, 251, 0.98);
}

@media (min-width: 768px) {
  .shared-hero {
    flex-direction: row;
    align-items: end;
    justify-content: space-between;
    padding: 24px;
  }
}
</style>
