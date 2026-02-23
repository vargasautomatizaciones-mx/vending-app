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

            console.log('--- DIAGNÓSTICO DE LOGIN ---');
            console.log('1. Intentando buscar usuario:', cleanUsername);

            // Fetch user first without password constraint to see if they exist
            const { data: users, error: dbError } = await supabase
                .from('users')
                .select('*')
                .or(`email.ilike.${cleanUsername},username.ilike.${cleanUsername}`);

            if (dbError) {
                console.error("2. ERROR DE BASE DE DATOS:", dbError);
                return { success: false, message: `Error DB: ${dbError.message}` };
            }

            if (!users || users.length === 0) {
                console.warn('2. RESULTADO: Usuario no encontrado en la tabla "users"');
                return { success: false, message: 'Usuario no encontrado' };
            }

            console.log(`2. RESULTADO: Se encontraron ${users.length} coincidencia(s)`);

            // Validate password in JS for better debugging
            const match = users.find(u => u.password === cleanPassword);

            if (!match) {
                console.warn('3. VALIDACIÓN: Contraseña INCORRECTA');
                return { success: false, message: 'Contraseña incorrecta' };
            }

            console.log('3. VALIDACIÓN: ÉXITO. Bienvenido', match.name);

            // For non-superadmins, verify company
            if (match.role !== 'superadmin' && companyId && companyId !== 'master' && match.company_id !== companyId) {
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
