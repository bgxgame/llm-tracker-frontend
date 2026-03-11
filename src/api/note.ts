import request from './request';
import type { Note } from '@/types';

export const noteApi = {
  // 获取节点下的笔记
  getNotesByNode: (nodeId: number) => request.get<any, Note[]>(`/roadmap/${nodeId}/notes`),
  
  // 获取笔记详情
  getDetail: (id: number) => request.get<any, { note: Note, artifacts: any[] }>(`/notes/${id}`),
  
  // 创建笔记
  createNote: (data: Partial<Note>) => request.post<any, Note>('/notes', data),
};