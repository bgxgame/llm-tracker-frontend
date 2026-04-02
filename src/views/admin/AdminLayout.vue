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
        brandLine: '团队工作台',
        summary: '统一查看总览、动态、路线图、笔记和空间成员。',
        searchLabel: '搜索',
        searchPlaceholder: '搜索路线图、笔记或成员',
        searchAction: '搜索',
        workspaceLabel: '当前空间',
        workspaceHint: '切换空间后，总览和管理页面会一起刷新。',
        accountLabel: '当前账号',
        marketing: '官网',
        logout: '退出登录',
        collapse: '收起侧栏',
        expand: '展开侧栏',
        nav: [
          { to: '/admin/dashboard', short: '总', label: '总览', meta: '关键数据与下一步' },
          { to: '/admin/activity', short: '动', label: '动态', meta: '成员与内容变化' },
          { to: '/admin/search', short: '搜', label: '搜索', meta: '快速找到内容' },
          { to: '/admin/workspace', short: '空', label: '空间', meta: '空间与成员管理' },
          { to: '/admin/roadmap', short: '图', label: '路线图', meta: '执行路径与节点' },
          { to: '/admin/notes', short: '记', label: '笔记', meta: '研究记录与资料' },
        ],
      }
    : {
        brandLine: 'Team workspace',
        summary: 'View overview, activity, roadmap, notes, and members in one place.',
        searchLabel: 'Search',
        searchPlaceholder: 'Search roadmap, notes, or members',
        searchAction: 'Search',
        workspaceLabel: 'Active workspace',
        workspaceHint: 'Switching workspace refreshes the full overview and management context.',
        accountLabel: 'Account',
        marketing: 'Site',
        logout: 'Logout',
        collapse: 'Collapse sidebar',
        expand: 'Expand sidebar',
        nav: [
          { to: '/admin/dashboard', short: 'DB', label: 'Overview', meta: 'Key numbers and next steps' },
          { to: '/admin/activity', short: 'AC', label: 'Activity', meta: 'Changes across the team' },
          { to: '/admin/search', short: 'SR', label: 'Search', meta: 'Find work quickly' },
          { to: '/admin/workspace', short: 'WS', label: 'Workspace', meta: 'Members and governance' },
          { to: '/admin/roadmap', short: 'RM', label: 'Roadmap', meta: 'Execution path and nodes' },
          { to: '/admin/notes', short: 'NT', label: 'Notes', meta: 'Research records and assets' },
        ],
      }
)

