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
            // Query users table for the given identifying info (email or username)
            const { data: userRecord, error } = await supabase
                .from('users')
                .select('*')
                .or(`email.eq.${username},username.eq.${username}`)
                .eq('password', password) // In production, use hashed passwords!
                .single();

            if (error || !userRecord) {
                return { success: false, message: 'Credenciales inválidas o usuario no encontrado' };
            }

            // For non-superadmins, verify they belong to the selected company
            if (userRecord.role !== 'superadmin' && companyId && userRecord.company_id !== companyId) {
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
            console.error('Login error:', err);
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
