
import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Calendar, Smartphone, Droplets, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'react-hot-toast';

interface Device {
    id: string;
    model: string;
    defect: string;
    status: string;
    quotedValue?: string;
    paymentDeadline?: string;
    neighborhood: string;
    waterDamage: boolean;
    signsOfLife: boolean;
    createdAt: string;
    counterOffer?: string;
}

interface UserDeviceDetailsProps {
    device: Device;
    onClose: () => void;
}

export default function UserDeviceModal({ device, onClose }: UserDeviceDetailsProps) {
    const [loading, setLoading] = useState(false);
    const [counterOffer, setCounterOffer] = useState('');
    const [showCounterInput, setShowCounterInput] = useState(false);
    const isBackRef = useRef(false);

    useEffect(() => {
        // Push state without changing URL to avoid navigation issues
        window.history.pushState({ modal: 'UserDeviceModal' }, '', window.location.href);

        const handlePopState = () => {
            isBackRef.current = true;
            onClose();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            // Only go back if we are closing programmatically (not via back button)
            // and if the current state is still our modal state
            if (!isBackRef.current && window.history.state?.modal === 'UserDeviceModal') {
                window.history.back();
            }
        };
    }, []);

    const handleAction = async (action: 'proposal_accepted' | 'proposal_rejected') => {
        if (action === 'proposal_rejected' && !counterOffer && !showCounterInput) {
            setShowCounterInput(true);
            return;
        }

        if (action === 'proposal_rejected' && !counterOffer) {
             toast('Por favor, informe uma contraproposta ou motivo da recusa.');
             return;
        }

        setLoading(true);
        try {
            await updateDoc(doc(db, "devices", device.id), {
                status: action,
                counterOffer: counterOffer || null
            });
            toast.success(action === 'proposal_accepted' ? 'Proposta aceita! Aguarde o pagamento.' : 'Proposta recusada/Contraproposta enviada.');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar status.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'awaiting_proposal':
                return { text: 'Em Análise', color: 'var(--warning-color)', bg: 'rgba(245, 158, 11, 0.1)' };
            case 'proposal_sent':
                return { text: 'Proposta Disponível', color: 'var(--primary-color)', bg: 'rgba(23, 23, 23, 0.1)' };
            case 'proposal_accepted':
                return { text: 'Aguardando Pagamento', color: 'var(--success-color)', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'proposal_rejected':
                return { text: 'Proposta Recusada', color: 'var(--danger-color)', bg: 'rgba(239, 68, 68, 0.1)' };
            case 'paid':
                return { text: 'Finalizado', color: 'var(--text-secondary)', bg: 'var(--surface-hover)' };
            default:
                return { text: 'Desconhecido', color: 'var(--text-secondary)', bg: 'var(--surface-hover)' };
        }
    };

    const statusInfo = getStatusInfo(device.status);

    return (
        <div className="user-device-modal-overlay" style={{
            position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
            <div className="glass-panel user-device-modal-content" style={{
                width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
                background: 'var(--surface-color)', position: 'relative', padding: '0'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            {device.model}
                        </h2>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            background: statusInfo.bg,
                            color: statusInfo.color,
                            fontSize: '0.75rem',
                            fontWeight: '600'
                        }}>
                            {statusInfo.text}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {/* Device Details Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ background: 'var(--bg-color)', padding: '0.75rem', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Data Cadastro</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                <Clock size={16} color="var(--primary-color)" />
                                {new Date(device.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div style={{ background: 'var(--bg-color)', padding: '0.75rem', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Molhado?</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                <Droplets size={16} className={device.waterDamage ? "text-blue-500" : "text-gray-400"} />
                                {device.waterDamage ? 'Sim' : 'Não'}
                            </div>
                        </div>
                        <div style={{ background: 'var(--bg-color)', padding: '0.75rem', borderRadius: '8px', gridColumn: 'span 2' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Defeito Relatado</p>
                            <p style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>{device.defect}</p>
                        </div>
                    </div>

                    {/* Proposal Section */}
                    {device.status === 'proposal_sent' && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(23, 23, 23, 0.05) 0%, rgba(82, 82, 82, 0.05) 100%)',
                            border: '1px solid rgba(23, 23, 23, 0.1)',
                            borderRadius: '12px',
                            padding: '1rem',
                            textAlign: 'center'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginBottom: '1rem',
                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                paddingBottom: '0.75rem'
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--primary-color)', margin: 0 }}>
                                    Nossa Proposta
                                </h3>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0' }}>Valor Ofertado</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success-color)', lineHeight: 1 }}>
                                        R$ {device.quotedValue}
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                background: 'var(--surface-color)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.75rem',
                                border: '1px solid var(--glass-border)',
                                textAlign: 'left'
                            }}>
                                <div style={{
                                    background: 'rgba(23, 23, 23, 0.05)',
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Calendar size={18} color="var(--primary-color)" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.1rem' }}>
                                        Previsão de Coleta e Pagamento
                                    </p>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.25rem' }}>
                                        {device.paymentDeadline ? new Date(device.paymentDeadline).toLocaleDateString() : 'A definir'}
                                    </p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                                        Pagamento no ato da coleta (até a data acima).
                                    </p>
                                </div>
                            </div>

                            {!showCounterInput ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => setShowCounterInput(true)}
                                        className="btn"
                                        style={{
                                            background: 'var(--surface-color)',
                                            border: '1px solid var(--glass-border)',
                                            color: 'var(--text-secondary)',
                                            padding: '0.6rem',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Recusar
                                    </button>
                                    <button
                                        onClick={() => handleAction('proposal_accepted')}
                                        disabled={loading}
                                        className="btn btn-primary"
                                        style={{ 
                                            background: 'var(--success-color)', 
                                            border: 'none',
                                            padding: '0.6rem',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <CheckCircle size={16} /> Aceitar
                                    </button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'left', animation: 'fadeIn 0.3s ease' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                        Contraproposta ou Motivo
                                    </label>
                                    <textarea
                                        value={counterOffer}
                                        onChange={(e) => setCounterOffer(e.target.value)}
                                        placeholder="Ex: Aceito por R$ 50,00 a mais..."
                                        style={{ width: '100%', minHeight: '60px', marginBottom: '0.75rem', background: 'var(--surface-color)', padding: '0.5rem', fontSize: '0.9rem' }}
                                        autoFocus
                                    />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => setShowCounterInput(false)}
                                            className="btn"
                                            style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.6rem' }}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => handleAction('proposal_rejected')}
                                            disabled={loading}
                                            className="btn btn-primary"
                                            style={{ padding: '0.6rem' }}
                                        >
                                            Enviar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Other Status States */}
                    {device.status === 'awaiting_proposal' && (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                            <div style={{
                                background: 'var(--bg-color)',
                                width: '64px', height: '64px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                            }}>
                                <Smartphone size={32} color="var(--text-secondary)" />
                            </div>
                            <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Análise em Andamento</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Nossa equipe técnica está avaliando as informações do seu aparelho.
                            </p>
                        </div>
                    )}

                    {device.status === 'proposal_accepted' && (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px' }}>
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                width: '64px', height: '64px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                            }}>
                                <CheckCircle size={32} color="var(--success-color)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success-color)', marginBottom: '0.5rem' }}>
                                Pagamento Programado!
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Valor acordado: <strong>R$ {device.quotedValue}</strong>
                            </p>
                            <div style={{
                                background: 'var(--surface-color)', padding: '1rem', borderRadius: '8px',
                                display: 'inline-flex', alignItems: 'center', gap: '0.75rem'
                            }}>
                                <Calendar size={20} color="var(--primary-color)" />
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Previsão de Coleta e Pagamento</p>
                                    <p style={{ fontWeight: '600' }}>{device.paymentDeadline ? new Date(device.paymentDeadline).toLocaleDateString() : 'A definir'}</p>
                                </div>
                            </div>

                            <p style={{ 
                                fontSize: '0.875rem', 
                                color: 'var(--text-secondary)', 
                                marginTop: '1.5rem', 
                                maxWidth: '300px', 
                                marginInline: 'auto',
                                lineHeight: '1.5'
                            }}>
                                Aguarde o nosso contato para o agendamento da coleta.
                            </p>
                        </div>
                    )}
                     {device.status === 'proposal_rejected' && (
                         <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                             <AlertTriangle size={48} color="var(--danger-color)" style={{ margin: '0 auto 1rem' }} />
                             <p style={{ fontWeight: '500' }}>Proposta Recusada</p>
                             <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                 Aguarde o contato da nossa equipe.
                             </p>
                             {device.counterOffer && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Sua mensagem:</p>
                                    <p style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>"{device.counterOffer}"</p>
                                </div>
                             )}
                         </div>
                     )}

                    {device.status === 'paid' && (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                width: '64px', height: '64px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                            }}>
                                <DollarSign size={32} color="var(--success-color)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                Venda Finalizada!
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                O pagamento foi realizado com sucesso.
                            </p>
                            
                            <div style={{
                                background: 'var(--bg-color)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                display: 'inline-block',
                                border: '1px solid var(--glass-border)',
                                minWidth: '200px'
                            }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Valor Recebido</p>
                                <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success-color)' }}>
                                    R$ {device.quotedValue}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
