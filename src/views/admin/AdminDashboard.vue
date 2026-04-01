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
        eyebrow: 'Workspace Dashboard',
        consoleTitle: 'Ops Console',
        summary: '把团队指标、onboarding、成员结构、研究笔记和协作动态，统一到一个真正可运营的 command center。',
        role: '当前角色',
        completion: '完成率',
        roleHintReadOnly: '当前是只读视角，可查看团队健康度与活动趋势。',
        roleHintWritable: '当前角色可继续推进 roadmap、notes 与团队运营。',
        metrics: {
          members: '团队成员',
          roadmap: 'Roadmap 节点',
          notes: 'Research Notes',
          progress: '进行中节点',
        },
        metricCopy: {
          members: '当前 workspace 内正在协作的人数',
          roadmap: '被正式纳入执行路径的节点总量',
          notes: '已经沉淀下来的研究、复盘与结论',
          progress: '仍处于推进状态的关键节点',
        },
        onboardingEyebrow: 'Onboarding Checklist',
        onboardingTitle: '把 workspace 从“刚创建”推进到“可运营”',
        onboardingDone: '已完成',
        onboardingNext: '下一步',
        roadmapEyebrow: 'Roadmap Health',
        roadmapTitle: '一眼看清执行健康度',
        overallCompletion: '整体完成率',
        suggestedNextMove: 'Suggested next move',
        completed: '已完成',
        inProgress: '进行中',
        todo: '待开始',
        teamEyebrow: 'Team Snapshot',
        teamTitle: '当前协作结构',
        teamAction: '管理 Team',
        teamRoles: {
          owner: 'Owners',
          admin: 'Admins',
          member: 'Members',
          viewer: 'Viewers',
        },
        emptyMembers: '当前还没有更多成员加入这个 workspace。',
        notesEyebrow: 'Recent Notes',
        notesTitle: '最近沉淀的研究笔记',
        notesAction: '查看全部 Notes',
        noSummary: '这条笔记还没有补充摘要。',
        emptyNotes: '还没有 notes。先从某个 roadmap 节点开始沉淀第一条研究记录。',
        activityEyebrow: 'Recent Activity',
        activityTitle: '最新协作动态',
        activityAction: '查看全部 Activity',
        openAction: '打开',
        emptyActivity: '最近还没有足够的协作动态。可以先邀请成员、创建笔记或推进 roadmap。',
        noWorkspace: '当前没有激活的 workspace，上下文建立后这里会出现总览。',
        loading: '正在加载 workspace overview...',
        errorFallback: '加载 dashboard 数据失败',
      }
    : {
        eyebrow: 'Workspace Dashboard',
        consoleTitle: 'Ops Console',
        summary: 'Bring team metrics, onboarding, structure, notes, and collaboration signals into one command center built for daily operations.',
        role: 'Current role',
        completion: 'Completion rate',
        roleHintReadOnly: 'This is a read-only operating view focused on visibility and signal.',
        roleHintWritable: 'This role can continue moving roadmap, notes, and workspace operations forward.',
        metrics: {
          members: 'Team members',
          roadmap: 'Roadmap nodes',
          notes: 'Research notes',
          progress: 'In progress',
        },
        metricCopy: {
          members: 'People actively collaborating inside this workspace',
          roadmap: 'Nodes already included in the execution path',
          notes: 'Research entries, reviews, and reusable findings',
          progress: 'Key nodes still moving forward',
        },
        onboardingEyebrow: 'Onboarding Checklist',
        onboardingTitle: 'Move the workspace from fresh setup to operational baseline',
        onboardingDone: 'Done',
        onboardingNext: 'Next',
        roadmapEyebrow: 'Roadmap Health',
        roadmapTitle: 'See execution health at a glance',
        overallCompletion: 'Overall completion',
        suggestedNextMove: 'Suggested next move',
        completed: 'Completed',
        inProgress: 'In progress',
        todo: 'Todo',
        teamEyebrow: 'Team Snapshot',
        teamTitle: 'Current collaboration structure',
        teamAction: 'Manage team',
        teamRoles: {
          owner: 'Owners',
          admin: 'Admins',
          member: 'Members',
          viewer: 'Viewers',
        },
        emptyMembers: 'No additional members have joined this workspace yet.',
        notesEyebrow: 'Recent Notes',
        notesTitle: 'Latest research notes',
        notesAction: 'View all notes',
        noSummary: 'This note does not have a summary yet.',
        emptyNotes: 'There are no notes yet. Start from a roadmap node and capture the first research entry.',
        activityEyebrow: 'Recent Activity',
        activityTitle: 'Latest collaboration signals',
        activityAction: 'View all activity',
        openAction: 'Open',
        emptyActivity: 'There is not enough activity yet. Invite teammates, add notes, or move the roadmap forward.',
        noWorkspace: 'There is no active workspace context yet. The overview will appear here once one is available.',
        loading: 'Loading workspace overview...',
        errorFallback: 'Unable to load dashboard data',
      }
)

