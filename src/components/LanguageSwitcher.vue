<script setup lang="ts">
import { computed } from 'vue'
import { useLocaleStore, type AppLocale } from '@/store/locale'

const props = withDefaults(
  defineProps<{
    tone?: 'light' | 'dark'
  }>(),
  {
    tone: 'light',
  }
)

const localeStore = useLocaleStore()

const options: Array<{ value: AppLocale; label: string }> = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'EN' },
]

const wrapperClass = computed(() =>
  props.tone === 'dark'
    ? 'border-white/10 bg-white/5 text-white'
    : 'border-slate-200 bg-white/90 text-slate-500 shadow-sm'
)

const activeClass = computed(() =>
  props.tone === 'dark' ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
)
const inactiveClass = computed(() =>
  props.tone === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-slate-900'
)
</script>

<template>
  <div :class="wrapperClass" class="inline-flex items-center gap-1 rounded-full border p-1">
    <button
      v-for="option in options"
      :key="option.value"
      :class="localeStore.locale === option.value ? activeClass : inactiveClass"
      class="rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] transition-all"
      @click="localeStore.setLocale(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
