// src/api/note.ts
import request from './request';
import type { Note, ApiResponse } from '@/types';

export const noteApi = {
  // 获取指定节点下的笔记
  getNotesByNode: (nodeId: number) => request.get<any, Note[]>(`/roadmap/${nodeId}/notes`),

  // 获取当前用户的所有笔记列表
  getAllNotes: () => request.get<any, Note[]>('/notes'),

  // 获取笔记详情
  getDetail: (id: number) => request.get<any, { note: Note, artifacts: any[] }>(`/notes/${id}`),

  // 创建笔记
  createNote: (data: Partial<Note>) => request.post<any, Note>('/notes', data),

  // 更新笔记
  updateNote: (id: number, data: Partial<Note>) => request.put<any, ApiResponse<any>>(`/notes/${id}`, data),

  // 删除笔记
  deleteNote: (id: number) => request.delete<any, ApiResponse<any>>(`/notes/${id}`),

  // 💡 新增：添加附件成果 (对接后端 POST /api/notes/artifacts)
  addArtifact: (data: { note_id: number, artifact_type: string, title: string, content_url: string }) =>
    request.post<any, any>('/notes/artifacts', data),

  // 💡 新增：删除附件成果 (对接后端 DELETE /api/notes/artifacts/:id)
  deleteArtifact: (id: number) =>
    request.delete<any, ApiResponse<any>>(`/notes/artifacts/${id}`),
};