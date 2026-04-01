<script setup lang="ts">
import { computed } from 'vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
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
          features: '核心能力',
          audience: '适用团队',
          pricing: '收费方式',
        },
        heroBadge: 'Knowledge Ops for AI Teams',
        heroTitle: '把 Roadmap、Research Notes、交付资产和团队协作，沉淀进同一个 workspace。',
        heroSummary:
          '这不是另一个文档工具，而是一套帮助 AI 团队管理知识、推进执行、沉淀方法论的商业化工作系统。',
        primary: authStore.isLoggedIn ? '进入 Dashboard' : '开始试用',
        secondary: authStore.isLoggedIn ? '打开 Ops Console' : '登录查看',
        stats: [
          { value: 'Workspace', label: '把团队协作边界和知识边界放到一起' },
          { value: 'Roadmap', label: '让能力建设和项目推进路径可视化' },
          { value: 'Artifacts', label: '把 Repo、Demo、论文与结论连接起来' },
        ],
        problemsTitle: '为什么通用文档工具不够',
        problems: [
          {
            title: '上下文散在太多工具里',
            description: '知识留在文档，过程留在聊天，结果留在仓库，团队最终看不到完整链路。',
          },
          {
            title: 'Research 推进缺少运营视角',
            description: '团队知道自己很忙，但看不清哪些节点在推进、哪些成果可复用。',
          },
          {
            title: '新成员很难继承经验',
            description: 'Onboarding、方法论和项目复盘无法自然沉淀成组织资产。',
          },
        ],
        featureTitle: '像 SaaS 一样经营团队知识，而不是像文件夹一样堆内容',
        features: [
          {
            eyebrow: 'Workspace',
            title: '按团队与项目建立协作边界',
            description: '一个 workspace 对应一套清晰的权限、知识和执行上下文。',
          },
          {
            eyebrow: 'Dashboard',
            title: '用运营视图看整体健康度',
            description: '在同一页里看到成员、Roadmap、Notes 和近期动态。',
          },
          {
            eyebrow: 'Notes',
            title: '让研究笔记回到正确上下文',
            description: '每条 note 都能挂在清晰的 Roadmap 节点和交付链路下。',
          },
          {
            eyebrow: 'Permissions',
            title: '从第一天开始支持多角色',
            description: 'Owner、Admin、Member、Viewer 四层协作权限适合商业产品化演进。',
          },
        ],
        audienceTitle: '适合这些正在沉淀 AI 能力的团队',
        audiences: [
          { title: 'AI 创业团队', description: '把知识、方法和执行资产沉淀成可复用的运营系统。' },
          { title: '训练营与教学团队', description: '组织课程路径、学员输出和复盘内容。' },
          { title: '研究实验室与技术组', description: '围绕实验、论文和项目建立长期知识资产。' },
        ],
        pricingTitle: '从小团队开始，逐步升级为组织级产品',
        pricing: [
          {
            name: 'Starter',
            price: '免费',
            description: '适合个人与验证期小团队',
            bullets: ['1 个 workspace', '基础 roadmap 与 notes', '验证知识运营流程'],
          },
          {
            name: 'Team',
            price: '¥49 / 人 / 月',
            description: '适合 5-30 人 AI 团队',
            bullets: ['多成员协作与权限', 'Workspace 管理', 'Dashboard 与 recent activity'],
            featured: true,
          },
          {
            name: 'Enterprise',
            price: '定制报价',
            description: '适合训练营、实验室和跨部门组织',
            bullets: ['更复杂的组织治理', '多团队 knowledge ops', '落地支持与迁移服务'],
          },
        ],
        ctaTitle: '把团队知识、执行进度和交付成果，真正变成可经营的产品能力。',
        ctaSummary:
          '如果你想把它做成像 Notion 一样可卖的产品，workspace、permissions、dashboard 和 knowledge ops 就是最值得持续做深的方向。',
      }
    : {
        nav: {
          features: 'Features',
          audience: 'Audience',
          pricing: 'Pricing',
        },
        heroBadge: 'Knowledge Ops for AI Teams',
        heroTitle: 'Bring roadmap, research notes, delivery assets, and team collaboration into one workspace.',
        heroSummary:
          'This is not another document tool. It is an operating system for AI teams to manage knowledge, execution, and reusable methods like a commercial SaaS.',
        primary: authStore.isLoggedIn ? 'Open dashboard' : 'Start free',
        secondary: authStore.isLoggedIn ? 'Open Ops Console' : 'Sign in',
        stats: [
          { value: 'Workspace', label: 'Keep collaboration boundaries and knowledge boundaries together' },
          { value: 'Roadmap', label: 'Make capability building and delivery paths visible' },
          { value: 'Artifacts', label: 'Connect repos, demos, papers, and conclusions' },
        ],
        problemsTitle: 'Why generic docs are not enough',
        problems: [
          {
            title: 'Context lives across too many tools',
            description: 'Knowledge stays in docs, process stays in chat, results stay in repos, and the full chain disappears.',
          },
          {
            title: 'Research lacks an operating view',
            description: 'Teams stay busy but still cannot see what is moving, what is blocked, and what is reusable.',
          },
          {
            title: 'New members cannot inherit experience quickly',
            description: 'Onboarding, methods, and retrospectives fail to compound into organizational memory.',
          },
        ],
        featureTitle: 'Operate team knowledge like a SaaS product, not like a folder tree',
        features: [
          {
            eyebrow: 'Workspace',
            title: 'Set collaboration boundaries by team or project',
            description: 'Each workspace carries a clear permission, knowledge, and execution context.',
          },
          {
            eyebrow: 'Dashboard',
            title: 'See team health from one operating view',
            description: 'Track members, roadmap, notes, and recent activity from one command center.',
          },
          {
            eyebrow: 'Notes',
            title: 'Put research notes back in context',
            description: 'Every note belongs to a roadmap step and a visible execution path.',
          },
          {
            eyebrow: 'Permissions',
            title: 'Support multi-role collaboration from day one',
            description: 'Owner, Admin, Member, and Viewer roles align with commercial product evolution.',
          },
        ],
        audienceTitle: 'Built for teams compounding AI capability',
        audiences: [
          { title: 'AI startups', description: 'Turn knowledge, process, and delivery assets into a reusable system.' },
          { title: 'Training programs', description: 'Organize learning paths, outputs, and retrospectives.' },
          { title: 'Labs and technical groups', description: 'Build long-term knowledge assets around experiments and projects.' },
        ],
        pricingTitle: 'Start small and grow into an organizational product',
        pricing: [
          {
            name: 'Starter',
            price: 'Free',
            description: 'Best for individuals and early validation',
            bullets: ['1 workspace', 'Core roadmap and notes', 'Validate the workflow'],
          },
          {
            name: 'Team',
            price: '$49 / seat / month',
            description: 'Best for 5-30 person AI teams',
            bullets: ['Multi-member collaboration', 'Workspace governance', 'Dashboard and recent activity'],
            featured: true,
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            description: 'Best for labs, programs, and cross-functional orgs',
            bullets: ['Advanced governance', 'Multi-team knowledge ops', 'Migration and rollout support'],
          },
        ],
        ctaTitle: 'Turn team knowledge, execution progress, and delivery outputs into product-grade capability.',
        ctaSummary:
          'If you want this product to become as sellable as Notion, workspace, permissions, dashboards, and knowledge ops are the right depth to keep building.',
      }
)
</script>

