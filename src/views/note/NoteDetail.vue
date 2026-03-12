<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { noteApi } from '@/api/note'
import { roadmapApi } from '@/api/roadmap' 
import type { Note, RoadmapNode } from '@/types'
import { MdPreview, MdCatalog } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

const route = useRoute()
const router = useRouter()

const note = ref<Note | null>(null)
const artifacts = ref<any[]>([])
const roadmapNodes = ref<RoadmapNode[]>([]) 
const loading = ref(true)
const scrollElement = document.documentElement

// 侧边栏折叠状态
const isCatalogOpen = ref(false)

const goBack = () => router.push('/')
const toggleCatalog = () => isCatalogOpen.value = !isCatalogOpen.value

// 计算属性：根据 note.node_id 获取匹配的节点标题
const currentNodeTitle = computed(() => {
  if (!note.value || !note.value.node_id) return 'Unsorted Note'
  const target = roadmapNodes.value.find(n => n.id === note.value?.node_id)
  return target ? target.title : `Node ${note.value.node_id}`
})

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    const [noteData, nodesData] = await Promise.all([
      noteApi.getDetail(id),
      roadmapApi.getNodes()
    ])
    
    note.value = noteData.note
    artifacts.value = noteData.artifacts
    roadmapNodes.value = nodesData
  } catch (err) {
    console.error('Error fetching data:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 flex flex-col">
    <!-- 1. 顶部导航条 -->
    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <button @click="goBack" class="group flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-all font-black text-[10px] uppercase tracking-[0.2em]">
          <span class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-blue-600 group-hover:-translate-x-1 transition-all">←</span>
          Exit Module
        </button>
        <div v-if="note" class="flex items-center gap-4">
          <span class="text-[10px] font-black bg-blue-600 text-white px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-blue-500/20">
            {{ currentNodeTitle }}
          </span>
          <div class="h-4 w-px bg-slate-200"></div>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ new Date(note.created_at).toLocaleDateString() }}</span>
        </div>
      </div>
    </nav>

    <!-- 2. 下方内容区 -->
    <div class="flex-1 flex relative">
      
      <!-- 左侧可折叠目录 -->
      <aside 
        :class="[isCatalogOpen ? 'w-80' : 'w-16']"
        class="sticky top-20 h-[calc(100vh-5rem)] border-r border-slate-200/60 bg-white transition-all duration-500 ease-in-out z-40 flex flex-col group"
      >
        <button 
          @click="toggleCatalog"
          class="h-16 w-full flex items-center justify-center border-b border-slate-100 hover:bg-slate-50 transition-colors"
        >
          <span v-if="!isCatalogOpen" class="text-slate-400 font-black text-xs uppercase tracking-widest rotate-90">Index</span>
          <span v-else class="text-blue-600 font-black text-xs uppercase tracking-widest">Close Index</span>
        </button>

        <div v-show="isCatalogOpen" class="flex-1 overflow-y-auto p-8 animate-in fade-in duration-700">
          <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 pb-4 border-b border-slate-50">Content Index</h4>
          <MdCatalog 
            :editorId="'preview-only'" 
            :scrollElement="scrollElement" 
            class="text-sm font-bold text-slate-600 catalog-custom" 
          />
        </div>
      </aside>

      <!-- 正文主体 -->
      <main class="flex-1 min-w-0 bg-white shadow-[inset_1px_0_0_0_rgba(0,0,0,0.02)]">
        <div v-if="loading" class="py-40 text-center flex flex-col items-center gap-6">
          <div class="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else-if="note" class="max-w-4xl mx-auto py-16 px-8 lg:px-16 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
          <header class="mb-0.1"> <!-- 💡 间距从 mb-16 缩小至 mb-6 -->
            <h1 class="text-5xl font-black text-slate-900 leading-tight mb-8">
              {{ note.title }}
            </h1>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in note.tags" :key="tag" 
                    class="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-md uppercase tracking-tighter border border-blue-100">
                #{{ tag }}
              </span>
            </div>
          </header>

          <!-- Markdown 内容渲染 -->
          <article>
            <MdPreview 
              :modelValue="note.content" 
              :editorId="'preview-only'" 
              theme="light" 
              class="bg-transparent! no-padding-preview" 
              :codeFoldable="true"
            />
          </article>

          <!-- 附件成果 -->
          <footer v-if="artifacts.length > 0" class="mt-24 pt-16 border-t-2 border-dashed border-slate-100">
            <h3 class="text-2xl font-black text-slate-900 mb-10 tracking-tight flex items-center gap-4">
              Artifacts
              <span class="h-px flex-1 bg-slate-100"></span>
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a v-for="item in artifacts" :key="item.id" :href="item.content_url" target="_blank"
                 class="group p-8 rounded-4xl bg-slate-50/50 border border-slate-100 hover:border-blue-500 hover:bg-white hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                 <div class="relative z-10">
                   <div class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">{{ item.artifact_type }}</div>
                   <div class="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{{ item.title || 'Untitled Source' }}</div>
                   <div class="mt-6 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                     Access Resource <span>→</span>
                   </div>
                 </div>
              </a>
            </div>
          </footer>
        </div>
      </main>

    </div>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

/* 移除预览组件自带的顶部外边距 */
:deep(.md-editor-preview) {
  padding-top: 0 !important;
}

:deep(.md-editor-catalog-active > .md-editor-catalog-link) {
  @apply text-blue-600 !important;
}

:deep(.md-editor-catalog-link span) {
  @apply transition-all duration-300;
}

:deep(.md-editor-catalog-active > .md-editor-catalog-link span) {
  @apply pl-4 border-l-2 border-blue-600 ml-0.5;
}

:deep(.md-editor-preview) {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 1.1rem;
  line-height: 2;
  color: #1e293b;
}

:deep(.md-editor-preview pre) {
  @apply rounded-3xl bg-slate-950 p-10! shadow-2xl my-14 border border-slate-800 relative;
}

:deep(.katex-display) {
  @apply my-12 p-10 bg-slate-50 rounded-4xl border border-slate-100 overflow-x-auto;
}

:deep(.md-editor-preview code:not(pre code)) {
  @apply bg-slate-100 text-slate-900 px-2 py-0.5 rounded font-mono text-[0.9em] border border-slate-200 mx-1;
}

:deep(.md-editor-preview h1, .md-editor-preview h2, .md-editor-preview h3) {
  @apply font-black tracking-tight text-slate-900 mt-16 mb-8;
}
</style>