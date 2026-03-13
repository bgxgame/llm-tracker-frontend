// src/types/index.ts

// 基础返回结构
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  msg?: string;
}

// 💡 补全并导出 User 接口
export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
}

// 路线图节点
export interface RoadmapNode {
  id: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  node_type: 'theory' | 'coding' | 'project';
  parent_id: number | null;
  sort_order: number;
}

// 笔记
export interface Note {
  id: number;
  node_id: number | null;
  title: string;
  content: string;
  summary: string | null;
  tags: string[] | null;
  is_indexed: boolean;
  created_at: string;
}