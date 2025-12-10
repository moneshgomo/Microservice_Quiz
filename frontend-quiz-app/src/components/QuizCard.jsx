import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuizCard({ quiz }) {
    // Safe check for questionIds
    const questionCount = quiz.questionIds ? quiz.questionIds.length : 0;

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#818cf8',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                        ID: {quiz.id}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{questionCount} Questions</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>{quiz.title}</h3>
            </div>
            <Link to={`/quiz/${quiz.id}`} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                Start Quiz <Play size={16} />
            </Link>
        </div>
    );
}
