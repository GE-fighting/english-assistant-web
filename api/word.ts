import { UnitWord } from '@/types/word';
import { ApiResponse } from '@/types/response';
import apiClient from './client';

export const wordApi = {
  // 获取单词列表
  getWords: async (unitId: number) => {
    const response = await apiClient.post<ApiResponse<UnitWord[]>>('/unit/words', { unit_id: unitId });
    return response.data;
  }
};
