import { supabase } from '../supabaseClient';

const MACHINES_TABLE = 'machines';

export const machineService = {
    getMachines: async (companyId) => {
        const { data, error } = await supabase
            .from(MACHINES_TABLE)
            .select('*')
            .eq('company_id', companyId);

        if (error) {
            console.error('Error fetching machines:', error);
            // Fallback to localStorage if Supabase fails (optional)
            const stored = localStorage.getItem(`vending_machines_${companyId}`);
            return stored ? JSON.parse(stored) : [];
        }

        // Update localStorage as cache
        localStorage.setItem(`vending_machines_${companyId}`, JSON.stringify(data));
        return data;
    },

    getMachineById: async (id) => {
        const { data, error } = await supabase
            .from(MACHINES_TABLE)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching machine:', error);
            return null;
        }
        return data;
    },

    addMachine: async (machine, companyId) => {
        const { data, error } = await supabase
            .from(MACHINES_TABLE)
            .insert([{
                ...machine,
                company_id: companyId,
                status: 'active'
            }])
            .select();

        if (error) throw error;
        return data[0];
    },

    updateMachine: async (id, updatedData) => {
        const { data, error } = await supabase
            .from(MACHINES_TABLE)
            .update(updatedData)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    deleteMachine: async (id) => {
        const { error } = await supabase
            .from(MACHINES_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    updateLastReading: async (id, newReading) => {
        return machineService.updateMachine(id, { last_reading: newReading });
    }
};
