
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isDanger = false
}: ConfirmModalProps) {
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
                textAlign: 'center'
            }}>
                <div style={{
                    background: isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <AlertTriangle size={32} color={isDanger ? 'var(--danger-color)' : 'var(--success-color)'} />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onCancel}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn btn-primary"
                        style={{
                            flex: 1,
                            background: isDanger ? 'var(--danger-color)' : 'var(--success-color)',
                            border: 'none'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
