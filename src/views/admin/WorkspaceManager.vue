<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { workspaceApi } from '@/api/workspace'
import { useAuthStore } from '@/store/auth'
import { useLocaleStore } from '@/store/locale'
import type { WorkspaceMember, WorkspaceRole } from '@/types'

const authStore = useAuthStore()
const localeStore = useLocaleStore()

const members = ref<WorkspaceMember[]>([])
const loadingMembers = ref(false)
const creatingWorkspace = ref(false)
const invitingMember = ref(false)
const errorMessage = ref('')
const createWorkspaceName = ref('')
const inviteIdentifier = ref('')
const inviteRole = ref<WorkspaceRole>('member')

const copy = computed(() =>
  localeStore.isChinese
    ? {
        kicker: '空间',
        title: '空间与成员',
        summary: '切换空间，邀请成员，管理权限。',
        createTitle: '新建空间',
        createPlaceholder: '例如：产品增长 / 客户交付 / 研究实验',
        createAction: '创建空间',
        creating: '创建中...',
        workspacesTitle: '空间列表',
        membersTitle: '成员与权限',
        invitePlaceholder: '输入用户名或邮箱',
        inviteAction: '邀请成员',
        inviting: '邀请中...',
        member: '成员',
        role: '角色',
        joined: '加入时间',
        remove: '移除',
        manageEnabled: '可管理',
        readOnly: '只读查看',
        emptyName: '空间名称不能为空',
        emptyInvite: '请输入用户名或邮箱',
        noMembers: '这个空间还没有成员。',
        loading: '正在加载成员...',
        createError: '创建空间失败',
        inviteError: '邀请成员失败',
        updateError: '更新成员角色失败',
        removeError: '移除成员失败',
        protectedOwner: '至少保留一位所有者。',
        selfHint: '不能在这里移除自己。',
        ownerOnlyHint: '只有所有者可以调整所有者角色。',
        removeConfirm: '确认将 {name} 从 {workspace} 中移除吗？',
      }
    : {
        kicker: 'Workspace',
        title: 'Workspaces and members',
        summary: 'Create workspaces, invite members, and set roles.',
        createTitle: 'Create workspace',
        createPlaceholder: 'For example: Growth / Delivery / Research',
        createAction: 'Create workspace',
        creating: 'Creating...',
        workspacesTitle: 'Workspace list',
        membersTitle: 'Members and roles',
        invitePlaceholder: 'Enter a username or email',
        inviteAction: 'Invite member',
        inviting: 'Inviting...',
        member: 'Member',
        role: 'Role',
        joined: 'Joined',
        remove: 'Remove',
        manageEnabled: 'Can manage',
        readOnly: 'Read only',
        emptyName: 'Workspace name cannot be empty',
        emptyInvite: 'Enter a username or email',
        noMembers: 'This workspace has no members yet.',
        loading: 'Loading members...',
        createError: 'Unable to create workspace',
        inviteError: 'Unable to invite member',
        updateError: 'Unable to update member role',
        removeError: 'Unable to remove member',
        protectedOwner: 'At least one owner must remain.',
        selfHint: 'You cannot remove yourself here.',
        ownerOnlyHint: 'Only an owner can change another owner role.',
        removeConfirm: 'Remove {name} from {workspace}?',
      }
)

const currentWorkspaceId = computed(() => authStore.activeWorkspaceId)
const canManageMembers = computed(() => authStore.canManageMembers)

const roleLabel = computed<Record<WorkspaceRole, string>>(() =>
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

const ownerCount = computed(() => members.value.filter((member) => member.role === 'owner').length)
const roleOptions = computed<WorkspaceRole[]>(() =>
  authStore.activeRole === 'owner' ? ['owner', 'admin', 'member', 'viewer'] : ['admin', 'member', 'viewer']
)

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(localeStore.locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const isLastOwner = (member: WorkspaceMember) => member.role === 'owner' && ownerCount.value <= 1

const canEditMemberRole = (member: WorkspaceMember) => {
  if (!canManageMembers.value) return false
  if (member.role === 'owner' && authStore.activeRole !== 'owner') return false
  if (isLastOwner(member)) return false
  return true
}

const canRemoveMember = (member: WorkspaceMember) => {
  if (!canManageMembers.value) return false
  if (member.user_id === authStore.userId) return false
  if (member.role === 'owner' && authStore.activeRole !== 'owner') return false
  if (isLastOwner(member)) return false
  return true
}

const memberHint = (member: WorkspaceMember) => {
  if (isLastOwner(member)) return copy.value.protectedOwner
  if (member.user_id === authStore.userId) return copy.value.selfHint
  if (member.role === 'owner' && authStore.activeRole !== 'owner') return copy.value.ownerOnlyHint
  return ''
}

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
    members.value = []
    errorMessage.value = error.message || copy.value.loading
  } finally {
    loadingMembers.value = false
  }
}

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
  if (!currentWorkspaceId.value) return
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
  if (!currentWorkspaceId.value || member.role === role || !canEditMemberRole(member)) return

  try {
    await workspaceApi.updateMemberRole(currentWorkspaceId.value, member.user_id, { role })
    await fetchMembers()
  } catch (error: any) {
    errorMessage.value = error.message || copy.value.updateError
    await fetchMembers()
  }
}

