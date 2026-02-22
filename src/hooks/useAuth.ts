
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Check user role in Firestore
                // Admin email check (hardcoded for now as per prompt "email que eu predefinir")
                // But better to check firestore or custom claims.
                // For simplicity: Admin email check
                const adminEmail = "zexnet.info@gmail.com";

                if (currentUser.email === adminEmail) {
                    setRole('admin');
                } else {
                    // Fetch role from Firestore if exists, else default to user
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setRole(docSnap.data().role || 'user');
                    } else {
                        setRole('user');
                    }
                }
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, role, loading };
}