const roleLabelMap = computed<Record<WorkspaceRole, string>>(() => ({
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
}))

const onboardingCopyMap = computed<
  Record<string, Pick<WorkspaceOnboardingChecklistItem, 'title' | 'description' | 'cta_label'>>
>(() =>
  localeStore.isChinese
    ? {
        roadmap_foundation: {
          title: '建立 roadmap foundation',
          description: '至少创建 3 个 roadmap 节点，让团队先看到一条清晰的执行路径。',
          cta_label: '打开 Roadmap',
        },
        invite_team: {
          title: '邀请第一批协作者',
          description: '至少再加入 1 位成员，让 workspace 真正进入协作状态。',
          cta_label: '管理 Team',
        },
        seed_notes: {
          title: '沉淀第一批 Research Notes',
          description: '至少创建 3 条 notes，让决策、实验与发现可以持续复用。',
          cta_label: '查看 Notes',
        },
      }
    : {
        roadmap_foundation: {
          title: 'Build roadmap foundation',
          description: 'Create at least 3 roadmap nodes so the team can see a visible execution path.',
          cta_label: 'Open roadmap',
        },
        invite_team: {
          title: 'Invite the first teammates',
          description: 'Add at least one more teammate so the workspace becomes truly collaborative.',
          cta_label: 'Manage team',
        },
        seed_notes: {
          title: 'Seed the first notes',
          description: 'Capture at least 3 notes so decisions, experiments, and findings can compound.',
          cta_label: 'Open notes',
        },
      }
)

const currentWorkspace = computed(() => overview.value?.workspace ?? authStore.activeWorkspace)
const currentRoleKey = computed<WorkspaceRole>(
  () => (overview.value?.workspace.role ?? authStore.activeRole ?? 'viewer') as WorkspaceRole
)
const currentRole = computed(() => roleLabelMap.value[currentRoleKey.value])
const metrics = computed(() => overview.value?.metrics)
const team = computed(() => overview.value?.team)
const recentNotes = computed(() => overview.value?.notes ?? [])
const activityItems = computed(() => overview.value?.activity ?? [])

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

const onboardingCompletedCount = computed(() => onboardingItems.value.filter((item) => item.done).length)

