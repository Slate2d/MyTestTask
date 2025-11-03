import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ISubjectCard, ITeacher, IPodgroup } from '../../types/types';
import { scheduleApi } from '../api/apiSlice';

interface ScheduleState {
  cards: ISubjectCard[];
  teachers: ITeacher[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ScheduleState = {
  cards: [],
  teachers: [],
  isLoading: true,
  error: null,
};

type TeacherUpdatePayload = {
  cardId: string;
  podgroupIndex: number;
  activityType: keyof Omit<IPodgroup, 'countStudents'>;
  teacherId: string;
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    updateTeacher: (state, action: PayloadAction<TeacherUpdatePayload>) => {
      const { cardId, podgroupIndex, activityType, teacherId } = action.payload;
      const card = state.cards.find((c) => c.uniqueId === cardId);
      if (card && card.podgroups[podgroupIndex]) {
        card.podgroups[podgroupIndex][activityType] = teacherId;
      }
    },

    applyTeacherToAll: (
      state,
      action: PayloadAction<{ cardId: string; podgroupIndex: number; teacherId: string }>
    ) => {
      const { cardId, podgroupIndex, teacherId } = action.payload;
      const card = state.cards.find((c) => c.uniqueId === cardId);
      if (!card) return;
      const pod = card.podgroups[podgroupIndex];
      if (!pod) return;

      const availabilityMap: Record<keyof Omit<IPodgroup, 'countStudents'>, boolean> = {
        lectureTeacher: parseInt(card.lecturesHours || '0') > 0,
        laboratoryTeacher: parseInt(card.laboratoryHours || '0') > 0,
        practiceTeacher: parseInt(card.practicHours || '0') > 0,
        seminarTeacher: parseInt(card.seminarHours || '0') > 0,
        examTeacher: !!card.exam,
        offsetTeacher: !!card.offset,
      };

      (Object.keys(availabilityMap) as Array<keyof typeof availabilityMap>).forEach((key) => {
        if (availabilityMap[key]) {
          pod[key] = teacherId;
        }
      });
    },

    addSubgroup: (state, action: PayloadAction<string>) => {
      const cardId = action.payload;
      const card = state.cards.find((c) => c.uniqueId === cardId);
      if (card && card.countPodgroups === '1') {
        card.countPodgroups = '2';

        const totalStudents = parseInt(card.studentsNumber);
        const count1 = Math.ceil(totalStudents / 2);
        const count2 = totalStudents - count1;

        card.podgroups[0].countStudents = String(count1);
        card.podgroups.push({
          countStudents: String(count2),
          laboratoryTeacher: '',
          lectureTeacher: '',
          practiceTeacher: '',
          seminarTeacher: '',
          examTeacher: '',
          offsetTeacher: '',
        });
      }
    },

    removeSubgroup: (state, action: PayloadAction<string>) => {
      const cardId = action.payload;
      const card = state.cards.find((c) => c.uniqueId === cardId);
      if (card && card.countPodgroups === '2') {
        card.countPodgroups = '1';
        card.podgroups[0].countStudents = card.studentsNumber;
        card.podgroups.splice(1, 1);
      }
    },

    updateAdditionalInfo: (
      state,
      action: PayloadAction<{ cardId: string; value: string }>
    ) => {
      const { cardId, value } = action.payload;
      const card = state.cards.find((c) => c.uniqueId === cardId);
      if (card) {
        card.additionalInfo = value;
      }
    },

    updateStudentCount: (
      state,
      action: PayloadAction<{ cardId: string; podgroupIndex: number; value: string }>
    ) => {
      const { cardId, podgroupIndex, value } = action.payload;
      const card = state.cards.find((c) => c.uniqueId === cardId);
      if (card && card.podgroups[podgroupIndex]) {
        card.podgroups[podgroupIndex].countStudents = value;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addMatcher(
        scheduleApi.endpoints.getScheduleData.matchPending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        scheduleApi.endpoints.getScheduleData.matchFulfilled,
        (state, action) => {
          state.isLoading = false;
          state.cards = action.payload.data;
          state.teachers = action.payload.teachers;
        }
      )
      .addMatcher(
        scheduleApi.endpoints.getScheduleData.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message || 'Failed to fetch data';
        }
      );
  },
});

export const { updateTeacher, addSubgroup, removeSubgroup, applyTeacherToAll, updateAdditionalInfo, updateStudentCount } = scheduleSlice.actions;
export default scheduleSlice.reducer;