<template>
  <div class="min-h-screen bg-[var(--page-bg)] text-slate-950">
    <section class="relative isolate overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.2),_transparent_30%),radial-gradient(circle_at_78%_0%,_rgba(59,130,246,0.16),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#f3f7fb_58%,_#ffffff_100%)]"></div>
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent"></div>

      <header class="relative z-10">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-10">
          <router-link to="/" class="flex items-center gap-3 text-slate-900 transition-opacity hover:opacity-80">
            <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]">LT</span>
            <span>
              <span class="block text-sm font-black uppercase tracking-[0.28em]">LLM Tracker</span>
              <span class="block text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400">Knowledge Ops</span>
            </span>
          </router-link>

          <nav class="hidden items-center gap-8 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 lg:flex">
            <a href="#features" class="transition-colors hover:text-slate-900">{{ copy.nav.features }}</a>
            <a href="#audiences" class="transition-colors hover:text-slate-900">{{ copy.nav.audience }}</a>
            <a href="#pricing" class="transition-colors hover:text-slate-900">{{ copy.nav.pricing }}</a>
          </nav>

          <div class="flex items-center gap-3">
            <LanguageSwitcher />
            <router-link
              :to="secondaryHref"
              class="hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 lg:inline-flex"
            >
              {{ copy.secondary }}
            </router-link>
            <router-link
              :to="primaryHref"
              class="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:bg-sky-600"
            >
              {{ copy.primary }}
            </router-link>
          </div>
        </div>
      </header>

      <div class="relative z-10 mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:px-10 lg:pb-28 lg:pt-14">
        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-3 rounded-full border border-sky-200/70 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 shadow-[0_12px_32px_rgba(14,165,233,0.08)] backdrop-blur">
            <span class="h-2 w-2 rounded-full bg-sky-500"></span>
            {{ copy.heroBadge }}
          </div>

          <h1 class="mt-8 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-slate-950 md:text-6xl lg:text-7xl">
            {{ copy.heroTitle }}
          </h1>

          <p class="mt-8 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
            {{ copy.heroSummary }}
          </p>

          <div class="mt-10 flex flex-col gap-4 sm:flex-row">
            <router-link
              :to="primaryHref"
              class="inline-flex items-center justify-center rounded-[1.4rem] bg-slate-950 px-7 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-[0_24px_50px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-1 hover:bg-sky-600"
            >
              {{ copy.primary }}
            </router-link>
            <router-link
              :to="secondaryHref"
              class="inline-flex items-center justify-center rounded-[1.4rem] border border-slate-200 bg-white px-7 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-slate-700 transition-all hover:-translate-y-1 hover:border-slate-300 hover:text-slate-950"
            >
              {{ copy.secondary }}
            </router-link>
          </div>

          <div class="mt-12 grid gap-4 sm:grid-cols-3">
            <div
              v-for="stat in copy.stats"
              :key="stat.value"
              class="rounded-[1.6rem] border border-white/80 bg-white/80 p-5 shadow-[0_18px_40px_rgba(148,163,184,0.12)] backdrop-blur"
            >
              <div class="text-2xl font-black tracking-[-0.06em]">{{ stat.value }}</div>
              <p class="mt-2 text-sm leading-6 text-slate-500">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <div class="relative">
          <div class="absolute -right-12 top-10 h-32 w-32 rounded-full bg-sky-300/20 blur-3xl"></div>
          <div class="absolute left-0 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-blue-300/15 blur-3xl"></div>

          <div class="relative overflow-hidden rounded-[2rem] border border-white/80 bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.26)]">
            <p class="text-[10px] font-black uppercase tracking-[0.28em] text-sky-300">Workspace Snapshot</p>
            <h2 class="mt-3 text-2xl font-black tracking-[-0.05em]">Ops Console</h2>

            <div class="mt-8 grid gap-4">
              <div class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Roadmap</p>
                    <h3 class="mt-2 text-lg font-black">AI Team Launch Sprint</h3>
                  </div>
                  <span class="rounded-full bg-emerald-400/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                    72% Completed
                  </span>
                </div>
                <div class="mt-5 h-2 rounded-full bg-white/10">
                  <div class="h-2 w-[72%] rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"></div>
                </div>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Recent Notes</p>
                  <div class="mt-3 space-y-3 text-sm text-slate-300">
                    <div class="rounded-2xl bg-white/5 px-4 py-3">Prompt evaluation playbook</div>
                    <div class="rounded-2xl bg-white/5 px-4 py-3">RAG quality checklist</div>
                  </div>
                </div>
                <div class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Team roles</p>
                  <div class="mt-3 space-y-3 text-sm text-slate-300">
                    <div class="rounded-2xl bg-white/5 px-4 py-3">1 Owner / 2 Admins</div>
                    <div class="rounded-2xl bg-white/5 px-4 py-3">4 Members / 3 Viewers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <h2 class="max-w-3xl text-4xl font-black tracking-[-0.05em] text-slate-950">{{ copy.problemsTitle }}</h2>
      <div class="mt-10 grid gap-6 lg:grid-cols-3">
        <div
          v-for="item in copy.problems"
          :key="item.title"
          class="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(148,163,184,0.08)]"
        >
          <p class="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Pain Point</p>
          <h3 class="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950">{{ item.title }}</h3>
          <p class="mt-4 text-base leading-8 text-slate-600">{{ item.description }}</p>
        </div>
      </div>
    </section>

    <section id="features" class="bg-slate-950 py-24 text-white">
      <div class="mx-auto max-w-7xl px-6 lg:px-10">
        <h2 class="max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">{{ copy.featureTitle }}</h2>

        <div class="mt-14 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="feature in copy.features"
            :key="feature.title"
            class="rounded-[1.9rem] border border-white/10 bg-white/5 p-7 shadow-[0_20px_55px_rgba(2,6,23,0.18)]"
          >
            <p class="text-[10px] font-black uppercase tracking-[0.26em] text-sky-300">{{ feature.eyebrow }}</p>
            <h3 class="mt-4 text-2xl font-black tracking-[-0.05em]">{{ feature.title }}</h3>
            <p class="mt-4 text-base leading-8 text-slate-300">{{ feature.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="audiences" class="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <h2 class="max-w-3xl text-4xl font-black tracking-[-0.05em] text-slate-950 md:text-5xl">{{ copy.audienceTitle }}</h2>

      <div class="mt-14 grid gap-6 lg:grid-cols-3">
        <article
          v-for="item in copy.audiences"
          :key="item.title"
          class="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(148,163,184,0.08)]"
        >
          <h3 class="text-2xl font-black tracking-[-0.05em] text-slate-950">{{ item.title }}</h3>
          <p class="mt-4 text-base leading-8 text-slate-600">{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section id="pricing" class="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <h2 class="max-w-3xl text-4xl font-black tracking-[-0.05em] text-slate-950 md:text-5xl">{{ copy.pricingTitle }}</h2>

      <div class="mt-14 grid gap-6 lg:grid-cols-3">
        <article
          v-for="plan in copy.pricing"
          :key="plan.name"
          :class="plan.featured ? 'border-slate-950 bg-slate-950 text-white shadow-[0_26px_70px_rgba(15,23,42,0.22)]' : 'border-slate-200 bg-white text-slate-950'"
          class="rounded-[2rem] border p-8"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-2xl font-black tracking-[-0.05em]">{{ plan.name }}</h3>
              <p :class="plan.featured ? 'text-slate-300' : 'text-slate-500'" class="mt-3 text-base leading-7">{{ plan.description }}</p>
            </div>
            <span
              v-if="plan.featured"
              class="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-300"
            >
              Recommended
            </span>
          </div>
          <div class="mt-8 text-4xl font-black tracking-[-0.05em]">{{ plan.price }}</div>
          <ul class="mt-8 space-y-3 text-sm leading-7">
            <li
              v-for="bullet in plan.bullets"
              :key="bullet"
              :class="plan.featured ? 'bg-white/10 text-slate-200' : 'bg-slate-50 text-slate-600'"
              class="rounded-2xl px-4 py-3"
            >
              {{ bullet }}
            </li>
          </ul>
        </article>
      </div>
    </section>

    <section class="px-6 pb-24 lg:px-10">
      <div class="mx-auto max-w-7xl overflow-hidden rounded-[2.4rem] bg-slate-950 px-8 py-12 text-white shadow-[0_28px_90px_rgba(15,23,42,0.24)] md:px-12 md:py-14">
        <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div class="max-w-3xl">
            <p class="text-[10px] font-black uppercase tracking-[0.28em] text-sky-300">Final CTA</p>
            <h2 class="mt-5 text-4xl font-black tracking-[-0.05em] md:text-5xl">{{ copy.ctaTitle }}</h2>
            <p class="mt-5 text-lg leading-8 text-slate-300">{{ copy.ctaSummary }}</p>
          </div>
          <div class="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <router-link
              :to="primaryHref"
              class="inline-flex items-center justify-center rounded-[1.3rem] bg-sky-500 px-7 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-white transition-all hover:-translate-y-1 hover:bg-sky-400"
            >
              {{ copy.primary }}
            </router-link>
            <router-link
              :to="secondaryHref"
              class="inline-flex items-center justify-center rounded-[1.3rem] border border-white/15 bg-white/10 px-7 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-white transition-all hover:-translate-y-1 hover:bg-white/15"
            >
              {{ copy.secondary }}
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
:global(:root) {
  --page-bg: #ffffff;
}
</style>