const roleLabelMap = computed<Record<WorkspaceRole, string>>(() =>
  localeStore.isChinese
    ? {
        owner: '所有者',
        admin: '管理员',
        member: '成员',
        viewer: '只读',
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
  <div class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f3f6fb_100%)]">
    <div class="flex min-h-screen">
      <aside
        :class="[isCollapsed ? 'w-[92px]' : 'w-[286px]']"
        class="flex shrink-0 flex-col border-r border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.72)] backdrop-blur transition-all duration-300"
      >
        <div class="flex h-full flex-col px-4 pb-4 pt-5">
          <div class="flex items-start justify-between gap-3">
            <router-link to="/" class="flex min-w-0 items-center gap-3">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--ink-strong)] text-sm font-black text-white">
                {{ BRAND.mark }}
              </span>
              <div v-if="!isCollapsed" class="min-w-0">
                <div class="truncate text-base font-black text-[var(--ink-strong)]">{{ BRAND.name }}</div>
                <div class="mt-1 truncate text-xs font-semibold text-[var(--ink-soft)]">{{ copy.brandLine }}</div>
              </div>
            </router-link>

            <button
              :aria-label="isCollapsed ? copy.expand : copy.collapse"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(15,23,42,0.08)] bg-white text-sm font-black text-[var(--ink-main)] transition-all hover:border-[rgba(15,23,42,0.16)] hover:text-[var(--ink-strong)]"
              type="button"
              @click="isCollapsed = !isCollapsed"
            >
              {{ isCollapsed ? '+' : '-' }}
            </button>
          </div>

          <div v-if="!isCollapsed" class="mt-5 rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white/88 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm font-black text-[var(--ink-strong)]">{{ copy.brandLine }}</div>
                <p class="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{{ copy.summary }}</p>
              </div>
              <LanguageSwitcher />
            </div>
          </div>

          <div v-else class="mt-5 flex justify-center">
            <LanguageSwitcher />
          </div>

          <div v-if="!isCollapsed" class="mt-4 rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white/88 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div class="text-sm font-semibold text-[var(--ink-main)]">{{ copy.searchLabel }}</div>
            <div class="mt-3 flex gap-2">
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

          <div v-if="!isCollapsed" class="mt-4 rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white/88 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-[var(--ink-main)]">{{ copy.workspaceLabel }}</div>
              <span class="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-deep)]">
                {{ currentRoleLabel }}
              </span>
            </div>

            <select v-model="workspaceSwitcher" class="workspace-select mt-3 w-full">
              <option
                v-for="workspace in authStore.workspaces"
                :key="workspace.workspace_id"
                :value="String(workspace.workspace_id)"
              >
                {{ workspace.workspace_name }} / {{ roleLabelMap[workspace.role] }}
              </option>
            </select>

            <p class="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{{ copy.workspaceHint }}</p>
          </div>

          <nav class="mt-5 flex-1 space-y-1.5">
            <router-link
              v-for="item in copy.nav"
              :key="item.to"
              :to="item.to"
              class="nav-item"
              active-class="nav-item-active"
            >
              <div class="nav-code">{{ item.short }}</div>
              <div v-if="!isCollapsed" class="min-w-0">
                <div class="truncate text-sm font-semibold text-[var(--ink-strong)]">{{ item.label }}</div>
                <div class="mt-0.5 truncate text-xs text-[var(--ink-soft)]">{{ item.meta }}</div>
              </div>
            </router-link>
          </nav>

          <div class="mt-4 rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white/88 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--ink-strong)] text-sm font-black text-white">
                {{ authStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}
              </div>

              <div v-if="!isCollapsed" class="min-w-0">
                <div class="text-xs font-semibold text-[var(--ink-soft)]">{{ copy.accountLabel }}</div>
                <div class="mt-1 truncate text-sm font-semibold text-[var(--ink-strong)]">{{ authStore.user?.username }}</div>
                <div class="mt-1 truncate text-xs text-[var(--ink-soft)]">{{ authStore.user?.email }}</div>
              </div>
            </div>

            <div v-if="!isCollapsed" class="mt-4 grid grid-cols-2 gap-2">
              <router-link class="footer-link" to="/">{{ copy.marketing }}</router-link>
              <button class="footer-link footer-link-danger" type="button" @click="handleLogout">{{ copy.logout }}</button>
            </div>
          </div>
        </div>
      </aside>

      <main class="min-w-0 flex-1">
        <div class="min-h-screen p-4 md:p-5">
          <div class="min-h-[calc(100vh-2rem)] rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.76)] shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
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
  @apply min-w-0 flex-1 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--ink-strong)] outline-none transition-all;
}

.sidebar-input:focus {
  border-color: rgba(37, 99, 235, 0.32);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
}

.sidebar-action {
  @apply rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-all;
  background: var(--brand);
}

.sidebar-action:hover {
  background: var(--brand-deep);
}

.workspace-select {
  @apply appearance-none rounded-2xl border border-[rgba(15,23,42,0.08)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--ink-strong)] outline-none transition-all;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235f6b7a' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6' /%3E%3C/svg%3E");
  background-position: right 0.9rem center;
  background-repeat: no-repeat;
  background-size: 0.9rem;
}

.workspace-select:focus {
  border-color: rgba(37, 99, 235, 0.32);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
}

.nav-item {
  @apply flex items-center gap-3 rounded-2xl px-3 py-3 transition-all;
}

.nav-item:hover {
  background: rgba(15, 23, 42, 0.04);
}

.nav-item-active {
  background: rgba(229, 106, 43, 0.1);
}

.nav-code {
  @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(15,23,42,0.08)] bg-white text-sm font-semibold text-[var(--ink-main)];
}

.nav-item-active .nav-code {
  background: var(--brand);
  color: white;
  border-color: transparent;
}

.footer-link {
  @apply flex items-center justify-center rounded-2xl border border-[rgba(15,23,42,0.08)] bg-[var(--surface-soft)] px-3 py-2.5 text-sm font-medium text-[var(--ink-main)] transition-all;
}

.footer-link:hover {
  border-color: rgba(15, 23, 42, 0.16);
  color: var(--ink-strong);
}

.footer-link-danger:hover {
  border-color: transparent;
  background: rgba(220, 38, 38, 0.1);
  color: var(--danger);
}
</style>
