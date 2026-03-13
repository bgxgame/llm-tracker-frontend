<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { noteApi } from '@/api/note'
import { roadmapApi } from '@/api/roadmap'
import type { Note, RoadmapNode } from '@/types'

const router = useRouter()
const notes = ref<Note[]>([])
const nodes = ref<RoadmapNode[]>([])
const loading = ref(true)

// 删除确认模态框状态
const isDeleteConfirmOpen = ref(false)
const targetNote = ref<Note | null>(null)

const fetchData = async () => {
    loading.value = true
    try {
        // 并发获取路线节点和全量笔记
        const [nodesData, notesData] = await Promise.all([
            roadmapApi.getNodes(),
            noteApi.getAllNotes()
        ])
        nodes.value = nodesData
        notes.value = notesData
    } catch (err) {
        console.error('获取数据失败:', err)
    } finally {
        loading.value = false
    }
}

onMounted(fetchData)

// 获取关联节点的标题
const getNodeTitle = (nodeId: number | null) => {
    if (!nodeId) return '全局 / 未分类'
    return nodes.value.find(n => n.id === nodeId)?.title || '未知节点'
}

const editNote = (id: number) => router.push(`/admin/note/edit/${id}`)
const createNote = () => router.push('/admin/note/create')

// 触发删除确认
const triggerDelete = (note: Note) => {
    targetNote.value = note
    isDeleteConfirmOpen.value = true
}

const confirmDelete = async () => {
    if (!targetNote.value) return
    try {
        await noteApi.deleteNote(targetNote.value.id)
        isDeleteConfirmOpen.value = false
        targetNote.value = null
        await fetchData() // 刷新列表
    } catch (err) {
        alert("删除失败，请稍后重试")
    }
}
</script>

<template>
    <div class="p-12 max-w-7xl mx-auto">
        <!-- 1. 顶部标题栏 -->
        <header class="flex justify-between items-end mb-16 px-4">
            <div>
                <h1 class="text-5xl font-black text-slate-900 tracking-tighter uppercase">研究笔记管理</h1>
                <p class="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest italic">Inventory of
                    Research Assets</p>
            </div>
            <button @click="createNote"
                class="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl active:scale-95">
                + 撰写新笔记
            </button>
        </header>

        <!-- 2. 笔记数据表格 -->
        <div class="bg-white rounded-4xl border border-slate-100 overflow-hidden shadow-sm">
            <table class="w-full text-left border-collapse">
                <thead
                    class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                        <th class="px-8 py-6">发布时间</th>
                        <th class="px-8 py-6">研究标题与摘要</th>
                        <th class="px-8 py-6">关联学习节点</th>
                        <th class="px-8 py-6 text-right">管理操作</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    <tr v-for="note in notes" :key="note.id" class="group hover:bg-blue-50/20 transition-colors">
                        <!-- 日期展示 -->
                        <td class="px-8 py-6 font-mono text-xs text-slate-500 font-bold">
                            {{ new Date(note.created_at).toLocaleDateString() }}
                        </td>

                        <!-- 标题与摘要预览 -->
                        <td class="px-8 py-6">
                            <div class="font-black text-slate-900 tracking-tight text-sm mb-1 uppercase">{{ note.title
                                }}</div>
                            <div class="text-[10px] text-slate-400 line-clamp-1 italic max-w-xs font-medium">
                                {{ note.summary || '等待 AI 执行结构化分析...' }}
                            </div>
                        </td>

                        <!-- 节点标签 -->
                        <td class="px-8 py-6">
                            <span
                                class="bg-white text-blue-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border border-blue-100 shadow-sm">
                                {{ getNodeTitle(note.node_id) }}
                            </span>
                        </td>

                        <!-- 操作区 -->
                        <td class="px-8 py-6 text-right space-x-6 opacity-0 group-hover:opacity-100 transition-all">
                            <button @click="editNote(note.id)"
                                class="text-[10px] font-black text-blue-700 hover:text-blue-900 uppercase tracking-widest underline decoration-2 underline-offset-4 transition-colors">编辑</button>
                            <button @click="triggerDelete(note)"
                                class="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors">移除</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- 空状态处理 -->
            <div v-if="notes.length === 0 && !loading" class="py-32 text-center">
                <p class="text-slate-200 font-black text-5xl uppercase tracking-tighter italic opacity-50">暂无记录</p>
                <p class="text-slate-400 text-xs font-bold mt-4 tracking-widest uppercase">开始记录你的研究成果，填补知识版图。</p>
            </div>
        </div>

        <!-- 3. 自定义删除确认模态框 -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="isDeleteConfirmOpen" class="fixed inset-0 z-110 flex items-center justify-center p-6">
                    <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-md" @click="isDeleteConfirmOpen = false">
                    </div>
                    <div
                        class="relative w-full max-w-sm bg-white rounded-4xl p-10 shadow-2xl text-center animate-in zoom-in-95 duration-300">
                        <div
                            class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">确认删除</h3>
                        <p class="text-slate-500 text-sm leading-relaxed mb-10 px-4 font-medium">
                            确定要永久移除笔记 <span class="font-bold text-slate-900">《{{ targetNote?.title }}》</span> 吗？此操作无法撤销。
                        </p>
                        <div class="flex flex-col gap-3">
                            <button @click="confirmDelete"
                                class="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 shadow-xl shadow-red-500/20 transition-all">确认永久移除</button>
                            <button @click="isDeleteConfirmOpen = false"
                                class="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">取消</button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

/* 模态框平滑缩放动画 */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .relative,
.modal-leave-to .relative {
    transform: scale(0.8) translateY(20px);
}
</style>