<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { workspaceApi } from '@/api/workspace'
import { useAuthStore } from '@/store/auth'
import { useLocaleStore } from '@/store/locale'
import type { WorkspaceInviteLink, WorkspaceMember, WorkspaceRole } from '@/types'

const authStore = useAuthStore()
const localeStore = useLocaleStore()

const members = ref<WorkspaceMember[]>([])
const loadingMembers = ref(false)
const creatingInviteLink = ref(false)
const errorMessage = ref('')
const inviteMessage = ref('')
const inviteRole = ref<WorkspaceRole>('member')
const inviteLink = ref<WorkspaceInviteLink | null>(null)

const copy = computed(() =>
  localeStore.isChinese
    ? {
        kicker: '成员',
        title: '成员管理',
        summary: '只处理两件事：邀请加入，以及管理当前空间的成员权限。',
        inviteTitle: '邀请加入',
        inviteHint: '生成链接发给对方，对方打开后可直接注册并加入当前空间。',
        inviteAction: '生成邀请链接',
        inviteGenerating: '生成中...',
        inviteLinkLabel: '邀请链接',
        inviteLinkEmpty: '生成后显示在这里',
        inviteRoleLabel: '加入身份',
        inviteFlowHint: '新成员打开链接后，可以直接加入当前空间，无需你手动再分配。',
        copyInvite: '复制链接',
        copied: '链接已复制',
        inviteExpires: '链接 7 天后失效',
        membersTitle: '成员',
        membersHint: '成员列表只保留必要信息和权限操作。',
        manageEnabled: '可管理',
        readOnly: '只读',
        loading: '正在加载成员...',
        noMembers: '当前还没有其他成员。',
        inviteError: '生成邀请链接失败',
        updateError: '更新成员角色失败',
        removeError: '移除成员失败',
        protectedOwner: '至少保留一位所有者。',
        selfHint: '不能在这里移除自己。',
        ownerOnlyHint: '只有所有者可以调整所有者角色。',
        removeConfirm: '确认将 {name} 从 {workspace} 中移除吗？',
        remove: '移除',
        joinedAt: '加入时间',
        totalMembers: '成员',
        youBadge: '你',
        currentWorkspace: '当前空间',
      }
    : {
        kicker: 'Members',
        title: 'Member management',
        summary: 'Keep this page focused on two jobs: inviting people and managing access in the current workspace.',
        inviteTitle: 'Invite people',
        inviteHint: 'Send the link and they can register or join this workspace directly.',
        inviteAction: 'Generate invite link',
        inviteGenerating: 'Generating...',
        inviteLinkLabel: 'Invite link',
        inviteLinkEmpty: 'The link appears here after generation',
        inviteRoleLabel: 'Role',
        inviteFlowHint: 'New members can join from this link directly without a separate manual setup.',
        copyInvite: 'Copy link',
        copied: 'Link copied',
        inviteExpires: 'The link expires in 7 days',
        membersTitle: 'Members',
        membersHint: 'Keep only the member info and permission controls that matter.',
        manageEnabled: 'Can manage',
        readOnly: 'Read only',
        loading: 'Loading members...',
        noMembers: 'There are no other members yet.',
        inviteError: 'Unable to generate invite link',
        updateError: 'Unable to update member role',
        removeError: 'Unable to remove member',
        protectedOwner: 'At least one owner must remain.',
        selfHint: 'You cannot remove yourself here.',
        ownerOnlyHint: 'Only an owner can change another owner role.',
        removeConfirm: 'Remove {name} from {workspace}?',
        remove: 'Remove',
        joinedAt: 'Joined',
        totalMembers: 'Members',
        youBadge: 'You',
        currentWorkspace: 'Current workspace',
      },
)

const currentWorkspaceId = computed(() => authStore.activeWorkspaceId)
const currentWorkspace = computed(() => authStore.activeWorkspace)
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
      },
)

const ownerCount = computed(() => members.value.filter((member) => member.role === 'owner').length)
const roleOptions = computed<WorkspaceRole[]>(() =>
  authStore.activeRole === 'owner' ? ['owner', 'admin', 'member', 'viewer'] : ['admin', 'member', 'viewer'],
)

