<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

// 💡 侧边栏折叠状态：默认不折叠 (false)
const isCollapsed = ref(false)

const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
}

const handleLogout = () => {
    if (confirm('确定要结束本次研究会话并退出登录吗？')) {
        authStore.logout()
        router.push('/login')
    }
}
</script>

<template>
    <div class="flex min-h-screen bg-slate-50">
        <!-- 1. 左侧智能折叠侧边栏 -->
        <aside :class="[isCollapsed ? 'w-20' : 'w-72']"
            class="bg-slate-950 text-white shrink-0 flex flex-col transition-all duration-500 ease-in-out relative border-r border-white/5">
            <!-- 折叠切换按钮 -->
            <button @click="toggleSidebar"
                class="absolute -right-3 top-10 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-slate-950 hover:bg-white hover:text-blue-600 transition-all z-50 group">
                <span :class="[isCollapsed ? 'rotate-180' : '']"
                    class="text-[10px] transition-transform duration-500">←</span>
            </button>

            <!-- 顶部 Logo 区 -->
            <div class="p-8 pb-6 overflow-hidden whitespace-nowrap">
                <h2 class="text-2xl font-black tracking-tighter italic text-blue-500 transition-opacity">
                    B<span v-show="!isCollapsed">ACKSTAGE</span>
                </h2>
                <p v-show="!isCollapsed"
                    class="text-[9px] text-slate-500 uppercase tracking-[0.3em] mt-2 font-bold animate-in fade-in duration-700">
                    大模型管理系统</p>
            </div>

            <!-- 功能导航区 -->
            <nav class="flex-1 px-4 mt-8 space-y-2 overflow-hidden">
                <router-link to="/admin/roadmap" class="admin-nav-item" active-class="active">
                    <div class="w-1.5 h-1.5 rounded-full bg-current shrink-0"></div>
                    <span v-show="!isCollapsed"
                        class="whitespace-nowrap animate-in slide-in-from-left-2 duration-300">路径规划管理</span>
                </router-link>
                <router-link to="/admin/notes" class="admin-nav-item" active-class="active">
                    <div class="w-1.5 h-1.5 rounded-full bg-current shrink-0"></div>
                    <span v-show="!isCollapsed"
                        class="whitespace-nowrap animate-in slide-in-from-left-2 duration-300">研究笔记管理</span>
                </router-link>
            </nav>

            <!-- 💡 底部用户信息与操作区 -->
            <div class="mt-auto flex flex-col p-4 space-y-4">
                <div class="bg-white/5 rounded-3xl p-4 border border-white/5 backdrop-blur-md overflow-hidden">
                    <!-- 用户头像与名称 -->
                    <div class="flex items-center gap-4" :class="[isCollapsed ? 'justify-center mb-0' : 'mb-6']">
                        <div
                            class="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-sm shadow-lg shadow-blue-600/30 shrink-0">
                            {{ authStore.user?.username.charAt(0).toUpperCase() }}
                        </div>
                        <div v-show="!isCollapsed" class="min-w-0 animate-in fade-in duration-500">
                            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                Researcher</p>
                            <h3 class="text-sm font-black text-slate-200 mt-1 truncate">{{ authStore.user?.username }}
                            </h3>
                        </div>
                    </div>

                    <!-- 注销按钮 -->
                    <button v-show="!isCollapsed" @click="handleLogout"
                        class="w-full py-3 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 whitespace-nowrap animate-in slide-in-from-bottom-2">
                        退出登录
                    </button>
                </div>

                <!-- 返回主站 -->
                <router-link to="/"
                    class="flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 hover:text-white transition-colors uppercase tracking-widest py-2">
                    <span class="shrink-0">←</span>
                    <span v-show="!isCollapsed" class="whitespace-nowrap">返回前台展示</span>
                </router-link>
            </div>
        </aside>

        <!-- 2. 右侧动态内容区 -->
        <main class="flex-1 overflow-y-auto">
            <router-view />
        </main>
    </div>
</template>

<style scoped>
@reference "@/style.css";

.admin-nav-item {
    @apply flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black tracking-widest text-slate-500 hover:bg-white/5 transition-all duration-300;
}

.admin-nav-item.active {
    @apply bg-blue-600 text-white shadow-xl shadow-blue-500/20;
}

/* 隐藏滚动条 */
aside {
    scrollbar-width: none;
}

aside::-webkit-scrollbar {
    display: none;
}
</style>