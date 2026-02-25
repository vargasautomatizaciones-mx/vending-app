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

const WarehouseInventory = () => {
    const navigate = useNavigate();
    const [inventory, setInventory] = useState([]);
    const [view, setView] = useState('list'); // 'list' | 'entry'
    const [scannerActive, setScannerActive] = useState(false);
    const [scannedProduct, setScannedProduct] = useState(null);
    const [amount, setAmount] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const html5QrCodeRef = useRef(null);
    const scannerId = "vending-scanner-id";

    const { user } = useAuth();

    const fetchInventory = async () => {
        if (!user?.companyId) return;

        try {
            setLoading(true);
            setFetchError(null);
            const data = await inventoryService.getInventory(user.companyId);
            setInventory(data || []);
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setFetchError('No se pudo cargar el inventario. Verifica tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();

        return () => {
            if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().catch(() => { });
            }
        };
    }, [user]);

    const startEntryFlow = (e) => {
        if (e) e.stopPropagation();
        setView('entry');
        setScannerActive(true);
        setScannedProduct(null);
        setAmount('');
        setShowSuccess(false);

        // Allow React to mount the scanner div
        setTimeout(async () => {
            try {
                const container = document.getElementById(scannerId);
                console.log("Scanner container check:", container ? "Found" : "Not Found");
                if (!container) return;

                if (!html5QrCodeRef.current) {
                    html5QrCodeRef.current = new Html5Qrcode(scannerId);
                }

                await html5QrCodeRef.current.start(
                    { facingMode: "environment" },
                    { fps: 15, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        handleScanSuccess(decodedText);
                    },
                    (() => { })
                );
            } catch (err) {
                console.error("Scanner error:", err);
            }
        }, 500);
    };

    const handleScanSuccess = async (barcode) => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (e) {
                console.warn("Error stopping scanner:", e);
            }
        }
        setScannerActive(false);

        const product = await inventoryService.getProductByBarcode(barcode);
        if (product) {
            setScannedProduct(product);
        } else {
            setScannedProduct({
                barcode,
                name: `CÓDIGO: ${barcode}`,
                image: 'https://images.unsplash.com/photo-1540340061722-9293d5163008?w=400',
                category: 'NO CATALOGADO'
            });
        }
    };

    const handleSave = async () => {
        if (!scannedProduct || !amount) return;
        setIsSaving(true);

        const productId = scannedProduct.id || scannedProduct.barcode;
        const currentAmount = parseInt(amount) || 0;

        try {
            await inventoryService.updateStock(productId, currentAmount, user.companyId);
            await fetchInventory();
            setIsSaving(false);
            setShowSuccess(true);

            setTimeout(() => {
                setView('list');
                setShowSuccess(false);
                setScannedProduct(null);
                setAmount('');
            }, 1200);
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('Error al actualizar el inventario.');
            setIsSaving(false);
        }
    };

    const closeEntry = () => {
        if (html5QrCodeRef.current?.isScanning) {
            html5QrCodeRef.current.stop().catch(() => { });
        }
        setView('list');
        setScannerActive(false);
    };

    // Filters inventory based on search term
    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.barcode && item.barcode.includes(searchTerm))
    );

    // --- MAIN RENDER ---
    if (view === 'entry') {
        return (
            <div className="fixed inset-0 bg-white flex flex-col font-sans z-[100] animate-in slide-in-from-bottom duration-300">
                <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-lg">
                    <div className="flex items-center">
                        <button onClick={closeEntry} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h2 className="ml-2 font-black uppercase text-base tracking-tight">INGRESO DE MERCANCÍA</h2>
                    </div>
                </header>

                <main className="flex-1 bg-slate-50 overflow-y-auto p-4 sm:p-6 pb-28">
                    <div className="max-w-md mx-auto space-y-8">
                        {showSuccess ? (
                            <div className="py-20 text-center animate-in zoom-in duration-300">
                                <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl mb-8 border-8 border-green-50">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 mb-2">¡HECHO!</h1>
                                <p className="text-slate-500 font-bold">Inventario actualizado con éxito.</p>
                            </div>
                        ) : (
                            <>
                                {scannerActive && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <div className="inline-block px-4 py-1 bg-slate-200 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">Apunta la Cámara al Código</div>
                                        </div>
                                        <div id={scannerId} className="w-full aspect-square bg-black rounded-[48px] overflow-hidden border-8 border-white shadow-2xl relative ring-1 ring-white/5">
                                            <div className="absolute inset-0 border-[50px] border-black/40 pointer-events-none flex items-center justify-center">
                                                <div className="w-full h-full border-2 border-blue-500 rounded-3xl animate-pulse text-blue-500 flex items-center justify-center">
                                                    <Camera className="w-12 h-12 opacity-20" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-[32px] border-2 border-blue-100 shadow-sm space-y-4">
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center">Simulador para Pruebas</p>
                                            <button
                                                onClick={() => handleScanSuccess('12345')}
                                                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-3"
                                            >
                                                <Barcode className="w-6 h-6" />
                                                <span>SIMULAR COCA-COLA (12345)</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {scannedProduct && (
                                    <div className="space-y-8 animate-in zoom-in-95 fade-in duration-500">
                                        <div className="bg-white p-8 rounded-[48px] shadow-2xl border border-blue-50 flex flex-col items-center text-center space-y-6">
                                            <div className="w-56 h-56 bg-gradient-to-tr from-slate-50 to-white rounded-[40px] flex items-center justify-center p-8 border-2 border-slate-100 shadow-inner relative group">
                                                <img
                                                    src={scannedProduct.image}
                                                    alt={scannedProduct.name}
                                                    className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540340061722-9293d5163008?w=400'; }}
                                                />
                                            </div>
                                            <div>
                                                <span className="inline-block px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-3 shadow-md shadow-blue-200">{scannedProduct.category}</span>
                                                <h3 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight">{scannedProduct.name}</h3>
                                                <p className="text-xs font-bold text-slate-400 mt-2 font-mono bg-slate-100 px-3 py-1 rounded-lg inline-block">CODE: {scannedProduct.barcode}</p>
                                            </div>
                                        </div>

                                        <div className="bg-white p-8 rounded-[48px] shadow-xl border border-slate-100 space-y-4">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block text-center">CANTIDAD A SUMAR</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    inputMode="decimal"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="0"
                                                    className="w-full bg-slate-50 border-4 border-slate-100 focus:border-slate-900 rounded-[32px] p-8 text-center text-8xl font-black outline-none transition-all shadow-inner text-slate-900 placeholder:text-slate-200"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>

                {!showSuccess && scannedProduct && (
                    <div className="p-4 sm:p-6 border-t border-slate-100 bg-white fixed bottom-0 inset-x-0 z-[110]">
                        <div className="max-w-md mx-auto">
                            <button
                                onClick={handleSave}
                                disabled={!amount || isSaving}
                                className="w-full bg-slate-900 text-white font-black py-6 rounded-[32px] text-xl shadow-2xl active:scale-95 transition-all disabled:opacity-30"
                            >
                                {isSaving ? (
                                    <RefreshCcw className="w-8 h-8 animate-spin mx-auto" />
                                ) : (
                                    <span>CONFIRMAR INGRESO</span>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // List View
    return (
        <div className="min-h-screen bg-white flex flex-col relative w-full overflow-x-hidden">
            <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 w-full shadow-sm">
                <div className="max-w-xl mx-auto flex items-center">
                    <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="ml-2 text-xl font-black text-slate-900 uppercase">ALMACÉN CENTRAL</h1>
                </div>
            </header>

            <main className="flex-1 p-4 max-w-xl mx-auto w-full space-y-6 pb-28">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar mercancía..."
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Existencias Actuales</h3>

                    {loading ? (
                        <div className="py-20 text-center">
                            <RefreshCcw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cargando Almacén...</p>
                        </div>
                    ) : fetchError ? (
                        <div className="bg-red-50 p-8 rounded-[32px] border-2 border-red-100 text-center space-y-4">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                            <p className="text-red-900 font-black uppercase text-xs">{fetchError}</p>
                            <button onClick={fetchInventory} className="bg-red-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Reintentar</button>
                        </div>
                    ) : filteredInventory.length === 0 ? (
                        <div className="bg-slate-50 p-12 rounded-[40px] border-2 border-dashed border-slate-200 text-center space-y-4">
                            <Package className="w-16 h-16 text-slate-200 mx-auto" />
                            <div>
                                <h4 className="text-slate-900 font-black uppercase text-sm">Almacén Vacío</h4>
                                <p className="text-slate-400 text-xs font-bold mt-1">Usa el botón de abajo para agregar mercancía.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredInventory.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-100 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-50">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                                            <span className="text-[10px] text-slate-300 font-mono tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis block max-w-[150px]">
                                                {item.barcode || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 text-white min-w-[60px] h-12 flex items-center justify-center rounded-2xl shadow-inner px-3">
                                        <span className="text-xl font-black">{item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* FIXED BOTTOM ACTION BUTTON */}
            <div className="fixed bottom-0 inset-x-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-100 z-[90]">
                <div className="max-w-xl mx-auto px-2">
                    <button
                        onClick={startEntryFlow}
                        type="button"
                        className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-3 text-lg"
                    >
                        <Camera className="w-6 h-6" />
                        <span>AGREGAR MERCANCÍA</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarehouseInventory;
