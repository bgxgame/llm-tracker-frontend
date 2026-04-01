<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { BRAND } from '@/config/brand'
import { useAuthStore } from '@/store/auth'
import { useLocaleStore } from '@/store/locale'
import type { WorkspaceRole } from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const localeStore = useLocaleStore()

const isCollapsed = ref(false)
const searchInput = ref('')

const copy = computed(() =>
  localeStore.isChinese
    ? {
        badge: '团队工作台',
        title: '团队运营中台',
        summary: '在一个统一的后台里查看总览、管理空间、维护路线图、沉淀笔记与协作权限。',
        searchLabel: '全局搜索',
        searchPlaceholder: '搜索路线图、笔记、方法或成员上下文',
        searchAction: '搜索',
        workspaceLabel: '当前空间',
        workspaceHint: '切换空间后，总览和管理页面会一起刷新。',
        accountLabel: '当前账号',
        marketing: '官网',
        logout: '退出登录',
        collapse: '收起侧栏',
        expand: '展开侧栏',
        nav: [
          { to: '/admin/dashboard', short: '总', label: '总览', meta: '关键指标、引导清单与最新动态' },
          { to: '/admin/activity', short: '动', label: '动态中心', meta: '团队动态与协作时间线' },
          { to: '/admin/search', short: '搜', label: '全局搜索', meta: '跨路线图与笔记搜索内容' },
          { to: '/admin/workspace', short: '空', label: '空间与成员', meta: '空间治理与成员权限' },
          { to: '/admin/roadmap', short: '图', label: '路线图', meta: '执行路径与节点管理' },
          { to: '/admin/notes', short: '记', label: '研究笔记', meta: '研究记录与知识沉淀' },
        ],
      }
    : {
        badge: 'Workspace Ops Console',
        title: 'Team Operating Shell',
        summary: 'Run dashboard, workspace governance, roadmap, notes, and permissions from one unified admin shell.',
        searchLabel: 'Workspace search',
        searchPlaceholder: 'Search roadmap, notes, methods, or team context',
        searchAction: 'Search',
        workspaceLabel: 'Active workspace',
        workspaceHint: 'Switching workspace refreshes the full dashboard and management context.',
        accountLabel: 'Account',
        marketing: 'Site',
        logout: 'Logout',
        collapse: 'Collapse sidebar',
        expand: 'Expand sidebar',
        nav: [
          { to: '/admin/dashboard', short: 'DB', label: 'Dashboard', meta: 'KPI, onboarding, and activity' },
          { to: '/admin/activity', short: 'AC', label: 'Activity Center', meta: 'Team signals and timeline' },
          { to: '/admin/search', short: 'SR', label: 'Global Search', meta: 'Search across roadmap and notes' },
          { to: '/admin/workspace', short: 'WS', label: 'Workspace & Team', meta: 'Governance and member access' },
          { to: '/admin/roadmap', short: 'RM', label: 'Roadmap Ops', meta: 'Execution paths and node operations' },
          { to: '/admin/notes', short: 'NT', label: 'Research Notes', meta: 'Captured insight and memory' },
        ],
      }
)

const roleLabelMap = computed<Record<WorkspaceRole, string>>(() =>
  localeStore.isChinese
    ? {
        owner: '所有者',
        admin: '管理员',
        member: '成员',
        viewer: '访客',
      }
    : {
        owner: 'Owner',
        admin: 'Admin',
        member: 'Member',
        viewer: 'Viewer',
      }
)

const currentRoleLabel = computed(() => {
  if (!authStore.activeRole) {
    return '--'
  }

  return roleLabelMap.value[authStore.activeRole]
})

watch(
  () => route.query.q,
  (value) => {
    searchInput.value = typeof value === 'string' ? value : ''
  },
  { immediate: true }
)

const workspaceSwitcher = computed({
  get: () => (authStore.activeWorkspaceId ? String(authStore.activeWorkspaceId) : ''),
  set: (value: string) => authStore.setActiveWorkspace(Number(value)),
})

