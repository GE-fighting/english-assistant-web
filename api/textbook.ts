// /api/textbook.ts

import apiClient from './client';
import { ApiResponse } from '@/types/response';
import { Version, Grade, Semester, Unit } from '@/types/textbook';

export const textbookApi = {
  // 现有的方法...

  // 新增的教材元数据相关方法
  getVersions: async () => {
    const response = await apiClient.get<ApiResponse<Version[]>>('/textbook-version/list');
    return response.data;
  },
  
  getGrades: async () => {
    const response = await apiClient.get<ApiResponse<Grade[]>>('/grade/list');
    return response.data;
  },
  
  getSemesters: async () => {
    const response = await apiClient.get<ApiResponse<Semester[]>>('/semester/list');
    return response.data;
  },
  
  getUnits: async (versionId: number, gradeId: number, semesterId: number) => {
    const response = await apiClient.post<ApiResponse<Unit[]>>(`/textbook/units`, {
      version_id: versionId,
      grade_id: gradeId,
      semester_id: semesterId
    });
    return response.data;
  }
};