
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, Mail, Lock, Phone, Loader2 } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user, role, loading: authLoading } = useAuth();

    React.useEffect(() => {
        if (!authLoading && user) {
            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/painel');
            }
        }
    }, [user, role, authLoading, navigate]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 10) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
        } else {
            value = value.replace(/(\d{0,2})/, "$1");
        }
        setPhone(value);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const unmaskedPhone = phone.replace(/\D/g, "");

        try {
            if (!email.includes('@') || password.length < 6 || unmaskedPhone.length < 10) {
                toast.error('Preencha os campos corretamente.');
                setLoading(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save additional user data to Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                phone: phone, // Saving the masked version as requested for notification purposes
                role: "user", // Default role
                createdAt: new Date().toISOString()
            });

            toast.success('Conta criada com sucesso!');
            navigate('/painel');
        } catch (error: any) {
            console.error(error);
            toast.error('Erro ao criar conta: ' + error.message);
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
                    <p style={{ color: 'var(--text-secondary)' }}>Junte-se a nós para vender seus aparelhos</p>
                </div>

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                        <Phone size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="tel"
                            placeholder="Telefone (WhatsApp)"
                            value={phone}
                            onChange={handlePhoneChange}
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
                        {loading ? <Loader2 className="animate-spin" /> : 'Criar Conta'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Já tem uma conta? <Link to="/" style={{ color: 'var(--primary-color)', fontWeight: '500' }}>Entrar</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
