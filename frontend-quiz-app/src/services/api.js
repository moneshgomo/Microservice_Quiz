import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8888',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const quizApi = {
    getAllQuizzes: () => api.get('/quiz/all'),
    getCategories: () => api.get('/quiz/categories'),
    getQuestions: (id) => api.get(`/quiz/get/${id}`),
    submitQuiz: (id, responses) => api.post(`/quiz/submit/${id}`, responses),
    attendQuiz: (code) => api.post(`/quiz/attend_Quiz?quiz_code=${code}`),

    // Private Quiz / Questions endpoints
    getQuestionsByCode: (code) => api.get(`/question/questions_code?questionCode=${code}`),
    getQuestionsDetails: (questionIds) => api.post('/question/getQuestions', questionIds),
    getScore: (responses) => api.post('/question/getScore', responses), // For code-based quiz
    addQuestions: (questions) => api.post('/question/add', questions),
    createQuizByCode: (quizDto) => api.post('/quiz/create/code', quizDto),
};
