import { Smartphone, DollarSign, Recycle, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LandingModalProps {
    onClose: () => void;
}

export default function LandingModal({ onClose }: LandingModalProps) {
    const navigate = useNavigate();

    const handleAction = () => {
        onClose();
        navigate('/register');
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-color)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.3s ease-out',
            overflow: 'hidden'
        }}>
            {/* Super Minimal Header */}
            <nav style={{
                padding: '0.75rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--glass-border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ background: 'var(--primary-color)', width: '24px', height: '24px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Smartphone size={14} color="white" />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>ReCiclo</span>
                </div>
                <button onClick={onClose} style={{ color: 'var(--text-secondary)', padding: '4px', borderRadius: '50%', background: 'var(--surface-color)', border: '1px solid var(--glass-border)' }}>
                    <X size={16} />
                </button>
            </nav>

            {/* Ultra Compact Content */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '1rem',
                maxWidth: '800px',
                margin: '0 auto',
                width: '100%',
                gap: '1.5rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 className="animate-fade-in" style={{
                        fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
                        fontWeight: '900',
                        lineHeight: '1.1',
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                        marginBottom: '0.75rem'
                    }}>
                        Seu celular quebrado <br /> <span style={{ color: 'var(--primary-color)' }}>vale dinheiro vivo</span>.
                    </h1>

                    <p className="animate-fade-in" style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.3', maxWidth: '400px', margin: '0 auto' }}>
                        Transforme o entulho na sua gaveta em saldo agora mesmo em Tubarão.
                    </p>
                </div>

                {/* Vertical features for mobile/compact horizontal for large */}
                <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    width: '100%'
                }}>
                    {[
                        { icon: <DollarSign size={18} />, title: 'Previsão de Valor', color: 'var(--primary-color)', bg: '#EEF2FF' },
                        { icon: <ShieldCheck size={18} />, title: 'Coleta Grátis', color: '#F59E0B', bg: '#FFF7ED' },
                        { icon: <Recycle size={18} />, title: 'Descarte Correto', color: '#10B981', bg: '#ECFDF5' }
                    ].map((f, i) => (
                        <div key={i} className="glass-panel animate-scale-in" style={{
                            padding: '1rem',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            border: 'none',
                            background: '#fff',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ background: f.bg, minWidth: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>{f.title}</h3>
                        </div>
                    ))}
                </div>

                <div className="animate-fade-in" style={{ width: '100%', maxWidth: '320px', margin: '0 auto' }}>
                    <button
                        onClick={handleAction}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: '700', borderRadius: '12px' }}
                    >
                        Trocar meu Aparelho <ArrowRight size={18} style={{ marginLeft: '6px' }} />
                    </button>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '0.75rem' }}>
                        Rápido, seguro e sustentável.
                    </p>
                </div>
            </main>

            <footer style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                &copy; 2024 ReCiclo Mobile &bull; Tubarão, SC
            </footer>
        </div>
    );
}
