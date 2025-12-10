import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { quizApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CreateQuiz() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        categoryName: '',
        numQuestions: 5
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await quizApi.getCategories();
            setCategories(res.data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError('Failed to load categories. Using manual input.');
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // categoryName, numQuestions, title
            const res = await quizApi.createQuiz({
                categoryName: formData.categoryName,
                numQuestions: parseInt(formData.numQuestions),
                title: formData.title
            });
            // Backend returns string "Success"
            if (res.status === 201 || res.data === "Success") {
                navigate('/');
            } else {
                // If simply string returned
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to create quiz. Ensure the category exists and service is up.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container" style={{ paddingTop: '2rem', maxWidth: '600px' }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="card">
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 'bold' }}>Create New Quiz</h2>

                    {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Quiz Title</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Java Basics"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Category</label>
                            {loadingCategories ? (
                                <div style={{ padding: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Loader2 size={16} className="animate-spin" /> Loading categories...
                                </div>
                            ) : categories.length > 0 ? (
                                <select
                                    required
                                    value={formData.categoryName}
                                    onChange={e => setFormData({ ...formData, categoryName: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        background: '#0f172a',
                                        border: '1px solid var(--border)',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat, idx) => (
                                        <option key={idx} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Java, Python"
                                        value={formData.categoryName}
                                        onChange={e => setFormData({ ...formData, categoryName: e.target.value })}
                                    />
                                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                                        Could not load categories. Please enter manually.
                                    </small>
                                </>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Number of Questions</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                required
                                value={formData.numQuestions}
                                onChange={e => setFormData({ ...formData, numQuestions: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                            {loading ? <><Loader2 className="animate-spin" /> Creating...</> : 'Create Quiz'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
