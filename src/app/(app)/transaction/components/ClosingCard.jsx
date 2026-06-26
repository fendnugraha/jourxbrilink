export const ClosingCard = ({ responseData }) => {
    // 1. Ambil teks mentah dari properti response Telegram
    const rawText = responseData?.result?.text || responseData?.text || "";

    if (!rawText) return null;

    // 2. Fungsi helper ekstraksi data menggunakan Regex (Clean Code)
    const extractValue = (regex, text) => {
        const match = text.match(regex);
        return match ? match[1].trim() : "-";
    };

    // Memisahkan data teks mentah menjadi variabel objek bersih
    const cabang = extractValue(/📍 Sumber:\s*([^\n]+)/, rawText);
    const tanggal = extractValue(/📝 Detail:\s*\n([^\n]+)/, rawText);

    const kas = extractValue(/Kas:\s*([^\n]+)/, rawText);
    const voucher = extractValue(/Voucher:\s*([^\n]+)/, rawText);
    const deposit = extractValue(/Deposit:\s*([^\n]+)/, rawText);
    const koreksi = extractValue(/Koreksi:\s*([^\n]+)/, rawText);
    const acc = extractValue(/Acc:\s*([^\n]+)/, rawText);
    const laba = extractValue(/Laba:\s*([^\n]+)/, rawText);

    const totalSetoran = extractValue(/Total Setoran:\s*([^\n]+)/, rawText);

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden font-sans transition-all duration-300">
            {/* HEADER CARD */}
            <div className="bg-linear-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">💰</span>
                        <h2 className="font-extrabold tracking-wide uppercase text-sm">Closing Shift</h2>
                    </div>
                    <span className="bg-white/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full backdrop-blur-sm tracking-wider">
                        Sukses Terkirim
                    </span>
                </div>

                {/* NAMA CABANG / KONTER */}
                <h1 className="text-xl font-black mt-2 tracking-tight uppercase flex items-center gap-1.5">
                    <span>📍</span> {cabang}
                </h1>
                <p className="text-xs text-orange-100 font-medium mt-1 font-mono">{tanggal}</p>
            </div>

            {/* BODY / RINCIAN ITEM DATA */}
            <div className="p-6 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/20">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    Rincian Transaksi
                </h3>

                {/* BARIS DATA LOOPING/MANUAL */}
                <div className="space-y-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between items-center">
                        <span>Kas Toko</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">Rp {kas}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Penjualan Voucher</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">Rp {voucher}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Deposit Saldo</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">Rp {deposit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Koreksi Selisih</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">Rp {koreksi}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Aksesoris (Acc)</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">Rp {acc}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Laba Bersih Shift</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Rp {laba}</span>
                    </div>
                </div>
            </div>

            {/* FOOTER TOTAL SETORAN */}
            <div className="bg-slate-100 dark:bg-slate-900/60 px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Kas Disetor</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono bg-amber-500/10 dark:bg-amber-500/5 text-orange-600 dark:text-amber-400 px-3 py-1 rounded-xl border border-orange-500/20">
                    Rp {totalSetoran}
                </span>
            </div>
        </div>
    );
};
