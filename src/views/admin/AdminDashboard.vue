<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { workspaceApi } from '@/api/workspace'
import { useAuthStore } from '@/store/auth'
import { useLocaleStore } from '@/store/locale'
import type { WorkspaceActivity, WorkspaceOverview, WorkspaceRole } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const localeStore = useLocaleStore()

const loading = ref(false)
const errorMessage = ref('')
const overview = ref<WorkspaceOverview | null>(null)

const copy = computed(() =>
  localeStore.isChinese
    ? {
        eyebrow: 'Workspace Dashboard',
        titleSuffix: 'command center',
        summary:
          '把团队协作、Roadmap 进度、Research Notes 和最近动态收进同一块运营总览，让这个产品从工具页进一步走向可经营的 SaaS。',
        currentRole: '当前角色',
        completionRate: '完成率',
        metrics: {
          members: '团队成员',
          roadmap: 'Roadmap 节点',
          notes: 'Research Notes',
          progress: '进行中',
        },
        metricCopy: {
          members: '当前 workspace 内的协作者规模',
          roadmap: '正在管理的执行节点总数',
          notes: '已经沉淀下来的研究与复盘',
          progress: '仍在向前推进的节点',
        },
        onboardingEyebrow: 'Onboarding checklist',
        onboardingTitle: '把 workspace 从空壳推进到可运营状态',
        roadmapEyebrow: 'Roadmap health',
        roadmapTitle: '用一眼能看懂的方式管理执行阶段',
        overallCompletion: '整体完成度',
        suggestedNextMove: 'Suggested next move',
        teamEyebrow: 'Team snapshot',
        teamTitle: '当前成员结构',
        teamAction: '管理 Team',
        notesEyebrow: 'Recent notes',
        notesTitle: '最近沉淀的研究笔记',
        notesAction: '查看全部 Notes',
        activityEyebrow: 'Recent activity',
        activityTitle: '近期协作动态',
        activityAction: '查看全部动态',
        emptyNotes: '当前还没有研究笔记，可以先从某个 roadmap 节点开始沉淀第一条 note。',
        noSummary: '这条笔记已经进入 workspace，但还没有补充摘要。',
        emptyActivity: '还没有足够的动态。先邀请成员、创建笔记，或推动 roadmap 节点进入下一阶段。',
        emptyMembers: '这个 workspace 里还没有更多成员加入。',
        loading: '正在加载 workspace overview...',
        errorFallback: '无法加载 dashboard 数据',
        readonly: '当前为只读角色，可查看总览与动态，但不会被误导去执行写操作。',
        writable: '当前角色可继续推进 roadmap 与 notes。',
        completed: '已完成',
        inProgress: '进行中',
        todo: '待开始',
        done: 'Done',
        next: 'Next',
      }
    : {
        eyebrow: 'Workspace Dashboard',
        titleSuffix: 'command center',
        summary:
          'Keep team collaboration, roadmap progress, research notes, and recent activity inside one operating overview built for a commercial SaaS workflow.',
        currentRole: 'Current role',
        completionRate: 'Completion rate',
        metrics: {
          members: 'Team members',
          roadmap: 'Roadmap nodes',
          notes: 'Research notes',
          progress: 'In progress',
        },
        metricCopy: {
          members: 'Active collaborators in this workspace',
          roadmap: 'Tracked execution nodes',
          notes: 'Captured knowledge entries',
          progress: 'Nodes still moving forward',
        },
        onboardingEyebrow: 'Onboarding checklist',
        onboardingTitle: 'Turn the workspace into an operational system',
        roadmapEyebrow: 'Roadmap health',
        roadmapTitle: 'See execution stages at a glance',
        overallCompletion: 'Overall completion',
        suggestedNextMove: 'Suggested next move',
        teamEyebrow: 'Team snapshot',
        teamTitle: 'Current team structure',
        teamAction: 'Manage team',
        notesEyebrow: 'Recent notes',
        notesTitle: 'Latest research notes',
        notesAction: 'View all notes',
        activityEyebrow: 'Recent activity',
        activityTitle: 'Latest collaboration signals',
        activityAction: 'View all activity',
        emptyNotes: 'No notes yet. Start from a roadmap node and capture the first research entry.',
        noSummary: 'This note is already in the workspace, but it does not have a summary yet.',
        emptyActivity: 'Not enough activity yet. Invite teammates, add notes, or move roadmap work forward.',
        emptyMembers: 'No additional members have joined this workspace yet.',
        loading: 'Loading workspace overview...',
        errorFallback: 'Unable to load dashboard data',
        readonly: 'This role is read-only and focused on visibility.',
        writable: 'This role can move roadmap and notes forward.',
        completed: 'Completed',
        inProgress: 'In progress',
        todo: 'Todo',
        done: 'Done',
        next: 'Next',
      }
)

