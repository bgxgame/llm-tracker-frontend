<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { noteApi } from '@/api/note'
import { roadmapApi } from '@/api/roadmap'
import { useLocaleStore } from '@/store/locale'
import type { Note, RoadmapNode } from '@/types'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const router = useRouter()
const localeStore = useLocaleStore()
const { addNodes, addEdges, onNodeClick, setViewport, dimensions } = useVueFlow()

const loading = ref(true)
const nodesData = ref<RoadmapNode[]>([])
const selectedNode = ref<RoadmapNode | null>(null)
const notes = ref<Note[]>([])
const loadingNotes = ref(false)
const errorMessage = ref('')

const copy = computed(() =>
  localeStore.isChinese
    ? {
        eyebrow: '路线图',
        title: '先看整体路径，再进入具体节点',
        summary: '把关键工作拆成可理解的路径。点击任一节点，就能看到说明和关联笔记。',
        totalNodes: '节点总数',
        inProgress: '进行中',
        completed: '已完成',
        hintTitle: '点击一个节点查看详情',
        hintBody: '节点说明和关联笔记会显示在下方，方便从整体路径快速进入具体内容。',
        loading: '正在加载路线图...',
        loadError: '加载路线图失败',
        selectedNode: '当前节点',
        linkedNotes: '关联笔记',
        openNote: '打开笔记',
        noNotes: '这个节点下还没有笔记。',
        loadingNotes: '正在加载节点笔记...',
        noDescription: '这个节点还没有补充说明。',
        todo: '待开始',
        doing: '进行中',
        done: '已完成',
        theory: '理论',
        coding: '编码',
        project: '项目',
      }
    : {
        eyebrow: 'Roadmap',
        title: 'See the full path before diving into a node',
        summary: 'Break work into a path the team can understand. Click any node to view its details and linked notes.',
        totalNodes: 'Total nodes',
        inProgress: 'In progress',
        completed: 'Completed',
        hintTitle: 'Click a node to see details',
        hintBody: 'The description and linked notes appear below so you can move from the big picture into the work.',
        loading: 'Loading roadmap...',
        loadError: 'Unable to load roadmap',
        selectedNode: 'Selected node',
        linkedNotes: 'Linked notes',
        openNote: 'Open note',
        noNotes: 'There are no notes under this node yet.',
        loadingNotes: 'Loading notes...',
        noDescription: 'No description yet.',
        todo: 'Todo',
        doing: 'In progress',
        done: 'Completed',
        theory: 'Theory',
        coding: 'Coding',
        project: 'Project',
      }
)

const metrics = computed(() => ({
  total: nodesData.value.length,
  inProgress: nodesData.value.filter((node) => node.status === 'in_progress').length,
  completed: nodesData.value.filter((node) => node.status === 'completed').length,
}))

const transformData = (nodes: RoadmapNode[]) => {
  const minOrder = Math.min(...nodes.map((node) => node.sort_order))

  const flowNodes = nodes.map((node) => ({
    id: node.id.toString(),
    label: node.title,
    data: { ...node },
    position: {
      x: node.node_type === 'theory' ? 80 : node.node_type === 'coding' ? 360 : 640,
      y: (node.sort_order - minOrder) * 180 + 80,
    },
    class: `roadmap-node roadmap-node-${node.status}`,
  }))

  const flowEdges = nodes
    .filter((node) => node.parent_id)
    .map((node) => ({
      id: `e${node.parent_id}-${node.id}`,
      source: node.parent_id!.toString(),
      target: node.id.toString(),
      animated: node.status === 'in_progress',
      type: 'smoothstep',
      style: { stroke: '#c9c2b8', strokeWidth: 3 },
    }))

  return { flowNodes, flowEdges }
}

const fetchNotesByNode = async (nodeId: number) => {
  loadingNotes.value = true

  try {
    notes.value = await noteApi.getNotesByNode(nodeId)
  } catch {
    notes.value = []
  } finally {
    loadingNotes.value = false
  }
}

const statusLabel = (status: RoadmapNode['status']) => {
  if (status === 'completed') return copy.value.done
  if (status === 'in_progress') return copy.value.doing
  return copy.value.todo
}

const typeLabel = (type: RoadmapNode['node_type']) => {
  if (type === 'coding') return copy.value.coding
  if (type === 'project') return copy.value.project
  return copy.value.theory
}

onMounted(async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await roadmapApi.getNodes()
    nodesData.value = data

    const { flowNodes, flowEdges } = transformData(data)
    addNodes(flowNodes)
    addEdges(flowEdges)

    await nextTick()

    setTimeout(() => {
      const containerWidth = dimensions.value.width || window.innerWidth
      setViewport({ x: Math.max(0, containerWidth / 2 - 420), y: 20, zoom: 0.9 }, { duration: 0 })
      loading.value = false
    }, 250)
  } catch (error: any) {
    errorMessage.value = error.message || copy.value.loadError
    loading.value = false
  }
})

onNodeClick(async ({ node }) => {
  selectedNode.value = node.data as RoadmapNode
  await fetchNotesByNode(Number(node.id))
})

