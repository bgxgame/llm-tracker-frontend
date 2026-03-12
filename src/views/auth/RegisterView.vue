<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// 表单数据
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

// 注册逻辑
const handleRegister = async () => {
  // 1. 基础校验
  if (form.value.password !== form.value.confirmPassword) {
    alert("Two passwords do not match")
    return
  }

  loading.value = true
  try {
    const res = await axios.post('/api/auth/register', {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password
    })

    if (res.data.success) {
      alert("Registration successful! Please login.")
      router.push('/login')
    }
  } catch (err: any) {
    // 使用我们后端返回的优雅错误信息
    const errorMsg = err.response?.data?.error || "Registration failed"
    alert(errorMsg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-6">
    <div class="max-w-lg w-full bg-white rounded-[3.5rem] p-16 shadow-[0_30px_100px_rgba(0,0,0,0.04)] border border-slate-100 animate-in zoom-in-95 duration-700">
      <header class="text-center mb-12">
        <div class="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest mb-4 border border-blue-100">
          Neural Network Access
        </div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tighter uppercase">Initialize Account</h1>
        <p class="text-[10px] font-bold text-slate-400 mt-2 tracking-[0.2em] uppercase">Join the LLM research trajectory</p>
      </header>

      <div class="space-y-6">
        <!-- Username -->
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Username</label>
          <input v-model="form.username" type="text" class="admin-input" placeholder="e.g. neuro_pioneer" />
        </div>

        <!-- Email -->
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <input v-model="form.email" type="email" class="admin-input" placeholder="name@research.com" />
        </div>

        <!-- Passwords -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <input v-model="form.password" type="password" class="admin-input" placeholder="••••••••" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
            <input v-model="form.confirmPassword" type="password" class="admin-input" placeholder="••••••••" />
          </div>
        </div>

        <button 
          @click="handleRegister" 
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-900 transition-all mt-8 shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
        >
          {{ loading ? 'Synchronizing...' : 'Create Researcher Profile' }}
        </button>
        
        <div class="text-center mt-10">
          <p class="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
            Already registered? 
            <span class="text-blue-600 cursor-pointer hover:underline ml-2" @click="router.push('/login')">SignIn</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@reference "@/style.css";

/* 💡 维持统一的高级感边框样式 */
.admin-input {
  display: block;
  width: 100%;
  background-color: #f8fafc;
  border: 2px solid #e2e8f0 !important; 
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.admin-input:hover {
  border-color: #cbd5e1 !important;
}

.admin-input:focus {
  background-color: #ffffff;
  border-color: #2563eb !important;
  box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.08);
}
</style>