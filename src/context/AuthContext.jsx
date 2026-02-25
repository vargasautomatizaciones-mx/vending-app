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

    const login = async (username, password) => {
        try {
            const cleanUsername = username.trim();
            const cleanPassword = password.trim();

            const { data: users, error: dbError } = await supabase
                .from('users')
                .select('*')
                .or(`email.ilike.${cleanUsername},username.ilike.${cleanUsername}`);

            if (dbError) throw dbError;

            if (!users || users.length === 0) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            const match = users.find(u => u.password === cleanPassword);

            if (!match) {
                return { success: false, message: 'Contraseña incorrecta' };
            }

            const userData = {
                id: match.id,
                username: match.username || match.email,
                email: match.email,
                role: match.role,
                name: match.name,
                companyId: match.company_id || 'master'
            };

            setUser(userData);
            return { success: true };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, message: 'Error de servidor' };
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
