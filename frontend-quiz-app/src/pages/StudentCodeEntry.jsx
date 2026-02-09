import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';

export default function StudentCodeEntry() {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!code.trim() || code.toLowerCase() === 'null') {
            setError('Please enter a valid code.');
            return;
        }

        setError('');
        navigate(`/take-quiz/code/${code}`);
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem', maxWidth: '500px' }}>
                <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="card" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
                        Enter Quiz Code
                    </h2>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
                        Enter the unique code provided by your instructor to start the quiz.
                    </p>

                    {error && <div style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            required
                            placeholder="Enter Code (e.g., ab123)"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.2rem',
                                textAlign: 'center',
                                letterSpacing: '2px',
                                marginBottom: '1.5rem',
                                borderRadius: 'var(--radius)',
                                border: '2px solid var(--border)',
                                background: '#0f172a',
                                color: 'white'
                            }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                            <Play size={20} style={{ marginRight: '0.5rem' }} /> Start Quiz
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
