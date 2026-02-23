import { supabase } from '../supabaseClient';

const VISITS_TABLE = 'visits';

export const historyService = {
    getVisits: async (companyId) => {
        const { data, error } = await supabase
            .from(VISITS_TABLE)
            .select('*, machines(name)')
            .eq('company_id', companyId)
            .order('timestamp', { ascending: false });

        if (error) {
            console.error('Error fetching visits:', error);
            return [];
        }
        return data;
    },

    addVisit: async (visitData, companyId) => {
        const { data, error } = await supabase
            .from(VISITS_TABLE)
            .insert([{
                company_id: companyId,
                machine_id: visitData.machineId,
                lectura_anterior: visitData.lecturaAnterior,
                lectura_actual: visitData.lecturaActual,
                tazas_vendidas: visitData.tazasVendidas,
                total_sales: visitData.totalSales,
                insumos: visitData.insumos,
                timestamp: new Date().toISOString()
            }])
            .select();

        if (error) throw error;
        return data[0];
    },

    exportToCSV: (visits) => {
        if (!visits || visits.length === 0) return;

        const headers = ['Fecha/Hora', 'Máquina', 'Lectura Anterior', 'Lectura Actual', 'Tazas Vendidas', 'Ingresos ($)', 'Vasos', 'Café', 'Azúcar', 'Paletinas', 'Crema', 'Chocolate'];
        const rows = visits.map(v => [
            new Date(v.timestamp).toLocaleString(),
            v.machines?.name || 'N/A',
            v.lectura_anterior,
            v.lectura_actual,
            v.tazas_vendidas,
            v.total_sales || 0,
            v.insumos?.vasos || 0,
            v.insumos?.cafe || 0,
            v.insumos?.azucar || 0,
            v.insumos?.paletinas || 0,
            v.insumos?.crema || 0,
            v.insumos?.chocolate || 0
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `historial_vending_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    getLowStockAlerts: async (companyId) => {
        const visits = await historyService.getVisits(companyId);
        const latestVisits = {};

        // Get only the latest visit per machine
        visits.forEach(v => {
            if (!latestVisits[v.machine_id]) {
                latestVisits[v.machine_id] = v;
            }
        });

        const alerts = [];
        Object.values(latestVisits).forEach(v => {
            const lowInsumos = [];
            const insumos = v.insumos || {};
            if (insumos.vasos < 20) lowInsumos.push('Vasos');
            if (insumos.cafe < 150) lowInsumos.push('Café');
            if (insumos.azucar < 100) lowInsumos.push('Azúcar');

            if (lowInsumos.length > 0) {
                alerts.push({
                    machineId: v.machine_id,
                    machineName: v.machines?.name || 'Máquina',
                    insumos: lowInsumos,
                    timestamp: v.timestamp
                });
            }
        });

        return alerts;
    }
};
