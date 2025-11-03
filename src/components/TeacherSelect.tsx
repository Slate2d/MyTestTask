import React from 'react';
import type { ITeacher, IPodgroup } from '../types/types';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { updateTeacher, applyTeacherToAll } from '../store/slices/scheduleSlice';
import { GrDescend } from 'react-icons/gr';
import { CustomSelect } from './CustomSelect';
import type { CustomSelectHandle } from './CustomSelect';

type TeacherSelectProps = {
  cardId: string;
  podgroupIndex: number;
  activityType: keyof Omit<IPodgroup, 'countStudents'>;
  selectedValue: string;
  teachers: ITeacher[];
  isDisabled: boolean;
  showApplyToAll?: boolean;
};

export const TeacherSelect: React.FC<TeacherSelectProps> = ({
  cardId,
  podgroupIndex,
  activityType,
  selectedValue,
  teachers,
  isDisabled,
  showApplyToAll,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectRef = React.useRef<CustomSelectHandle | null>(null);

  const handleChange = (newValue: string) => {
    dispatch(
      updateTeacher({
        cardId,
        podgroupIndex,
        activityType,
        teacherId: newValue,
      })
    );
  };

  const handleApplyAll = () => {
    if (!selectedValue) { selectRef.current?.open(); return; }
dispatch(applyTeacherToAll({ cardId, podgroupIndex, teacherId: selectedValue }));
  };

  return (
    <div className="select-with-actions">
      <CustomSelect
        ref={selectRef}
        value={selectedValue || ''}
        options={[{ value: '', label: 'Вакансия' }, ...teachers.map((t) => ({ value: t.id, label: t.name }))]}
        disabled={isDisabled}
        onChange={handleChange}
      />

      {showApplyToAll && (
        <button
          type="button"
          className="apply-all-btn"
          onClick={handleApplyAll}
          aria-label="Применить ко всем полям"
          title="Применить ко всем полям"
          disabled={isDisabled}
        >
          <GrDescend />
        </button>
      )}
    </div>
  );
};
