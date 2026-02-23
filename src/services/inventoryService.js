import { supabase } from '../supabaseClient';

const INVENTORY_TABLE = 'inventory';

export const inventoryService = {
    getInventory: async (companyId) => {
        const { data, error } = await supabase
            .from(INVENTORY_TABLE)
            .select('*')
            .eq('company_id', companyId);

        if (error) {
            console.error('Error fetching inventory:', error);
            return [];
        }
        return data;
    },

    getProductByBarcode: async (barcode) => {
        // First check in the database
        const { data, error } = await supabase
            .from(INVENTORY_TABLE)
            .select('*')
            .eq('barcode', barcode)
            .single();

        if (data) return data;

        // If not in DB, it might be a new product that hasn't been added yet
        return null;
    },

    updateStock: async (id, amount, companyId) => {
        // Get current stock
        const { data: current } = await supabase
            .from(INVENTORY_TABLE)
            .select('quantity')
            .eq('id', id)
            .single();

        const newQuantity = (current?.quantity || 0) + amount;

        const { data, error } = await supabase
            .from(INVENTORY_TABLE)
            .update({ quantity: newQuantity })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    deductStock: async (deductions, companyId) => {
        // This is a complex operation that might require a transaction or separate calls
        // For simplicity in this demo, we'll do individual updates
        // In production, consider using a Supabase RPC function
        for (const [name, amount] of Object.entries(deductions)) {
            if (amount <= 0) continue;

            // Search by name (not ideal but works for this structure)
            const { data: item } = await supabase
                .from(INVENTORY_TABLE)
                .select('id, quantity')
                .eq('company_id', companyId)
                .ilike('name', `%${name}%`)
                .single();

            if (item) {
                await supabase
                    .from(INVENTORY_TABLE)
                    .update({ quantity: Math.max(0, item.quantity - amount) })
                    .eq('id', item.id);
            }
        }
    }
};
