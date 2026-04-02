<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BRAND } from '@/config/brand'
import { useAuthStore } from '@/store/auth'
import { useLocaleStore } from '@/store/locale'
import type { WorkspaceRole } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const localeStore = useLocaleStore()

const isCollapsed = ref(false)

const copy = computed(() =>
  localeStore.isChinese
    ? {
        brandLine: '团队工作台',
        workspaceLabel: '当前空间',
        accountLabel: '当前账号',
        logout: '退出登录',
        collapse: '收起导航',
        expand: '展开导航',
        nav: [
          { to: '/admin/dashboard', short: '总', label: '总览', hint: '看当前推进' },
          { to: '/admin/roadmap', short: '图', label: '路线图', hint: '看整体路径' },
          { to: '/admin/notes', short: '记', label: '笔记', hint: '沉淀结论' },
          { to: '/admin/workspace', short: '空', label: '空间', hint: '成员与权限' },
          { to: '/admin/search', short: '搜', label: '搜索', hint: '需要时再找' },
        ],
      }
    : {
        brandLine: 'Team workspace',
        workspaceLabel: 'Active workspace',
        accountLabel: 'Account',
        logout: 'Log out',
        collapse: 'Collapse navigation',
        expand: 'Expand navigation',
        nav: [
          { to: '/admin/dashboard', short: 'DB', label: 'Overview', hint: 'Current progress' },
          { to: '/admin/roadmap', short: 'RM', label: 'Roadmap', hint: 'See the full path' },
          { to: '/admin/notes', short: 'NT', label: 'Notes', hint: 'Capture decisions' },
          { to: '/admin/workspace', short: 'WS', label: 'Workspace', hint: 'Members and access' },
          { to: '/admin/search', short: 'SR', label: 'Search', hint: 'Find when needed' },
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

const workspaceSwitcher = computed({
  get: () => (authStore.activeWorkspaceId ? String(authStore.activeWorkspaceId) : ''),
  set: (value: string) => authStore.setActiveWorkspace(Number(value)),
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-transparent">
    <div class="flex min-h-screen">
      <aside
        :class="[isCollapsed ? 'w-[92px]' : 'w-[244px]']"
        class="border-r border-[rgba(15,23,42,0.06)] bg-[rgba(248,248,246,0.88)] transition-all duration-300"
      >
        <div class="flex h-full flex-col gap-4 px-3 pb-4 pt-4">
          <div class="flex items-center justify-between gap-3 px-2">
            <router-link to="/" class="flex min-w-0 items-center gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(15,23,42,0.08)] bg-white text-sm font-black text-[var(--ink-strong)]">
                {{ BRAND.mark }}
              </span>
              <div v-if="!isCollapsed" class="min-w-0">
                <div class="truncate text-sm font-bold text-[var(--ink-strong)]">{{ BRAND.name }}</div>
                <div class="truncate text-xs text-[var(--ink-soft)]">{{ copy.brandLine }}</div>
              </div>
            </router-link>

            <button
              :aria-label="isCollapsed ? copy.expand : copy.collapse"
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(15,23,42,0.06)] bg-white text-sm text-[var(--ink-soft)] transition-all hover:text-[var(--ink-strong)]"
              type="button"
              @click="isCollapsed = !isCollapsed"
            >
              {{ isCollapsed ? '+' : '-' }}
            </button>
          </div>

          <div v-if="!isCollapsed" class="admin-sidebar-card">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="admin-sidebar-label">{{ copy.workspaceLabel }}</div>
                <div class="mt-2 truncate text-sm font-semibold text-[var(--ink-strong)]">
                  {{ authStore.activeWorkspace?.workspace_name || '--' }}
                </div>
              </div>
              <span v-if="authStore.activeRole" class="admin-chip">
                {{ roleLabelMap[authStore.activeRole] }}
              </span>
            </div>

            <select v-model="workspaceSwitcher" class="admin-select mt-3 !rounded-[14px] !px-3 !py-2.5 !text-sm">
              <option
                v-for="workspace in authStore.workspaces"
                :key="workspace.workspace_id"
                :value="String(workspace.workspace_id)"
              >
                {{ workspace.workspace_name }}
              </option>
            </select>
          </div>

          <nav class="space-y-1 px-1">
            <router-link
              v-for="item in copy.nav"
              :key="item.to"
              :to="item.to"
              class="admin-nav-link"
              active-class="admin-nav-link-active"
            >
              <span class="admin-nav-icon">{{ item.short }}</span>
              <div v-if="!isCollapsed" class="min-w-0">
                <div class="text-sm font-semibold">{{ item.label }}</div>
                <div class="text-xs text-[var(--ink-soft)]">{{ item.hint }}</div>
              </div>
            </router-link>
          </nav>

          <div class="mt-auto px-1">
            <div class="admin-sidebar-card">
              <div class="flex items-center gap-3">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(15,23,42,0.06)] text-sm font-bold text-[var(--ink-strong)]">
                  {{ authStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}
                </span>
                <div v-if="!isCollapsed" class="min-w-0">
                  <div class="admin-sidebar-label">{{ copy.accountLabel }}</div>
                  <div class="mt-1 truncate text-sm font-semibold text-[var(--ink-strong)]">{{ authStore.user?.username }}</div>
                  <div class="truncate text-xs text-[var(--ink-soft)]">{{ authStore.user?.email }}</div>
                </div>
              </div>

              <button
                v-if="!isCollapsed"
                class="footer-link footer-link-danger mt-4 w-full !rounded-[14px] !px-3 !py-2.5 !text-xs"
                type="button"
                @click="handleLogout"
              >
                {{ copy.logout }}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main class="min-w-0 flex-1">
        <div class="min-h-screen p-3 md:p-4">
          <div class="min-h-[calc(100vh-1.5rem)] rounded-[28px] border border-[rgba(15,23,42,0.06)] bg-[rgba(255,255,255,0.62)]">
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
