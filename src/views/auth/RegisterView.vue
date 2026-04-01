<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import { useLocaleStore } from '@/store/locale'

const router = useRouter()
const authStore = useAuthStore()
const localeStore = useLocaleStore()

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const errorMessage = ref('')

const copy = computed(() =>
  localeStore.isChinese
    ? {
        badge: 'Launch your workspace',
        title: '创建账号，启动你的第一套团队空间',
        summary: '把 roadmap、研究笔记、协作权限和执行资产放进同一个产品级 workspace。',
        username: '用户名',
        usernamePlaceholder: 'team-operator',
        email: '邮箱',
        emailPlaceholder: 'team@company.com',
        password: '密码',
        passwordPlaceholder: '至少 6 位',
        confirm: '确认密码',
        confirmPlaceholder: '再次输入密码',
        submit: '创建账号',
        submitting: '正在开通 workspace...',
        loginHint: '已经有账号？',
        loginAction: '去登录',
        benefitsTitle: '注册后你会得到什么',
        benefits: [
          {
            label: 'Workspace structure',
            copy: '每个新用户都会从可扩展的 workspace 架构起步，方便后续扩成团队产品。',
          },
          {
            label: 'Role-based collaboration',
            copy: '从第一天开始就支持 owner、admin、member、viewer 多角色协作。',
          },
          {
            label: 'Execution memory',
            copy: '把 roadmap、notes 和 research artifacts 连接起来，而不是散落在多个工具中。',
          },
        ],
        mismatch: '两次输入的密码不一致',
        error: '无法创建账号',
      }
    : {
        badge: 'Launch your workspace',
        title: 'Create an account and launch your first team space',
        summary: 'Set up one shared place for roadmap planning, research notes, permissions, and execution assets.',
        username: 'Username',
        usernamePlaceholder: 'team-operator',
        email: 'Email',
        emailPlaceholder: 'team@company.com',
        password: 'Password',
        passwordPlaceholder: 'At least 6 characters',
        confirm: 'Confirm',
        confirmPlaceholder: 'Repeat password',
        submit: 'Create account',
        submitting: 'Provisioning workspace...',
        loginHint: 'Already have access?',
        loginAction: 'Sign in',
        benefitsTitle: 'What you unlock',
        benefits: [
          {
            label: 'Workspace structure',
            copy: 'Every new user starts with an extensible workspace foundation that can grow into a team product.',
          },
          {
            label: 'Role-based collaboration',
            copy: 'Support owners, admins, members, and viewers from day one.',
          },
          {
            label: 'Execution memory',
            copy: 'Keep roadmap, notes, and research artifacts connected instead of scattering them across tools.',
          },
        ],
        mismatch: 'Passwords do not match',
        error: 'Unable to create account',
      }
)

const handleRegister = async () => {
  errorMessage.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = copy.value.mismatch
    return
  }

  loading.value = true

  try {
    await authApi.register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
    })

    const session = await authApi.login({
      username: form.value.username,
      password: form.value.password,
    })

    authStore.login(session)
    router.push('/admin/dashboard')
  } catch (error: any) {
    errorMessage.value = error.message || copy.value.error
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.16),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef5ff_100%)] px-6 py-10">
    <div class="mx-auto mb-6 flex max-w-6xl justify-end">
      <LanguageSwitcher />
    </div>

    <div class="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <div class="w-full max-w-xl rounded-[2.5rem] border border-white/80 bg-white/92 p-10 shadow-[0_30px_100px_rgba(37,99,235,0.12)] backdrop-blur lg:p-14">
        <header class="mb-10">
          <div class="text-[11px] font-black uppercase tracking-[0.32em] text-blue-600">{{ copy.badge }}</div>
          <h1 class="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-950">{{ copy.title }}</h1>
          <p class="mt-3 text-sm leading-6 text-slate-500">{{ copy.summary }}</p>
        </header>

        <div class="space-y-5">
          <div class="space-y-2">
            <label class="ml-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{{ copy.username }}</label>
            <input v-model="form.username" type="text" class="admin-input" :placeholder="copy.usernamePlaceholder" />
          </div>

          <div class="space-y-2">
            <label class="ml-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{{ copy.email }}</label>
            <input v-model="form.email" type="email" class="admin-input" :placeholder="copy.emailPlaceholder" />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <label class="ml-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{{ copy.password }}</label>
              <input v-model="form.password" type="password" class="admin-input" :placeholder="copy.passwordPlaceholder" />
            </div>
            <div class="space-y-2">
              <label class="ml-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{{ copy.confirm }}</label>
              <input v-model="form.confirmPassword" type="password" class="admin-input" :placeholder="copy.confirmPlaceholder" />
            </div>
          </div>

          <div v-if="errorMessage" class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {{ errorMessage }}
          </div>

          <button
            :disabled="loading"
            class="mt-4 w-full rounded-2xl bg-blue-600 py-4 text-xs font-black uppercase tracking-[0.32em] text-white shadow-[0_20px_50px_rgba(37,99,235,0.25)] transition-all hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleRegister"
          >
            {{ loading ? copy.submitting : copy.submit }}
          </button>

          <p class="text-center text-sm font-semibold text-slate-400">
            {{ copy.loginHint }}
            <span class="cursor-pointer text-blue-600 hover:underline" @click="router.push('/login')">{{ copy.loginAction }}</span>
          </p>
        </div>
      </div>

      <section class="hidden px-6 lg:block">
        <div class="rounded-[2.75rem] border border-white/70 bg-slate-950 p-10 text-white shadow-[0_35px_120px_rgba(15,23,42,0.18)]">
          <div class="text-[11px] font-black uppercase tracking-[0.3em] text-blue-300">{{ copy.benefitsTitle }}</div>
          <div class="mt-10 space-y-5">
            <div v-for="benefit in copy.benefits" :key="benefit.label" class="benefit-card">
              <div class="benefit-label">{{ benefit.label }}</div>
              <p class="benefit-copy">{{ benefit.copy }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

.benefit-card {
  @apply rounded-[1.8rem] border border-white/10 bg-white/5 p-6;
}

.benefit-label {
  @apply text-[11px] font-black uppercase tracking-[0.24em] text-blue-200;
}

.benefit-copy {
  @apply mt-3 text-sm leading-7 text-slate-300;
}

.admin-input {
  display: block;
  width: 100%;
  background-color: #f8fbff;
  border: 2px solid #dbeafe !important;
  border-radius: 1rem;
  padding: 1rem 1.15rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.admin-input:focus {
  background-color: white;
  border-color: #2563eb !important;
  box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.1);
}
</style>
