
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, Mail, Lock, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import LandingModal from '../components/LandingModal';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLanding, setShowLanding] = useState(false);
    const navigate = useNavigate();
    const { user, role, loading: authLoading } = useAuth();

    React.useEffect(() => {
        if (!authLoading && user) {
            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/painel');
            }
        } else if (!authLoading && !user) {
            // Check if they already saw the landing in this session
            const hasSeenLanding = sessionStorage.getItem('has_seen_landing');
            if (!hasSeenLanding) {
                setShowLanding(true);
            }
        }
    }, [user, role, authLoading, navigate]);

    const handleCloseLanding = () => {
        setShowLanding(false);
        sessionStorage.setItem('has_seen_landing', 'true');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // No need for explicit success toast/redirect here if App.tsx handles auth state changes via ProtectedRoute redirection logic
            // But for UX feedback let's keep a success message.
            toast.success('Login realizado com sucesso!');

            // Check if it's admin
            if (userCredential.user.email === 'zexnet.info@gmail.com') {
                navigate('/admin');
            } else {
                navigate('/painel');
            }
        } catch (error: any) {
            console.error(error);
            toast.error('Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-color)',
            padding: 'var(--layout-padding-x)'
        }}>
            <div className="glass-panel" style={{
                padding: 'var(--card-padding)',
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{
                        background: 'var(--primary-color)',
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.25)'
                    }}>
                        <Smartphone color="white" size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>ReCiclo Mobile</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Acesse sua conta para continuar</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', paddingLeft: '40px' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', paddingLeft: '40px' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Não tem uma conta? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '500' }}>Cadastre-se</Link>
                    </p>
                </div>
            </div>
            {showLanding && <LandingModal onClose={handleCloseLanding} />}
        </div>
    );
}
