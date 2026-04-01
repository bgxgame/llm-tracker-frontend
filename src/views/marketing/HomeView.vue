<script setup lang="ts">
import { computed } from 'vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { BRAND } from '@/config/brand'
import { useAuthStore } from '@/store/auth'
import { useLocaleStore } from '@/store/locale'

const authStore = useAuthStore()
const localeStore = useLocaleStore()

const primaryHref = computed(() => (authStore.isLoggedIn ? '/admin/dashboard' : '/register'))
const secondaryHref = computed(() =>
  authStore.isLoggedIn ? '/admin/dashboard' : { name: 'login', query: { redirect: '/admin/dashboard' } }
)

const copy = computed(() =>
  localeStore.isChinese
    ? {
        nav: {
          product: '产品能力',
          workflow: '团队场景',
          pricing: '收费方式',
        },
        badge: `${BRAND.name} · Workspace Intelligence for AI Teams`,
        title: '把 Roadmap、研究笔记、团队协作和交付资产，重构成一套可运营的 Workspace 产品。',
        summary:
          'LLM Tracker 不只是记录内容，而是把 AI 团队每天产生的方法、结论、进度和责任，沉淀成可以持续复用的商业系统。',
        primary: authStore.isLoggedIn ? '进入 Dashboard' : '开始创建 Workspace',
        secondary: authStore.isLoggedIn ? '打开 Ops Console' : '登录查看产品',
        highlights: [
          { value: 'Workspace', label: '把人、内容、权限和项目边界管理在同一层' },
          { value: 'Knowledge Ops', label: '让研究流程不再散落在文档、聊天和代码仓库里' },
          { value: 'Execution Memory', label: '把团队经验沉淀成下一次可复制的执行资产' },
        ],
        consoleTitle: 'Workspace Ops Console',
        consoleSummary: '从 dashboard 直接看到团队的推进速度、协作结构、近期活动和 onboarding 状态。',
        consoleMetrics: [
          { label: 'Completion Rate', value: '74%', hint: 'Roadmap 节点按优先级持续推进' },
          { label: 'Active Notes', value: '18', hint: '研究结论与 roadmap 节点保持关联' },
          { label: 'Team Coverage', value: '8', hint: 'Owner / Admin / Member / Viewer 分层协作' },
        ],
        activityTitle: 'Recent Activity',
        activities: [
          '新成员加入 AI Delivery Workspace',
          '评估模板被更新并同步到 Research Notes',
          'Roadmap 本周完成 3 个节点，1 个节点进入执行中',
        ],
        problemsTitle: '为什么通用文档工具不够',
        problems: [
          {
            title: '上下文被拆散',
            description: '知识留在文档，决策留在聊天，交付留在仓库，团队始终看不到完整链路。',
          },
          {
            title: '研究过程不可运营',
            description: '你知道团队很忙，但无法从一个视图看到谁在推进、哪里卡住、哪些结论可复用。',
          },
          {
            title: '新成员接不住经验',
            description: 'Onboarding、复盘和方法论没有沉淀成组织资产，训练成本每次都重新支付。',
          },
        ],
        featureTitle: '一个 Workspace 连接项目、研究与团队执行',
        features: [
          {
            eyebrow: 'Dashboard',
            title: '团队总览开箱即用',
            description: '成员、路线图、笔记和活动时间线统一在一个首页里查看。',
          },
          {
            eyebrow: 'Permissions',
            title: '让正确的人看到正确的内容',
            description: 'Owner、Admin、Member、Viewer 四层角色让协作更清晰，也更少混乱。',
          },
          {
            eyebrow: 'Research Notes',
            title: '笔记回到业务上下文',
            description: '每一条研究记录都能挂接到 roadmap 节点、交付目标和团队动作。',
          },
          {
            eyebrow: 'Ops Layer',
            title: '让团队经验可以复利',
            description: '把一次次研究、试验和交付，沉淀成下一次更快启动的运营系统。',
          },
        ],
        workflowTitle: '适合哪些团队先用起来',
        workflows: [
          {
            title: 'AI 创业团队',
            description: '把产品探索、评估方法、模型试验和交付节奏压进同一套团队空间。',
          },
          {
            title: '训练营与教育团队',
            description: '把课程路线、学员输出、教研笔记和运营复盘结构化沉淀。',
          },
          {
            title: '实验室与技术组织',
            description: '围绕实验、项目和论文建立长期可继承的知识系统，而不是临时资料堆。',
          },
        ],
        pricingTitle: '从一个团队开始，按协作规模逐步升级',
        pricing: [
          {
            name: 'Starter',
            price: '免费',
            description: '适合个人验证与小规模试运行',
            bullets: ['1 个 workspace', '核心 notes 与 roadmap', '基础团队协作'],
          },
          {
            name: 'Team',
            price: '¥299 / workspace / 月',
            description: '适合需要统一项目、知识与协作节奏的团队',
            bullets: ['权限治理与团队协作', '活动与 onboarding 视图', '更清晰的项目执行结构'],
            featured: true,
          },
          {
            name: 'Enterprise',
            price: '定制报价',
            description: '适合跨团队、多角色、复杂协作场景',
            bullets: ['多 workspace 治理', '更正式的协作流程', '迁移与落地支持'],
          },
        ],
        ctaTitle: '让团队在一个 Workspace 里同步目标、研究与执行。',
        ctaSummary:
          '少切换工具，少丢上下文，更快把想法推进成清晰、可追踪、可交付的结果。',
      }
    : {
        nav: {
          product: 'Product',
          workflow: 'Use Cases',
          pricing: 'Pricing',
        },
        badge: `${BRAND.name} · Workspace Intelligence for AI Teams`,
        title: 'Turn roadmap, research notes, collaboration, and delivery assets into a product-grade workspace.',
        summary:
          'LLM Tracker is not another place to write things down. It is where AI teams compound methods, decisions, progress, and ownership into a reusable operating system.',
        primary: authStore.isLoggedIn ? 'Open dashboard' : 'Launch workspace',
        secondary: authStore.isLoggedIn ? 'Open Ops Console' : 'Sign in',
        highlights: [
          { value: 'Workspace', label: 'Manage people, content, permissions, and project scope in one operating layer' },
          { value: 'Knowledge Ops', label: 'Keep research workflows out of scattered docs, chat threads, and repos' },
          { value: 'Execution Memory', label: 'Turn team experience into reusable delivery capital' },
        ],
        consoleTitle: 'Workspace Ops Console',
        consoleSummary: 'See execution velocity, team structure, recent activity, and onboarding progress from one dashboard.',
        consoleMetrics: [
          { label: 'Completion Rate', value: '74%', hint: 'Roadmap stages keep moving against shared priorities' },
          { label: 'Active Notes', value: '18', hint: 'Research insight stays connected to roadmap decisions' },
          { label: 'Team Coverage', value: '8', hint: 'Owner, Admin, Member, and Viewer roles stay explicit' },
        ],
        activityTitle: 'Recent Activity',
        activities: [
          'A new teammate joined the AI Delivery workspace',
          'The evaluation playbook was updated and linked to research notes',
          'Three roadmap items shipped this week and one moved into progress',
        ],
        problemsTitle: 'Why generic document tools stop short',
        problems: [
          {
            title: 'Context gets fragmented',
            description: 'Knowledge lives in docs, decisions live in chat, delivery lives in repos, and the full chain disappears.',
          },
          {
            title: 'Research lacks an operating view',
            description: 'Teams stay busy without a clear picture of what is moving, what is blocked, and what is reusable.',
          },
          {
            title: 'Experience does not compound',
            description: 'Onboarding, retrospectives, and methods do not become durable organizational memory.',
          },
        ],
        featureTitle: 'One workspace for projects, research, and team execution',
        features: [
          {
            eyebrow: 'Dashboard',
            title: 'A clear home for the team',
            description: 'Members, roadmap, notes, and recent activity are visible from one workspace home.',
          },
          {
            eyebrow: 'Permissions',
            title: 'The right access for the right people',
            description: 'Owner, Admin, Member, and Viewer roles keep collaboration clear from day one.',
          },
          {
            eyebrow: 'Research Notes',
            title: 'Notes stay inside execution context',
            description: 'Every insight can be tied back to a roadmap step, delivery objective, or operating decision.',
          },
          {
            eyebrow: 'Ops Layer',
            title: 'Let experience compound',
            description: 'Turn repeated research, experiments, and delivery work into a faster next launch.',
          },
        ],
        workflowTitle: 'Best fit for teams building AI capability',
        workflows: [
          {
            title: 'AI startups',
            description: 'Unify exploration, evaluation method, experimentation, and delivery cadence in one team space.',
          },
          {
            title: 'Training programs',
            description: 'Structure curriculum paths, learner outputs, instructor notes, and operating retrospectives.',
          },
          {
            title: 'Labs and technical orgs',
            description: 'Build durable knowledge systems around experiments, projects, and papers instead of ad hoc folders.',
          },
        ],
        pricingTitle: 'Start with one team and scale as collaboration grows',
        pricing: [
          {
            name: 'Starter',
            price: 'Free',
            description: 'For solo operators and early validation',
            bullets: ['1 workspace', 'Core notes and roadmap', 'Foundational collaboration'],
          },
          {
            name: 'Team',
            price: '$39 / workspace / month',
            description: 'For teams that need one place for project work, knowledge, and collaboration',
            bullets: ['Permission governance and team collaboration', 'Activity and onboarding visibility', 'A clearer operating structure for work'],
            featured: true,
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            description: 'For multi-team, multi-role, higher-governance environments',
            bullets: ['Multi-workspace governance', 'Formal collaboration workflows', 'Migration and rollout support'],
          },
        ],
        ctaTitle: 'Keep goals, research, and execution in one workspace.',
        ctaSummary:
          'Spend less time switching tools, lose less context, and move ideas into trackable, deliverable work faster.',
      }
)
</script>

