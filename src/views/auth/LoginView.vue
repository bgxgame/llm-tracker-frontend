<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useAuthStore } from '@/store/auth'
import { useLocaleStore } from '@/store/locale'
import { authApi } from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()
const localeStore = useLocaleStore()
const form = ref({ username: '', password: '' })
const loading = ref(false)
const errorMessage = ref('')

const copy = computed(() =>
  localeStore.isChinese
    ? {
        badge: 'AI Research Workspace',
        heroTitle: '把分散的 LLM 研究、roadmap 和协作，收进同一个商业化 workspace。',
        heroSummary: '不再让知识散落在文档、聊天、代码仓和个人笔记里，而是沉淀成可运营的团队系统。',
        cards: [
          { label: 'Shared context', value: 'Roadmap + notes + assets' },
          { label: 'Workspace roles', value: 'Owner / admin / member / viewer' },
          { label: 'Faster execution', value: '更少混乱，更多交付' },
        ],
        welcome: 'Welcome back',
        title: '登录你的 workspace',
        summary: '继续团队的 research ops、计划推进和知识沉淀。',
        username: '用户名',
        usernamePlaceholder: 'your-team-handle',
        password: '密码',
        passwordPlaceholder: '输入你的密码',
        submit: '进入 Workspace',
        submitting: '登录中...',
        why: '为什么团队会用它',
        whySummary: '用一个 workspace 替代碎片化文档、私有笔记和断开的 AI 实验流程。',
        signup: '第一次使用？',
        signupAction: '创建账号',
        error: '无法登录',
      }
    : {
        badge: 'AI Research Workspace',
        heroTitle: 'Turn scattered LLM research, roadmap, and collaboration into one commercial workspace.',
        heroSummary: 'Stop losing context across docs, chat, repos, and personal notes. Operate from one shared system.',
        cards: [
          { label: 'Shared context', value: 'Roadmap + notes + assets' },
          { label: 'Workspace roles', value: 'Owner / admin / member / viewer' },
          { label: 'Faster execution', value: 'Less chaos, more shipping' },
        ],
        welcome: 'Welcome back',
        title: 'Sign in to your workspace',
        summary: 'Continue your team research ops, planning pipeline, and execution workflow.',
        username: 'Username',
        usernamePlaceholder: 'your-team-handle',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        submit: 'Enter workspace',
        submitting: 'Signing in...',
        why: 'Why teams use it',
        whySummary: 'Replace fragmented docs, private notes, and disconnected AI experiments with one operating layer.',
        signup: 'New here?',
        signupAction: 'Create account',
        error: 'Unable to sign in',
      }
)

const redirectTarget = computed(() => {
  const redirect = router.currentRoute.value.query.redirect
  return typeof redirect === 'string' ? redirect : '/admin/dashboard'
})

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const session = await authApi.login(form.value)
    authStore.login(session)
    router.push(redirectTarget.value)
  } catch (error: any) {
    errorMessage.value = error.message || copy.value.error
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] px-6 py-10">
    <div class="mx-auto mb-6 flex max-w-6xl justify-end">
      <LanguageSwitcher />
    </div>

    <div class="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <section class="hidden px-6 lg:block">
        <div class="inline-flex items-center rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-blue-600 shadow-sm">
          {{ copy.badge }}
        </div>
        <h1 class="mt-8 max-w-2xl text-6xl font-black leading-none tracking-[-0.06em] text-slate-950">
          {{ copy.heroTitle }}
        </h1>
        <p class="mt-6 max-w-xl text-lg leading-8 text-slate-600">{{ copy.heroSummary }}</p>
        <div class="mt-10 grid max-w-2xl grid-cols-3 gap-4">
          <div v-for="item in copy.cards" :key="item.label" class="feature-card">
            <div class="feature-label">{{ item.label }}</div>
            <div class="feature-value">{{ item.value }}</div>
          </div>
        </div>
      </section>

      <div class="w-full max-w-xl justify-self-center rounded-[2.5rem] border border-white/80 bg-white/92 p-10 shadow-[0_30px_100px_rgba(37,99,235,0.12)] backdrop-blur lg:p-14">
        <header class="mb-10">
          <div class="text-[11px] font-black uppercase tracking-[0.32em] text-blue-600">{{ copy.welcome }}</div>
          <h2 class="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-950">{{ copy.title }}</h2>
          <p class="mt-3 text-sm leading-6 text-slate-500">{{ copy.summary }}</p>
        </header>

        <div class="space-y-5">
          <div class="space-y-2">
            <label class="ml-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{{ copy.username }}</label>
            <input v-model="form.username" type="text" class="admin-input" :placeholder="copy.usernamePlaceholder" />
          </div>
          <div class="space-y-2">
            <label class="ml-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{{ copy.password }}</label>
            <input
              v-model="form.password"
              type="password"
              class="admin-input"
              :placeholder="copy.passwordPlaceholder"
              @keyup.enter="handleLogin"
            />
          </div>

          <div v-if="errorMessage" class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {{ errorMessage }}
          </div>

          <button
            :disabled="loading"
            class="mt-4 w-full rounded-2xl bg-blue-600 py-4 text-xs font-black uppercase tracking-[0.32em] text-white shadow-[0_20px_50px_rgba(37,99,235,0.25)] transition-all hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleLogin"
          >
            {{ loading ? copy.submitting : copy.submit }}
          </button>

          <div class="rounded-[1.5rem] border border-slate-100 bg-slate-50 px-5 py-4">
            <div class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">{{ copy.why }}</div>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ copy.whySummary }}</p>
          </div>

          <p class="text-center text-sm font-semibold text-slate-400">
            {{ copy.signup }}
            <span class="cursor-pointer text-blue-600 hover:underline" @click="router.push('/register')">{{ copy.signupAction }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

.feature-card {
  @apply rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur;
}

.feature-label {
  @apply text-[11px] font-black uppercase tracking-[0.22em] text-slate-400;
}

.feature-value {
  @apply mt-4 text-2xl font-black tracking-tight text-slate-900;
}

.admin-input {
  display: block;
  width: 100%;
  border: 2px solid #dbeafe !important;
  background-color: #f8fbff;
  border-radius: 1rem;
  padding: 1rem 1.15rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.admin-input:focus {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.1);
  background-color: white;
}
</style>
