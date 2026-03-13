<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { roadmapApi } from '@/api/roadmap'
import { noteApi } from '@/api/note'
import type { RoadmapNode } from '@/types'

const router = useRouter()
const route = useRoute()

// 状态管理
const loading = ref(false)
const submitting = ref(false)
const nodes = ref<RoadmapNode[]>([])
const artifacts = ref<any[]>([]) // 💡 存储当前笔记的附件列表

// 附件表单
const artifactForm = ref({
  title: '',
  artifact_type: 'code', // code, model, demo, image
  content_url: ''
})

const noteId = computed(() => route.params.id ? Number(route.params.id) : null)
const isEditMode = computed(() => !!noteId.value)

const form = ref({ title: '', node_id: null as number | null, content: '', tags: '' })

// 💡 获取并刷新附件列表
const refreshArtifacts = async () => {
  if (noteId.value) {
    const data = await noteApi.getDetail(noteId.value)
    artifacts.value = data.artifacts
  }
}

onMounted(async () => {
  loading.value = true
  try {
    nodes.value = await roadmapApi.getNodes()
    if (isEditMode.value && noteId.value) {
      const data = await noteApi.getDetail(noteId.value)
      form.value = {
        title: data.note.title,
        node_id: data.note.node_id,
        content: data.note.content,
        tags: (data.note.tags || []).join(', ')
      }
      artifacts.value = data.artifacts // 💡 加载初始附件
    }
  } catch (err) { console.error(err) } finally { loading.value = false }
})

// 💡 添加附件逻辑
const addArtifact = async () => {
  if (!noteId.value) {
    alert("请先发布/保存笔记后再添加成果附件")
    return
  }
  if (!artifactForm.value.title || !artifactForm.value.content_url) return

  try {
    await noteApi.addArtifact({
      note_id: noteId.value,
      ...artifactForm.value
    })
    artifactForm.value = { title: '', artifact_type: 'code', content_url: '' } // 重置
    await refreshArtifacts() // 刷新列表
  } catch (err) { alert("添加失败") }
}

// 💡 删除附件逻辑
const deleteArtifact = async (id: number) => {
  if (confirm("确定移除该研究成果吗？")) {
    try {
      await noteApi.deleteArtifact(id)
      await refreshArtifacts()
    } catch (err) { alert("删除失败") }
  }
}

const handleSave = async () => {
  if (!form.value.title || !form.value.node_id) return
  submitting.value = true
  try {
    const payload = {
      ...form.value,
      tags: form.value.tags.split(',').map(t => t.trim()).filter(t => t)
    }
    if (isEditMode.value && noteId.value) {
      await noteApi.updateNote(noteId.value, payload)
    } else {
      await noteApi.createNote(payload)
    }
    router.push('/admin/notes')
  } catch (err) { alert('保存失败') } finally { submitting.value = false }
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- 顶部操作栏 -->
    <header
      class="h-24 border-b border-slate-100 px-12 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-50">
      <div class="flex items-center gap-8 flex-1">
        <button @click="router.back()"
          class="text-slate-400 font-black text-[10px] uppercase tracking-widest border border-slate-200 px-4 py-2 rounded-xl hover:text-slate-900 transition-all">取消</button>
        <input v-model="form.title" type="text" placeholder="输入研究标题..."
          class="flex-1 bg-transparent text-2xl font-black text-slate-900 focus:outline-none tracking-tight" />
      </div>
      <div class="flex items-center gap-4">
        <select v-model="form.node_id"
          class="admin-select bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 text-[11px] font-black text-slate-600 appearance-none outline-none">
          <option :value="null">选择归属节点</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id">{{ node.title }}</option>
        </select>
        <button @click="handleSave"
          class="bg-blue-600 text-white px-10 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-xl">
          {{ isEditMode ? '更新研究同步' : '发布研究成果' }}
        </button>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden bg-slate-50/30">
      <!-- 左侧：Markdown 编辑器 -->
      <div class="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
        <div class="px-8 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest">Metadata Tags</span>
          <input v-model="form.tags" type="text" placeholder="用逗号分隔标签..."
            class="flex-1 bg-transparent text-sm font-bold text-slate-600 focus:outline-none" />
        </div>
        <div class="flex-1 overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white relative">
          <MdEditor v-model="form.content" language="en-US" theme="light" placeholder="开始记录..."
            class="h-full border-none!" />
        </div>
      </div>

      <!-- 右侧：成果附件管理 (Artifacts) -->
      <aside class="w-96 border-l border-slate-100 bg-white p-8 flex flex-col gap-8 overflow-y-auto hide-scrollbar">
        <div>
          <h3 class="text-xl font-black text-slate-900 tracking-tight mb-2">研究成果 (Artifacts)</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 italic">Linked sources and
            assets</p>

          <!-- 附件列表 -->
          <div class="space-y-4">
            <div v-for="item in artifacts" :key="item.id"
              class="group p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-blue-200 transition-all relative">
              <button @click="deleteArtifact(item.id)"
                class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">✕</button>
              <div class="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-tighter">{{ item.artifact_type }}
              </div>
              <div class="text-sm font-black text-slate-800 truncate pr-4">{{ item.title }}</div>
              <div class="text-[10px] text-slate-400 mt-2 truncate font-mono">{{ item.content_url }}</div>
            </div>
          </div>
        </div>

        <!-- 新增附件表单 -->
        <div class="mt-auto pt-8 border-t border-slate-100 space-y-4">
          <h4 class="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Quick Attach</h4>
          <input v-model="artifactForm.title" type="text" placeholder="成果名称 (如: GitHub Repo)"
            class="admin-small-input" />
          <select v-model="artifactForm.artifact_type" class="admin-small-input appearance-none">
            <option value="code">CODE REPO</option>
            <option value="model">MODEL WEIGHTS</option>
            <option value="demo">INTERACTIVE DEMO</option>
            <option value="image">VISUAL ASSETS</option>
          </select>
          <input v-model="artifactForm.content_url" type="text" placeholder="资源链接 URL" class="admin-small-input" />
          <button @click="addArtifact"
            class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg">
            + Attach Artifact
          </button>
        </div>
      </aside>
    </main>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

.admin-small-input {
  @apply block w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-600 transition-all;
}

.admin-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.5rem center;
  background-size: 0.8rem;
}

.hide-scrollbar {
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>