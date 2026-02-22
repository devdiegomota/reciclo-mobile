
import { useState, useEffect, useRef } from 'react';
import { Smartphone, MessageSquare, Truck, DollarSign, X, Recycle } from 'lucide-react';

interface WelcomeModalProps {
    onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
    const [screen, setScreen] = useState(1);
    const isBackRef = useRef(false);

    useEffect(() => {
        // Push state without changing URL
        window.history.pushState({ modal: 'WelcomeModal' }, '', window.location.href);

        const handlePopState = () => {
            isBackRef.current = true;
            onClose();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            // Only go back if we are closing programmatically (not via back button)
            // and if the current state is still our modal state
            if (!isBackRef.current && window.history.state?.modal === 'WelcomeModal') {
                window.history.back();
            }
        };
    }, []);

    const steps = [
        {
            icon: <Smartphone size={24} color="var(--primary-color)" />,
            title: "Anuncie seu aparelho",
            description: "Cadastre seu celular quebrado informando o defeito e enviando fotos reais."
        },
        {
            icon: <MessageSquare size={24} color="var(--primary-color)" />,
            title: "Receba uma proposta",
            description: "Nossa equipe analisará os dados e enviará uma oferta de valor e um prazo de pagamento."
        },
        {
            icon: <Truck size={24} color="var(--primary-color)" />,
            title: "Agendamento e Coleta",
            description: "Se aceitar, chamaremos você no WhatsApp para agendar o melhor horário para o motoboy buscar o aparelho."
        },
        {
            icon: <DollarSign size={24} color="var(--primary-color)" />,
            title: "Pagamento Garantido",
            description: "Você recebe o valor combinado diretamente pelo motoboy no ato da coleta do aparelho."
        }
    ];

    const handleButtonClick = () => {
        if (screen === 1) {
            setScreen(2);
        } else {
            onClose();
        }
    };

    return (
        <div className="welcome-modal-overlay" style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--layout-padding-x)'
        }}>
            <div className="glass-panel welcome-modal-content" style={{
                width: '100%',
                maxWidth: '500px',
                padding: 'var(--card-padding)',
                position: 'relative',
                background: 'var(--surface-color)'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute',
                    right: '1.5rem',
                    top: '1.5rem',
                    color: 'var(--text-secondary)'
                }}>
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {screen === 1 ? 'Como funciona?' : 'Aviso Importante'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {screen === 1
                            ? 'Transforme seu aparelho quebrado em dinheiro de forma simples e rápida.'
                            : 'Sobre os valores das propostas'}
                    </p>
                </div>

                <div style={{ minHeight: '300px' }}>
                    {screen === 1 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                            {steps.map((step, index) => (
                                <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        background: 'rgba(23, 23, 23, 0.05)',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {step.icon}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                            {step.title}
                                        </h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1.5rem',
                            padding: '1rem 0',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                padding: '1.5rem',
                                borderRadius: '50%',
                                marginBottom: '1rem'
                            }}>
                                <Recycle size={48} color="var(--success-color)" />
                            </div>
                            <p style={{
                                fontSize: '1.125rem',
                                color: 'var(--text-primary)',
                                lineHeight: '1.6',
                                fontWeight: '500'
                            }}>
                                Os valores pagos são abaixo do mercado, pois os aparelhos <span style={{ color: 'var(--danger-color)' }}>não serão mais reutilizáveis</span>.
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Focamos na reciclagem correta e no aproveitamento de componentes específicos.
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleButtonClick}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
                >
                    {screen === 1 ? 'Avançar' : 'Entendi, vamos começar!'}
                </button>
            </div>
        </div>
    );
}
