import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateQuiz from './pages/CreateQuiz';
import Quiz from './pages/Quiz';
import AddQuestions from './pages/AddQuestions';
import CreateQuizFromCode from './pages/CreateQuizFromCode';
import StudentCodeEntry from './pages/StudentCodeEntry';
import TakeQuizByCode from './pages/TakeQuizByCode';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<CreateQuiz />} />
      <Route path="/quiz/:id" element={<Quiz />} />
      <Route path="/add-questions" element={<AddQuestions />} />
      <Route path="/create-quiz-code" element={<CreateQuizFromCode />} />
      <Route path="/enter-code" element={<StudentCodeEntry />} />
      <Route path="/take-quiz/code/:code" element={<TakeQuizByCode />} />
    </Routes>
  );
}
