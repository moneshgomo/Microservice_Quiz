import { useState } from 'react';
import Navbar from '../components/Navbar';
import { quizApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, ArrowLeft, Send } from 'lucide-react';

export default function AddQuestions() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [successCode, setSuccessCode] = useState('');
    const [questions, setQuestions] = useState([]);

    // Current question form state
    const [currentQuestion, setCurrentQuestion] = useState({
        questionTitle: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        rightAnswer: '',
        difficultyLevel: 'Easy',
        category: ''
    });

    const handleAddQuestion = (e) => {
        e.preventDefault();
        setQuestions([...questions, currentQuestion]);
        // Reset form but keep category
        setCurrentQuestion({
            ...currentQuestion,
            questionTitle: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            rightAnswer: '',
        });
    };

    const handleSubmitAll = async () => {
        if (questions.length === 0) return;
        setLoading(true);
        try {
            const res = await quizApi.addQuestions(questions);
            // The backend returns the code directly as a string or in response object
            // Adjust based on actual backend return format. Assuming plain string or object with code.
            // Based on Controller: List<Question> input, Returns ResponseEntity<String> (which is the code)

            // NOTE: The controller example showed `addQuestion(@RequestBody List<Question> question)` returns `ResponseEntity<String>`.
            // The string returned is the One-Time Code.
            setSuccessCode(res.data);
            setQuestions([]);
        } catch (err) {
            console.error(err);
            alert('Failed to submit questions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
                <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> Back to Home
                </button>

                {successCode ? (
                    <div className="card" style={{ textAlign: 'center', borderColor: 'var(--success)' }}>
                        <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Questions Submitted Successfully!</h2>
                        <p style={{ fontSize: '1.2rem' }}>Your One-Time Code is:</p>
                        <div style={{
                            background: '#f8fafc',
                            color: '#0f172a',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius)',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            margin: '1.5rem 0',
                            letterSpacing: '2px'
                        }}>
                            {successCode}
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Copy this code. You will need it to create a Private Quiz.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => {
                                navigator.clipboard.writeText(successCode);
                                alert('Code copied!');
                            }} className="btn btn-primary">
                                Copy Code
                            </button>
                            <button onClick={() => navigate('/create-quiz-code')} className="btn btn-primary" style={{ background: 'var(--success)', border: 'none' }}>
                                Next: Create Quiz
                            </button>
                            <button onClick={() => setSuccessCode('')} className="btn btn-secondary">
                                Add More
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="card mb-4" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Add Questions</h2>
                            <form onSubmit={handleAddQuestion} style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label>Question Title</label>
                                    <input
                                        type="text" required value={currentQuestion.questionTitle}
                                        onChange={e => setCurrentQuestion({ ...currentQuestion, questionTitle: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {[1, 2, 3, 4].map(num => (
                                        <div key={num}>
                                            <label>Option {num}</label>
                                            <input
                                                type="text" required value={currentQuestion[`option${num}`]}
                                                onChange={e => setCurrentQuestion({ ...currentQuestion, [`option${num}`]: e.target.value })}
                                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label>Right Answer</label>
                                        <select
                                            value={currentQuestion.rightAnswer}
                                            required
                                            onChange={e => setCurrentQuestion({ ...currentQuestion, rightAnswer: e.target.value })}
                                            style={{ width: '100%', padding: '0.625rem', marginTop: '0.25rem' }}
                                        >
                                            <option value="">Select Correct Option</option>
                                            <option value={currentQuestion.option1}>Option 1</option>
                                            <option value={currentQuestion.option2}>Option 2</option>
                                            <option value={currentQuestion.option3}>Option 3</option>
                                            <option value={currentQuestion.option4}>Option 4</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Difficulty</label>
                                        <select
                                            value={currentQuestion.difficultyLevel}
                                            onChange={e => setCurrentQuestion({ ...currentQuestion, difficultyLevel: e.target.value })}
                                            style={{ width: '100%', padding: '0.625rem', marginTop: '0.25rem' }}
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Category</label>
                                        <input
                                            type="text" required value={currentQuestion.category}
                                            onChange={e => setCurrentQuestion({ ...currentQuestion, category: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                                    <Plus size={16} /> Add to List
                                </button>
                            </form>
                        </div>

                        {questions.length > 0 && (
                            <div className="card">
                                <h3 style={{ marginBottom: '1rem' }}>Questions to Submit ({questions.length})</h3>
                                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                                    {questions.map((q, idx) => (
                                        <li key={idx} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                                            <strong>{idx + 1}. {q.questionTitle}</strong>
                                            <br />
                                            <small style={{ color: 'var(--text-muted)' }}>{q.category} • {q.difficultyLevel}</small>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={handleSubmitAll} className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                                    {loading ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Submit All Questions</>}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
