import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getApiErrorMessage = (error, fallbackMessage = 'Something went wrong. Please try again.') => {
    const backendMessage = error?.response?.data?.message;
    if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
        return backendMessage;
    }
    if (error?.code === 'ERR_NETWORK') {
        return 'Unable to connect to server. Please check your internet or backend service.';
    }
    return fallbackMessage;
};

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
