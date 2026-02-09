import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { quizApi } from '../services/api';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import BookLoader from '../components/BookLoader';

export default function TakeQuizByCode() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    const [responses, setResponses] = useState({});
    const [quizId, setQuizId] = useState(null);
    const [quizTitle, setQuizTitle] = useState('Private Quiz');
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [code]);

    const fetchQuestions = async () => {
        const startTime = Date.now();
        try {
            // Use the attendQuiz endpoint as specified by the user
            const response = await quizApi.attendQuiz(code);
            console.log("Full Response Object:", response);
            console.log("Response Data:", response.data);

            const data = response.data;
            if (!data) {
                setError('No data received from server.');
                return;
            }

            const quiz_id = data.id || data.quizId || data.quiz_id;
            const quiz_title = data.title || data.quizTitle || 'Private Quiz';
            const quiz_questions = data.questions || data.questionList || data.questionWrappers || [];

            console.log("Extracted Data:", { quiz_id, quiz_title, count: quiz_questions.length });

            if (!quiz_questions || quiz_questions.length === 0) {
                setError('No questions found for this quiz.');
                return;
            }

            setQuizId(quiz_id);
            setQuizTitle(quiz_title);
            setQuestions(quiz_questions);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setError('The quiz code you entered is invalid.');
            } else {
                setError('Failed to load quiz. Please try again later.');
            }
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);
            setTimeout(() => setLoading(false), remainingTime);
        }
    };

    const [forceSubmit, setForceSubmit] = useState(false);

    const handleOptionSelect = (questionId, option) => {
        setResponses(prev => {
            if (prev[questionId] === option) {
                const newResponses = { ...prev };
                delete newResponses[questionId];
                return newResponses;
            }
            return { ...prev, [questionId]: option };
        });
    };

    const handleSubmit = async () => {
        if (!forceSubmit && Object.keys(responses).length < questions.length) {
            alert('Please answer all questions before submitting.');
            return;
        }

        setSubmitting(true);
        try {
            const responseList = questions.map(q => ({
                id: q.id,
                response: responses[q.id] || "" // Send empty string for unanswered
            }));

            let res;
            if (quizId) {
                // If it's a proper quiz, submit to quiz service
                res = await quizApi.submitQuiz(quizId, responseList);
            } else {
                // Fallback to getting score directly from question service if no quizId
                res = await quizApi.getScore(responseList);
            }
            setResult(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to submit quiz.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loader-container">
                <BookLoader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="container" style={{ paddingTop: '4rem', textAlign: 'center', maxWidth: '600px' }}>
                    <div className="card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <dotlottie-wc src="https://lottie.host/aa73bff9-ecec-478a-a3ad-36ce53e28870/tpzgIANEBR.lottie" style={{ width: '300px', height: '300px' }} autoplay loop></dotlottie-wc>

                        <h2 style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '2rem' }}>Quiz Not Found</h2>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            The code you have entered is incorrect or no quiz is currently active with this ID. Please check the code and try again.
                        </p>
                        <button onClick={() => navigate('/')} className="btn btn-secondary">
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (result !== null) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="container" style={{ paddingTop: '4rem', textAlign: 'center', maxWidth: '600px' }}>
                    <div className="card" style={{ borderColor: 'var(--success)' }}>
                        <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            Quiz Completed!
                        </h2>
                        <div style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
                            Your Score: <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{result}</span> / {questions.length}
                        </div>
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px' }}>
                <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{quizTitle}</h1>
                    <span className="badge badge-primary">{questions.length} Questions</span>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {questions.map((q, index) => (
                        <div key={q.id} className="card">
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>Q{index + 1}.</span>
                                {q.questionTitle}
                            </h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {[q.option1, q.option2, q.option3, q.option4].map((opt, i) => (
                                    <label
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            background: responses[q.id] === opt ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.4)',
                                            border: responses[q.id] === opt ? '1px solid var(--primary)' : '1px solid var(--border)',
                                            borderRadius: 'var(--radius)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${q.id}`}
                                            value={opt}
                                            checked={responses[q.id] === opt}
                                            onChange={() => handleOptionSelect(q.id, opt)}
                                            style={{ marginRight: '1rem', width: '20px', height: '20px' }}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <input
                            type="checkbox"
                            id="forceSubmit"
                            checked={forceSubmit}
                            onChange={(e) => setForceSubmit(e.target.checked)}
                            style={{ width: 'auto', marginRight: '0.5rem' }}
                        />
                        <label htmlFor="forceSubmit" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
                            Allow submitting incomplete quiz
                        </label>
                    </div>
                    <button onClick={handleSubmit} className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 3rem' }} disabled={submitting}>
                        {submitting ? <Loader2 className="animate-spin" /> : 'Submit Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
}