const suggestedNextMove = computed(() => {
  if (!metrics.value) {
    return ''
  }

  if (metrics.value.roadmap_total === 0) {
    return localeStore.isChinese
      ? '先搭建最小 roadmap，让团队知道接下来沿着什么路径推进。'
      : 'Start with a minimal roadmap so the team can see what path to push next.'
  }

  if (metrics.value.members_total <= 1) {
    return localeStore.isChinese
      ? '下一步最值得做的是邀请首批协作者，让这个 workspace 真正变成团队系统。'
      : 'The best next step is inviting the first teammate so this workspace becomes a real team system.'
  }

  if (metrics.value.notes_total < metrics.value.roadmap_total) {
    return localeStore.isChinese
      ? 'Roadmap 已经有结构，接下来应该补齐节点下的研究笔记与复盘。'
      : 'The roadmap has structure. Next, seed notes and reviews beneath the active nodes.'
  }

  return localeStore.isChinese
    ? '当前 workspace 已具备稳定运营基线，可以继续扩大团队并沉淀更多可复用知识。'
    : 'This workspace already has a stable operating baseline. Keep expanding the team and compounding reusable knowledge.'
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
  <div class="mx-auto max-w-7xl px-6 py-8 lg:px-10">
    <header class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
      <div>
        <div class="product-eyebrow border border-[rgba(216,110,59,0.14)] bg-white/80 text-[var(--brand)]">
          <span class="h-2.5 w-2.5 rounded-full bg-[var(--brand)]"></span>
          {{ copy.eyebrow }}
        </div>
        <h1 class="product-title mt-7 text-4xl leading-[0.95] md:text-6xl">
          {{ currentWorkspace?.workspace_name || 'Workspace' }} {{ copy.consoleTitle }}
        </h1>
        <p class="mt-5 max-w-3xl text-base leading-8 text-[var(--ink-soft)]">{{ copy.summary }}</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <article class="hero-card">
          <div class="hero-label">{{ copy.role }}</div>
          <div class="hero-value">{{ currentRole }}</div>
          <p class="hero-copy">{{ authStore.hasWriteAccess ? copy.roleHintWritable : copy.roleHintReadOnly }}</p>
        </article>

        <article class="hero-card">
          <div class="hero-label">{{ copy.completion }}</div>
          <div class="hero-value">{{ metrics?.completion_rate ?? 0 }}%</div>
          <p class="hero-copy">{{ currentWorkspace?.workspace_slug || 'workspace' }}</p>
        </article>
      </div>
    </header>

    <div v-if="errorMessage" class="product-error mt-8 px-5 py-4 text-sm font-semibold">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="empty-card mt-10">
      {{ copy.loading }}
    </div>

    <div v-else-if="!overview" class="empty-card mt-10">
      {{ copy.noWorkspace }}
    </div>

    <template v-else>
      <section class="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article class="metric-card">
          <div class="metric-label">{{ copy.metrics.members }}</div>
          <div class="metric-value">{{ metrics?.members_total ?? 0 }}</div>
          <p class="metric-copy">{{ copy.metricCopy.members }}</p>
        </article>

        <article class="metric-card">
          <div class="metric-label">{{ copy.metrics.roadmap }}</div>
          <div class="metric-value">{{ metrics?.roadmap_total ?? 0 }}</div>
          <p class="metric-copy">{{ copy.metricCopy.roadmap }}</p>
        </article>

        <article class="metric-card">
          <div class="metric-label">{{ copy.metrics.notes }}</div>
          <div class="metric-value">{{ metrics?.notes_total ?? 0 }}</div>
          <p class="metric-copy">{{ copy.metricCopy.notes }}</p>
        </article>

        <article class="metric-card">
          <div class="metric-label">{{ copy.metrics.progress }}</div>
          <div class="metric-value">{{ metrics?.roadmap_in_progress ?? 0 }}</div>
          <p class="metric-copy">{{ copy.metricCopy.progress }}</p>
        </article>
      </section>

      <section class="mt-10 grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <article class="panel">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="panel-eyebrow">{{ copy.onboardingEyebrow }}</div>
              <h2 class="panel-title">{{ copy.onboardingTitle }}</h2>
            </div>
            <div class="pill">{{ onboardingCompletedCount }}/{{ onboardingItems.length }}</div>
          </div>

          <div class="mt-7 space-y-4">
            <article
              v-for="item in onboardingItems"
              :key="item.key"
              class="soft-card flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div class="flex items-center gap-3">
                  <span
                    :class="
                      item.done
                        ? 'bg-[rgba(24,121,78,0.12)] text-[var(--success)]'
                        : 'bg-[rgba(216,110,59,0.12)] text-[var(--brand)]'
                    "
                    class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]"
                  >
                    {{ item.done ? copy.onboardingDone : copy.onboardingNext }}
                  </span>
                  <h3 class="text-lg font-black tracking-tight text-[var(--ink-strong)]">{{ item.title }}</h3>
                </div>
                <p class="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{{ item.description }}</p>
              </div>

              <button class="product-button-secondary !px-5 !py-3" type="button" @click="openLink(item.cta_path)">
                {{ item.cta_label }}
              </button>
            </article>
          </div>
        </article>

        <article class="panel bg-[linear-gradient(180deg,rgba(255,250,242,0.96),rgba(255,246,238,0.9))]">
          <div class="panel-eyebrow">{{ copy.roadmapEyebrow }}</div>
          <h2 class="panel-title">{{ copy.roadmapTitle }}</h2>

          <div class="mt-8">
            <div class="mb-3 flex items-center justify-between text-sm font-bold text-[var(--ink-soft)]">
              <span>{{ copy.overallCompletion }}</span>
              <span>{{ metrics?.completion_rate ?? 0 }}%</span>
            </div>
            <div class="h-3 rounded-full bg-[rgba(20,33,43,0.08)]">
              <div
                class="h-3 rounded-full bg-[linear-gradient(90deg,#d86e3b_0%,#2d7a78_100%)]"
                :style="{ width: `${metrics?.completion_rate ?? 0}%` }"
              ></div>
            </div>
          </div>

          <div class="mt-6 grid gap-4 sm:grid-cols-3">
            <article class="status-card status-card-success">
              <div class="status-label">{{ copy.completed }}</div>
              <div class="status-value">{{ metrics?.roadmap_completed ?? 0 }}</div>
            </article>

            <article class="status-card status-card-brand">
              <div class="status-label">{{ copy.inProgress }}</div>
              <div class="status-value">{{ metrics?.roadmap_in_progress ?? 0 }}</div>
            </article>

            <article class="status-card">
              <div class="status-label">{{ copy.todo }}</div>
              <div class="status-value">{{ metrics?.roadmap_todo ?? 0 }}</div>
            </article>
          </div>

          <div class="soft-card mt-6 p-5">
            <div class="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--accent)]">
              {{ copy.suggestedNextMove }}
            </div>
            <p class="mt-3 text-sm leading-7 text-[var(--ink-main)]">{{ suggestedNextMove }}</p>
          </div>
        </article>
      </section>

      <section class="mt-10 grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <article class="panel">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="panel-eyebrow">{{ copy.teamEyebrow }}</div>
              <h2 class="panel-title">{{ copy.teamTitle }}</h2>
            </div>
            <button class="product-button-secondary !px-5 !py-3" type="button" @click="router.push('/admin/workspace')">
              {{ copy.teamAction }}
            </button>
          </div>

          <div class="mt-7 grid gap-4 sm:grid-cols-2">
            <article class="role-card">
              <div class="role-label">{{ copy.teamRoles.owner }}</div>
              <div class="role-value">{{ team?.role_counts.owner ?? 0 }}</div>
            </article>
            <article class="role-card">
              <div class="role-label">{{ copy.teamRoles.admin }}</div>
              <div class="role-value">{{ team?.role_counts.admin ?? 0 }}</div>
            </article>
            <article class="role-card">
              <div class="role-label">{{ copy.teamRoles.member }}</div>
              <div class="role-value">{{ team?.role_counts.member ?? 0 }}</div>
            </article>
            <article class="role-card">
              <div class="role-label">{{ copy.teamRoles.viewer }}</div>
              <div class="role-value">{{ team?.role_counts.viewer ?? 0 }}</div>
            </article>
          </div>

          <div class="mt-7 space-y-3">
            <article
              v-for="member in team?.recent_members ?? []"
              :key="member.user_id"
              class="soft-card flex items-center justify-between gap-4 px-4 py-4"
            >
              <div>
                <div class="font-black text-[var(--ink-strong)]">{{ member.username }}</div>
                <div class="mt-1 text-sm text-[var(--ink-soft)]">{{ member.email }}</div>
              </div>
              <div class="text-right">
                <div class="pill">{{ roleLabelMap[member.role as WorkspaceRole] ?? member.role }}</div>
                <div class="mt-2 text-[11px] font-semibold text-[var(--ink-soft)]">{{ formatDate(member.joined_at) }}</div>
              </div>
            </article>

            <div v-if="(team?.recent_members.length ?? 0) === 0" class="empty-inline-card">
              {{ copy.emptyMembers }}
            </div>
          </div>
        </article>

        <article class="panel">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="panel-eyebrow">{{ copy.notesEyebrow }}</div>
              <h2 class="panel-title">{{ copy.notesTitle }}</h2>
            </div>
            <button class="product-button-secondary !px-5 !py-3" type="button" @click="router.push('/admin/notes')">
              {{ copy.notesAction }}
            </button>
          </div>

          <div class="mt-7 space-y-4">
            <article
              v-for="note in recentNotes"
              :key="note.id"
              class="soft-card cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(20,33,43,0.08)]"
              @click="router.push(`/note/${note.id}`)"
            >
              <div class="flex items-center justify-between gap-4">
                <h3 class="text-lg font-black tracking-tight text-[var(--ink-strong)]">{{ note.title }}</h3>
                <div class="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                  {{ formatDate(note.created_at) }}
                </div>
              </div>
              <p class="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{{ note.summary || copy.noSummary }}</p>
            </article>

            <div v-if="recentNotes.length === 0" class="empty-inline-card">
              {{ copy.emptyNotes }}
            </div>
          </div>
        </article>
      </section>

      <section class="mt-10">
        <article class="panel">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="panel-eyebrow">{{ copy.activityEyebrow }}</div>
              <h2 class="panel-title">{{ copy.activityTitle }}</h2>
            </div>
            <button class="product-button-secondary !px-5 !py-3" type="button" @click="router.push('/admin/activity')">
              {{ copy.activityAction }}
            </button>
          </div>

          <div class="mt-7 space-y-4">
            <article
              v-for="item in activityItems"
              :key="`${item.type}-${item.occurred_at}-${item.title}`"
              class="soft-card flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between"
            >
              <div>
                <div class="pill">{{ activityBadge(item) }}</div>
                <h3 class="mt-3 text-lg font-black tracking-tight text-[var(--ink-strong)]">{{ item.title }}</h3>
                <p class="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{{ item.description }}</p>
              </div>

              <div class="flex items-center gap-3">
                <div class="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                  {{ formatDate(item.occurred_at) }}
                </div>
                <button class="product-button-secondary !px-5 !py-3" type="button" @click="openLink(item.href)">
                  {{ copy.openAction }}
                </button>
              </div>
            </article>

            <div v-if="activityItems.length === 0" class="empty-inline-card">
              {{ copy.emptyActivity }}
            </div>
          </div>
        </article>
      </section>
    </template>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

.hero-card {
  @apply rounded-[2rem] border border-[rgba(20,33,43,0.08)] bg-[rgba(255,251,245,0.86)] px-6 py-6 shadow-[0_18px_50px_rgba(20,33,43,0.06)];
}

.hero-label {
  @apply text-[10px] font-black uppercase tracking-[0.24em] text-[var(--ink-soft)];
}

.hero-value {
  @apply mt-4 font-[var(--font-display)] text-4xl font-black tracking-[-0.06em] text-[var(--ink-strong)];
}

.hero-copy {
  @apply mt-3 text-sm leading-7 text-[var(--ink-soft)];
}

.metric-card {
  @apply rounded-[1.8rem] border border-[rgba(20,33,43,0.08)] bg-[rgba(255,255,255,0.72)] px-5 py-5 shadow-[0_14px_40px_rgba(20,33,43,0.05)];
}

.metric-label {
  @apply text-[10px] font-black uppercase tracking-[0.24em] text-[var(--ink-soft)];
}

.metric-value {
  @apply mt-4 font-[var(--font-display)] text-4xl font-black tracking-[-0.07em] text-[var(--ink-strong)];
}

.metric-copy {
  @apply mt-3 text-sm leading-7 text-[var(--ink-soft)];
}

.panel {
  @apply rounded-[2.2rem] border border-[rgba(20,33,43,0.08)] bg-[rgba(255,251,245,0.84)] p-7 shadow-[0_24px_70px_rgba(20,33,43,0.05)];
}

.panel-eyebrow {
  @apply text-[11px] font-black uppercase tracking-[0.28em] text-[var(--brand)];
}

.panel-title {
  @apply mt-3 font-[var(--font-display)] text-3xl font-black tracking-[-0.05em] text-[var(--ink-strong)];
}

.soft-card {
  @apply rounded-[1.6rem] border border-[rgba(20,33,43,0.08)] bg-[rgba(255,255,255,0.66)];
}

.pill {
  @apply inline-flex rounded-full bg-[rgba(20,33,43,0.06)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--ink-main)];
}

