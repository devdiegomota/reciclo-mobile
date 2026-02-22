
import { useEffect, useState } from 'react';
import { Plus, Loader2, DollarSign, Wallet, ChevronRight } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import UserDeviceModal from '../components/UserDeviceModal';
import Header from '../components/Header';
import WelcomeModal from '../components/WelcomeModal';

interface Device {
    id: string;
    model: string;
    defect: string;
    status: 'awaiting_proposal' | 'proposal_sent' | 'proposal_accepted' | 'proposal_rejected' | 'paid';
    createdAt: string;
    quotedValue?: string;
    paymentDeadline?: string;
    neighborhood: string;
    waterDamage: boolean;
    signsOfLife: boolean;
    photoFrontUrl: string;
    photoBackUrl: string;
}

export default function UserDashboard() {
    const navigate = useNavigate();
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!auth.currentUser) return;
        const key = `welcome_seen_${auth.currentUser.uid}`;
        const welcomeSeen = localStorage.getItem(key);
        if (!welcomeSeen) {
            setShowWelcome(true);
        }
    }, [auth.currentUser]);

    const handleCloseWelcome = () => {
        if (!auth.currentUser) return;
        setShowWelcome(false);
        const key = `welcome_seen_${auth.currentUser.uid}`;
        localStorage.setItem(key, 'true');
    };

    useEffect(() => {
        if (!auth.currentUser) return;

        const unsubscribe = onSnapshot(
            query(collection(db, "devices"), where("userId", "==", auth.currentUser.uid)),
            (snapshot) => {
                const devicesData: Device[] = [];
                snapshot.forEach((doc) => {
                    devicesData.push({ id: doc.id, ...doc.data() } as Device);
                });
                // Client-side sort
                devicesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setDevices(devicesData);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching user devices:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [auth.currentUser?.uid]); // Add dependency just in case

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'awaiting_proposal': return 'var(--warning-color)';
            case 'proposal_sent': return 'var(--primary-color)';
            case 'proposal_accepted': return 'var(--success-color)';
            case 'proposal_rejected': return 'var(--danger-color)';
            case 'paid': return 'var(--text-secondary)';
            default: return 'var(--text-secondary)';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'awaiting_proposal': return 'AGUARDANDO PROPOSTA';
            case 'proposal_sent': return 'PROPOSTA RECEBIDA';
            case 'proposal_accepted': return 'PROPOSTA ACEITA';
            case 'proposal_rejected': return 'PROPOSTA RECUSADA';
            case 'paid': return 'PAGO / FINALIZADO';
            default: return status.toUpperCase();
        }
    };

    const parseValue = (val: string | undefined): number => {
        if (!val) return 0;
        // Remove R$, spaces and replace comma with dot
        return parseFloat(val.replace(/[^\d,.-]/g, '').replace(',', '.'));
    };

    const pendingValue = devices
        .filter(d => d.status === 'proposal_accepted')
        .reduce((acc, d) => acc + parseValue(d.quotedValue), 0);

    const receivedValue = devices
        .filter(d => d.status === 'paid')
        .reduce((acc, d) => acc + parseValue(d.quotedValue), 0);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '0 0 var(--layout-padding-y) 0' }}>
            <Header />
            <div className="container" style={{ marginTop: '2rem' }}>
                {/* Cards de Resumo Financeiro */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <div className="glass-panel" style={{ 
                        padding: '1.25rem', 
                        flex: 1,
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(255, 255, 255, 0.5) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.35rem', borderRadius: '8px' }}>
                                    <Wallet size={16} color="#d97706" />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>A Receber</span>
                            </div>
                            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', lineHeight: 1, letterSpacing: '-0.5px' }}>
                                R$ {pendingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <Wallet 
                            size={100} 
                            color="#f59e0b" 
                            style={{ 
                                position: 'absolute', 
                                right: -25, 
                                bottom: -25, 
                                opacity: 0.1, 
                                transform: 'rotate(-15deg)' 
                            }} 
                        />
                    </div>

                    <div className="glass-panel" style={{ 
                        padding: '1.25rem', 
                        flex: 1,
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(255, 255, 255, 0.5) 100%)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.35rem', borderRadius: '8px' }}>
                                    <DollarSign size={16} color="#059669" />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recebido</span>
                            </div>
                            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', lineHeight: 1, letterSpacing: '-0.5px' }}>
                                R$ {receivedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <DollarSign 
                            size={100} 
                            color="#10b981" 
                            style={{ 
                                position: 'absolute', 
                                right: -25, 
                                bottom: -25, 
                                opacity: 0.1, 
                                transform: 'rotate(-15deg)' 
                            }} 
                        />
                    </div>
                </div>


                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--primary-color)" />
                    </div>
                ) : (
                    <div>
                        {/* Card para Adicionar Novo */}
                        <div className="glass-panel new-device-card" onClick={() => navigate('/painel/novo')} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                            boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.2)',
                            marginBottom: '2rem',
                            transform: 'translateZ(0)'
                        }}>
                            {/* Decorative element */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05))',
                                transform: 'skewX(-20deg)',
                                pointerEvents: 'none'
                            }} />

                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                width: '38px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '0.875rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                zIndex: 1
                            }}>
                                <Plus size={18} color="#fff" />
                            </div>
                            
                            <div style={{ flex: 1, zIndex: 1 }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff', marginBottom: '0', letterSpacing: '0.2px' }}>Vender Aparelho Quebrado</h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '2px' }}>Avaliação imediata</p>
                            </div>

                            <div style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                borderRadius: '50%', 
                                padding: '0.35rem',
                                border: '1px solid rgba(255,255,255,0.05)',
                                zIndex: 1
                            }}>
                                <ChevronRight size={16} color="rgba(255,255,255,0.8)" />
                            </div>
                        </div>

                        {devices.length > 0 && (
                            <>
                                <h2 style={{ 
                                    fontSize: '1.25rem', 
                                    fontWeight: '600', 
                                    color: 'var(--text-primary)', 
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    Meus Aparelhos
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        background: 'var(--glass-border)', 
                                        padding: '0.1rem 0.5rem', 
                                        borderRadius: '12px',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        {devices.length}
                                    </span>
                                </h2>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '1.5rem'
                                }}>
                                    {/* Lista de Aparelhos Reais */}
                                    {devices.map((device) => (
                                        <div 
                                            key={device.id} 
                                            className="glass-panel" 
                                            onClick={() => setSelectedDevice(device)}
                                            style={{ 
                                                padding: '0', // Reset padding to handle internally
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                border: '1px solid var(--glass-border)',
                                                overflow: 'hidden',
                                                position: 'relative'
                                            }}
                                        >
                                            {/* Status Bar */}
                                            <div style={{
                                                padding: '0.75rem 1rem',
                                                borderBottom: '1px solid var(--glass-border)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: `linear-gradient(90deg, ${getStatusColor(device.status)}10, transparent)`
                                            }}>
                                                <span style={{
                                                    color: getStatusColor(device.status),
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    letterSpacing: '0.5px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(device.status) }}></div>
                                                    {getStatusText(device.status)}
                                                </span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                    {new Date(device.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Main Content */}
                                            <div style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                {device.photoFrontUrl ? (
                                                    <div style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        background: '#000',
                                                        flexShrink: 0,
                                                        border: '1px solid var(--glass-border)',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                                    }}>
                                                        <img
                                                            src={device.photoFrontUrl}
                                                            alt={device.model}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'contain'
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        borderRadius: '10px',
                                                        background: 'var(--glass-bg)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid var(--glass-border)'
                                                    }}>
                                                        <Wallet size={24} color="var(--text-secondary)" />
                                                    </div>
                                                )}

                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h3 style={{ 
                                                        fontSize: '1rem', 
                                                        fontWeight: '600', 
                                                        marginBottom: '0.25rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        color: 'var(--text-primary)'
                                                    }}>
                                                        {device.model}
                                                    </h3>
                                                    <p style={{ 
                                                        color: 'var(--text-secondary)', 
                                                        fontSize: '0.8rem',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {device.defect}
                                                    </p>
                                                </div>

                                                <ChevronRight size={18} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                                            </div>

                                            {/* Proposal Value Highlight */}
                                            {(device.status === 'proposal_sent' || device.status === 'proposal_accepted' || device.status === 'paid') && device.quotedValue && (
                                                <div style={{ 
                                                    padding: '0.75rem 1rem', 
                                                    background: 'rgba(0,0,0,0.2)', 
                                                    borderTop: '1px solid var(--glass-border)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Valor da Proposta</span>
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--success-color)', fontWeight: 'bold' }}>
                                                        R$ {device.quotedValue}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

            </div>

            {selectedDevice && (
                <UserDeviceModal
                    device={selectedDevice}
                    onClose={() => setSelectedDevice(null)}
                />
            )}

            {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
        </div>
    );
}
