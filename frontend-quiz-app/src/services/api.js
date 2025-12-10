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
    createQuiz: (quizData) => api.post('/quiz/create', quizData),
    getQuestions: (id) => api.get(`/quiz/get/${id}`),
    submitQuiz: (id, responses) => api.post(`/quiz/submit/${id}`, responses),
};