.status-card {
  @apply rounded-[1.5rem] border border-[rgba(20,33,43,0.08)] bg-[rgba(255,255,255,0.64)] px-4 py-5;
}

.status-card-success {
  background: rgba(24, 121, 78, 0.08);
  border-color: rgba(24, 121, 78, 0.12);
}

.status-card-brand {
  background: rgba(216, 110, 59, 0.08);
  border-color: rgba(216, 110, 59, 0.12);
}

.status-label {
  @apply text-[10px] font-black uppercase tracking-[0.24em] text-[var(--ink-soft)];
}

.status-value {
  @apply mt-3 font-[var(--font-display)] text-3xl font-black tracking-[-0.05em] text-[var(--ink-strong)];
}

.role-card {
  @apply rounded-[1.5rem] border border-[rgba(20,33,43,0.08)] bg-[rgba(255,255,255,0.66)] px-4 py-5;
}

.role-label {
  @apply text-[10px] font-black uppercase tracking-[0.24em] text-[var(--ink-soft)];
}

.role-value {
  @apply mt-3 font-[var(--font-display)] text-3xl font-black tracking-[-0.05em] text-[var(--ink-strong)];
}

.empty-card {
  @apply rounded-[2rem] border border-dashed border-[rgba(20,33,43,0.12)] bg-[rgba(255,255,255,0.54)] px-6 py-16 text-center text-sm font-semibold text-[var(--ink-soft)];
}

.empty-inline-card {
  @apply rounded-[1.6rem] border border-dashed border-[rgba(20,33,43,0.12)] bg-[rgba(255,255,255,0.52)] px-4 py-10 text-center text-sm font-semibold text-[var(--ink-soft)];
}
</style>
