import { useGetScheduleDataQuery, useSaveScheduleDataMutation } from './store/api/apiSlice';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import { SubjectCard } from './components/SubjectCard';
import './App.css';

function App() {
  const { isLoading, error } = useGetScheduleDataQuery();
  const { cards, teachers } = useSelector((state: RootState) => state.schedule);
  const [saveSchedule, { isLoading: isSaving }] = useSaveScheduleDataMutation();

  const handleSave = () => {
    saveSchedule(cards)
      .unwrap()
      .then(() => alert('Сохранено!'))
      .catch((err) => alert('Ошибка сохранения: ' + err.message));
  };

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки данных.</div>;

  return (
    <div className="container">
      {cards.map((card) => (
        <SubjectCard key={card.uniqueId} card={card} teachers={teachers} />
      ))}
      <button className="save-button" onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  );
}

export default App;

