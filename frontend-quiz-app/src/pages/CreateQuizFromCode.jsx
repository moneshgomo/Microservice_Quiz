import { useState } from 'react';
import Navbar from '../components/Navbar';
import { quizApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CreateQuizFromCode() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        questionCode: ''
    });
    const [error, setError] = useState('');
    const [createdQuizCode, setCreatedQuizCode] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.questionCode.trim()) {
            setError('All fields are required.');
            return;
        }

        // Basic validation for "null" string
        if (formData.questionCode.toLowerCase() === 'null') {
            setError('Invalid code.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await quizApi.createQuizByCode({
                title: formData.title,
                QUIZ_GENERATOR_CODE: formData.questionCode
            });
            // Assuming response.data contains the Quiz Code directly or in a field
            // Adjust based on actual backend response. If it's a string, use response.data.
            setCreatedQuizCode(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to create quiz. Please check the code and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (createdQuizCode) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="container" style={{ paddingTop: '2rem', maxWidth: '600px' }}>
                    <div className="card" style={{ textAlign: 'center', borderColor: 'var(--success)' }}>
                        <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Quiz Created Successfully!</h2>
                        <p style={{ fontSize: '1.2rem' }}>Share this code with your students:</p>
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
                            {createdQuizCode}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => {
                                navigator.clipboard.writeText(createdQuizCode);
                                alert('Quiz Code copied!');
                            }} className="btn btn-primary">
                                Copy Quiz Code
                            </button>
                            <button onClick={() => navigate('/enter-code')} className="btn btn-primary" style={{ background: 'var(--success)', border: 'none' }}>
                                Next: Take Quiz
                            </button>
                            <button onClick={() => navigate('/')} className="btn btn-secondary">
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem', maxWidth: '600px' }}>
                <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="card">
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 'bold' }}>Create Quiz from Code</h2>

                    {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Quiz Title</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Advanced Microservices"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Question Code</label>
                            <input
                                type="text"
                                required
                                placeholder="Enter the code from 'Add Questions'"
                                value={formData.questionCode}
                                onChange={e => setFormData({ ...formData, questionCode: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Create Quiz'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
