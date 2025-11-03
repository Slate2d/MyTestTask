import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { IApiResponse, ISubjectCard } from '../../types/types';

export const scheduleApi = createApi({
  reducerPath: 'scheduleApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://bgaa.by' }),
  endpoints: (builder) => ({

    getScheduleData: builder.query<IApiResponse, void>({
      query: () => '/test',
    }),

    saveScheduleData: builder.mutation<any, ISubjectCard[]>({
      query: (updatedData) => ({
        url: '/test_result',
        method: 'POST',
        body: updatedData,
      }),
    }),
  }),
});

export const { 
  useGetScheduleDataQuery, 
  useSaveScheduleDataMutation 
} = scheduleApi;