const viewNoteDetail = (id: number) => router.push(`/note/${id}`)
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#faf7f0_0%,#f4f1eb_100%)]">
    <div class="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <header class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl">
          <div class="product-eyebrow border border-[rgba(45,122,120,0.14)] bg-white/80 text-[var(--accent)]">
            <span class="h-2.5 w-2.5 rounded-full bg-[var(--accent)]"></span>
            {{ copy.eyebrow }}
          </div>
          <h1 class="product-title mt-7 text-4xl leading-[0.96] md:text-6xl">{{ copy.title }}</h1>
          <p class="mt-5 text-base leading-8 text-[var(--ink-soft)]">{{ copy.summary }}</p>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <article class="metric-card">
            <div class="metric-label">{{ copy.totalNodes }}</div>
            <div class="metric-value">{{ metrics.total }}</div>
          </article>
          <article class="metric-card">
            <div class="metric-label">{{ copy.inProgress }}</div>
            <div class="metric-value">{{ metrics.inProgress }}</div>
          </article>
          <article class="metric-card">
            <div class="metric-label">{{ copy.completed }}</div>
            <div class="metric-value">{{ metrics.completed }}</div>
          </article>
        </div>
      </header>

      <div v-if="errorMessage" class="product-error mt-8 px-5 py-4 text-sm font-semibold">
        {{ errorMessage }}
      </div>

      <section class="canvas-shell mt-8">
        <div v-if="loading" class="canvas-loading">{{ copy.loading }}</div>

        <VueFlow v-else class="h-full w-full bg-transparent">
          <Background pattern-color="#d9d1c7" :gap="28" variant="dots" />
          <Controls />
        </VueFlow>
      </section>

      <section class="mt-8">
        <article v-if="selectedNode" class="detail-shell">
          <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div class="max-w-3xl">
              <div class="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--accent)]">{{ copy.selectedNode }}</div>
              <h2 class="mt-3 text-3xl font-black tracking-[-0.05em] text-[var(--ink-strong)]">{{ selectedNode.title }}</h2>
              <div class="mt-4 flex flex-wrap gap-2">
                <span class="pill pill-brand">{{ typeLabel(selectedNode.node_type) }}</span>
                <span class="pill">{{ statusLabel(selectedNode.status) }}</span>
              </div>
              <p class="mt-5 text-base leading-8 text-[var(--ink-soft)]">{{ selectedNode.description || copy.noDescription }}</p>
            </div>
          </div>

          <div class="mt-8">
            <div class="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--brand)]">{{ copy.linkedNotes }}</div>

            <div v-if="loadingNotes" class="mt-4 text-sm font-semibold text-[var(--ink-soft)]">
              {{ copy.loadingNotes }}
            </div>

            <div v-else-if="notes.length > 0" class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="note in notes"
                :key="note.id"
                class="note-card"
                @click="viewNoteDetail(note.id)"
              >
                <div class="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                  {{ new Date(note.created_at).toLocaleDateString(localeStore.locale) }}
                </div>
                <h3 class="mt-3 text-lg font-black tracking-tight text-[var(--ink-strong)]">{{ note.title }}</h3>
                <p class="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{{ note.summary || copy.noDescription }}</p>
                <div class="mt-4 text-[11px] font-black text-[var(--brand)]">{{ copy.openNote }}</div>
              </article>
            </div>

            <div v-else class="mt-4 text-sm font-semibold text-[var(--ink-soft)]">
              {{ copy.noNotes }}
            </div>
          </div>
        </article>

        <article v-else class="hint-shell">
          <h2 class="text-2xl font-black tracking-[-0.04em] text-[var(--ink-strong)]">{{ copy.hintTitle }}</h2>
          <p class="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{{ copy.hintBody }}</p>
        </article>
      </section>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

.canvas-shell {
  @apply relative h-[68vh] min-h-[520px] overflow-hidden rounded-[2rem] border border-[rgba(20,33,43,0.08)] bg-[rgba(255,251,245,0.82)] shadow-[0_18px_50px_rgba(20,33,43,0.05)];
}

.canvas-loading {
  @apply flex h-full items-center justify-center text-sm font-semibold text-[var(--ink-soft)];
}

.metric-card {
  @apply rounded-[1.6rem] border border-[rgba(20,33,43,0.08)] bg-[rgba(255,251,245,0.84)] px-4 py-4 shadow-[0_10px_24px_rgba(20,33,43,0.04)];
}

.metric-label {
  @apply text-[10px] font-black uppercase tracking-[0.22em] text-[var(--ink-soft)];
}

.metric-value {
  @apply mt-3 font-[var(--font-display)] text-3xl font-black tracking-[-0.05em] text-[var(--ink-strong)];
}

.detail-shell,
.hint-shell {
  @apply rounded-[2rem] border border-[rgba(20,33,43,0.08)] bg-[rgba(255,255,255,0.72)] p-6 shadow-[0_18px_50px_rgba(20,33,43,0.05)];
}

.note-card {
  @apply cursor-pointer rounded-[1.4rem] border border-[rgba(20,33,43,0.08)] bg-[rgba(255,250,242,0.9)] p-5 transition-all;
}

.note-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(20, 33, 43, 0.06);
}

.pill {
  @apply inline-flex rounded-full bg-[rgba(20,33,43,0.06)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--ink-main)];
}

.pill-brand {
  @apply bg-[rgba(216,110,59,0.12)] text-[var(--brand)];
}

:deep(.roadmap-node) {
  @apply min-w-[220px] rounded-[1.4rem] border-2 bg-white px-5 py-4 text-center text-sm font-black tracking-tight text-[var(--ink-strong)] shadow-[0_10px_24px_rgba(20,33,43,0.05)];
}

:deep(.roadmap-node-todo) {
  border-color: rgba(20, 33, 43, 0.16);
}

:deep(.roadmap-node-in_progress) {
  border-color: rgba(216, 110, 59, 0.52);
  box-shadow: 0 0 0 6px rgba(216, 110, 59, 0.08);
}

:deep(.roadmap-node-completed) {
  border-color: rgba(45, 122, 120, 0.34);
}

:deep(.vue-flow__node.selected .roadmap-node) {
  box-shadow: 0 0 0 6px rgba(45, 122, 120, 0.08);
}
</style>
