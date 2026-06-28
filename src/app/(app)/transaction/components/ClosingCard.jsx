import { formatDateTime } from "@/libs/format";
import { CopyIcon, MapPin, Power } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export const ClosingCard = ({ responseData }) => {
    // 1. Ambil teks mentah dari properti response Telegram
    const [isCopied, setIsCopied] = useState(false);
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

    const copyDailyReport = () => {
        const dailyReportData = [
            { name: "Kas", value: extractValue(/Kas:\s*([^\n]+)/, rawText) },
            { name: "Voucher", value: extractValue(/Voucher:\s*([^\n]+)/, rawText) },
            { name: "Deposit", value: extractValue(/Deposit:\s*([^\n]+)/, rawText) },
            { name: "Koreksi", value: extractValue(/Koreksi:\s*([^\n]+)/, rawText) },
            { name: "Acc", value: extractValue(/Acc:\s*([^\n]+)/, rawText) },
            { name: "Laba", value: extractValue(/Laba:\s*([^\n]+)/, rawText) },
        ];

        const lines = dailyReportData.map(({ name, value }) => `${name}: ${value}`);

        return `${formatDateTime(tanggal)}\nReport ${cabang}:\n\n${lines.join("\n")}\n\nTotal Setoran: ${totalSetoran}`;
    };

    const copyData = async () => {
        await navigator.clipboard.writeText(copyDailyReport());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 9000);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-1">
            <div className="w-xs mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden font-sans transition-all duration-300">
                {/* HEADER CARD */}
                <div className="bg-linear-to-r from-blue-500 to-blue-400 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">
                                <Power size={16} className="" />
                            </span>
                            <h2 className="font-extrabold tracking-wide uppercase text-sm">Closing Shift</h2>
                        </div>
                        <span className="bg-white/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full backdrop-blur-sm tracking-wider">Sent</span>
                    </div>

                    {/* NAMA CABANG / KONTER */}
                    <h1 className="text-xl font-black mt-2 tracking-tight uppercase gap-1.5">{cabang}</h1>
                    <p className="text-xs text-orange-100 font-medium mt-1 font-mono">{tanggal}</p>
                </div>

                {/* BODY / RINCIAN ITEM DATA */}
                <div className="p-6 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/20">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        Rincian Transaksi
                    </h3>

                    {/* BARIS DATA LOOPING/MANUAL */}
                    <div className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between items-center">
                            <span>Kas</span>
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
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Laba</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Rp {laba}</span>
                        </div>
                    </div>
                </div>

                {/* FOOTER TOTAL SETORAN */}
                <div className="bg-slate-100 dark:bg-slate-900/60 px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-1 justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Kas Disetor</span>
                    <span className="text-lg font-black dark:text-white font-mono bg-amber-500/10 dark:bg-amber-500/5 text-orange-600 px-3 py-0.5 rounded-xl border border-orange-500/20">
                        Rp {totalSetoran}
                    </span>
                </div>
            </div>
            <div className="flex flex-col gap-2 items-center">
                <div className="bg-white rounded-lg p-4">
                    <QRCodeSVG value={copyDailyReport()} size={120} />
                </div>
                <button
                    className="cursor-pointer text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-slate-100 transition-transform duration-75 flex items-center gap-1 hover:scale-110"
                    onClick={() => copyData()}
                >
                    <CopyIcon size={14} className={`${isCopied ? "text-green-500" : ""}`} /> {isCopied ? "Copied" : "Copy"}
                </button>
            </div>
        </div>
    );
};