const submitSearch = () => {
  const q = searchInput.value.trim()
  router.push({
    name: 'admin-search',
    query: q ? { q } : {},
  })
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#faf7f0_0%,#f4f1eb_100%)]">
    <div class="flex min-h-screen">
      <aside
        :class="[isCollapsed ? 'w-[104px]' : 'w-[340px]']"
        class="relative flex shrink-0 flex-col overflow-hidden border-r border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#14212b_0%,#101b23_100%)] text-white transition-all duration-300"
      >
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(216,110,59,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(45,122,120,0.18),_transparent_28%)]"></div>

        <div class="relative z-10 flex h-full flex-col px-5 pb-5 pt-6">
          <div class="flex items-start justify-between gap-3">
            <router-link to="/" class="flex items-center gap-3 transition-opacity hover:opacity-80">
              <span class="flex h-11 w-11 items-center justify-center rounded-[1.35rem] bg-white text-sm font-black tracking-[0.16em] text-[var(--ink-strong)] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                {{ BRAND.mark }}
              </span>
              <div v-if="!isCollapsed">
                <div class="text-sm font-black uppercase tracking-[0.3em] text-white">{{ BRAND.name }}</div>
                <div class="mt-1 text-[10px] font-black uppercase tracking-[0.34em] text-[rgba(255,255,255,0.52)]">
                  {{ BRAND.descriptor }}
                </div>
              </div>
            </router-link>

            <button
              :aria-label="isCollapsed ? copy.expand : copy.collapse"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[rgba(255,255,255,0.08)] text-xs font-black text-white transition-all hover:bg-white hover:text-[var(--ink-strong)]"
              type="button"
              @click="isCollapsed = !isCollapsed"
            >
              {{ isCollapsed ? '+' : '-' }}
            </button>
          </div>

          <div v-if="!isCollapsed" class="mt-6 rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.06)] p-5 backdrop-blur">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-[11px] font-black uppercase tracking-[0.28em] text-[var(--brand)]">{{ copy.title }}</div>
                <p class="mt-3 text-sm leading-7 text-[rgba(255,255,255,0.66)]">{{ copy.summary }}</p>
              </div>
              <LanguageSwitcher tone="dark" />
            </div>
          </div>

          <div v-else class="mt-5 flex justify-center">
            <LanguageSwitcher tone="dark" />
          </div>

          <div v-if="!isCollapsed" class="mt-5 rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.06)] p-5 backdrop-blur">
            <div class="text-[11px] font-black uppercase tracking-[0.24em] text-[rgba(255,255,255,0.52)]">
              {{ copy.searchLabel }}
            </div>
            <div class="mt-3 flex gap-3">
              <input
                v-model="searchInput"
                class="sidebar-input"
                type="text"
                :placeholder="copy.searchPlaceholder"
                @keyup.enter="submitSearch"
              />
              <button class="sidebar-action" type="button" @click="submitSearch">{{ copy.searchAction }}</button>
            </div>
          </div>

          <div v-if="!isCollapsed" class="mt-5 rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.06)] p-5 backdrop-blur">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[11px] font-black uppercase tracking-[0.24em] text-[rgba(255,255,255,0.52)]">
                {{ copy.workspaceLabel }}
              </div>
              <span class="rounded-full bg-[rgba(216,110,59,0.16)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                {{ currentRoleLabel }}
              </span>
            </div>

            <select v-model="workspaceSwitcher" class="workspace-select mt-4 w-full">
              <option
                v-for="workspace in authStore.workspaces"
                :key="workspace.workspace_id"
                :value="String(workspace.workspace_id)"
              >
                {{ workspace.workspace_name }} / {{ roleLabelMap[workspace.role] }}
              </option>
            </select>

            <p class="mt-3 text-sm leading-6 text-[rgba(255,255,255,0.56)]">{{ copy.workspaceHint }}</p>
          </div>

          <nav class="relative mt-6 flex-1 space-y-2">
            <router-link
              v-for="item in copy.nav"
              :key="item.to"
              :to="item.to"
              class="nav-item"
              active-class="nav-item-active"
            >
              <div class="nav-code">{{ item.short }}</div>
              <div v-if="!isCollapsed" class="min-w-0">
                <div class="truncate text-[12px] font-black uppercase tracking-[0.22em]">{{ item.label }}</div>
                <div class="mt-1 truncate text-xs font-semibold text-[rgba(255,255,255,0.62)]">{{ item.meta }}</div>
              </div>
            </router-link>
          </nav>

          <div class="relative mt-5 rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.06)] p-5 backdrop-blur">
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-white text-base font-black text-[var(--ink-strong)]">
                {{ authStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}
              </div>

              <div v-if="!isCollapsed" class="min-w-0">
                <div class="text-[11px] font-black uppercase tracking-[0.24em] text-[rgba(255,255,255,0.52)]">
                  {{ copy.accountLabel }}
                </div>
                <div class="mt-1 truncate text-sm font-black text-white">{{ authStore.user?.username }}</div>
                <div class="mt-1 truncate text-xs text-[rgba(255,255,255,0.62)]">{{ authStore.user?.email }}</div>
              </div>
            </div>

            <div v-if="!isCollapsed" class="mt-5 grid grid-cols-2 gap-3">
              <router-link class="footer-link" to="/">{{ copy.marketing }}</router-link>
              <button class="footer-link footer-link-danger" type="button" @click="handleLogout">{{ copy.logout }}</button>
            </div>
          </div>
        </div>
      </aside>

      <main class="min-w-0 flex-1">
        <div class="min-h-screen p-4 md:p-6">
          <div class="min-h-[calc(100vh-2rem)] rounded-[2.2rem] border border-[rgba(20,33,43,0.08)] bg-[rgba(255,251,245,0.64)] shadow-[0_24px_90px_rgba(20,33,43,0.08)] backdrop-blur">
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

.sidebar-input {
  @apply min-w-0 flex-1 rounded-2xl border border-white/10 bg-[rgba(0,0,0,0.16)] px-4 py-3 text-sm font-semibold text-white outline-none transition-all;
}

.sidebar-input::placeholder {
  color: rgba(255, 255, 255, 0.42);
}

.sidebar-input:focus {
  border-color: rgba(216, 110, 59, 0.42);
  box-shadow: 0 0 0 4px rgba(216, 110, 59, 0.12);
}

.sidebar-action {
  @apply rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white transition-all;
  background: var(--brand);
}

.sidebar-action:hover {
  background: var(--brand-deep);
}

.workspace-select {
  @apply appearance-none rounded-2xl border border-white/10 bg-[rgba(0,0,0,0.16)] px-4 py-3 text-sm font-bold text-white outline-none transition-all;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f8fafc' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6' /%3E%3C/svg%3E");
  background-position: right 0.95rem center;
  background-repeat: no-repeat;
  background-size: 0.9rem;
}

.workspace-select:focus {
  border-color: rgba(216, 110, 59, 0.42);
  box-shadow: 0 0 0 4px rgba(216, 110, 59, 0.12);
}

.nav-item {
  @apply flex items-center gap-3 rounded-[1.4rem] border border-transparent px-3 py-3 text-[rgba(255,255,255,0.76)] transition-all;
}

.nav-item:hover {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
}

.nav-item-active {
  border-color: rgba(216, 110, 59, 0.18);
  background: rgba(216, 110, 59, 0.16);
  color: white;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.12);
}

.nav-code {
  @apply flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-[rgba(255,255,255,0.08)] text-[10px] font-black uppercase tracking-[0.24em];
}

.footer-link {
  @apply flex items-center justify-center rounded-[1rem] border border-white/10 bg-[rgba(255,255,255,0.08)] px-3 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-all;
}

.footer-link:hover {
  background: white;
  color: var(--ink-strong);
}

.footer-link-danger:hover {
  background: rgba(187, 45, 59, 0.92);
  color: white;
}
</style>
