import type React from 'react';
import type { ISubjectCard, ITeacher } from '../types/types';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { TeacherSelect } from './TeacherSelect';
import { addSubgroup, removeSubgroup, updateAdditionalInfo, updateStudentCount } from '../store/slices/scheduleSlice';
import { BsTrash } from 'react-icons/bs';
import { FaBookOpen } from 'react-icons/fa6';

const activityRows = [
  { label: 'Лекции', hoursKey: 'lecturesHours', teacherKey: 'lectureTeacher' as const },
  { label: 'Лабораторные', hoursKey: 'laboratoryHours', teacherKey: 'laboratoryTeacher' as const },
  { label: 'Практика', hoursKey: 'practicHours', teacherKey: 'practiceTeacher' as const },
  { label: 'Семинар', hoursKey: 'seminarHours', teacherKey: 'seminarTeacher' as const },
] as const;

export const SubjectCard: React.FC<{ card: ISubjectCard; teachers: ITeacher[] }> = ({ card, teachers }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleAddSubgroup = () => {
    dispatch(addSubgroup(card.uniqueId));
  };

  const handleRemoveSubgroup = () => {
    dispatch(removeSubgroup(card.uniqueId));
  };

  return (
    <div className="card">
      <div className="card-header"><FaBookOpen />{card.subjectName}</div>

      <div className="card-info card-info--alt">
        <div className="info-cell">
          <span className="label">Группа</span>
          <span className="value">{card.groupName}</span>
        </div>
        <div className="info-cell">
          <span className="label">Курс</span>
          <span className="value">{card.course}</span>
        </div>
        <div className="info-cell">
          <span className="label">Количество студентов</span>
          <span className="value">{card.studentsNumber}</span>
        </div>
        <div className="info-cell">
          <span className="label">Семестр</span>
          <span className="value">{card.semestr}</span>
        </div>
      </div>

      <table className="card-table">
        <thead>
          <tr>
            <th>Вид занятия</th>
            <th>Часы</th>
            {card.countPodgroups === '1' ? (
              <th className="th-with-action">
                <span>Преподаватель</span>
                <button className="th-action-btn" onClick={handleAddSubgroup}>+</button>
              </th>
            ) : (
              <>
                <th>Подгруппа 1</th>
                <th className="th-with-action">
                  <span>Подгруппа 2</span>
                  <button className="th-action-btn" onClick={handleRemoveSubgroup}><BsTrash /></button>
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {activityRows.map((row) => {
            const hours = card[row.hoursKey];
            const isDisabled = parseInt(hours) === 0;

            return (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{hours}</td>
                {card.podgroups.map((podgroup, index) => (
                  <td key={index}>
                    <TeacherSelect
                      cardId={card.uniqueId}
                      podgroupIndex={index}
                      activityType={row.teacherKey}
                      selectedValue={podgroup[row.teacherKey]}
                      teachers={teachers}
                      isDisabled={isDisabled}
                      showApplyToAll={row.teacherKey === 'lectureTeacher'}
                    />
                  </td>
                ))}
              </tr>
            );
          })}

          {card.exam && (
            <DynamicRow type="exam" label="Экзамен" card={card} teachers={teachers} />
          )}
          {card.offset && (
            <DynamicRow type="offset" label="Зачёт" card={card} teachers={teachers} />
          )}

          {card.countPodgroups === '2' && (
            <tr>
              <td>Количество студентов</td>
              <td></td>
              {card.podgroups.map((podgroup, index) => (
                <td key={index}>
                  <input
                    type="number"
                    min={0}
                    value={podgroup.countStudents}
                    onChange={(e) =>
                      dispatch(
                        updateStudentCount({
                          cardId: card.uniqueId,
                          podgroupIndex: index,
                          value: e.target.value,
                        })
                      )
                    }
                  />
                </td>
              ))}
            </tr>
          )}

          <tr>
            <td className='activity-label'>
              <span>Примечание</span>
              <span>(для составления расписания)</span>
            </td>
            
            <td></td>
            <td colSpan={card.countPodgroups === '1' ? 1 : 2}>
              <textarea
                value={card.additionalInfo}
                onChange={(e) =>
                  dispatch(
                    updateAdditionalInfo({ cardId: card.uniqueId, value: e.target.value })
                  )
                }
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

interface DynamicRowProps {
  type: 'exam' | 'offset';
  label: string;
  card: ISubjectCard;
  teachers: ITeacher[];
}

const DynamicRow: React.FC<DynamicRowProps> = ({ type, label, card, teachers }) => {
  const teacherKey = type === 'exam' ? 'examTeacher' : 'offsetTeacher';
  return (
    <tr>
      <td>{label}</td>
      <td>-</td>
      {card.podgroups.map((podgroup, index) => (
        <td key={index}>
          <TeacherSelect
            cardId={card.uniqueId}
            podgroupIndex={index}
            activityType={teacherKey}
            selectedValue={podgroup[teacherKey]}
            teachers={teachers}
            isDisabled={false}
          />
        </td>
      ))}
    </tr>
  );
};

export default SubjectCard;
