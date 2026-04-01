<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { workspaceApi } from '@/api/workspace'
import { useAuthStore } from '@/store/auth'
import { useLocaleStore } from '@/store/locale'
import type { WorkspaceMember, WorkspaceRole } from '@/types'

const authStore = useAuthStore()
const localeStore = useLocaleStore()

const loadingMembers = ref(false)
const creatingWorkspace = ref(false)
const invitingMember = ref(false)
const members = ref<WorkspaceMember[]>([])
const errorMessage = ref('')
const createWorkspaceName = ref('')
const inviteIdentifier = ref('')
const inviteRole = ref<WorkspaceRole>('member')

const copy = computed(() =>
  localeStore.isChinese
    ? {
        eyebrow: 'Workspace control',
        title: '像运营产品一样管理团队访问，而不是像表格一样堆权限。',
        summary: '创建 workspace、管理角色、邀请成员，让 roadmap 和 notes 从一开始就有清晰的协作边界。',
        metrics: {
          workspaces: 'Workspaces',
          role: '当前角色',
          teamSize: '团队规模',
        },
        createEyebrow: 'Create workspace',
        createTitle: '几分钟内启动新的团队环境',
        createSummary: '每个 workspace 都是独立协作边界，适合不同团队、项目线或客户环境。',
        createPlaceholder: '增长实验室、Core Platform、Agent Infra...',
        createAction: '创建 workspace',
        creating: '创建中...',
        listEyebrow: 'Your workspaces',
        listTitle: '切换上下文，不丢失治理边界',
        teamEyebrow: 'Team access',
        teamSummary: '支持按用户名或邮箱邀请成员，并通过角色管理读写与成员权限。',
        manageEnabled: '可管理成员',
        readOnly: '只读访问',
        invitePlaceholder: '用用户名或邮箱邀请成员',
        inviteAction: '邀请成员',
        inviting: '邀请中...',
        member: '成员',
        role: '角色',
        joined: '加入时间',
        action: '操作',
        remove: '移除',
        noMembers: '这个 workspace 里还没有成员。',
        loading: '正在加载成员列表...',
        loadError: '无法加载成员列表',
        emptyName: 'Workspace 名称不能为空',
        emptyInvite: '请输入用户名或邮箱',
        createError: '无法创建 workspace',
        inviteError: '无法添加成员',
        updateError: '无法更新成员角色',
        removeError: '无法移除成员',
        removeConfirm: '确定要把 {name} 从 {workspace} 中移除吗？',
      }
    : {
        eyebrow: 'Workspace control',
        title: 'Run team access like a product, not a spreadsheet.',
        summary: 'Create workspaces, manage roles, and keep roadmap plus notes scoped to the right collaboration boundary.',
        metrics: {
          workspaces: 'Workspaces',
          role: 'Active role',
          teamSize: 'Team size',
        },
        createEyebrow: 'Create workspace',
        createTitle: 'Spin up a new team environment in minutes',
        createSummary: 'Every workspace becomes its own collaboration boundary for a team, project line, or client context.',
        createPlaceholder: 'Growth Lab, Core Platform, Agent Infra...',
        createAction: 'Create workspace',
        creating: 'Creating...',
        listEyebrow: 'Your workspaces',
        listTitle: 'Switch context without losing governance',
        teamEyebrow: 'Team access',
        teamSummary: 'Invite users by username or email and manage read, write, and team permissions with roles.',
        manageEnabled: 'Manage enabled',
        readOnly: 'Read only',
        invitePlaceholder: 'Invite by username or email',
        inviteAction: 'Invite member',
        inviting: 'Inviting...',
        member: 'Member',
        role: 'Role',
        joined: 'Joined',
        action: 'Action',
        remove: 'Remove',
        noMembers: 'No team members found in this workspace yet.',
        loading: 'Loading workspace members...',
        loadError: 'Unable to load workspace members',
        emptyName: 'Workspace name cannot be empty',
        emptyInvite: 'Enter a username or email to invite',
        createError: 'Unable to create workspace',
        inviteError: 'Unable to add workspace member',
        updateError: 'Unable to update member role',
        removeError: 'Unable to remove member',
        removeConfirm: 'Remove {name} from {workspace}?',
      }
)