const roleLabelMap = computed<Record<WorkspaceRole, string>>(() =>
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

const currentWorkspace = computed(() => overview.value?.workspace ?? authStore.activeWorkspace)
const currentRole = computed(() => (authStore.activeRole ? roleLabelMap.value[authStore.activeRole] : 'Viewer'))
const metrics = computed(() => overview.value?.metrics)
const team = computed(() => overview.value?.team)
const recentNotes = computed(() => overview.value?.notes ?? [])
const activityItems = computed(() => overview.value?.activity ?? [])
const onboardingItems = computed(() => overview.value?.onboarding ?? [])

const suggestedNextMove = computed(() => {
  if (!metrics.value) {
    return ''
  }

  if (metrics.value.roadmap_total === 0) {
    return localeStore.isChinese
      ? '先搭建最小 roadmap，让团队知道应该沿着什么路径推进。'
      : 'Build a minimal roadmap first so the team sees a clear path forward.'
  }

  if (metrics.value.members_total <= 1) {
    return localeStore.isChinese
      ? '下一步最值得做的是邀请第一批协作者，让这个 workspace 真正进入协作状态。'
      : 'The best next move is inviting the first teammate so this workspace becomes collaborative.'
  }

  if (metrics.value.notes_total < metrics.value.roadmap_total) {
    return localeStore.isChinese
      ? 'Roadmap 已经有结构，接下来应该补齐节点下的研究笔记和复盘。'
      : 'The roadmap has shape. Next, seed notes and reviews under the active nodes.'
  }

  return localeStore.isChinese
    ? '当前 workspace 已具备稳定运营基础，可以继续扩大团队并沉淀更多可复用知识。'
    : 'This workspace has a solid operating baseline. Keep expanding the team and compounding reusable knowledge.'
})

const fetchOverview = async () => {
  if (!authStore.activeWorkspaceId) {
    overview.value = null
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    overview.value = await workspaceApi.getOverview(authStore.activeWorkspaceId)
  } catch (error: any) {
    overview.value = null
    errorMessage.value = error.message || copy.value.errorFallback
  } finally {
    loading.value = false
  }
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(localeStore.locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const activityBadge = (item: WorkspaceActivity) => {
  if (localeStore.isChinese) {
    if (item.type === 'member_joined') return '成员加入'
    if (item.type === 'note_created') return '新建笔记'
    if (item.type === 'roadmap_updated') return '更新节点'
    return '动态'
  }

  if (item.type === 'member_joined') return 'Member joined'
  if (item.type === 'note_created') return 'Note created'
  if (item.type === 'roadmap_updated') return 'Roadmap updated'
  return 'Activity'
}

const openLink = (href: string) => {
  router.push(href)
}

watch(
  () => authStore.activeWorkspaceId,
  () => {
    fetchOverview()
  },
  { immediate: true }
)
</script>

<template>
  <div class="mx-auto max-w-7xl px-8 py-10 lg:px-12">
    <header class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
      <div>
        <div class="text-[11px] font-black uppercase tracking-[0.34em] text-blue-600">{{ copy.eyebrow }}</div>
        <h1 class="mt-4 text-5xl font-black tracking-[-0.06em] text-slate-950">
          {{ currentWorkspace?.workspace_name || 'Workspace' }} {{ copy.titleSuffix }}
        </h1>
        <p class="mt-4 max-w-3xl text-base leading-8 text-slate-500">
          {{ copy.summary }}
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="hero-card">
          <div class="hero-label">{{ copy.currentRole }}</div>
          <div class="hero-value">{{ currentRole }}</div>
          <div class="hero-copy">{{ authStore.hasWriteAccess ? copy.writable : copy.readonly }}</div>
        </div>
        <div class="hero-card">
          <div class="hero-label">{{ copy.completionRate }}</div>
          <div class="hero-value">{{ metrics?.completion_rate ?? 0 }}%</div>
          <div class="hero-copy">{{ currentWorkspace?.workspace_slug || 'workspace' }}</div>
        </div>
      </div>
    </header>

    <div
      v-if="errorMessage"
      class="mt-8 rounded-[1.75rem] border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="loading"
      class="mt-10 rounded-[2rem] border border-slate-100 bg-white px-6 py-16 text-center text-sm font-semibold text-slate-400 shadow-[0_18px_70px_rgba(15,23,42,0.04)]"
    >
      {{ copy.loading }}
    </div>

    <template v-else-if="overview">
      <section class="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article class="metric-card">
          <div class="metric-label">{{ copy.metrics.members }}</div>
          <div class="metric-value">{{ metrics?.members_total ?? 0 }}</div>
          <div class="metric-copy">{{ copy.metricCopy.members }}</div>
        </article>
        <article class="metric-card">
          <div class="metric-label">{{ copy.metrics.roadmap }}</div>
          <div class="metric-value">{{ metrics?.roadmap_total ?? 0 }}</div>
          <div class="metric-copy">{{ copy.metricCopy.roadmap }}</div>
        </article>
        <article class="metric-card">
          <div class="metric-label">{{ copy.metrics.notes }}</div>
          <div class="metric-value">{{ metrics?.notes_total ?? 0 }}</div>
          <div class="metric-copy">{{ copy.metricCopy.notes }}</div>
        </article>
        <article class="metric-card">
          <div class="metric-label">{{ copy.metrics.progress }}</div>
          <div class="metric-value">{{ metrics?.roadmap_in_progress ?? 0 }}</div>
          <div class="metric-copy">{{ copy.metricCopy.progress }}</div>
        </article>
      </section>

      <section class="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div class="panel">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="panel-eyebrow">{{ copy.onboardingEyebrow }}</div>
              <h2 class="panel-title">{{ copy.onboardingTitle }}</h2>
            </div>
            <div class="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
              {{ onboardingItems.filter((item) => item.done).length }}/{{ onboardingItems.length }}
            </div>
          </div>

          <div class="mt-8 space-y-4">
            <div
              v-for="item in onboardingItems"
              :key="item.key"
              class="rounded-[1.6rem] border border-slate-100 bg-slate-50/70 p-5"
            >
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <span
                      :class="item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                      class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]"
                    >
                      {{ item.done ? copy.done : copy.next }}
                    </span>
                    <h3 class="text-lg font-black tracking-tight text-slate-950">{{ item.title }}</h3>
                  </div>
                  <p class="mt-3 text-sm leading-7 text-slate-500">{{ item.description }}</p>
                </div>
                <button class="secondary-button" @click="openLink(item.cta_path)">{{ item.cta_label }}</button>
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-eyebrow">{{ copy.roadmapEyebrow }}</div>
          <h2 class="panel-title">{{ copy.roadmapTitle }}</h2>

          <div class="mt-8 space-y-5">
            <div>
              <div class="mb-3 flex items-center justify-between text-sm font-bold text-slate-500">
                <span>{{ copy.overallCompletion }}</span>
                <span>{{ metrics?.completion_rate ?? 0 }}%</span>
              </div>
              <div class="h-3 rounded-full bg-slate-100">
                <div
                  class="h-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                  :style="{ width: `${metrics?.completion_rate ?? 0}%` }"
                ></div>
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <div class="status-card status-card-complete">
                <div class="status-label">{{ copy.completed }}</div>
                <div class="status-value">{{ metrics?.roadmap_completed ?? 0 }}</div>
              </div>
              <div class="status-card status-card-progress">
                <div class="status-label">{{ copy.inProgress }}</div>
                <div class="status-value">{{ metrics?.roadmap_in_progress ?? 0 }}</div>
              </div>
              <div class="status-card status-card-todo">
                <div class="status-label">{{ copy.todo }}</div>
                <div class="status-value">{{ metrics?.roadmap_todo ?? 0 }}</div>
              </div>
            </div>

            <div class="rounded-[1.6rem] border border-slate-100 bg-slate-50/70 p-5">
              <div class="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{{ copy.suggestedNextMove }}</div>
              <p class="mt-3 text-sm leading-7 text-slate-600">{{ suggestedNextMove }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-10 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div class="panel">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="panel-eyebrow">{{ copy.teamEyebrow }}</div>
              <h2 class="panel-title">{{ copy.teamTitle }}</h2>
            </div>
            <button class="ghost-button" @click="router.push('/admin/workspace')">{{ copy.teamAction }}</button>
          </div>

          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <div class="role-card">
              <div class="role-label">Owners</div>
              <div class="role-value">{{ team?.role_counts.owner ?? 0 }}</div>
            </div>
            <div class="role-card">
              <div class="role-label">Admins</div>
              <div class="role-value">{{ team?.role_counts.admin ?? 0 }}</div>
            </div>
            <div class="role-card">
              <div class="role-label">Members</div>
              <div class="role-value">{{ team?.role_counts.member ?? 0 }}</div>
            </div>
            <div class="role-card">
              <div class="role-label">Viewers</div>
              <div class="role-value">{{ team?.role_counts.viewer ?? 0 }}</div>
            </div>
          </div>

          <div class="mt-8 space-y-3">
            <div
              v-for="member in team?.recent_members ?? []"
              :key="member.user_id"
              class="flex items-center justify-between rounded-[1.4rem] border border-slate-100 bg-slate-50/70 px-4 py-4"
            >
              <div>
                <div class="font-black text-slate-900">{{ member.username }}</div>
                <div class="mt-1 text-sm text-slate-500">{{ member.email }}</div>
              </div>
              <div class="text-right">
                <span class="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                  {{ roleLabelMap[member.role as WorkspaceRole] ?? member.role }}
                </span>
                <div class="mt-2 text-[11px] font-semibold text-slate-400">{{ formatDate(member.joined_at) }}</div>
              </div>
            </div>

            <div
              v-if="(team?.recent_members.length ?? 0) === 0"
              class="rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm font-semibold text-slate-400"
            >
              {{ copy.emptyMembers }}
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="panel-eyebrow">{{ copy.notesEyebrow }}</div>
              <h2 class="panel-title">{{ copy.notesTitle }}</h2>
            </div>
            <button class="ghost-button" @click="router.push('/admin/notes')">{{ copy.notesAction }}</button>
          </div>

          <div class="mt-8 space-y-4">
            <article
              v-for="note in recentNotes"
              :key="note.id"
              class="cursor-pointer rounded-[1.6rem] border border-slate-100 bg-slate-50/70 p-5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-[0_18px_50px_rgba(37,99,235,0.10)]"
              @click="router.push(`/note/${note.id}`)"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="text-lg font-black tracking-tight text-slate-950">{{ note.title }}</div>
                <div class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">{{ formatDate(note.created_at) }}</div>
              </div>
              <div class="mt-3 text-sm leading-7 text-slate-500">
                {{ note.summary || copy.noSummary }}
              </div>
            </article>

            <div
              v-if="recentNotes.length === 0"
              class="rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center text-sm font-semibold text-slate-400"
            >
              {{ copy.emptyNotes }}
            </div>
          </div>
        </div>
      </section>

      <section class="mt-10">
        <div class="panel">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="panel-eyebrow">{{ copy.activityEyebrow }}</div>
              <h2 class="panel-title">{{ copy.activityTitle }}</h2>
            </div>
            <button class="ghost-button" @click="router.push('/admin/activity')">{{ copy.activityAction }}</button>
          </div>

          <div class="mt-8 space-y-4">
            <article
              v-for="item in activityItems"
              :key="`${item.type}-${item.occurred_at}-${item.title}`"
              class="rounded-[1.6rem] border border-slate-100 bg-slate-50/70 p-5 transition-all hover:border-slate-200"
            >
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div class="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                    {{ activityBadge(item) }}
                  </div>
                  <h3 class="mt-3 text-lg font-black tracking-tight text-slate-950">{{ item.title }}</h3>
                  <p class="mt-2 text-sm leading-7 text-slate-500">{{ item.description }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{{ formatDate(item.occurred_at) }}</div>
                  <button class="ghost-button" @click="openLink(item.href)">Open</button>
                </div>
              </div>
            </article>

            <div
              v-if="activityItems.length === 0"
              class="rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center text-sm font-semibold text-slate-400"
            >
              {{ copy.emptyActivity }}
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

.hero-card {
  @apply rounded-[1.75rem] border border-slate-100 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)];
}

.hero-label {
  @apply text-[10px] font-black uppercase tracking-[0.24em] text-slate-400;
}

.hero-value {
  @apply mt-4 text-4xl font-black tracking-[-0.06em] text-slate-950;
}

.hero-copy {
  @apply mt-2 text-sm text-slate-500;
}

.metric-card {
  @apply rounded-[1.75rem] border border-slate-100 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)];
}

.metric-label {
  @apply text-[10px] font-black uppercase tracking-[0.24em] text-slate-400;
}

.metric-value {
  @apply mt-4 text-4xl font-black tracking-[-0.06em] text-slate-950;
}

.metric-copy {
  @apply mt-2 text-sm text-slate-500;
}

.panel {
  @apply rounded-[2.25rem] border border-slate-100 bg-white p-7 shadow-[0_18px_70px_rgba(15,23,42,0.04)];
}

.panel-eyebrow {
  @apply text-[11px] font-black uppercase tracking-[0.28em] text-blue-600;
}

.panel-title {
  @apply mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950;
}

.status-card {
  @apply rounded-[1.5rem] border px-4 py-5;
}

.status-card-complete {
  @apply border-emerald-100 bg-emerald-50/70;
}

.status-card-progress {
  @apply border-blue-100 bg-blue-50/70;
}

.status-card-todo {
  @apply border-slate-200 bg-slate-50/70;
}

.status-label {
  @apply text-[10px] font-black uppercase tracking-[0.24em] text-slate-400;
}

.status-value {
  @apply mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950;
}

.role-card {
  @apply rounded-[1.5rem] border border-slate-100 bg-slate-50/70 px-4 py-5;
}

.role-label {
  @apply text-[10px] font-black uppercase tracking-[0.24em] text-slate-400;
}

.role-value {
  @apply mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950;
}

.ghost-button {
  @apply rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 transition-all hover:border-slate-300 hover:text-slate-950;
}

.secondary-button {
  @apply rounded-2xl bg-slate-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-white transition-all hover:bg-blue-600;
}
</style>
