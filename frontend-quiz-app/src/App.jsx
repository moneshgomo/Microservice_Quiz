import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateQuiz from './pages/CreateQuiz';
import Quiz from './pages/Quiz';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<CreateQuiz />} />
      <Route path="/quiz/:id" element={<Quiz />} />
    </Routes>
  );
}
