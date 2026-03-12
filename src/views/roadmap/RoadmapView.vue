<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { roadmapApi } from '@/api/roadmap'
import { noteApi } from '@/api/note'
import type { RoadmapNode, Note } from '@/types'
import { useRouter } from 'vue-router'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const router = useRouter()
const { addNodes, addEdges, onNodeClick, fitView } = useVueFlow()

const loading = ref(true)
const selectedNode = ref<RoadmapNode | null>(null)
const notes = ref<Note[]>([])
const loadingNotes = ref(false)
const notesSectionRef = ref<HTMLElement | null>(null)

const transformData = (nodes: RoadmapNode[]) => {
  const flowNodes = nodes.map((node) => ({
    id: node.id.toString(),
    label: node.title,
    data: { ...node },
    // 保持对称坐标
    position: { 
      x: node.node_type === 'theory' ? -200 : 200, 
      y: node.sort_order * 220 
    },
    class: `custom-node ${node.status}`,
  }))

  const flowEdges = nodes
    .filter((node) => node.parent_id !== null)
    .map((node) => ({
      id: `e${node.parent_id}-${node.id}`,
      source: node.parent_id!.toString(),
      target: node.id.toString(),
      animated: nodes.find(n => n.id === node.id)?.status === 'in_progress',
      type: 'smoothstep',
      style: { stroke: '#cbd5e1', strokeWidth: 2 },
    }))

  return { flowNodes, flowEdges }
}

onMounted(async () => {
  try {
    const data = await roadmapApi.getNodes()
    const { flowNodes, flowEdges } = transformData(data)
    
    addNodes(flowNodes)
    addEdges(flowEdges)
    
    // 💡 第一次静默对齐，使用极小的 padding (0.1) 强制放大
    await nextTick()
    fitView({ padding: 0.1, duration: 0 }) 
    
    setTimeout(async () => {
      loading.value = false
      await nextTick()
      // 💡 第二次带动画的对齐，确保节点在视觉上处于“饱满”状态
      fitView({ padding: 0.1, duration: 1000 }) 
    }, 300)

  } catch (err) {
    console.error(err)
    loading.value = false
  }
})

onNodeClick(async ({ node }) => {
  selectedNode.value = node.data as RoadmapNode
  loadingNotes.value = true
  try {
    const data = await noteApi.getNotesByNode(Number(node.id))
    notes.value = data
    await nextTick()
    if (notesSectionRef.value) {
      notesSectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  } catch (err) {
    notes.value = []
  } finally {
    loadingNotes.value = false
  }
})

const viewNoteDetail = (id: number) => router.push(`/note/${id}`)
</script>

<template>
  <div :class="[selectedNode ? 'min-h-screen overflow-y-auto' : 'h-screen overflow-hidden']" class="w-full bg-white transition-all duration-500">
    
    <div class="relative h-screen w-full bg-slate-50/20">
      <div v-if="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-white">
         <div class="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div class="absolute top-8 right-8 z-20">
        <button @click="router.push('/note/create')" 
          class="bg-slate-900 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">
          + New Note
        </button>
      </div>

      <VueFlow class="bg-transparent">
        <Background pattern-color="#e2e8f0" :gap="40" variant="dots" />
        <Controls />
      </VueFlow>
      
      <div class="absolute bottom-8 w-full flex justify-center pointer-events-none">
        <div class="flex flex-col items-center gap-3">
          <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Interactive Knowledge Graph</span>
          <div v-if="!selectedNode" class="w-px h-8 bg-linear-to-b from-slate-200 to-transparent"></div>
        </div>
      </div>
    </div>

    <section v-if="selectedNode" ref="notesSectionRef" class="min-h-screen bg-white transition-opacity duration-1000 animate-in fade-in">
      <div class="max-w-7xl mx-auto py-32 px-12">
        <div class="border-l-4 border-blue-600 pl-8 mb-20">
          <h2 class="text-5xl font-black text-slate-900 tracking-tight leading-tight">{{ selectedNode.title }}</h2>
          <p class="text-xl text-slate-400 mt-4 font-medium italic max-w-2xl">{{ selectedNode.description }}</p>
        </div>

        <div v-if="loadingNotes" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="h-80 bg-slate-50 animate-pulse rounded-4xl"></div>
        </div>

        <div v-else-if="notes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div v-for="note in notes" :key="note.id" @click="viewNoteDetail(note.id)"
            class="group bg-slate-50/50 p-10 rounded-4xl border border-transparent hover:bg-white hover:border-blue-200 hover:shadow-[0_40px_80px_rgba(59,130,246,0.08)] transition-all duration-500 cursor-pointer">
            <div class="flex justify-between items-start mb-10">
              <time class="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{{ new Date(note.created_at).toLocaleDateString() }}</time>
              <span class="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
            <h3 class="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">{{ note.title }}</h3>
            <p class="text-slate-500 mt-4 text-sm line-clamp-2 leading-relaxed">{{ note.summary || 'Deep dive into LLM architecture...' }}</p>
          </div>
        </div>

        <div v-else class="text-center py-40 rounded-[3rem] border-2 border-dashed border-slate-100">
          <p class="text-slate-300 text-2xl font-bold italic">No records in this module yet.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

.custom-node {
  /* 💡 节点整体再次放大：min-w-80, px-12 py-8, text-base */
  @apply rounded-2xl border-2 px-12 py-8 font-black transition-all shadow-md text-base min-w-80 text-center cursor-pointer 
         bg-white border-slate-200 text-slate-800 hover:border-blue-500 hover:shadow-2xl;
}

.custom-node.completed { @apply border-emerald-500/30 text-emerald-600 bg-emerald-50/30; }
.custom-node.in_progress { @apply border-blue-500 text-blue-600 bg-blue-50 shadow-[0_0_25px_rgba(59,130,246,0.15)]; }
.custom-node.todo { @apply border-slate-100 text-slate-300; }

:deep(.vue-flow__node.selected) .custom-node {
  @apply border-blue-600 ring-12 ring-blue-500/5 scale-105;
}

:deep(.vue-flow__edge-path) {
  stroke: #f1f5f9;
  stroke-width: 4; /* 线条也加粗一点 */
}
:deep(.vue-flow__edge.animated .vue-flow__edge-path) {
  stroke: #3b82f6;
  stroke-dasharray: 6;
}
</style>