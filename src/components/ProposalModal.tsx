
import { useEffect, useState, useRef } from 'react';
import { X, DollarSign, Calendar, Phone, MessageCircle, AlertTriangle, ChevronLeft, MapPin, Droplets, Zap, Trash2, CheckCircle, Send, Loader2 } from 'lucide-react';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';

interface Device {
    id: string;
    model: string;
    defect: string;
    waterDamage: boolean;
    signsOfLife: boolean;
    photoFrontUrl: string;
    photoBackUrl: string;
    status: string;
    neighborhood: string;
    userId: string;
    userEmail: string;
    createdAt: string;
    quotedValue?: string;
    paymentDeadline?: string;
    counterOffer?: string;
}

interface ProposalModalProps {
    device: Device;
    onClose: () => void;
}

export default function ProposalModal({ device, onClose }: ProposalModalProps) {
    const [proposalAmount, setProposalAmount] = useState(device.quotedValue || '');
    const [paymentDate, setPaymentDate] = useState(device.paymentDeadline || '');
    const [loading, setLoading] = useState(false);
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
    const [showConfirmPaid, setShowConfirmPaid] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [userPhone, setUserPhone] = useState<string>('Carregando...');
    const isBackRef = useRef(false);

    const getStatusText = (status: string) => {
        switch (status) {
            case 'awaiting_proposal': return 'AGUARDANDO PROPOSTA';
            case 'proposal_sent': return 'PROPOSTA ENVIADA';
            case 'proposal_accepted': return 'PROPOSTA ACEITA';
            case 'proposal_rejected': return 'PROPOSTA RECUSADA';
            case 'paid': return 'PAGO / FINALIZADO';
            default: return status.replace('_', ' ').toUpperCase();
        }
    };

    useEffect(() => {
        // Push state without changing URL
        window.history.pushState({ modal: 'ProposalModal' }, '', window.location.href);

        const handlePopState = () => {
            isBackRef.current = true;
            onClose();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            // Only go back if we are closing programmatically (not via back button)
            // and if the current state is still our modal state
            if (!isBackRef.current && window.history.state?.modal === 'ProposalModal') {
                window.history.back();
            }
        };
    }, []);

    useEffect(() => {
        const fetchUserPhone = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", device.userId));
                if (userDoc.exists()) {
                    setUserPhone(userDoc.data().phone || 'Não informado');
                } else {
                    setUserPhone('Usuário não encontrado');
                }
            } catch (error) {
                console.error("Erro ao buscar telefone:", error);
                setUserPhone('Erro ao carregar');
            }
        };
        fetchUserPhone();
    }, [device.userId]);

    const handleSendProposal = async () => {
        if (!proposalAmount || !paymentDate) {
            toast.error('Preencha o valor e o prazo.');
            return;
        }
        setLoading(true);
        try {
            await updateDoc(doc(db, "devices", device.id), {
                quotedValue: proposalAmount,
                paymentDeadline: paymentDate,
                status: 'proposal_sent'
            });
            toast.success('Proposta enviada!');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao enviar proposta');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, "devices", device.id));
            toast.success("Cadastro deletado.");
            onClose();
        } catch (error) {
            toast.error("Erro ao deletar.");
        }
    };

    const handleMarkPaid = async () => {
        setLoading(true);
        try {
            await updateDoc(doc(db, "devices", device.id), {
                status: 'paid'
            });
            toast.success("Marcado como pago!");
            onClose();
        } catch (error) {
            toast.error("Erro ao marcar como pago.");
        } finally {
            setLoading(false);
        }
    };

    if (viewingPhoto) {
        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column'
            }} onClick={() => setViewingPhoto(null)}>
                <button
                    onClick={() => setViewingPhoto(null)}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>
                <img src={viewingPhoto} style={{ maxWidth: '95%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} />
            </div>
        )
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-color)',
            zIndex: 1100,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--glass-border)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
                <button
                    onClick={onClose}
                    className="btn btn-secondary"
                    style={{
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        boxShadow: 'none'
                    }}
                >
                    <ChevronLeft size={24} color="var(--text-primary)" />
                </button>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Detalhes da Proposta</h2>
                <div style={{ width: '40px' }}></div> {/* Spacer for centering */}
            </div>

            <div className="container" style={{ flex: 1, padding: '1.5rem 1rem 6rem 1rem' }}>
                
                {/* Device Info Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2' }}>{device.model}</h3>
                        <span style={{ 
                            fontSize: '0.9rem', 
                            color: 'var(--text-secondary)',
                            fontWeight: '500'
                        }}>
                            {getStatusText(device.status)}
                        </span>
                    </div>

                    <div style={{ 
                        background: 'var(--bg-color)', 
                        padding: '1rem', 
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        marginBottom: '1rem'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Defeito Relatado:</p>
                        <p style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{device.defect}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ 
                            padding: '0.75rem', 
                            borderRadius: '8px', 
                            background: device.waterDamage ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            border: `1px solid ${device.waterDamage ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: device.waterDamage ? 'var(--danger-color)' : 'var(--success-color)'
                        }}>
                            <Droplets size={16} />
                            {device.waterDamage ? 'Contato com água' : 'Sem água'}
                        </div>
                        <div style={{ 
                            padding: '0.75rem', 
                            borderRadius: '8px', 
                            background: device.signsOfLife ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${device.signsOfLife ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: device.signsOfLife ? 'var(--success-color)' : 'var(--danger-color)'
                        }}>
                            <Zap size={16} />
                            {device.signsOfLife ? 'Dá sinal' : 'Não liga'}
                        </div>
                    </div>
                </div>

                {/* Photos */}
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Fotos do Aparelho
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div 
                        onClick={() => setViewingPhoto(device.photoFrontUrl)} 
                        style={{ 
                            aspectRatio: '1/1', 
                            borderRadius: '12px', 
                            overflow: 'hidden', 
                            position: 'relative', 
                            boxShadow: 'var(--shadow-md)',
                            cursor: 'pointer',
                            border: '2px solid white'
                        }}
                    >
                        <img src={device.photoFrontUrl} alt="Frente" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '6px', textAlign: 'center', color: 'white', fontSize: '12px', fontWeight: '600' }}>Frente</div>
                    </div>
                    <div 
                        onClick={() => setViewingPhoto(device.photoBackUrl)} 
                        style={{ 
                            aspectRatio: '1/1', 
                            borderRadius: '12px', 
                            overflow: 'hidden', 
                            position: 'relative', 
                            boxShadow: 'var(--shadow-md)',
                            cursor: 'pointer',
                            border: '2px solid white'
                        }}
                    >
                        <img src={device.photoBackUrl} alt="Trás" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '6px', textAlign: 'center', color: 'white', fontSize: '12px', fontWeight: '600' }}>Trás</div>
                    </div>
                </div>

                {/* Client Info */}
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>Dados do Cliente</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Phone size={18} color="var(--primary-color)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Telefone</p>
                                <p style={{ fontWeight: '600' }}>{userPhone}</p>
                            </div>
                            {userPhone !== 'Carregando...' && userPhone !== 'Não informado' && (
                                <a
                                    href={`https://wa.me/55${userPhone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn"
                                    style={{
                                        background: '#25D366',
                                        color: 'white',
                                        padding: '0.5rem',
                                        borderRadius: '8px',
                                        border: 'none'
                                    }}
                                >
                                    <MessageCircle size={20} />
                                </a>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MapPin size={18} color="var(--primary-color)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bairro</p>
                                <p style={{ fontWeight: '600' }}>{device.neighborhood}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Send size={18} color="var(--primary-color)" />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email</p>
                                <p style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{device.userEmail}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Proposal Section */}
                <div className="glass-panel" style={{ padding: '1.5rem', border: '2px solid var(--primary-color)' }}>
                    {device.counterOffer && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.05)',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            borderLeft: '4px solid var(--danger-color)'
                        }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--danger-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertTriangle size={16} /> Contraproposta do Cliente
                            </h3>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '500', fontStyle: 'italic' }}>"{device.counterOffer}"</p>
                        </div>
                    )}

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--primary-color)' }}>Proposta Comercial</h3>

                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Valor da Oferta (R$)</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)' }} />
                                <input
                                    type="text"
                                    value={proposalAmount}
                                    onChange={(e) => setProposalAmount(e.target.value)}
                                    placeholder="0,00"
                                    style={{ 
                                        width: '100%', 
                                        padding: '1rem 1rem 1rem 3rem',
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: 'var(--text-primary)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'var(--bg-color)'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Previsão de Pagamento</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)' }} />
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '1rem 1rem 1rem 3rem',
                                        fontSize: '1rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'var(--bg-color)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Actions */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'var(--surface-color)',
                padding: '1rem',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '1rem',
                zIndex: 20,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
            }}>
                <button 
                    onClick={() => setShowConfirmDelete(true)} 
                    className="btn" 
                    style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        color: 'var(--danger-color)',
                        border: 'none',
                        padding: '0.75rem',
                        borderRadius: '12px'
                    }}
                >
                    <Trash2 size={24} />
                </button>

                {device.status === 'proposal_accepted' ? (
                    <button 
                        onClick={() => setShowConfirmPaid(true)} 
                        className="btn btn-primary" 
                        style={{ 
                            flex: 1, 
                            background: 'var(--success-color)',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '1rem'
                        }}
                    >
                        <CheckCircle size={20} /> Marcar como Pago
                    </button>
                ) : (
                    <button 
                        onClick={handleSendProposal} 
                        disabled={loading} 
                        className="btn btn-primary"
                        style={{ 
                            flex: 1, 
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : device.status === 'awaiting_proposal' ? 'Enviar Proposta' : 'Atualizar Proposta'}
                    </button>
                )}
            </div>

            <ConfirmModal
                isOpen={showConfirmPaid}
                title="Confirmar Pagamento"
                message="Você confirma que o pagamento já foi realizado e deseja finalizar este processo?"
                confirmText="Confirmar Pagamento"
                onConfirm={handleMarkPaid}
                onCancel={() => setShowConfirmPaid(false)}
            />

            <ConfirmModal
                isOpen={showConfirmDelete}
                title="Deletar Cadastro"
                message="Tem certeza que deseja excluir permanentemente este cadastro? Esta ação não pode ser desfeita."
                confirmText="Sim, Deletar"
                isDanger={true}
                onConfirm={handleDelete}
                onCancel={() => setShowConfirmDelete(false)}
            />
        </div>
    );
}
