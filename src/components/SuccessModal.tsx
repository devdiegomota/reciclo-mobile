
import { CheckCircle } from 'lucide-react';

interface SuccessModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onClose: () => void;
    buttonText?: string;
}

export default function SuccessModal({
    isOpen,
    title,
    message,
    onClose,
    buttonText = "Entendi"
}: SuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
        }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2rem',
                background: 'var(--surface-color)',
                position: 'relative',
                textAlign: 'center',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <CheckCircle size={32} color="var(--success-color)" />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        padding: '0.875rem',
                        background: 'var(--success-color)',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
