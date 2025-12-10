import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../services/api';
import Navbar from '../components/Navbar';
import { Loader2, CheckCircle, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Quiz() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);

    // Map of questionId -> selectedOption (string)
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await quizApi.getQuestions(id);
                setQuestions(res.data);
            } catch (err) {
                console.error(err);
                alert('Failed to load quiz');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [id, navigate]);

    const handleSelect = (questionId, option) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    const handleSubmit = async () => {
        // Convert answers map to List<Response>
        // Response: { id: Integer, response: String }
        const responseList = Object.keys(answers).map(qId => ({
            id: parseInt(qId),
            response: answers[qId]
        }));

        // Validate all answered?
        if (responseList.length < questions.length) {
            if (!window.confirm("You haven't answered all questions. Submit anyway?")) return;
        }

        setLoading(true);
        try {
            const res = await quizApi.submitQuiz(id, responseList);
            setScore(res.data);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            alert('Error submitting quiz');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !submitted && score === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                background: 'rgba(34, 197, 94, 0.2)',
                                padding: '2rem',
                                borderRadius: '50%',
                                color: 'var(--success)'
                            }}>
                                <CheckCircle size={64} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Quiz Completed!</h2>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>You scored</p>
                        <div style={{ fontSize: '4rem', fontWeight: 'bold', margin: '1rem 0' }} className="gradient-text">
                            {score} / {questions.length}
                        </div>
                        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ paddingBottom: '4rem' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Quiz #{id}</h2>
                    <span className="text-gray-400">
                        Answered: {Object.keys(answers).length} / {questions.length}
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {questions.map((q, index) => (
                        <div key={q.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
                                background: answers[q.id] ? 'var(--primary)' : 'var(--border)'
                            }} />

                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', marginLeft: '1rem' }}>
                                <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginRight: '0.5rem' }}>Q{index + 1}.</span>
                                {q.questionTitle}
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {[q.option1, q.option2, q.option3, q.option4].filter(o => o).map((opt, optIndex) => (
                                    <button
                                        key={optIndex}
                                        onClick={() => handleSelect(q.id, opt)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: 'var(--radius)',
                                            background: answers[q.id] === opt ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                            color: answers[q.id] === opt ? 'white' : 'var(--text-main)',
                                            textAlign: 'left',
                                            border: answers[q.id] === opt ? '1px solid var(--primary)' : '1px solid transparent',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {opt}
                                        {answers[q.id] === opt && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={handleSubmit}
                        className="btn btn-primary"
                        style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
                    >
                        Submit Quiz
                    </button>
                </div>
            </div>
        </div>
    );
}
