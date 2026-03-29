import { Link } from 'react-router-dom';
import { Sparkles, Github, Globe } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="glass sticky top-0 z-50 border-b border-[var(--border)]">
            <div className="container" style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <Sparkles style={{ color: 'var(--primary)' }} />
                    <span className="gradient-text">BackendIQ</span>
                </Link>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <a href="https://github.com/moneshgomo" target="_blank" rel="noopener noreferrer" className="nav-icon-btn" title="GitHub">
                        <Github size={40} />
                    </a>
                    <a href="https://moneshgomo.netlify.app" target="_blank" rel="noopener noreferrer" className="nav-icon-btn" title="Portfolio">
                        <Globe size={40} />
                    </a>
                </div>
            </div>
        </nav>
    );
}