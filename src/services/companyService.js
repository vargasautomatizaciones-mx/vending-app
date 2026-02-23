import { supabase } from '../supabaseClient';

const COMPANIES_TABLE = 'companies';

export const companyService = {
    getCompanies: async () => {
        const { data, error } = await supabase
            .from(COMPANIES_TABLE)
            .select('*');

        if (error) {
            console.error('Error fetching companies:', error);
            return [];
        }
        return data || [];
    },

    addCompany: async (company) => {
        const { data, error } = await supabase
            .from(COMPANIES_TABLE)
            .insert([{ ...company, status: 'active' }])
            .select();

        if (error) throw error;
        return data;
    },

    updateCompanyStatus: async (id, status) => {
        const { data, error } = await supabase
            .from(COMPANIES_TABLE)
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data;
    },

    getCompanyById: async (id) => {
        const { data, error } = await supabase
            .from(COMPANIES_TABLE)
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    },

    getMasterKey: () => 'master2024'
};
