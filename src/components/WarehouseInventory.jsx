import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Plus,
    X,
    Barcode,
    Camera,
    CheckCircle2,
    RefreshCcw,
    Search,
    AlertCircle
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess }) => {
    const scannerId = "vending-qr-scanner-id";
    const scannerRef = useRef(null);

    useEffect(() => {
        const startScanner = async () => {
            try {
                if (!scannerRef.current) {
                    scannerRef.current = new Html5Qrcode(scannerId);
                }

                await scannerRef.current.start(
                    { facingMode: "environment" },
                    { fps: 15, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        onScanSuccess(decodedText);
                    },
                    (() => { })
                );
            } catch (err) {
                console.warn("Scanner init error:", err);
            }
        };

        const timer = setTimeout(startScanner, 500);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    return <div id={scannerId} className="w-full h-full bg-black"></div>;
};

const WarehouseInventory = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Entry Flow States
    const [showEntryFlow, setShowEntryFlow] = useState(false);
    const [scannedResult, setScannedResult] = useState(null);
    const [addAmount, setAddAmount] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        if (!user?.companyId) return;
        setLoading(true);
        setFetchError(null);
        try {
            const data = await inventoryService.getInventory(user.companyId);
            setInventory(data || []);
        } catch (err) {
            setFetchError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleScanSuccess = async (barcode) => {
        setScannedResult({ barcode, name: 'Cargando...', quantity: 0 });
        try {
            const product = await inventoryService.getProductByBarcode(barcode);
            if (product) {
                setScannedResult(product);
            } else {
                setScannedResult({
                    barcode,
                    name: `Producto ${barcode}`,
                    quantity: 0,
                    isNew: true
                });
            }
        } catch (err) {
            console.error("Scan error", err);
        }
    };

    const handleSaveEntry = async () => {
        if (!addAmount || isNaN(addAmount)) return;
        setIsSaving(true);
        try {
            await inventoryService.updateStock(
                scannedResult.isNew ? scannedResult.barcode : scannedResult.id,
                parseInt(addAmount),
                user.companyId
            );
            await loadInventory();
            setShowEntryFlow(false);
            setScannedResult(null);
            setAddAmount('');
        } catch (err) {
            alert("Error al guardar: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.barcode && item.barcode.includes(searchTerm))
    );

    if (showEntryFlow) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
                <header className="p-6 flex items-center justify-between">
                    <button
                        onClick={() => { setShowEntryFlow(false); setScannedResult(null); }}
                        className="p-3 bg-white/10 text-white rounded-2xl active:scale-90 transition-all font-bold"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40">Ingreso de Mercancía</h1>
                    <div className="w-12 text-blue-500 font-bold">●</div>
                </header>

                <main className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto">
                    {!scannedResult ? (
                        <div className="flex-1 flex flex-col space-y-8 py-10">
                            <div className="aspect-square w-full bg-slate-800 rounded-[60px] overflow-hidden border-2 border-white/10 relative shadow-2xl">
                                <QRScanner onScanSuccess={handleScanSuccess} />
                                <div className="absolute inset-0 pointer-events-none border-[30px] border-slate-900/40 flex items-center justify-center">
                                    <div className="w-full h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse"></div>
                                </div>
                            </div>
                            <div className="text-center space-y-3">
                                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Cámara Activa</p>
                                <p className="text-slate-400 text-sm font-bold max-w-[200px] mx-auto opacity-60">Escanea el código de barras del producto</p>
                                <button
                                    onClick={() => handleScanSuccess('12345')}
                                    className="pt-10 text-[10px] text-white/20 font-black uppercase tracking-widest"
                                >
                                    (Prueba Simulada)
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-slide-up pt-4">
                            <div className="bg-white rounded-[48px] p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="w-24 h-24 bg-blue-100 rounded-[32px] flex items-center justify-center mx-auto relative z-10 text-blue-600">
                                    <Package className="w-12 h-12" />
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight mb-2 px-2">
                                        {scannedResult.name}
                                    </h2>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 italic">
                                        EAN: {scannedResult.barcode}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="block text-center text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Cantidad a sumar</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    autoFocus
                                    className="w-full bg-slate-800 border-2 border-white/5 rounded-[40px] py-10 text-center text-7xl font-black text-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10 outline-none transition-all placeholder:text-white/5 shadow-inner"
                                    placeholder="0"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                />
                                <button
                                    onClick={() => setScannedResult(null)}
                                    className="w-full text-white/40 font-black text-[10px] uppercase tracking-widest py-4 bg-white/5 rounded-2xl active:bg-white/10 transition-colors"
                                >
                                    Escanear otro producto
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="fixed bottom-0 inset-x-0 p-8 bg-slate-900/90 backdrop-blur-xl border-t border-white/5 z-50">
                    <button
                        onClick={handleSaveEntry}
                        disabled={!scannedResult || !addAmount || isSaving}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black py-7 rounded-[32px] shadow-2xl flex items-center justify-center space-x-3 active:scale-[0.98] transition-all text-xl tracking-tight"
                    >
                        {isSaving ? (
                            <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <CheckCircle2 className="w-7 h-7" />
                                <span>CONFIRMAR INGRESO</span>
                            </>
                        )}
                    </button>
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            <header className="bg-white px-6 pt-10 pb-8 border-b border-slate-100 rounded-b-[48px] shadow-sm flex items-center space-x-6 relative z-10">
                <button
                    onClick={() => navigate('/')}
                    className="p-4 bg-slate-50 text-slate-400 rounded-2xl active:scale-95 transition-all border border-slate-100"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Almacén Central</p>
                    <h1 className="text-3xl font-black text-slate-900 leading-none">Inventario</h1>
                </div>
            </header>

            <main className="flex-1 flex flex-col px-6 pt-8 pb-32 overflow-y-auto space-y-8">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        className="w-full bg-white border border-slate-200 rounded-[30px] py-5 pl-14 pr-6 text-slate-900 font-bold focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                        placeholder="Buscar mercancía..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-3">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Existencias Actuales</h2>
                        <div className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span className="text-[10px] font-black uppercase">{filteredInventory.length} SKUs</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white rounded-[40px] animate-pulse border border-slate-100"></div>)}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredInventory.map(item => (
                                <div key={item.id} className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm flex items-center group active:scale-[0.98] transition-all hover:shadow-xl hover:shadow-slate-200/50">
                                    <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center mr-5 group-hover:bg-blue-50 transition-colors">
                                        <Package className="w-7 h-7 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-black text-slate-900 truncate text-lg uppercase tracking-tight leading-tight mb-1">
                                            {item.name}
                                        </p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 inline-block px-2 py-1 rounded-md border border-slate-100 italic">
                                            {item.barcode}
                                        </p>
                                    </div>
                                    <div className="text-right pl-4 border-l border-slate-50">
                                        <p className={`text-2xl font-black ${item.quantity < 5 ? 'text-red-500' : 'text-slate-900'}`}>
                                            {item.quantity}
                                        </p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">unidades</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <div className="fixed bottom-0 inset-x-0 p-8 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-40">
                <button
                    onClick={() => setShowEntryFlow(true)}
                    className="w-full bg-slate-900 text-white font-black py-7 rounded-[32px] shadow-2xl shadow-slate-900/40 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 text-lg tracking-tight"
                >
                    <Camera className="w-6 h-6" />
                    <span className="uppercase">INGRESAR MERCANCÍA</span>
                </button>
            </div>
        </div>
    );
};

export default WarehouseInventory;
