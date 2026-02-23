import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { machineService } from '../services/machineService';
import { companyService } from '../services/companyService';
import { inventoryService } from '../services/inventoryService';
import { historyService } from '../services/historyService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('vending_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [settings, setSettings] = useState(null);

    useEffect(() => {
        if (user) {
            localStorage.setItem('vending_user', JSON.stringify(user));
            // Settings and company scope are handled via companyId in the services
        } else {
            localStorage.removeItem('vending_user');
            setSettings(null);
        }
    }, [user]);

    const login = async (username, password, companyId) => {
        try {
            const cleanUsername = username.trim();
            const cleanPassword = password.trim();

            // Try to find by email first
            console.log('--- Intentando Login ---');
            console.log('Buscando email:', cleanUsername);

            let { data: userRecord, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', cleanUsername)
                .eq('password', cleanPassword)
                .maybeSingle();

            if (error) console.error("Error en query de email:", error);

            // If not found by email, try by username
            if (!userRecord && !error) {
                console.log('No encontrado por email, buscando por username...');
                const { data: userByUsername, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('username', cleanUsername)
                    .eq('password', cleanPassword)
                    .maybeSingle();

                userRecord = userByUsername;
                if (userError) console.error("Error en query de username:", userError);
            }

            if (error || !userRecord) {
                console.warn('Login FALLIDO: Usuario no encontrado en tabla users');
                return { success: false, message: 'Credenciales inválidas o usuario no encontrado' };
            }

            console.log('Login EXITOSO para:', userRecord.email, 'Rol:', userRecord.role);

            // For non-superadmins, verify they belong to the selected company
            if (userRecord.role !== 'superadmin' && companyId && companyId !== 'master' && userRecord.company_id !== companyId) {
                return { success: false, message: 'No tienes acceso a esta empresa' };
            }

            const userData = {
                id: userRecord.id,
                username: userRecord.username || userRecord.email,
                email: userRecord.email,
                role: userRecord.role,
                name: userRecord.name,
                companyId: userRecord.company_id || 'master'
            };

            setUser(userData);
            return { success: true };
        } catch (err) {
            console.error('System login error:', err);
            return { success: false, message: 'Error de conexión con el servidor' };
        }
    };

    const logout = () => {
        setUser(null);
    };

    const updateAdminProfile = async (newName, newPassword, businessName) => {
        if (!user) return;
        // In a cloud-based system, we would update the 'companies' or 'users' table
        // This is a placeholder for the actual cloud update logic
        setUser({ ...user, name: newName });
    };

    return (
        <AuthContext.Provider value={{ user, settings, login, logout, updateAdminProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
