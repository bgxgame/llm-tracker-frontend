<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/auth'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useAuthStore } from '@/store/auth'
import { useLocaleStore } from '@/store/locale'

const router = useRouter()
const authStore = useAuthStore()
const localeStore = useLocaleStore()

const form = ref({
  username: '',
  password: '',
})

const loading = ref(false)
const errorMessage = ref('')

const copy = computed(() =>
  localeStore.isChinese
    ? {
        badge: 'Workspace Access',
        title: '进入你的 Workspace Ops Console',
        summary: '继续管理团队 roadmap、研究笔记、近期活动和协作权限，不再让关键上下文散落在别处。',
        username: '用户名',
        usernamePlaceholder: 'team-operator',
        password: '密码',
        passwordPlaceholder: '输入你的密码',
        submit: '进入 Workspace',
        submitting: '正在进入...',
        sideTitle: '登录后你会回到什么体验',
        sideCards: [
          {
            title: 'Dashboard first',
            body: '登录后默认进入 command center，先看团队指标、onboarding 和 recent activity。',
          },
          {
            title: 'Role-aware access',
            body: '不同角色看到不同能力边界，Viewer 也不会再被误导到写操作入口。',
          },
          {
            title: 'Commercial workflow',
            body: '从一个清晰的 admin shell 继续推进知识运营，而不是回到零散工具堆。',
          },
        ],
        helperTitle: '为什么团队会频繁打开它',
        helperBody: '因为这里不是单纯“记笔记”的地方，而是运营 workspace、跟踪交付和沉淀方法论的主入口。',
        registerLead: '还没有账号？',
        registerAction: '创建团队空间',
        error: '登录失败，请稍后重试',
      }
    : {
        badge: 'Workspace Access',
        title: 'Enter your Workspace Ops Console',
        summary: 'Return to roadmap execution, research notes, recent activity, and permission-aware collaboration from one place.',
        username: 'Username',
        usernamePlaceholder: 'team-operator',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        submit: 'Enter workspace',
        submitting: 'Signing in...',
        sideTitle: 'What waits after sign-in',
        sideCards: [
          {
            title: 'Dashboard first',
            body: 'Land in the command center by default and immediately see team metrics, onboarding, and recent activity.',
          },
          {
            title: 'Role-aware access',
            body: 'Every role sees the right operating surface, and viewers are not nudged toward write actions.',
          },
          {
            title: 'Commercial workflow',
            body: 'Keep operating from one admin shell instead of returning to a fragmented tool stack.',
          },
        ],
        helperTitle: 'Why teams return here often',
        helperBody: 'This is not just where notes live. It is the main surface for operating a workspace, tracking delivery, and compounding methods.',
        registerLead: 'Need an account?',
        registerAction: 'Create team space',
        error: 'Unable to sign in right now',
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
  <div class="page-shell px-5 py-6 md:px-8 md:py-8">
    <div class="product-shell mb-6 flex justify-end">
      <LanguageSwitcher />
    </div>

    <div class="product-shell grid min-h-[calc(100vh-7.5rem)] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section class="order-2 lg:order-1">
        <div class="rounded-[2.4rem] bg-[var(--surface-dark)] p-8 text-white shadow-[0_36px_120px_rgba(20,33,43,0.18)] md:p-10">
          <div class="product-eyebrow border border-white/10 bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.76)]">
            <span class="h-2.5 w-2.5 rounded-full bg-[var(--brand)]"></span>
            {{ copy.sideTitle }}
          </div>

          <div class="mt-8 space-y-4">
            <article
              v-for="card in copy.sideCards"
              :key="card.title"
              class="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.06)] p-5"
            >
              <h2 class="font-[var(--font-display)] text-2xl font-black tracking-[-0.05em]">{{ card.title }}</h2>
              <p class="mt-3 text-sm leading-7 text-[rgba(255,255,255,0.68)]">{{ card.body }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="order-1 lg:order-2">
        <div class="product-panel rounded-[2.4rem] p-8 md:p-10">
          <div class="product-eyebrow border border-[rgba(216,110,59,0.14)] bg-white/80 text-[var(--brand)]">
            <span class="h-2.5 w-2.5 rounded-full bg-[var(--brand)]"></span>
            {{ copy.badge }}
          </div>

          <h1 class="product-title mt-8 text-4xl leading-[0.96] md:text-5xl">{{ copy.title }}</h1>
          <p class="mt-4 max-w-xl text-base leading-8 text-[var(--ink-soft)]">{{ copy.summary }}</p>

          <form class="mt-10 space-y-5" @submit.prevent="handleLogin">
            <div class="space-y-2">
              <label class="product-label">{{ copy.username }}</label>
              <input v-model="form.username" class="product-input" type="text" :placeholder="copy.usernamePlaceholder" />
            </div>

            <div class="space-y-2">
              <label class="product-label">{{ copy.password }}</label>
              <input
                v-model="form.password"
                class="product-input"
                type="password"
                :placeholder="copy.passwordPlaceholder"
              />
            </div>

            <div v-if="errorMessage" class="product-error px-4 py-3 text-sm font-semibold">
              {{ errorMessage }}
            </div>

            <button class="product-button-primary mt-2 w-full" :disabled="loading" type="submit">
              {{ loading ? copy.submitting : copy.submit }}
            </button>
          </form>

          <div class="product-muted-card mt-6 px-5 py-4">
            <div class="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--accent)]">
              {{ copy.helperTitle }}
            </div>
            <p class="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{{ copy.helperBody }}</p>
          </div>

          <p class="mt-6 text-sm font-semibold text-[var(--ink-soft)]">
            {{ copy.registerLead }}
            <button class="text-[var(--brand)] transition-colors hover:text-[var(--brand-deep)]" type="button" @click="router.push('/register')">
              {{ copy.registerAction }}
            </button>
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
