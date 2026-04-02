<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { workspaceApi } from '@/api/workspace'
import { useAuthStore } from '@/store/auth'
import { useLocaleStore } from '@/store/locale'
import type {
  WorkspaceActivity,
  WorkspaceOnboardingChecklistItem,
  WorkspaceOverview,
  WorkspaceRole,
} from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const localeStore = useLocaleStore()

const loading = ref(false)
const errorMessage = ref('')
const overview = ref<WorkspaceOverview | null>(null)

const copy = computed(() =>
  localeStore.isChinese
    ? {
        eyebrow: '工作台总览',
        summary: '先看最重要的信息，再决定下一步做什么。',
        role: '当前角色',
        completion: '完成率',
        workHintReadOnly: '你当前可以查看整体进展和团队动态。',
        workHintWritable: '你当前可以继续推进路线图、笔记和团队协作。',
        primaryAction: '查看路线图',
        secondaryAction: '查看笔记',
        metrics: {
          members: '团队成员',
          roadmap: '路线图节点',
          notes: '研究笔记',
          progress: '进行中',
        },
        nextTitle: '下一步最值得做的事',
        nextSummary: '这里会优先告诉你最能推动空间进展的动作。',
        nextDone: '已完成',
        nextTodo: '待处理',
        healthTitle: '空间状态',
        healthSummary: '从进度和协作结构快速判断这个空间是否已经进入稳定运转。',
        overallCompletion: '整体完成率',
        suggestedNextMove: '建议下一步',
        completed: '已完成',
        inProgress: '进行中',
        todo: '待开始',
        teamRoles: {
          owner: '所有者',
          admin: '管理员',
          member: '成员',
          viewer: '只读',
        },
        notesTitle: '最新笔记',
        notesAction: '查看全部笔记',
        noSummary: '这条笔记还没有摘要。',
        emptyNotes: '还没有笔记。先从路线图中的一个节点开始记录。',
        activityTitle: '最近动态',
        activityAction: '查看全部动态',
        openAction: '打开',
        emptyActivity: '最近还没有动态。可以先邀请成员、创建笔记或推进路线图。',
        noWorkspace: '当前没有激活的空间。',
        loading: '正在加载总览...',
        errorFallback: '加载总览失败',
      }
    : {
        eyebrow: 'Overview',
        summary: 'See the most important information first, then decide what to do next.',
        role: 'Current role',
        completion: 'Completion',
        workHintReadOnly: 'You can review progress and team activity.',
        workHintWritable: 'You can keep moving roadmap, notes, and team collaboration forward.',
        primaryAction: 'Open roadmap',
        secondaryAction: 'Open notes',
        metrics: {
          members: 'Members',
          roadmap: 'Roadmap nodes',
          notes: 'Notes',
          progress: 'In progress',
        },
        nextTitle: 'Best next steps',
        nextSummary: 'This area highlights the most useful actions to move the workspace forward.',
        nextDone: 'Done',
        nextTodo: 'Next',
        healthTitle: 'Workspace status',
        healthSummary: 'Use progress and team structure to quickly judge whether the workspace is running smoothly.',
        overallCompletion: 'Overall completion',
        suggestedNextMove: 'Suggested next move',
        completed: 'Completed',
        inProgress: 'In progress',
        todo: 'Todo',
        teamRoles: {
          owner: 'Owners',
          admin: 'Admins',
          member: 'Members',
          viewer: 'Viewers',
        },
        notesTitle: 'Latest notes',
        notesAction: 'View all notes',
        noSummary: 'This note does not have a summary yet.',
        emptyNotes: 'No notes yet. Start from a roadmap node and capture the first record.',
        activityTitle: 'Recent activity',
        activityAction: 'View all activity',
        openAction: 'Open',
        emptyActivity: 'There is no recent activity yet. Invite teammates, add notes, or move the roadmap forward.',
        noWorkspace: 'There is no active workspace.',
        loading: 'Loading overview...',
        errorFallback: 'Unable to load overview',
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

const onboardingCopyMap = computed<
  Record<string, Pick<WorkspaceOnboardingChecklistItem, 'title' | 'description' | 'cta_label'>>
>(() =>
  localeStore.isChinese
    ? {
        roadmap_foundation: {
          title: '补齐路线图基础节点',
          description: '至少创建 3 个路线图节点，让团队先看到清晰的执行路径。',
          cta_label: '打开路线图',
        },
        invite_team: {
          title: '邀请第一批协作者',
          description: '至少再加入 1 位成员，让空间真正进入协作状态。',
          cta_label: '管理成员',
        },
        seed_notes: {
          title: '记录第一批研究笔记',
          description: '至少创建 3 条笔记，让决策、实验和发现沉淀下来。',
          cta_label: '查看笔记',
        },
      }
    : {
        roadmap_foundation: {
          title: 'Build roadmap foundation',
          description: 'Create at least 3 roadmap nodes so the team has a visible execution path.',
          cta_label: 'Open roadmap',
        },
        invite_team: {
          title: 'Invite the first teammates',
          description: 'Add at least one more teammate so the workspace becomes collaborative.',
          cta_label: 'Manage members',
        },
        seed_notes: {
          title: 'Capture the first notes',
          description: 'Create at least 3 notes so decisions and findings do not get lost.',
          cta_label: 'Open notes',
        },
      }
)

const currentWorkspace = computed(() => overview.value?.workspace ?? authStore.activeWorkspace)
const metrics = computed(() => overview.value?.metrics)
const team = computed(() => overview.value?.team)
const recentNotes = computed(() => overview.value?.notes ?? [])
const activityItems = computed(() => overview.value?.activity ?? [])
const currentRoleKey = computed<WorkspaceRole>(
  () => (overview.value?.workspace.role ?? authStore.activeRole ?? 'viewer') as WorkspaceRole
)
const currentRole = computed(() => roleLabelMap.value[currentRoleKey.value])

const onboardingItems = computed(() =>
  (overview.value?.onboarding ?? []).map((item) => {
    const localized = onboardingCopyMap.value[item.key]
    if (!localized) {
      return item
    }

    return {
      ...item,
      title: localized.title,
      description: localized.description,
      cta_label: localized.cta_label,
    }
  })
)

const suggestedNextMove = computed(() => {
  if (!metrics.value) {
    return ''
  }

  if (metrics.value.roadmap_total === 0) {
    return localeStore.isChinese
      ? '先补齐最小路线图，让团队知道接下来沿着什么路径推进。'
      : 'Start with a minimal roadmap so the team can see what path to move next.'
  }

  if (metrics.value.members_total <= 1) {
    return localeStore.isChinese
      ? '邀请第一位协作者，让这个空间真正变成团队空间。'
      : 'Invite the first teammate so this workspace becomes a team space.'
  }

  if (metrics.value.notes_total < metrics.value.roadmap_total) {
    return localeStore.isChinese
      ? '路线图已经有结构，接下来应该补齐节点下的研究记录和复盘。'
      : 'The roadmap already has structure. Next, add notes and reviews under active nodes.'
  }

  return localeStore.isChinese
    ? '这个空间已经有稳定基础，可以继续扩大协作并沉淀更多知识。'
    : 'This workspace has a stable baseline. Keep expanding collaboration and capturing more knowledge.'
})

const fetchOverview = async () => {
  if (!authStore.activeWorkspaceId) {
    overview.value = null
    errorMessage.value = ''
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
    if (item.type === 'note_created') return '新增笔记'
    if (item.type === 'roadmap_updated') return '节点更新'
    return '动态'
  }

  if (item.type === 'member_joined') return 'Member joined'
  if (item.type === 'note_created') return 'Note created'
  if (item.type === 'roadmap_updated') return 'Roadmap updated'
  return 'Activity'
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
  <div class="mx-auto max-w-7xl px-6 py-8 lg:px-8">
    <div v-if="errorMessage" class="product-error px-5 py-4 text-sm font-semibold">
      {{ errorMessage }}
    </div>

    <div v-else-if="loading" class="empty-card">
      {{ copy.loading }}
    </div>

    <div v-else-if="!overview" class="empty-card">
      {{ copy.noWorkspace }}
    </div>

    <template v-else>
      <section class="hero-shell">
        <div class="hero-main">
          <div class="product-eyebrow border border-[rgba(229,106,43,0.14)] bg-[rgba(229,106,43,0.06)] text-[var(--brand-deep)]">
            <span class="h-2 w-2 rounded-full bg-[var(--brand)]"></span>
            {{ copy.eyebrow }}
          </div>

          <h1 class="product-title mt-5 text-4xl leading-[0.92] md:text-6xl">
            {{ currentWorkspace?.workspace_name || 'Workspace' }}
          </h1>

          <p class="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">{{ copy.summary }}</p>

          <div class="mt-6 flex flex-wrap gap-3">
            <button class="product-button-primary" type="button" @click="router.push('/admin/roadmap')">
              {{ copy.primaryAction }}
            </button>
            <button class="product-button-secondary" type="button" @click="router.push('/admin/notes')">
              {{ copy.secondaryAction }}
            </button>
          </div>
        </div>

        <aside class="hero-side">
          <div class="hero-side-label">{{ copy.role }}</div>
          <div class="hero-side-value">{{ currentRole }}</div>
          <p class="hero-side-copy">{{ authStore.hasWriteAccess ? copy.workHintWritable : copy.workHintReadOnly }}</p>

          <div class="hero-divider"></div>

          <div class="hero-side-label">{{ copy.completion }}</div>
          <div class="hero-side-value">{{ metrics?.completion_rate ?? 0 }}%</div>
          <p class="hero-side-copy">{{ currentWorkspace?.workspace_slug || '' }}</p>
        </aside>
      </section>

      <section class="metric-grid">
        <article class="metric-card">
          <div class="metric-label">{{ copy.metrics.members }}</div>
          <div class="metric-value">{{ metrics?.members_total ?? 0 }}</div>
        </article>
        <article class="metric-card">
          <div class="metric-label">{{ copy.metrics.roadmap }}</div>
          <div class="metric-value">{{ metrics?.roadmap_total ?? 0 }}</div>
        </article>
        <article class="metric-card">
          <div class="metric-label">{{ copy.metrics.notes }}</div>
          <div class="metric-value">{{ metrics?.notes_total ?? 0 }}</div>
        </article>
        <article class="metric-card">
          <div class="metric-label">{{ copy.metrics.progress }}</div>
          <div class="metric-value">{{ metrics?.roadmap_in_progress ?? 0 }}</div>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <div class="section-title">{{ copy.nextTitle }}</div>
          <p class="section-copy">{{ copy.nextSummary }}</p>

          <div class="mt-5 space-y-3">
            <article
              v-for="item in onboardingItems"
              :key="item.key"
              class="task-item"
            >
              <div class="task-body">
                <div class="flex items-center gap-3">
                  <span :class="item.done ? 'task-badge task-badge-done' : 'task-badge task-badge-todo'">
                    {{ item.done ? copy.nextDone : copy.nextTodo }}
                  </span>
                  <h3 class="task-title">{{ item.title }}</h3>
                </div>
                <p class="task-copy">{{ item.description }}</p>
              </div>

              <button class="product-button-secondary !px-4 !py-2.5" type="button" @click="router.push(item.cta_path)">
                {{ item.cta_label }}
              </button>
            </article>
          </div>
        </article>

        <article class="panel panel-soft">
          <div class="section-title">{{ copy.healthTitle }}</div>
          <p class="section-copy">{{ copy.healthSummary }}</p>

          <div class="mt-5">
            <div class="mb-2 flex items-center justify-between text-sm font-semibold text-[var(--ink-main)]">
              <span>{{ copy.overallCompletion }}</span>
              <span>{{ metrics?.completion_rate ?? 0 }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${metrics?.completion_rate ?? 0}%` }"></div>
            </div>
          </div>

          <div class="status-grid">
            <div class="status-card">
              <div class="status-label">{{ copy.completed }}</div>
              <div class="status-value">{{ metrics?.roadmap_completed ?? 0 }}</div>
            </div>
            <div class="status-card">
              <div class="status-label">{{ copy.inProgress }}</div>
              <div class="status-value">{{ metrics?.roadmap_in_progress ?? 0 }}</div>
            </div>
            <div class="status-card">
              <div class="status-label">{{ copy.todo }}</div>
              <div class="status-value">{{ metrics?.roadmap_todo ?? 0 }}</div>
            </div>
          </div>

          <div class="team-mini-grid">
            <div class="team-mini-card">
              <div class="team-mini-label">{{ copy.teamRoles.owner }}</div>
              <div class="team-mini-value">{{ team?.role_counts.owner ?? 0 }}</div>
            </div>
            <div class="team-mini-card">
              <div class="team-mini-label">{{ copy.teamRoles.admin }}</div>
              <div class="team-mini-value">{{ team?.role_counts.admin ?? 0 }}</div>
            </div>
            <div class="team-mini-card">
              <div class="team-mini-label">{{ copy.teamRoles.member }}</div>
              <div class="team-mini-value">{{ team?.role_counts.member ?? 0 }}</div>
            </div>
            <div class="team-mini-card">
              <div class="team-mini-label">{{ copy.teamRoles.viewer }}</div>
              <div class="team-mini-value">{{ team?.role_counts.viewer ?? 0 }}</div>
            </div>
          </div>

          <div class="next-move">
            <div class="next-move-label">{{ copy.suggestedNextMove }}</div>
            <p class="next-move-copy">{{ suggestedNextMove }}</p>
          </div>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <div class="section-head">
            <div class="section-title">{{ copy.activityTitle }}</div>
            <button class="section-link" type="button" @click="router.push('/admin/activity')">{{ copy.activityAction }}</button>
          </div>

          <div v-if="activityItems.length > 0" class="mt-4 space-y-3">
            <article
              v-for="item in activityItems.slice(0, 4)"
              :key="`${item.type}-${item.occurred_at}-${item.title}`"
              class="feed-item"
            >
              <div class="feed-main">
                <div class="feed-badge">{{ activityBadge(item) }}</div>
                <div class="feed-title">{{ item.title }}</div>
                <div class="feed-copy">{{ item.description }}</div>
              </div>
              <div class="feed-side">
                <div class="feed-date">{{ formatDate(item.occurred_at) }}</div>
                <button class="section-link" type="button" @click="router.push(item.href)">{{ copy.openAction }}</button>
              </div>
            </article>
          </div>

          <div v-else class="empty-inline-card">{{ copy.emptyActivity }}</div>
        </article>

        <article class="panel">
          <div class="section-head">
            <div class="section-title">{{ copy.notesTitle }}</div>
            <button class="section-link" type="button" @click="router.push('/admin/notes')">{{ copy.notesAction }}</button>
          </div>

          <div v-if="recentNotes.length > 0" class="mt-4 space-y-3">
            <article
              v-for="note in recentNotes.slice(0, 4)"
              :key="note.id"
              class="note-item"
              @click="router.push(`/note/${note.id}`)"
            >
              <div class="note-item-title">{{ note.title }}</div>
              <div class="note-item-copy">{{ note.summary || copy.noSummary }}</div>
              <div class="note-item-date">{{ formatDate(note.created_at) }}</div>
            </article>
          </div>

          <div v-else class="empty-inline-card">{{ copy.emptyNotes }}</div>
        </article>
      </section>
    </template>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

.hero-shell {
  @apply grid gap-5 rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] p-7 shadow-[0_16px_40px_rgba(15,23,42,0.04)] xl:grid-cols-[minmax(0,1fr)_320px];
}

.hero-main {
  @apply min-w-0;
}

.hero-side {
  @apply rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[var(--surface-soft)] p-5;
}

.hero-side-label {
  @apply text-sm font-semibold text-[var(--ink-soft)];
}

.hero-side-value {
  @apply mt-2 font-[var(--font-display)] text-3xl font-bold tracking-[-0.05em] text-[var(--ink-strong)];
}

.hero-side-copy {
  @apply mt-2 text-sm leading-7 text-[var(--ink-soft)];
}

.hero-divider {
  @apply my-5 h-px bg-[rgba(15,23,42,0.08)];
}

.metric-grid {
  @apply mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4;
}

.metric-card {
  @apply rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)];
}

.metric-label {
  @apply text-sm font-semibold text-[var(--ink-soft)];
}

.metric-value {
  @apply mt-3 font-[var(--font-display)] text-4xl font-bold tracking-[-0.06em] text-[var(--ink-strong)];
}

.content-grid {
  @apply mt-5 grid gap-5 xl:grid-cols-2;
}

.panel {
  @apply rounded-[26px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)];
}

.panel-soft {
  @apply bg-[rgba(248,250,252,0.94)];
}

.section-head {
  @apply flex items-center justify-between gap-4;
}

.section-title {
  @apply text-xl font-bold tracking-[-0.03em] text-[var(--ink-strong)];
}

.section-copy {
  @apply mt-2 text-sm leading-7 text-[var(--ink-soft)];
}

.section-link {
  @apply text-sm font-semibold text-[var(--brand)] transition-opacity hover:opacity-70;
}

.task-item {
  @apply flex flex-col gap-4 rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-[var(--surface-soft)] p-5 lg:flex-row lg:items-center lg:justify-between;
}

.task-body {
  @apply min-w-0;
}

.task-badge {
  @apply inline-flex rounded-full px-3 py-1 text-xs font-semibold;
}

.task-badge-done {
  @apply bg-[rgba(21,128,61,0.12)] text-[var(--success)];
}

.task-badge-todo {
  @apply bg-[rgba(229,106,43,0.12)] text-[var(--brand-deep)];
}

.task-title {
  @apply text-base font-semibold text-[var(--ink-strong)];
}

.task-copy {
  @apply mt-3 text-sm leading-7 text-[var(--ink-soft)];
}

.progress-bar {
  @apply h-2.5 rounded-full bg-[rgba(15,23,42,0.08)];
}

.progress-fill {
  @apply h-2.5 rounded-full bg-[linear-gradient(90deg,#e56a2b_0%,#2563eb_100%)];
}

.status-grid {
  @apply mt-5 grid gap-3 sm:grid-cols-3;
}

.status-card {
  @apply rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white px-4 py-4;
}

.status-label {
  @apply text-sm font-semibold text-[var(--ink-soft)];
}

.status-value {
  @apply mt-2 font-[var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-[var(--ink-strong)];
}

.team-mini-grid {
  @apply mt-5 grid gap-3 sm:grid-cols-2;
}

.team-mini-card {
  @apply rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white px-4 py-4;
}

.team-mini-label {
  @apply text-sm font-semibold text-[var(--ink-soft)];
}

.team-mini-value {
  @apply mt-2 text-lg font-bold text-[var(--ink-strong)];
}

.next-move {
  @apply mt-5 rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-white px-5 py-5;
}

.next-move-label {
  @apply text-sm font-semibold text-[var(--ink-soft)];
}

.next-move-copy {
  @apply mt-2 text-sm leading-7 text-[var(--ink-main)];
}

.feed-item,
.note-item {
  @apply flex cursor-pointer items-start justify-between gap-4 rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-[var(--surface-soft)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.05)];
}

.feed-main {
  @apply min-w-0;
}

.feed-badge {
  @apply inline-flex rounded-full bg-[rgba(15,23,42,0.06)] px-3 py-1 text-xs font-semibold text-[var(--ink-main)];
}

.feed-title,
.note-item-title {
  @apply mt-3 text-base font-semibold text-[var(--ink-strong)];
}

.feed-copy,
.note-item-copy {
  @apply mt-2 text-sm leading-7 text-[var(--ink-soft)];
}

.feed-side {
  @apply shrink-0 text-right;
}

.feed-date,
.note-item-date {
  @apply text-xs text-[var(--ink-soft)];
}

.note-item {
  @apply block;
}

.note-item-date {
  @apply mt-3 block;
}

.empty-card {
  @apply rounded-[24px] border border-dashed border-[rgba(15,23,42,0.12)] bg-[rgba(255,255,255,0.7)] px-6 py-16 text-center text-sm font-semibold text-[var(--ink-soft)];
}

.empty-inline-card {
  @apply mt-4 rounded-[20px] border border-dashed border-[rgba(15,23,42,0.12)] bg-[rgba(248,250,252,0.88)] px-5 py-12 text-center text-sm font-semibold text-[var(--ink-soft)];
}
</style>
