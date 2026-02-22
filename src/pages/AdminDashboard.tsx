
import { useEffect, useState } from 'react';
import { FileText, Loader2, Smartphone } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import ProposalModal from '../components/ProposalModal';
import Header from '../components/Header';

interface Device {
    id: string;
    model: string;
    defect: string;
    waterDamage: boolean;
    signsOfLife: boolean;
    photoFrontUrl: string;
    photoBackUrl: string;
    status: 'awaiting_proposal' | 'proposal_sent' | 'proposal_accepted' | 'proposal_rejected' | 'paid';
    neighborhood: string;
    userId: string;
    userEmail: string;
    createdAt: string;
    quotedValue?: string;
    paymentDeadline?: string;
}

export default function AdminDashboard() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        // Realtime listener
        const q = query(collection(db, "devices"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const devicesData: Device[] = [];
            snapshot.forEach((doc) => {
                devicesData.push({ id: doc.id, ...doc.data() } as Device);
            });
            setDevices(devicesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching devices:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
            case 'proposal_sent': return 'PROPOSTA ENVIADA';
            case 'proposal_accepted': return 'PROPOSTA ACEITA';
            case 'proposal_rejected': return 'PROPOSTA RECUSADA';
            case 'paid': return 'PAGO / FINALIZADO';
            default: return status.toUpperCase();
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '0 0 var(--layout-padding-y) 0' }}>
            <Header />
            <div className="container" style={{ marginTop: '2rem' }}>

                <div style={{ padding: '0 0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '0' }}>Aparelhos Recentes</h2>
                    <span style={{ background: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem' }}>
                        Total: {devices.length}
                    </span>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--primary-color)" />
                    </div>
                ) : devices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        Nenhum aparelho cadastrado ainda.
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {devices.map((device) => (
                            <div key={device.id} className="glass-panel" style={{
                                padding: '1.5rem',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                            }}>
                                {/* Status Indicator Line */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    width: '4px',
                                    backgroundColor: getStatusColor(device.status)
                                }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '0.25rem 0.75rem',
                                        backgroundColor: `${getStatusColor(device.status)}15`,
                                        borderRadius: '20px',
                                        color: getStatusColor(device.status),
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {getStatusText(device.status)}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {new Date(device.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        backgroundColor: '#000',
                                        flexShrink: 0,
                                        border: '1px solid var(--glass-border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {device.photoFrontUrl ? (
                                            <img
                                                src={device.photoFrontUrl}
                                                alt={device.model}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            <Smartphone size={32} color="var(--text-secondary)" />
                                        )}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            marginBottom: '0.25rem',
                                            color: 'var(--text-primary)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {device.model}
                                        </h3>
                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.85rem',
                                            lineHeight: '1.4',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {device.defect}
                                        </p>
                                        {device.quotedValue && (
                                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--success-color)' }}>
                                                R$ {device.quotedValue}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-secondary)' }}></span>
                                            {device.neighborhood}
                                        </span>
                                        <span>{device.userEmail.split('@')[0]}</span>
                                    </div>

                                    <button
                                        onClick={() => setSelectedDevice(device)}
                                        className="btn btn-primary"
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            fontSize: '0.875rem',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                        }}
                                    >
                                        <FileText size={16} />
                                        Gerenciar Proposta
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedDevice && (
                <ProposalModal
                    device={selectedDevice}
                    onClose={() => setSelectedDevice(null)}
                />
            )}
        </div>
    );
}