const currentInviteUrl = computed(() =>
  inviteLink.value ? `${window.location.origin}${inviteLink.value.invite_url}` : '',
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

const handleCreateInviteLink = async () => {
  if (!currentWorkspaceId.value || !canManageMembers.value) return

  creatingInviteLink.value = true
  errorMessage.value = ''
  inviteMessage.value = ''

  try {
    inviteLink.value = await workspaceApi.createInviteLink(currentWorkspaceId.value, {
      role: inviteRole.value,
    })
  } catch (error: any) {
    errorMessage.value = error.message || copy.value.inviteError
  } finally {
    creatingInviteLink.value = false
  }
}

const copyInviteLink = async () => {
  if (!currentInviteUrl.value) return

  try {
    await navigator.clipboard.writeText(currentInviteUrl.value)
    inviteMessage.value = copy.value.copied
  } catch (error: any) {
    errorMessage.value = error.message || copy.value.inviteError
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
    .replace('{workspace}', currentWorkspace.value?.workspace_name || 'workspace')

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
    inviteLink.value = null
    inviteMessage.value = ''
    fetchMembers()
  },
  { immediate: true },
)
</script>

<template>
  <div class="admin-page">
    <header class="max-w-4xl">
      <div class="admin-kicker">{{ copy.kicker }}</div>
      <h1 class="admin-headline mt-3">{{ copy.title }}</h1>
      <p class="admin-subtitle mt-5">{{ copy.summary }}</p>

      <div class="mt-5 flex flex-wrap gap-2">
        <span class="workspace-meta-pill workspace-meta-pill-dark">
          {{ copy.currentWorkspace }} {{ currentWorkspace?.workspace_name || '--' }}
        </span>
        <span class="workspace-meta-pill">
          {{ copy.totalMembers }} {{ members.length }}
        </span>
      </div>
    </header>

    <div v-if="errorMessage" class="product-error mt-5 px-5 py-4 text-sm font-semibold">
      {{ errorMessage }}
    </div>

    <section class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <div>
        <article class="admin-card p-6 md:p-7">
          <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div class="admin-card-title">{{ copy.membersTitle }}</div>
              <p class="admin-card-copy">{{ copy.membersHint }}</p>
            </div>
            <span :class="canManageMembers ? 'workspace-side-pill workspace-side-pill-dark' : 'workspace-side-pill'">
              {{ canManageMembers ? copy.manageEnabled : copy.readOnly }}
            </span>
          </div>

          <div v-if="loadingMembers" class="admin-empty mt-5">
            {{ copy.loading }}
          </div>

          <div v-else-if="members.length === 0" class="admin-empty mt-5">
            {{ copy.noMembers }}
          </div>

          <div v-else class="mt-5 space-y-3">
            <article v-for="member in members" :key="member.user_id" class="member-card">
              <div class="member-avatar">
                {{ member.username?.charAt(0)?.toUpperCase() || 'U' }}
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="text-base font-semibold text-[var(--ink-strong)]">{{ member.username }}</div>
                  <span class="workspace-meta-pill">{{ roleLabel[member.role] }}</span>
                  <span v-if="member.user_id === authStore.userId" class="workspace-meta-pill workspace-meta-pill-dark">
                    {{ copy.youBadge }}
                  </span>
                </div>
                <div class="mt-2 text-sm text-[var(--ink-soft)]">{{ member.email }}</div>
                <div class="mt-2 text-sm text-[var(--ink-soft)]">{{ copy.joinedAt }} {{ formatDate(member.joined_at) }}</div>
                <p v-if="memberHint(member)" class="mt-2 text-sm text-[var(--danger)]">{{ memberHint(member) }}</p>
              </div>

              <div class="member-actions">
                <select
                  :value="member.role"
                  class="admin-select !min-w-[148px]"
                  :disabled="!canEditMemberRole(member)"
                  @change="updateRole(member, ($event.target as HTMLSelectElement).value as WorkspaceRole)"
                >
                  <option v-for="role in roleOptions" :key="role" :value="role">
                    {{ roleLabel[role] }}
                  </option>
                </select>

                <button
                  class="text-sm font-semibold"
                  :class="canRemoveMember(member) ? 'text-[var(--danger)]' : 'cursor-not-allowed text-[rgba(15,23,42,0.28)]'"
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
      </div>

      <div class="space-y-6 xl:sticky xl:top-4">
        <article class="admin-card p-6">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
              <div class="admin-card-title">{{ copy.inviteTitle }}</div>
              <span :class="canManageMembers ? 'workspace-side-pill workspace-side-pill-dark' : 'workspace-side-pill'">
                {{ canManageMembers ? copy.manageEnabled : copy.readOnly }}
              </span>
            </div>
            <p class="text-sm leading-7 text-[var(--ink-soft)]">{{ copy.inviteHint }}</p>
          </div>

          <div class="mt-5 space-y-4">
            <div class="space-y-2">
              <label class="product-label">{{ copy.inviteRoleLabel }}</label>
              <select v-model="inviteRole" class="admin-select" :disabled="!canManageMembers || creatingInviteLink">
                <option v-for="role in roleOptions" :key="role" :value="role">
                  {{ roleLabel[role] }}
                </option>
              </select>
            </div>

            <button
              class="product-button-dark w-full"
              type="button"
              :disabled="!canManageMembers || creatingInviteLink"
              @click="handleCreateInviteLink"
            >
              {{ creatingInviteLink ? copy.inviteGenerating : copy.inviteAction }}
            </button>

            <div class="space-y-2">
              <label class="product-label">{{ copy.inviteLinkLabel }}</label>
              <input :value="currentInviteUrl || copy.inviteLinkEmpty" type="text" class="admin-input" readonly />
            </div>

            <button class="product-button-secondary w-full" type="button" :disabled="!currentInviteUrl" @click="copyInviteLink">
              {{ copy.copyInvite }}
            </button>

            <div class="rounded-[18px] border border-[rgba(15,23,42,0.06)] bg-[rgba(247,247,245,0.72)] px-4 py-3 text-sm leading-7 text-[var(--ink-soft)]">
              {{ inviteMessage || copy.inviteFlowHint }}
            </div>

            <div class="text-xs font-semibold text-[var(--ink-soft)]">
              {{ copy.inviteExpires }}
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

.workspace-meta-pill {
  @apply inline-flex items-center rounded-full border border-[rgba(15,23,42,0.06)] bg-[rgba(247,247,245,0.88)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-main)];
}

.workspace-meta-pill-dark {
  @apply border-transparent bg-[var(--ink-strong)] text-white;
}

.workspace-side-pill {
  @apply inline-flex items-center rounded-full border border-[rgba(15,23,42,0.06)] bg-[rgba(247,247,245,0.88)] px-4 py-2 text-xs font-semibold whitespace-nowrap text-[var(--ink-main)];
}

.workspace-side-pill-dark {
  @apply border-transparent bg-[var(--ink-strong)] text-white;
}

.member-card {
  @apply flex flex-col gap-4 rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.96)] p-4 md:flex-row md:items-start;
}

.member-avatar {
  @apply flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(15,23,42,0.06)] text-sm font-bold text-[var(--ink-strong)];
}

.member-actions {
  @apply flex shrink-0 flex-col gap-3 md:items-end;
}
</style>
