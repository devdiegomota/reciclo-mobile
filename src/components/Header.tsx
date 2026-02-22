import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';

interface HeaderProps {
    className?: string;
}

export default function Header({ className }: HeaderProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.signOut();
        navigate('/');
    };

    return (
        <header className={className} style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-sm)',
            width: '100%',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                paddingBottom: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="/mobile-icon.svg" alt="ReCiclo" style={{ width: '40px', height: '40px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                        ReCiclo
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        Mobile
                    </span>
                </div>
            </div>
            
            <nav>
                <button 
                    onClick={handleLogout} 
                    className="btn btn-secondary" 
                    style={{ 
                        fontSize: '0.875rem', 
                        padding: '0.5rem 0.75rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem' 
                    }}
                >
                    <LogOut size={16} /> 
                    <span>Sair</span>
                </button>
            </nav>
            </div>
        </header>
    );
}