<template>
  <div class="page-shell overflow-hidden">
    <section class="relative pb-16 pt-6 md:pb-24">
      <div class="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_top_left,_rgba(216,110,59,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(45,122,120,0.14),_transparent_26%),linear-gradient(180deg,_rgba(255,251,245,0.86)_0%,_rgba(244,241,235,0.48)_70%,_transparent_100%)]"></div>

      <header class="product-shell relative z-10 flex items-center justify-between gap-4 py-5">
        <router-link to="/" class="flex items-center gap-3 transition-opacity hover:opacity-80">
          <span class="flex h-11 w-11 items-center justify-center rounded-[1.35rem] bg-[var(--ink-strong)] text-sm font-black tracking-[0.18em] text-white shadow-[0_20px_40px_rgba(20,33,43,0.16)]">
              {{ BRAND.mark }}
            </span>
            <span>
              <span class="block font-[var(--font-display)] text-sm font-black uppercase tracking-[0.32em] text-[var(--ink-strong)]">
                {{ BRAND.name }}
              </span>
              <span class="block text-[10px] font-black uppercase tracking-[0.34em] text-[var(--ink-soft)]">
                {{ BRAND.descriptor }}
              </span>
            </span>
          </router-link>

        <nav class="hidden items-center gap-7 text-[11px] font-black uppercase tracking-[0.24em] text-[var(--ink-soft)] lg:flex">
          <a href="#product" class="transition-colors hover:text-[var(--ink-strong)]">{{ copy.nav.product }}</a>
          <a href="#workflow" class="transition-colors hover:text-[var(--ink-strong)]">{{ copy.nav.workflow }}</a>
          <a href="#pricing" class="transition-colors hover:text-[var(--ink-strong)]">{{ copy.nav.pricing }}</a>
        </nav>

        <div class="flex items-center gap-3">
          <LanguageSwitcher />
          <router-link :to="secondaryHref" class="product-button-secondary hidden lg:inline-flex">
            {{ copy.secondary }}
          </router-link>
          <router-link :to="primaryHref" class="product-button-primary">
            {{ copy.primary }}
          </router-link>
        </div>
      </header>

      <div class="product-shell relative z-10 grid gap-10 pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center lg:pt-16">
        <div class="max-w-3xl">
          <div class="product-eyebrow border border-[rgba(216,110,59,0.14)] bg-[rgba(255,255,255,0.72)] text-[var(--brand)]">
            <span class="h-2.5 w-2.5 rounded-full bg-[var(--brand)]"></span>
            {{ copy.badge }}
          </div>

          <h1 class="product-title mt-8 text-5xl leading-[0.92] md:text-6xl xl:text-7xl">
            {{ copy.title }}
          </h1>

          <p class="product-body mt-7 max-w-2xl text-lg md:text-[1.15rem]">
            {{ copy.summary }}
          </p>

          <div class="mt-10 flex flex-col gap-4 sm:flex-row">
            <router-link :to="primaryHref" class="product-button-primary">
              {{ copy.primary }}
            </router-link>
            <router-link :to="secondaryHref" class="product-button-secondary">
              {{ copy.secondary }}
            </router-link>
          </div>

          <div class="mt-12 grid gap-4 md:grid-cols-3">
            <div v-for="item in copy.highlights" :key="item.value" class="product-stat">
              <div class="text-xs font-black uppercase tracking-[0.26em] text-[var(--ink-soft)]">{{ item.value }}</div>
              <p class="mt-4 text-sm font-semibold leading-7 text-[var(--ink-main)]">{{ item.label }}</p>
            </div>
          </div>
        </div>

        <div class="relative">
          <div class="absolute -left-6 top-10 h-40 w-40 rounded-full bg-[rgba(216,110,59,0.16)] blur-3xl"></div>
          <div class="absolute -right-5 bottom-10 h-44 w-44 rounded-full bg-[rgba(45,122,120,0.18)] blur-3xl"></div>

          <div class="relative overflow-hidden rounded-[2.2rem] bg-[var(--surface-dark)] p-6 text-white shadow-[0_40px_120px_rgba(20,33,43,0.2)] md:p-8">
            <div class="flex items-start justify-between gap-5">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.28em] text-[rgba(255,255,255,0.56)]">
                  {{ copy.consoleTitle }}
                </p>
                <h2 class="mt-3 font-[var(--font-display)] text-3xl font-black tracking-[-0.05em]">
                  AI Research Workspace
                </h2>
                <p class="mt-4 max-w-md text-sm leading-7 text-[rgba(255,255,255,0.68)]">
                  {{ copy.consoleSummary }}
                </p>
              </div>
              <span class="rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[rgba(255,255,255,0.78)]">
                Live Overview
              </span>
            </div>

            <div class="mt-8 grid gap-4 md:grid-cols-3">
              <div
                v-for="metric in copy.consoleMetrics"
                :key="metric.label"
                class="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.06)] p-5"
              >
                <div class="text-[11px] font-black uppercase tracking-[0.24em] text-[rgba(255,255,255,0.54)]">
                  {{ metric.label }}
                </div>
                <div class="mt-4 font-[var(--font-display)] text-4xl font-black tracking-[-0.06em]">
                  {{ metric.value }}
                </div>
                <p class="mt-3 text-sm leading-6 text-[rgba(255,255,255,0.65)]">{{ metric.hint }}</p>
              </div>
            </div>

            <div class="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div class="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.06)] p-5">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-[11px] font-black uppercase tracking-[0.24em] text-[rgba(255,255,255,0.56)]">
                    {{ copy.activityTitle }}
                  </div>
                  <div class="rounded-full bg-[rgba(216,110,59,0.18)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[rgba(255,245,240,0.92)]">
                    Team Flow
                  </div>
                </div>

                <div class="mt-4 space-y-3">
                  <div
                    v-for="activity in copy.activities"
                    :key="activity"
                    class="rounded-[1.2rem] border border-white/10 bg-[rgba(255,255,255,0.06)] px-4 py-3 text-sm leading-6 text-[rgba(255,255,255,0.72)]"
                  >
                    {{ activity }}
                  </div>
                </div>
              </div>

              <div class="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(216,110,59,0.18),rgba(255,255,255,0.04))] p-5">
                <p class="text-[11px] font-black uppercase tracking-[0.24em] text-[rgba(255,255,255,0.58)]">Onboarding</p>
                <div class="mt-4 space-y-3">
                  <div class="rounded-[1.2rem] bg-[rgba(255,255,255,0.08)] px-4 py-3">
                    <div class="text-sm font-black text-white">Roadmap baseline</div>
                    <div class="mt-1 text-sm leading-6 text-[rgba(255,255,255,0.68)]">3 foundational nodes are already mapped</div>
                  </div>
                  <div class="rounded-[1.2rem] bg-[rgba(255,255,255,0.08)] px-4 py-3">
                    <div class="text-sm font-black text-white">Team roles</div>
                    <div class="mt-1 text-sm leading-6 text-[rgba(255,255,255,0.68)]">Owner and Admin keep governance visible</div>
                  </div>
                  <div class="rounded-[1.2rem] bg-[rgba(255,255,255,0.08)] px-4 py-3">
                    <div class="text-sm font-black text-white">Research memory</div>
                    <div class="mt-1 text-sm leading-6 text-[rgba(255,255,255,0.68)]">Notes stay linked to delivery decisions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="product-shell py-16 md:py-24">
      <div class="grid gap-6 lg:grid-cols-3">
        <article
          v-for="item in copy.problems"
          :key="item.title"
          class="product-panel rounded-[2rem] p-8"
        >
          <div class="text-[11px] font-black uppercase tracking-[0.26em] text-[var(--brand)]">Pain Point</div>
          <h3 class="mt-5 font-[var(--font-display)] text-3xl font-black tracking-[-0.05em] text-[var(--ink-strong)]">
            {{ item.title }}
          </h3>
          <p class="mt-4 text-base leading-8 text-[var(--ink-soft)]">{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section id="product" class="bg-[var(--surface-dark)] py-20 text-white md:py-24">
      <div class="product-shell">
        <div class="max-w-4xl">
          <div class="product-eyebrow border border-white/10 bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.72)]">
            <span class="h-2.5 w-2.5 rounded-full bg-[var(--brand)]"></span>
            Product Layer
          </div>
          <h2 class="mt-7 font-[var(--font-display)] text-4xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl">
            {{ copy.featureTitle }}
          </h2>
        </div>

        <div class="mt-12 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="feature in copy.features"
            :key="feature.title"
            class="rounded-[1.9rem] border border-white/10 bg-[rgba(255,255,255,0.06)] p-7"
          >
            <div class="text-[11px] font-black uppercase tracking-[0.28em] text-[var(--brand)]">
              {{ feature.eyebrow }}
            </div>
            <h3 class="mt-5 font-[var(--font-display)] text-3xl font-black tracking-[-0.05em]">
              {{ feature.title }}
            </h3>
            <p class="mt-4 text-sm leading-7 text-[rgba(255,255,255,0.68)]">{{ feature.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="workflow" class="product-shell py-20 md:py-24">
      <div class="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div>
          <div class="product-eyebrow border border-[rgba(45,122,120,0.14)] bg-[rgba(255,255,255,0.72)] text-[var(--accent)]">
            <span class="h-2.5 w-2.5 rounded-full bg-[var(--accent)]"></span>
            Team Scenarios
          </div>
          <h2 class="product-section-title mt-7">{{ copy.workflowTitle }}</h2>
        </div>

        <div class="grid gap-5">
          <article
            v-for="item in copy.workflows"
            :key="item.title"
            class="product-panel rounded-[2rem] p-7"
          >
            <h3 class="font-[var(--font-display)] text-3xl font-black tracking-[-0.05em] text-[var(--ink-strong)]">
              {{ item.title }}
            </h3>
            <p class="mt-4 text-base leading-8 text-[var(--ink-soft)]">{{ item.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="pricing" class="product-shell pb-20 md:pb-24">
      <div class="max-w-4xl">
        <div class="product-eyebrow border border-[rgba(216,110,59,0.14)] bg-[rgba(255,255,255,0.72)] text-[var(--brand)]">
          <span class="h-2.5 w-2.5 rounded-full bg-[var(--brand)]"></span>
          Pricing Logic
        </div>
        <h2 class="product-section-title mt-7">{{ copy.pricingTitle }}</h2>
      </div>

      <div class="mt-12 grid gap-5 lg:grid-cols-3">
        <article
          v-for="plan in copy.pricing"
          :key="plan.name"
          :class="
            plan.featured
              ? 'bg-[var(--ink-strong)] text-white shadow-[0_28px_90px_rgba(20,33,43,0.18)]'
              : 'product-panel text-[var(--ink-strong)]'
          "
          class="rounded-[2rem] border p-8"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="font-[var(--font-display)] text-3xl font-black tracking-[-0.05em]">{{ plan.name }}</div>
              <p :class="plan.featured ? 'text-[rgba(255,255,255,0.68)]' : 'text-[var(--ink-soft)]'" class="mt-3 text-sm leading-7">
                {{ plan.description }}
              </p>
            </div>
            <span
              v-if="plan.featured"
              class="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[rgba(255,255,255,0.82)]"
            >
              Recommended
            </span>
          </div>

          <div class="mt-8 font-[var(--font-display)] text-5xl font-black tracking-[-0.07em]">{{ plan.price }}</div>

          <div class="mt-7 space-y-3">
            <div
              v-for="bullet in plan.bullets"
              :key="bullet"
              :class="
                plan.featured
                  ? 'bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.76)]'
                  : 'bg-[rgba(255,255,255,0.64)] text-[var(--ink-main)]'
              "
              class="rounded-[1.2rem] px-4 py-3 text-sm font-semibold leading-6"
            >
              {{ bullet }}
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="px-5 pb-20 md:px-8 md:pb-24">
      <div class="product-shell overflow-hidden rounded-[2.4rem] bg-[var(--ink-strong)] px-8 py-10 text-white shadow-[0_34px_120px_rgba(20,33,43,0.18)] md:px-12 md:py-14">
        <div class="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div class="max-w-4xl">
            <div class="text-[11px] font-black uppercase tracking-[0.28em] text-[rgba(255,255,255,0.56)]">Unified Workflow</div>
            <h2 class="mt-5 font-[var(--font-display)] text-4xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl">
              {{ copy.ctaTitle }}
            </h2>
            <p class="mt-5 text-base leading-8 text-[rgba(255,255,255,0.68)]">{{ copy.ctaSummary }}</p>
          </div>

          <div class="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <router-link :to="primaryHref" class="product-button-primary">
              {{ copy.primary }}
            </router-link>
            <router-link :to="secondaryHref" class="product-button-dark">
              {{ copy.secondary }}
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
