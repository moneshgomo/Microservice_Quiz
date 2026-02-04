import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import QuizCard from '../components/QuizCard';
import { quizApi } from '../services/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await quizApi.getAllQuizzes();
            setQuizzes(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch quizzes. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="container" style={{ paddingTop: '2rem' }}>
                <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
                        Test Your understanding of Backend Engineering
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
                        Select a quiz below to challenge yourself, or create your own custom quiz.
                    </p>
                </header>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                    </div>
                ) : error ? (
                    <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', borderColor: 'var(--danger)' }}>
                        <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem', margin: '0 auto' }} />
                        <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Error Loading Quizzes</h3>
                        <p style={{ marginBottom: '1rem' }}>{error}</p>
                        <button onClick={fetchQuizzes} className="btn btn-secondary">Try Again</button>
                    </div>
                ) : (
                    <>
                        {quizzes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.7 }}>
                                <h3>No quizzes available.</h3>
                                <p style={{ marginBottom: '2rem' }}>Be the first to create one!</p>
                                <Link to="/create" className="btn btn-primary">Create Quiz</Link>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '2rem'
                            }}>
                                {quizzes.map(quiz => (
                                    <QuizCard key={quiz.id} quiz={quiz} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
