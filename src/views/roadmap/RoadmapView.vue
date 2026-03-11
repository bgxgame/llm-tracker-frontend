<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { roadmapApi } from '@/api/roadmap'
import type { RoadmapNode } from '@/types'
import { useRouter } from 'vue-router' // 保留导入

const router = useRouter() // 正在使用的 router
const { addNodes, addEdges, onNodeClick, fitView } = useVueFlow()
const loading = ref(true)

const transformData = (nodes: RoadmapNode[]) => {
  const flowNodes = nodes.map((node) => ({
    id: node.id.toString(),
    label: node.title,
    // 💡 改进：根据 node_type 自动分配 X 坐标，让布局更整齐
    position: { 
      x: node.node_type === 'theory' ? 100 : 450, 
      y: node.sort_order * 120 // 拉开垂直间距
    },
    data: { status: node.status, type: node.node_type },
    class: `custom-node ${node.status}`,
  }))

  const flowEdges = nodes
    .filter((node) => node.parent_id !== null)
    .map((node) => ({
      id: `e${node.parent_id}-${node.id}`,
      source: node.parent_id!.toString(),
      target: node.id.toString(),
      // 💡 改进：如果是“进行中”的任务，连线带动画流转
      animated: nodes.find(n => n.id === node.id)?.status === 'in_progress',
      // 💡 改进：设置不同样式的线条
      type: 'smoothstep', // 使用圆角折线，更有科技感
      style: { stroke: '#3b82f6', strokeWidth: 3 },
    }))

  return { flowNodes, flowEdges }
}

onMounted(async () => {
  try {
    const data = await roadmapApi.getNodes()
    const { flowNodes, flowEdges } = transformData(data)
    addNodes(flowNodes)
    addEdges(flowEdges)
    setTimeout(() => fitView(), 100)
  } catch (err) {
    console.error('加载路径图失败:', err)
  } finally {
    loading.value = false
  }
})

// 修复点：在这里使用 router 变量
onNodeClick(({ node }) => {
  console.log('点击了路径节点:', node.id)
  // 跳转逻辑：我们假设点击节点会进入一个该节点下的笔记列表页
  // 或者如果该节点只有一个核心笔记，直接跳转到笔记详情
  // 暂时注释掉跳转，先用 log 激活变量，或者直接跳转到一个搜索页
  router.push(`/search?nodeId=${node.id}`)

  // 为了彻底消除警告且保留扩展性：
  const targetPath = `/roadmap/${node.id}`
  console.log(`准备跳转至: ${targetPath}`)
})
</script>

<template>
  <div
    class="roadmap-container relative h-[80vh] w-full rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
    <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>

    <VueFlow :fit-view-on-init="true">
      <Background pattern-color="#cbd5e1" :gap="20" />
      <Controls />
    </VueFlow>

    <div class="absolute top-4 left-4 bg-white/90 p-4 rounded-xl shadow-sm border border-slate-100">
      <h2 class="text-sm font-bold text-slate-700">学习路线图说明</h2>
      <p class="text-xs text-slate-500">左侧：理论基础 | 右侧：实战/项目</p>
    </div>
  </div>
</template>

<style scoped>
@reference "@/style.css";

.custom-node {
  @apply rounded-xl border-2 px-6 py-3 font-bold transition-all shadow-sm text-sm min-w-37.5 text-center cursor-pointer hover:scale-105;
}

.custom-node.completed {
  @apply border-emerald-500 bg-emerald-50 text-emerald-700;
}

.custom-node.in_progress {
  @apply border-amber-500 bg-amber-50 text-amber-700;
}

.custom-node.todo {
  @apply border-slate-200 bg-slate-50 text-slate-400;
}
</style>