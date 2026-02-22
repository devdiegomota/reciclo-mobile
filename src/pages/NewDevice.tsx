
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, Smartphone, Image as ImageIcon } from 'lucide-react';
import { db, auth, storage } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';
import SuccessModal from '../components/SuccessModal';

const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const scaleSize = MAX_WIDTH / img.width;
                const finalScale = Math.min(scaleSize, 1); // Never upscale

                canvas.width = img.width * finalScale;
                canvas.height = img.height * finalScale;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Compression failed'));
                }, 'image/jpeg', 0.7); // 70% quality
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export default function NewDevice() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [formData, setFormData] = useState({
        model: '',
        defect: '',
        waterDamage: '' as string | boolean,
        signsOfLife: '' as string | boolean,
        neighborhood: '',
    });

    // Track upload status and URLs separately
    const [uploadStatus, setUploadStatus] = useState<{
        front: 'idle' | 'uploading' | 'success' | 'error';
        back: 'idle' | 'uploading' | 'success' | 'error';
    }>({
        front: 'idle',
        back: 'idle'
    });

    const [uploadedUrls, setUploadedUrls] = useState<{
        front: string | null;
        back: string | null;
    }>({
        front: null,
        back: null
    });

    const [previews, setPreviews] = useState<{
        front: string | null;
        back: string | null;
    }>({
        front: null,
        back: null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name === 'waterDamage' || name === 'signsOfLife') {
            setFormData(prev => ({
                ...prev,
                [name]: value === 'true'
            }));
            return;
        }

        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Set preview immediately
            setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
            setUploadStatus(prev => ({ ...prev, [type]: 'uploading' }));

            try {
                // Compress image
                const compressedBlob = await compressImage(file);
                
                // Upload to Firebase Storage
                if (!auth.currentUser) throw new Error('Usuário não autenticado');
                
                const timestamp = Date.now();
                const path = `devices/${auth.currentUser.uid}/${timestamp}_${type}.jpg`;
                const storageRef = ref(storage, path);
                
                const snapshot = await uploadBytes(storageRef, compressedBlob);
                const downloadUrl = await getDownloadURL(snapshot.ref);
                
                setUploadedUrls(prev => ({ ...prev, [type]: downloadUrl }));
                setUploadStatus(prev => ({ ...prev, [type]: 'success' }));
                toast.success(`Foto ${type === 'front' ? 'da frente' : 'de trás'} enviada com sucesso!`);
            } catch (error) {
                console.error('Error uploading photo:', error);
                setUploadStatus(prev => ({ ...prev, [type]: 'error' }));
                toast.error(`Erro ao enviar foto ${type === 'front' ? 'da frente' : 'de trás'}. Tente novamente.`);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if uploads are still in progress
        if (uploadStatus.front === 'uploading' || uploadStatus.back === 'uploading') {
            toast.loading('Aguarde o envio das fotos terminar...');
            return;
        }

        if (!uploadedUrls.front || !uploadedUrls.back) {
            toast.error('Por favor, adicione as fotos da frente e de trás do aparelho.');
            return;
        }

        setLoading(true);

        try {
            if (!auth.currentUser) throw new Error('Usuário não autenticado');

            if (formData.waterDamage === '' || formData.signsOfLife === '') {
                toast.error('Por favor, responda se o aparelho foi molhado e se dá sinal de vida.');
                setLoading(false);
                return;
            }

            await addDoc(collection(db, "devices"), {
                userId: auth.currentUser.uid,
                userEmail: auth.currentUser.email,
                ...formData,
                waterDamage: formData.waterDamage === 'true',
                signsOfLife: formData.signsOfLife === 'true',
                status: 'awaiting_proposal',
                createdAt: new Date().toISOString(),
                photoFrontUrl: uploadedUrls.front,
                photoBackUrl: uploadedUrls.back,
                quotedValue: null, // Will be filled by admin later
                paymentDeadline: null // Will be filled by admin later
            });

            setShowSuccessModal(true);
        } catch (error: any) {
            console.error(error);
            toast.error('Erro ao cadastrar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        navigate('/painel');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '1rem 0' }}>
            <SuccessModal
                isOpen={showSuccessModal}
                title="Cadastro Realizado!"
                message="Seu aparelho foi enviado para análise. Em breve, você receberá uma notificação com o valor da nossa proposta."
                onClose={handleCloseSuccess}
                buttonText="Ir para o Painel"
            />
            <div className="container" style={{ maxWidth: '600px' }}>

                <div className="glass-panel mobile-no-card" style={{ padding: '1.5rem' }}>
                    <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <button
                                onClick={() => navigate('/painel')}
                                style={{
                                    padding: '6px',
                                    background: 'var(--surface-color)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-primary)',
                                    marginTop: '2px' // Align with first line of title
                                }}
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <div>
                                <h1 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '0.125rem' }}>Vender Aparelho</h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Preencha os dados do seu celular quebrado</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Model */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.9rem' }}>Modelo do Celular</label>
                            <div style={{ position: 'relative' }}>
                                <Smartphone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ex: iPhone 11, Samsung S20..."
                                    style={{ width: '100%', paddingLeft: '36px', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        {/* Defect */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.9rem' }}>Qual o defeito?</label>
                            <textarea
                                name="defect"
                                value={formData.defect}
                                onChange={handleChange}
                                required
                                placeholder="Descreva o problema (ex: tela quebrada, não liga...)"
                                style={{ width: '100%', minHeight: '80px', resize: 'vertical', fontSize: '0.9rem' }}
                            />
                        </div>

                        {/* Selects */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.9rem' }}>Foi molhado?</label>
                                <select
                                    name="waterDamage"
                                    value={formData.waterDamage.toString()}
                                    onChange={handleChange}
                                    style={{ width: '100%', fontSize: '0.9rem' }}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    <option value="false">Não</option>
                                    <option value="true">Sim</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.9rem' }}>Dá sinal de vida?</label>
                                <select
                                    name="signsOfLife"
                                    value={formData.signsOfLife.toString()}
                                    onChange={handleChange}
                                    style={{ width: '100%', fontSize: '0.9rem' }}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    <option value="false">Não</option>
                                    <option value="true">Sim</option>
                                </select>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.9rem' }}>Bairro onde mora</label>
                            <input
                                type="text"
                                name="neighborhood"
                                value={formData.neighborhood}
                                onChange={handleChange}
                                required
                                placeholder="Seu bairro"
                                style={{ width: '100%', fontSize: '0.9rem' }}
                            />
                            <p style={{ fontSize: '0.7rem', color: 'var(--warning-color)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckCircle size={10} /> Atendemos apenas a cidade de Tubarão no momento.
                            </p>
                        </div>

                        {/* Photos Upload */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.9rem' }}>Fotos do Aparelho</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {/* Front Photo */}
                                <label style={{
                                    border: `2px dashed ${uploadStatus.front === 'error' ? 'var(--danger-color)' : (previews.front ? 'var(--primary-color)' : 'var(--glass-border)')}`,
                                    borderRadius: 'var(--radius-md)',
                                    padding: previews.front ? '0' : '1rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    aspectRatio: '1/1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: previews.front ? `url(${previews.front}) center/cover no-repeat` : 'var(--surface-color)'
                                }}>
                                    {!previews.front && (
                                        <>
                                            <ImageIcon size={20} style={{ marginBottom: '0.25rem', color: 'var(--text-secondary)' }} />
                                            <p style={{ fontSize: '0.8rem', fontWeight: '500' }}>Frente</p>
                                        </>
                                    )}
                                    
                                    {/* Uploading Indicator */}
                                    {uploadStatus.front === 'uploading' && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(0,0,0,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backdropFilter: 'blur(2px)'
                                        }}>
                                            <Loader2 className="animate-spin" color="white" size={32} />
                                        </div>
                                    )}

                                    {/* Success Indicator */}
                                    {uploadStatus.front === 'success' && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'var(--success-color)',
                                            borderRadius: '50%',
                                            padding: '4px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}>
                                            <CheckCircle size={14} color="white" />
                                        </div>
                                    )}

                                    <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 'front')} style={{ display: 'none' }} />
                                </label>

                                {/* Back Photo */}
                                <label style={{
                                    border: `2px dashed ${uploadStatus.back === 'error' ? 'var(--danger-color)' : (previews.back ? 'var(--primary-color)' : 'var(--glass-border)')}`,
                                    borderRadius: 'var(--radius-md)',
                                    padding: previews.back ? '0' : '1rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    aspectRatio: '1/1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: previews.back ? `url(${previews.back}) center/cover no-repeat` : 'var(--surface-color)'
                                }}>
                                    {!previews.back && (
                                        <>
                                            <ImageIcon size={20} style={{ marginBottom: '0.25rem', color: 'var(--text-secondary)' }} />
                                            <p style={{ fontSize: '0.8rem', fontWeight: '500' }}>Trás</p>
                                        </>
                                    )}

                                    {/* Uploading Indicator */}
                                    {uploadStatus.back === 'uploading' && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(0,0,0,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backdropFilter: 'blur(2px)'
                                        }}>
                                            <Loader2 className="animate-spin" color="white" size={32} />
                                        </div>
                                    )}

                                    {/* Success Indicator */}
                                    {uploadStatus.back === 'success' && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'var(--success-color)',
                                            borderRadius: '50%',
                                            padding: '4px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}>
                                            <CheckCircle size={14} color="white" />
                                        </div>
                                    )}

                                    <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 'back')} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>


                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem', width: '100%', padding: '0.75rem' }}>
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Enviando...
                                </>
                            ) : 'Enviar para Avaliação'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
