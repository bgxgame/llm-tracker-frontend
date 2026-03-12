import { defineStore } from 'pinia';

// 1. 定义用户信息类型 (与 Rust 后端 User 模型对应)
export interface User {
  id: number;
  username: string;
  email: string;
}

// 2. 定义 Store 状态类型
interface AuthState {
  token: string | null;
  user: User | null;
}

export const useAuthStore = defineStore('auth', {
  // 💡 状态初始化：增加异常保护
  state: (): AuthState => {
    let savedUser = null;
    try {
      const userJson = localStorage.getItem('user');
      savedUser = userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      localStorage.removeItem('user');
    }

    return {
      token: localStorage.getItem('token') || null,
      user: savedUser,
    };
  },

  getters: {
    // 💡 计算属性：判断是否已登录
    isLoggedIn: (state) => !!state.token && !!state.user,
    
    // 获取用户 ID (方便用于关联笔记)
    userId: (state) => state.user?.id || null,
  },

  actions: {
    /**
     * 执行登录成功后的状态存储
     * @param token JWT 令牌
     * @param user 用户信息对象
     */
    login(token: string, user: User) {
      this.token = token;
      this.user = user;

      // 持久化存储
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log(`✅ [Auth] 用户 ${user.username} 状态已同步至 Pinia`);
    },

    /**
     * 注销并清理所有状态
     */
    logout() {
      this.token = null;
      this.user = null;

      // 清理持久化数据
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.log('🚪 [Auth] 用户已退出登录，状态已清理');
    }
  }
});