const currentWorkspaceId = computed(() => authStore.activeWorkspaceId)
const currentWorkspace = computed(() => authStore.activeWorkspace)
const canManageMembers = computed(() => authStore.canManageMembers)
const roleOptions = computed<WorkspaceRole[]>(() =>
  authStore.activeRole === 'owner' ? ['owner', 'admin', 'member', 'viewer'] : ['admin', 'member', 'viewer']
)

const roleLabel = computed<Record<WorkspaceRole, string>>(() =>
  localeStore.isChinese
    ? {
        owner: 'Owner',
        admin: 'Admin',
        member: 'Member',
        viewer: 'Viewer',
      }
    : {
        owner: 'Owner',
        admin: 'Admin',
        member: 'Member',
        viewer: 'Viewer',
      }
)

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(localeStore.locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const fetchMembers = async () => {
  if (!currentWorkspaceId.value) {
    members.value = []
    return
  }

  loadingMembers.value = true
  errorMessage.value = ''

  try {
    members.value = await workspaceApi.listMembers(currentWorkspaceId.value)
  } catch (error: any) {
    errorMessage.value = error.message || copy.value.loadError
    members.value = []
  } finally {
    loadingMembers.value = false
  }
}

watch(
  () => currentWorkspaceId.value,
  () => {
    fetchMembers()
  },
  { immediate: true }
)

const handleCreateWorkspace = async () => {
  if (!createWorkspaceName.value.trim()) {
    errorMessage.value = copy.value.emptyName
    return
  }

  creatingWorkspace.value = true
  errorMessage.value = ''

  try {
    const workspace = await workspaceApi.createWorkspace({ name: createWorkspaceName.value.trim() })
    authStore.appendWorkspace(workspace)
    createWorkspaceName.value = ''
    await fetchMembers()
  } catch (error: any) {
    errorMessage.value = error.message || copy.value.createError
  } finally {
    creatingWorkspace.value = false
  }
}

const handleInviteMember = async () => {
  if (!currentWorkspaceId.value) {
    return
  }

  if (!inviteIdentifier.value.trim()) {
    errorMessage.value = copy.value.emptyInvite
    return
  }

  invitingMember.value = true
  errorMessage.value = ''

  try {
    await workspaceApi.addMember(currentWorkspaceId.value, {
      identifier: inviteIdentifier.value.trim(),
      role: inviteRole.value,
    })
    inviteIdentifier.value = ''
    inviteRole.value = 'member'
    await fetchMembers()
  } catch (error: any) {
    errorMessage.value = error.message || copy.value.inviteError
  } finally {
    invitingMember.value = false
  }
}

const updateRole = async (member: WorkspaceMember, role: WorkspaceRole) => {
  if (!currentWorkspaceId.value || member.role === role) {
    return
  }

  errorMessage.value = ''

  try {
    await workspaceApi.updateMemberRole(currentWorkspaceId.value, member.user_id, { role })
    await fetchMembers()
  } catch (error: any) {
    errorMessage.value = error.message || copy.value.updateError
    await fetchMembers()
  }
}

const removeMember = async (member: WorkspaceMember) => {
  if (!currentWorkspaceId.value) {
    return
  }

  const template = copy.value.removeConfirm
    .replace('{name}', member.username)
    .replace('{workspace}', currentWorkspace.value?.workspace_name || 'workspace')
  const confirmed = window.confirm(template)
  if (!confirmed) {
    return
  }

  errorMessage.value = ''

  try {
    await workspaceApi.removeMember(currentWorkspaceId.value, member.user_id)
    await fetchMembers()
  } catch (error: any) {
    errorMessage.value = error.message || copy.value.removeError
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-8 py-10 lg:px-12">
    <header class="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
      <div>
        <div class="text-[11px] font-black uppercase tracking-[0.34em] text-blue-600">{{ copy.eyebrow }}</div>
        <h1 class="mt-4 text-5xl font-black tracking-[-0.06em] text-slate-950">{{ copy.title }}</h1>
        <p class="mt-4 max-w-3xl text-base leading-8 text-slate-500">
          {{ copy.summary }}
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <div class="metric-card">
          <div class="metric-label">{{ copy.metrics.workspaces }}</div>
          <div class="metric-value">{{ authStore.workspaces.length }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">{{ copy.metrics.role }}</div>
          <div class="metric-value">{{ currentWorkspace ? roleLabel[currentWorkspace.role] : '--' }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">{{ copy.metrics.teamSize }}</div>
          <div class="metric-value">{{ members.length }}</div>
        </div>
      </div>
    </header>

    <div v-if="errorMessage" class="mt-8 rounded-[1.75rem] border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
      {{ errorMessage }}
    </div>

    <section class="mt-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div class="space-y-6">
        <div class="panel">
          <div class="panel-eyebrow">{{ copy.createEyebrow }}</div>
          <h2 class="panel-title">{{ copy.createTitle }}</h2>
          <p class="panel-copy">{{ copy.createSummary }}</p>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              v-model="createWorkspaceName"
              type="text"
              class="admin-input flex-1"
              :placeholder="copy.createPlaceholder"
              @keyup.enter="handleCreateWorkspace"
            />
            <button :disabled="creatingWorkspace" class="primary-button sm:w-auto" @click="handleCreateWorkspace">
              {{ creatingWorkspace ? copy.creating : copy.createAction }}
            </button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-eyebrow">{{ copy.listEyebrow }}</div>
          <h2 class="panel-title">{{ copy.listTitle }}</h2>

          <div class="mt-6 space-y-3">
            <button
              v-for="workspace in authStore.workspaces"
              :key="workspace.workspace_id"
              :class="[authStore.activeWorkspaceId === workspace.workspace_id ? 'workspace-card-active' : 'workspace-card']"
              class="w-full text-left"
              @click="authStore.setActiveWorkspace(workspace.workspace_id)"
            >
              <div class="flex items-center justify-between gap-4">
                <div>
                  <div class="text-lg font-black tracking-tight">{{ workspace.workspace_name }}</div>
                  <div class="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    {{ workspace.workspace_slug }}
                  </div>
                </div>
                <span class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]">
                  {{ roleLabel[workspace.role] }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="flex flex-col gap-3 border-b border-slate-100 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="panel-eyebrow">{{ copy.teamEyebrow }}</div>
            <h2 class="panel-title">{{ currentWorkspace?.workspace_name || 'Workspace' }}</h2>
            <p class="panel-copy">{{ copy.teamSummary }}</p>
          </div>
          <div class="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            {{ canManageMembers ? copy.manageEnabled : copy.readOnly }}
          </div>
        </div>

        <div class="mt-6 rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5">
          <div class="grid gap-3 lg:grid-cols-[1.3fr_0.7fr_auto]">
            <input
              v-model="inviteIdentifier"
              type="text"
              class="admin-input"
              :disabled="!canManageMembers || invitingMember"
              :placeholder="copy.invitePlaceholder"
              @keyup.enter="handleInviteMember"
            />
            <select v-model="inviteRole" class="admin-input" :disabled="!canManageMembers || invitingMember">
              <option v-for="role in roleOptions" :key="role" :value="role">
                {{ roleLabel[role] }}
              </option>
            </select>
            <button
              :disabled="!canManageMembers || invitingMember"
              class="primary-button whitespace-nowrap"
              @click="handleInviteMember"
            >
              {{ invitingMember ? copy.inviting : copy.inviteAction }}
            </button>
          </div>
        </div>

        <div class="mt-8 overflow-hidden rounded-[1.8rem] border border-slate-100">
          <table class="w-full border-collapse bg-white">
            <thead class="bg-slate-50 text-left text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
              <tr>
                <th class="px-6 py-4">{{ copy.member }}</th>
                <th class="px-6 py-4">{{ copy.role }}</th>
                <th class="px-6 py-4">{{ copy.joined }}</th>
                <th class="px-6 py-4 text-right">{{ copy.action }}</th>
              </tr>
            </thead>
            <tbody v-if="!loadingMembers" class="divide-y divide-slate-100">
              <tr v-for="member in members" :key="member.user_id" class="hover:bg-slate-50/70">
                <td class="px-6 py-5">
                  <div class="font-black text-slate-900">{{ member.username }}</div>
                  <div class="mt-1 text-sm text-slate-500">{{ member.email }}</div>
                </td>
                <td class="px-6 py-5">
                  <select
                    :value="member.role"
                    class="role-select"
                    :disabled="!canManageMembers"
                    @change="updateRole(member, ($event.target as HTMLSelectElement).value as WorkspaceRole)"
                  >
                    <option v-for="role in roleOptions" :key="role" :value="role">
                      {{ roleLabel[role] }}
                    </option>
                  </select>
                </td>
                <td class="px-6 py-5 text-sm font-semibold text-slate-500">
                  {{ formatDate(member.joined_at) }}
                </td>
                <td class="px-6 py-5 text-right">
                  <button
                    :disabled="!canManageMembers"
                    class="text-[11px] font-black uppercase tracking-[0.2em] text-red-500 transition-all hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    @click="removeMember(member)"
                  >
                    {{ copy.remove }}
                  </button>
                </td>
              </tr>
              <tr v-if="members.length === 0">
                <td colspan="4" class="px-6 py-14 text-center text-sm font-semibold text-slate-400">
                  {{ copy.noMembers }}
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="loadingMembers" class="px-6 py-14 text-center text-sm font-semibold text-slate-400">
            {{ copy.loading }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

.panel {
  @apply rounded-[2.25rem] border border-slate-100 bg-white p-7 shadow-[0_18px_70px_rgba(15,23,42,0.04)];
}

.panel-eyebrow {
  @apply text-[11px] font-black uppercase tracking-[0.28em] text-blue-600;
}

.panel-title {
  @apply mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950;
}

.panel-copy {
  @apply mt-3 text-sm leading-7 text-slate-500;
}

.metric-card {
  @apply rounded-[1.75rem] border border-slate-100 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)];
}

.metric-label {
  @apply text-[10px] font-black uppercase tracking-[0.24em] text-slate-400;
}

.metric-value {
  @apply mt-4 text-3xl font-black tracking-[-0.05em] text-slate-950;
}

.admin-input {
  @apply w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all;
}

.admin-input:focus {
  @apply border-blue-600;
  box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.08);
}

.primary-button {
  @apply rounded-2xl bg-blue-600 px-5 py-3 text-[11px] font-black uppercase tracking-[0.26em] text-white shadow-[0_18px_50px_rgba(37,99,235,0.22)] transition-all hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60;
}

.workspace-card {
  @apply rounded-[1.6rem] border border-slate-100 bg-white px-5 py-4 transition-all hover:border-blue-200 hover:bg-blue-50/30;
}

.workspace-card span {
  @apply bg-slate-100 text-slate-500;
}

.workspace-card-active {
  @apply rounded-[1.6rem] border border-blue-200 bg-blue-50/60 px-5 py-4 shadow-[0_14px_40px_rgba(37,99,235,0.12)];
}

.workspace-card-active span {
  @apply bg-blue-600 text-white;
}

.role-select {
  @apply rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 outline-none transition-all;
}

.role-select:focus {
  @apply border-blue-600;
}
</style>
