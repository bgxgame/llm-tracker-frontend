<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { noteApi } from '@/api/note'
import type { Note } from '@/types'
// 引入预览组件和样式
import { MdPreview, MdCatalog } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

const route = useRoute()
const note = ref<Note | null>(null)
const artifacts = ref<any[]>([])
const loading = ref(true)
const scrollElement = document.documentElement

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    const data = await noteApi.getDetail(id)
    note.value = data.note
    artifacts.value = data.artifacts
  } catch (err) {
    console.error('获取笔记失败:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto py-8 px-4 flex gap-8">
    <!-- 左侧文章主体 -->
    <div class="flex-1 min-w-0">
      <div v-if="loading" class="flex h-64 items-center justify-center text-slate-400">
        <div class="animate-pulse">正在深度解析学习笔记...</div>
      </div>

      <div v-else-if="note" class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <header class="mb-8 border-b border-slate-100 pb-8">
          <div class="flex items-center gap-4 mb-4">
            <span class="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
              Level {{ note.node_id }}
            </span>
            <time class="text-xs text-slate-400">{{ new Date(note.created_at).toLocaleDateString() }}</time>
          </div>
          <h1 class="text-4xl font-black text-slate-900 tracking-tight mb-4">{{ note.title }}</h1>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in note.tags" :key="tag" class="text-sm text-blue-500 font-medium">
              #{{ tag }}
            </span>
          </div>
        </header>

        <!-- Markdown 预览核心 -->
        <MdPreview :modelValue="note.content" :editorId="'preview-only'" theme="light" class="bg-transparent!" />

        <!-- 关联成果展示 -->
        <footer v-if="artifacts.length > 0" class="mt-12 pt-8 border-t border-slate-100">
          <h3 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span class="h-2 w-2 bg-blue-500 rounded-full"></span> 学习成果与实验数据
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a v-for="item in artifacts" :key="item.id" :href="item.content_url" target="_blank"
              class="group p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all">
              <div class="text-[10px] text-blue-500 font-black uppercase mb-1">{{ item.artifact_type }}</div>
              <div class="font-bold text-slate-700 group-hover:text-blue-700">{{ item.title || '实验记录' }}</div>
            </a>
          </div>
        </footer>
      </div>
    </div>

    <!-- 右侧文章目录 (Catalog) -->
    <aside class="hidden xl:block w-64 shrink-0">
      <div class="sticky top-8 bg-white p-6 rounded-2xl border border-slate-100">
        <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">目录</h4>
        <MdCatalog :editorId="'preview-only'" :scrollElement="scrollElement" class="text-sm" />
      </div>
    </aside>
  </div>
</template>

<style>
@reference "@/style.css";

/* 自定义预览样式，使其更符合 AI 极客感 */
.md-editor-preview {
  font-family: 'Inter', system-ui, sans-serif;
  line-height: 1.8;
}

.md-editor-preview pre {
  @apply rounded-2xl bg-slate-900 p-4 ! shadow-lg my-6 !;
}

.md-editor-preview code {
  @apply font-mono text-sm;
}
</style>