const removeMember = async (member: WorkspaceMember) => {
  if (!currentWorkspaceId.value || !canRemoveMember(member)) return

  const text = copy.value.removeConfirm
    .replace('{name}', member.username)
    .replace('{workspace}', authStore.activeWorkspace?.workspace_name || 'workspace')

  if (!window.confirm(text)) return

  try {
    await workspaceApi.removeMember(currentWorkspaceId.value, member.user_id)
    await fetchMembers()
  } catch (error: any) {
    errorMessage.value = error.message || copy.value.removeError
  }
}

watch(
  () => currentWorkspaceId.value,
  () => {
    fetchMembers()
  },
  { immediate: true }
)
</script>

<template>
  <div class="admin-page">
    <header class="max-w-4xl">
      <div class="admin-kicker">{{ copy.kicker }}</div>
      <h1 class="admin-headline mt-3">{{ copy.title }}</h1>
      <p class="admin-subtitle mt-5">{{ copy.summary }}</p>
    </header>

    <div v-if="errorMessage" class="product-error mt-5 px-5 py-4 text-sm font-semibold">
      {{ errorMessage }}
    </div>

    <section class="mt-6 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div class="space-y-6">
        <article class="admin-card p-6">
          <div class="admin-card-title">{{ copy.createTitle }}</div>
          <div class="mt-4 flex flex-col gap-3">
            <input
              v-model="createWorkspaceName"
              type="text"
              class="admin-input"
              :placeholder="copy.createPlaceholder"
              @keyup.enter="handleCreateWorkspace"
            />
            <button class="product-button-dark w-full" type="button" :disabled="creatingWorkspace" @click="handleCreateWorkspace">
              {{ creatingWorkspace ? copy.creating : copy.createAction }}
            </button>
          </div>
        </article>

        <article class="admin-card p-6">
          <div class="admin-card-title">{{ copy.workspacesTitle }}</div>
          <div class="mt-5 space-y-3">
            <button
              v-for="workspace in authStore.workspaces"
              :key="workspace.workspace_id"
              type="button"
              class="admin-list-card w-full text-left"
              :class="authStore.activeWorkspaceId === workspace.workspace_id ? 'border-[rgba(15,23,42,0.16)]' : ''"
              @click="authStore.setActiveWorkspace(workspace.workspace_id)"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="truncate text-base font-semibold text-[var(--ink-strong)]">{{ workspace.workspace_name }}</div>
                  <div class="mt-1 truncate text-sm text-[var(--ink-soft)]">{{ roleLabel[workspace.role] }}</div>
                </div>
              </div>
            </button>
          </div>
        </article>
      </div>

      <article class="admin-card p-6">
        <div class="flex items-center justify-between gap-3">
          <div class="admin-card-title">{{ copy.membersTitle }}</div>
          <span :class="canManageMembers ? 'admin-chip-dark' : 'admin-chip'">
            {{ canManageMembers ? copy.manageEnabled : copy.readOnly }}
          </span>
        </div>

        <div class="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
          <input
            v-model="inviteIdentifier"
            type="text"
            class="admin-input"
            :disabled="!canManageMembers || invitingMember"
            :placeholder="copy.invitePlaceholder"
            @keyup.enter="handleInviteMember"
          />

          <select v-model="inviteRole" class="admin-select" :disabled="!canManageMembers || invitingMember">
            <option v-for="role in roleOptions" :key="role" :value="role">
              {{ roleLabel[role] }}
            </option>
          </select>

          <button
            class="product-button-dark whitespace-nowrap"
            type="button"
            :disabled="!canManageMembers || invitingMember"
            @click="handleInviteMember"
          >
            {{ invitingMember ? copy.inviting : copy.inviteAction }}
          </button>
        </div>

        <div v-if="loadingMembers" class="admin-empty mt-5">
          {{ copy.loading }}
        </div>

        <div v-else-if="members.length === 0" class="admin-empty mt-5">
          {{ copy.noMembers }}
        </div>

        <div v-else class="mt-5 space-y-3">
          <article v-for="member in members" :key="member.user_id" class="admin-list-card">
            <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_120px_auto] lg:items-start">
              <div class="min-w-0">
                <div class="text-base font-semibold text-[var(--ink-strong)]">{{ member.username }}</div>
                <div class="mt-1 text-sm text-[var(--ink-soft)]">{{ member.email }}</div>
                <p v-if="memberHint(member)" class="mt-2 text-sm text-[var(--danger)]">{{ memberHint(member) }}</p>
              </div>

              <select
                :value="member.role"
                class="admin-select"
                :disabled="!canEditMemberRole(member)"
                @change="updateRole(member, ($event.target as HTMLSelectElement).value as WorkspaceRole)"
              >
                <option v-for="role in roleOptions" :key="role" :value="role">
                  {{ roleLabel[role] }}
                </option>
              </select>

              <div class="pt-3 text-sm text-[var(--ink-soft)] lg:pt-0">
                {{ formatDate(member.joined_at) }}
              </div>

              <button
                class="text-sm font-semibold"
                :class="canRemoveMember(member) ? 'text-[var(--danger)]' : 'cursor-not-allowed text-[rgba(15,23,42,0.3)]'"
                type="button"
                :disabled="!canRemoveMember(member)"
                @click="removeMember(member)"
              >
                {{ copy.remove }}
              </button>
            </div>
          </article>
        </div>
      </article>
    </section>
  </div>
</template>
