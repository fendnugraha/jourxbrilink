"use client";
import Dropdown from "@/components/Dropdown";
import Modal from "@/components/Modal";
import axios from "@/libs/axios";
import { closingShift } from "@/libs/closingShift";
import { DateTimeNow, formatDateTime, formatRupiah } from "@/libs/format";
import formatNumber from "@/libs/formatNumber";
import { sendTelegramAlert } from "@/libs/telegramAlert";
import { Check, ChevronDown, CircleAlertIcon, CopyIcon, LoaderCircle, Power, RefreshCcwIcon, ScanQrCodeIcon, SettingsIcon, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { mutate } from "swr";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const CashBankBalance = ({ accountBalance, dailyDashboard, isLoading, isValidating, mutateCashBankBalance, user }) => {
    const { today } = DateTimeNow();
    const summarizeBalance = accountBalance?.data?.chartOfAccounts?.reduce((total, account) => total + account.balance, 0);
    const [errors, setErrors] = useState([]);
    const [showAccName, setShowAccName] = useState(false);
    const [showBalanceReport, setShowBalanceReport] = useState(true);
    const [showCashBankBalance, setShowCashBankBalance] = useState(true);
    const [showDailyReport, setShowDailyReport] = useState(false);
    const [showAllAccounts, setShowAllAccounts] = useState(false);
    const [isModalSettingInitBalancesOpen, setIsModalSettingInitBalancesOpen] = useState(false);
    const [initBalances, setInitBalances] = useState({});
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [limits, setLimits] = useState({});
    const warehouse = Number(user?.role?.warehouse_id);
    const warehouseName = user?.role?.warehouse?.name;
    const warehouseCashId = Number(user?.role?.warehouse?.chart_of_account_id);
    const [isCopied, setIsCopied] = useState(false);
    const [openingCash, setOpeningCash] = useState(0);
    const [showCloseStore, setShowCloseStore] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [statusText, setStatusText] = useState("");
    const [isClosingComplete, setIsClosingComplete] = useState(false);

    // Load data saat pertama kali mount
    useEffect(() => {
        if (accountBalance?.data?.chartOfAccounts) {
            const formatted = accountBalance.data.chartOfAccounts.reduce((acc, account) => {
                acc[account.id] = account.limit?.limit_amount ?? 0;
                return acc;
            }, {});

            setInitBalances(formatted);
            localStorage.setItem("initBalances", JSON.stringify(formatted));
        }
    }, [accountBalance]);

    // Fungsi untuk update
    const addToInitBalances = async (id, balance) => {
        // setInitBalances((prevBalances) => ({ // ...prevBalances, // [id]: balance, // }));
        try {
            await axios.put(`/api/update-account-limit/${id}`, {
                limit: balance,
                diff: 0, // kalau backend kamu wajib diff
            });

            // notification({
            //     type: "success",
            //     message: response.data.message,
            // });

            mutateCashBankBalance();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        setOpeningCash(initBalances[warehouseCashId] ?? 0);
    }, [initBalances]);

    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());

    const fetchTransaction = async () => {
        try {
            const response = await axios.get(`/api/get-trx-vcr/${warehouse}/${startDate}/${endDate}`);
            const data = response.data.data;

            setTransactions(data); // Tetap di-set untuk kebutuhan UI/tampilan komponen
            return data; // 🔥 Kembalikan data untuk kebutuhan proses urutan async
        } catch (error) {
            setNotification({
                type: "error",
                message: error.response?.data?.message || "Something went wrong.",
            });
            console.log(error);
            throw error; // 🔥 Lempar error agar jika API gagal, proses closing otomatis stop
        }
    };

    const formatVoucherText = (latestTransactions) => {
        // 🔥 Jika ada data dari parameter, pakai itu. Jika tidak, pakai state transactions.
        const dataToUse = latestTransactions || transactions;

        const voucherQty = {};
        const nonVoucherQty = {};

        // Proses pemisahan voucher dan non-voucher langsung di dalam fungsi menggunakan data terbaru
        dataToUse?.forEach((trx) => {
            const name = trx.product?.name || "Produk Tanpa Nama";
            const qty = Number(trx.quantity) || 0;

            // Sesuaikan kondisi penanda voucher di bawah ini dengan logika filter Anda sebelumnya
            // Contoh di bawah berasumsi ada properti 'is_voucher' atau sejenisnya pada produk/transaksi
            if (trx.product?.category === "Vaoucher & SP") {
                voucherQty[name] = (voucherQty[name] || 0) + qty;
            } else {
                nonVoucherQty[name] = (nonVoucherQty[name] || 0) + qty;
            }
        });

        // Ubah objek menjadi baris teks
        const voucherLines = Object.entries(voucherQty).map(([name, qty]) => `${name}: *${qty * -1}* pcs`);
        const nonVoucherLines = Object.entries(nonVoucherQty).map(([name, qty]) => `${name}: *${qty * -1}* pcs`);

        return `Voucher ${warehouseName}:\n\n${voucherLines.join("\n") || "Tidak ada data"}\n\n\nNon Voucher :\n${nonVoucherLines.join("\n") || "Tidak ada data"}`;
    };

    const closeModal = () => {
        setIsModalSettingInitBalancesOpen(false);
    };

    const totalSetoran =
        dailyDashboard?.data?.totalFee +
        dailyDashboard?.data?.totalCash +
        dailyDashboard?.data?.totalCashDeposit?.total +
        dailyDashboard?.data?.totalAccessories?.total +
        dailyDashboard?.data?.totalVoucher?.total +
        dailyDashboard?.data?.totalExpense;

    const copyData = async () => {
        await navigator.clipboard.writeText(copyDailyReport());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 9000);
    };

    const copySalesVoucher = async () => {
        await navigator.clipboard.writeText(formatVoucherText());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
    };

    const closingStatus = () => {
        setIsClosingComplete(true);
        setStatusText("Selesai.");
        setTimeout(() => {
            setIsClosingComplete(false);
            setStatusText("");
        }, 300000);
    };

    const copyDailyReport = () => {
        const dailyReportData = [
            { name: "Kas", value: formatNumber(dailyDashboard?.data?.totalCash - openingCash) },
            { name: "Voucher", value: formatNumber(dailyDashboard?.data?.totalVoucher?.total) },
            { name: "Deposit", value: formatNumber(dailyDashboard?.data?.totalCashDeposit?.total) },
            { name: "Koreksi", value: formatNumber(dailyDashboard?.data?.totalCorrection ?? 0) },
            { name: "Acc", value: formatNumber(dailyDashboard?.data?.totalAccessories?.total) },
            { name: "Laba", value: formatNumber(dailyDashboard?.data?.profit) },
        ];

        const lines = dailyReportData.map(({ name, value }) => `${name}: ${value}`);

        return `${formatDateTime(today)}\nReport ${warehouseName}:\n\n${lines.join("\n")}\n\nTotal Setoran: ${formatNumber(
            dailyDashboard?.data?.totalCash > openingCash ? totalSetoran - openingCash : totalSetoran,
        )}`;
    };
    const limitSummary = accountBalance?.data?.chartOfAccounts?.reduce((total, account) => total + Number(account.limit?.limit_amount), 0);
    const limitPlusSummary = accountBalance?.data?.chartOfAccounts
        ?.filter((acc) => acc.balance - acc.limit?.limit_amount > 0 && acc.account_id === 2)
        .reduce((total, account) => total + Number(account.balance - account.limit?.limit_amount), 0);

    const handleClosing = async () => {
        if (confirm("Anda yakin ingin menutup shift, pastikan semua data sudah diinput?\n(Semua input data akan terkunci setelah kas disetor)") === false)
            return;

        setLoading(true); // Cukup satu loading utama di sini untuk mengontrol seluruh alur
        setStatusText("Menutup shift...");

        try {
            await copyData();

            setStatusText("Menyalin report...");
            // 🔥 Ambil data terbaru langsung dari return fungsi fetch
            const latestTransactions = await fetchTransaction();

            await closingShift({
                cred_code: warehouseCashId,
                amount: dailyDashboard?.data?.totalCash - openingCash,
                warehouse: warehouseName,
                message: copyDailyReport(),
                warehouseId: warehouse,
            });

            setStatusText("Mengirim laporan...");
            await sendTelegramAlert({
                title: "PENJUALAN BARANG",
                source: warehouseName,
                // 🔥 Oper data transaksi terbaru ke pembuat format teks
                message: formatVoucherText(latestTransactions),
                forwardChatId: 986761281,
                // forwardChatId: 851552604,
            });

            changeLockStatus(warehouse);
            alert("Shift berhasil ditutup!");
            setShowCloseStore(false);
        } catch (error) {
            console.log(error);
            alert("Terjadi kesalahan saat menutup shift.");
        } finally {
            setLoading(false); // Loading dimatikan HANYA jika semua proses di atas selesai/gagal
            closingStatus();
        }
    };

    const changeLockStatus = async (id) => {
        try {
            await axios.put(`api/change-lock-status/${id}`, {
                status: 3,
            });
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            console.log(error);
        }
    };

    // 1. Ambil waktu sekarang
    const now = new Date();

    // 2. Gunakan Intl.DateTimeFormat untuk ambil jam & menit khusus timezone Asia/Jakarta
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jakarta",
        hour: "numeric",
        minute: "numeric",
        hour12: false, // Pakai format 24 jam agar tidak ada AM/PM
    });

    // Hasilnya berupa string format 24 jam, misal: "20:30"
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour").value, 10);
    const minute = parseInt(parts.find((p) => p.type === "minute").value, 10);

    // 3. Hitung total menit saat ini
    const currentMinutes = hour * 60 + minute;

    // 4. Range waktu (20:00 - 23:45)
    const start = 20 * 60; // 1200 menit
    const end = 23 * 60 + 45; // 1425 menit

    const isWithinTime = currentMinutes >= start && currentMinutes <= end;

    return (
        <>
            <div className="relative">
                {isValidating && (
                    <div className="absolute w-full h-full bg-white/10 backdrop-blur-[3px] flex justify-center items-center z-10 rounded-3xl">
                        <LoaderCircle size={60} className=" inline text-white animate-spin" />
                    </div>
                )}
                <button onClick={() => setIsModalSettingInitBalancesOpen(true)} className="absolute top-2 right-4 cursor-pointer z-99">
                    <SettingsIcon className="w-4 h-4 inline text-slate-400 hover:rotate-90 transition-transform delay-150 duration-300" />
                </button>
                <Modal isOpen={isModalSettingInitBalancesOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Set Saldo Awal Kas & Bank">
                    {accountBalance?.data?.chartOfAccounts?.map((account) => (
                        <div className="group p-2" key={account.id}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <h1 className="text-xs">{account.acc_name}</h1>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        className="form-control block w-full p-2.5"
                                        value={limits[account.id] ?? account.limit?.limit_amount ?? ""}
                                        onChange={(e) =>
                                            setLimits((prev) => ({
                                                ...prev,
                                                [account.id]: Number(e.target.value),
                                            }))
                                        }
                                    />
                                    <button
                                        onClick={() => addToInitBalances(account.id, limits[account.id])}
                                        className="text-xs bg-blue-500 text-white p-2 rounded-lg"
                                    >
                                        Set
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </Modal>
                <div className="bg-gray-600 dark:bg-black/40 rounded-t-3xl p-2">
                    <div className="flex justify-center items-center bg-slate-200 dark:bg-slate-600 flex-col backdrop-blur-sm rounded-2xl py-2 text-white shadow-lg">
                        {accountBalance?.data?.chartOfAccounts?.length > 0 ? (
                            <>
                                <h1 className="text-xs text-slate-600 dark:text-white">Total Saldo</h1>
                                <h1 className="text-2xl text-slate-600 dark:text-white font-black">{formatNumber(summarizeBalance ?? 0)}</h1>
                                {warehouse !== 1 && (
                                    <h1 className={`text-xs ${summarizeBalance - limitSummary === 0 ? "text-green-500" : "text-red-600 dark:text-red-300"}`}>
                                        {summarizeBalance - limitSummary === 0 ? "Complete" : formatNumber(summarizeBalance - limitSummary)}
                                    </h1>
                                )}
                            </>
                        ) : (
                            <span className="font-normal text-sm">Loading...</span>
                        )}
                    </div>
                </div>
                <div className="bg-gray-600 dark:bg-black/40 backdrop-blur-sm px-12 sm:px-4">
                    <div className="flex justify-between items-center text-white dark:text-lime-800 bg-slate-300 dark:bg-gray-400 p-0.5 rounded-3xl">
                        <button
                            onClick={() => {
                                setShowCashBankBalance(true);
                                setShowDailyReport(false);
                            }}
                            className={`cursor-pointer hover:font-semibold text-center w-full rounded-xl p-0.5 text-sm ${
                                showCashBankBalance ? "bg-gray-600/70 dark:bg-lime-400" : "text-slate-600"
                            }`}
                        >
                            Kas & Bank
                        </button>
                        <button
                            onClick={() => {
                                setShowDailyReport(true);
                                setShowCashBankBalance(false);
                            }}
                            className={`cursor-pointer hover:font-semibold text-center w-full rounded-xl p-0.5 text-sm ${
                                showDailyReport ? "bg-gray-600/70 dark:bg-lime-400" : "text-slate-600"
                            }`}
                        >
                            Report
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setShowBalanceReport(!showBalanceReport)}
                    className="bg-gray-600 dark:bg-black/40 backdrop-blur-sm w-full rounded-b-3xl shadow-md text-white disabled:bg-gray-100"
                    disabled={accountBalance?.data?.length === 0}
                >
                    <ChevronDown className={`w-4 h-4 inline ${showBalanceReport ? "rotate-180" : ""} transition delay-500 ease-in-out`} />
                </button>
                <div
                    className={`bg-slate-50 dark:bg-black/40 backdrop-blur-sm mt-2 rounded-3xl transform ${
                        showBalanceReport
                            ? `opacity-100 scale-y-100 ${showAllAccounts ? "h-fit" : "max-h-175 overflow-y-auto"}`
                            : "opacity-0 scale-y-0 max-h-0 "
                    } origin-top transition-all duration-300 ease-in-out drop-shadow-sm`}
                >
                    <div hidden={!showCashBankBalance} className={`${showAllAccounts ? "h-fit" : "max-h-105 overflow-y-auto"}`}>
                        {accountBalance?.data?.chartOfAccounts?.map((account) => (
                            <div
                                className="group px-4 py-2 border-b border-slate-200 dark:border-slate-700 first:mt-1 last:border-b-0 rounded-3xl"
                                key={account.id}
                            >
                                <div className="flex justify-between items-center overflow-x-auto">
                                    <div className="overflow-x-hidden">
                                        <h1
                                            className="text-sm text-nowrap text-slate-600 dark:text-slate-400 font-semibold transition-all delay-100 duration-150 ease-out"
                                            onClick={() => setShowAccName(!showAccName)}
                                        >
                                            {account.account_group}
                                            <span
                                                className={`overflow-hidden block text-[0.55rem] text-slate-600 dark:text-slate-400 font-normal
                                                    transition-all duration-300 ease-out
                                                    ${showAccName ? "max-h-0 opacity-0" : "max-h-10 opacity-100"}`}
                                            >
                                                {account.acc_name}
                                            </span>
                                        </h1>
                                    </div>

                                    <div className="flex flex-col items-end justify-between">
                                        <h1 className="text-sky-700 dark:text-lime-400 font-bold transition delay-100 duration-150 ease-out">
                                            {account.balance === 0 ? "-" : formatNumber(account.balance)}
                                        </h1>
                                        {account.balance - account.limit?.limit_amount !== 0 && (
                                            <h2
                                                className={`text-xs ${
                                                    account.balance - account.limit?.limit_amount > 0
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-red-600 dark:text-red-400"
                                                } transition delay-100 duration-150 ease-out`}
                                                hidden={!account.limit?.limit_amount}
                                            >
                                                {formatNumber(account.balance - account.limit?.limit_amount)}
                                            </h2>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div hidden={!showDailyReport} className="p-3 text-slate-600 dark:text-white mt-2">
                        <div className="flex justify-between items-start mb-2">
                            {/* <Dropdown
                            trigger={
                                <button className="cursor-pointer transition-transform duration-75 outline-none" onClick={() => copyData()}>
                                    <ScanQrCodeIcon className={`w-5 h-5`} />
                                </button>
                            }
                            align="left"
                            width={"w-fit"}
                        >
                            <div className="p-4">
                                <QRCodeSVG value={copyDailyReport()} size={200} />
                            </div>
                        </Dropdown> */}
                            <button
                                onClick={() => {
                                    setShowCloseStore(true);
                                    mutate(["/api/daily-dashboard", { warehouse, startDate, endDate }]);
                                }}
                                className="text-xs text-slate-100 active:scale-90 bg-red-500 hover:bg-red-400 px-1 py-0.5 rounded-md flex items-center gap-1"
                                hidden={!isWithinTime || warehouse === 1 || limitPlusSummary > 0}
                            >
                                Tutup Toko{" "}
                                <span className="bg-red-300 rounded-full p-0.5 text-white">
                                    <Power size={10} />
                                </span>
                            </button>

                            <div className="flex gap-2 items-center bg-slate-400 dark:bg-slate-600 rounded-full px-2 py-1">
                                <button
                                    className="cursor-pointer text-slate-600 dark:text-slate-100 transition-transform duration-75"
                                    onClick={() => copyData()}
                                >
                                    <CopyIcon size={14} className={`${isCopied ? "text-green-500" : ""}`} />
                                </button>
                                <button
                                    className="cursor-pointer text-slate-600 dark:text-slate-100 transition-transform duration-75"
                                    onClick={() => mutate(["/api/daily-dashboard", { warehouse, startDate, endDate }])}
                                >
                                    <RefreshCcwIcon size={14} className={`${isLoading ? "animate-spin" : ""}`} />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between mb-1">
                            <h1 className="text-xs">Uang Tunai</h1>
                            <h1 className={`text-xs font-bold text-end ${dailyDashboard?.data?.totalCash < openingCash ? "text-red-200" : ""}`}>
                                {formatNumber(dailyDashboard?.data?.totalCash)}
                            </h1>
                        </div>
                        <div className="flex justify-between mb-1">
                            <h1 className="text-xs">Voucher</h1>
                            <h1 className="text-xs font-bold text-end">{formatNumber(dailyDashboard?.data?.totalVoucher?.total)}</h1>
                        </div>
                        <div className="flex justify-between mb-1">
                            <h1 className="text-xs">Accessories</h1>
                            <h1 className="text-xs font-bold text-end">{formatNumber(dailyDashboard?.data?.totalAccessories?.total)}</h1>
                        </div>
                        <div className="flex justify-between mb-1">
                            <h1 className="text-xs">Deposit</h1>
                            <h1 className="text-xs font-bold text-end">{formatNumber(dailyDashboard?.data?.totalCashDeposit?.total)}</h1>
                        </div>
                        <div className="flex justify-between mb-1">
                            <h1 className="text-xs">Koreksi</h1>
                            <h1 className="text-xs font-bold text-yellow-500 dark:text-yellow-200 text-end">
                                {formatNumber(dailyDashboard?.data?.totalCorrection ?? 0)}
                            </h1>
                        </div>
                        <hr className="border border-slate-500/50 dark:border-slate-300/50 border-dashed" />
                        <div className="flex justify-between mt-1 mb-4">
                            <h1 className="text-xs font-bold">Pendapatan</h1>
                            <h1 className="text-xs font-bold text-end text-teal-500 dark:text-teal-300">
                                {formatNumber(
                                    dailyDashboard?.data?.totalCash +
                                        dailyDashboard?.data?.totalCashDeposit?.total +
                                        dailyDashboard?.data?.totalAccessories?.total +
                                        dailyDashboard?.data?.totalVoucher?.total,
                                )}
                            </h1>
                        </div>
                        <div className="flex justify-between mb-1">
                            <h1 className="text-xs">Fee Admin</h1>
                            <h1 className="text-xs font-bold text-end">{formatNumber(dailyDashboard?.data?.totalFee ?? 0)}</h1>
                        </div>
                        <div className="flex justify-between mb-1">
                            <h1 className="text-xs">Biaya</h1>
                            <h1 className="text-xs font-bold text-red-400 dark:text-red-200 text-end">
                                {formatNumber(dailyDashboard?.data?.totalExpense ?? 0)}
                            </h1>
                        </div>
                        <hr className="border border-slate-500/50 dark:border-slate-300/50 border-dashed" />
                        <div className="flex justify-between mt-1 mb-4">
                            <h1 className="text-xs font-bold">Profit (Laba)</h1>
                            <h1 className="text-xs font-bold text-end text-teal-500 dark:text-teal-300">{formatNumber(dailyDashboard?.data?.profit)}</h1>
                        </div>
                        <div className="flex justify-between mt-1 mb-4">
                            <h1 className="text-xs font-bold">Total Pendapatan</h1>
                            <h1 className="text-xs font-bold text-end text-teal-500 dark:text-teal-300">
                                {formatNumber(
                                    dailyDashboard?.data?.totalFee +
                                        dailyDashboard?.data?.totalCash +
                                        dailyDashboard?.data?.totalCashDeposit?.total +
                                        dailyDashboard?.data?.totalAccessories?.total +
                                        dailyDashboard?.data?.totalVoucher?.total +
                                        dailyDashboard?.data?.totalExpense,
                                )}
                            </h1>
                        </div>

                        <div className="p-2 border border-slate-500/50 dark:border-slate-300/50 border-dashed rounded-xl">
                            <h1 className="text-xs font-bold">Total Uang Disetor</h1>

                            <h1 className="text-xs text-end text-red-400">
                                {dailyDashboard?.data?.totalCash < openingCash && (
                                    <div className="flex items-center text-red-400 text-xs">
                                        <CircleAlertIcon className="w-3 h-3 mr-1" />
                                        <span>Kas kurang dari uang awal</span>
                                    </div>
                                )}
                            </h1>
                            <h1 className="text-xs text-end text-red-400">
                                {formatNumber(openingCash > 0 && dailyDashboard?.data?.totalCash > openingCash ? -openingCash : 0)}
                            </h1>
                            <h1 className="text-lg font-bold text-end text-teal-500 dark:text-teal-300">
                                {formatNumber(dailyDashboard?.data?.totalCash > openingCash ? totalSetoran - openingCash : totalSetoran)}
                            </h1>
                        </div>
                    </div>
                </div>
                <button
                    hidden={!showBalanceReport}
                    className="w-full flex justify-center items-center py-1 text-slate-500 dark:text-slate-400 text-xs"
                    onClick={() => setShowAllAccounts(!showAllAccounts)}
                >
                    {showAllAccounts ? "Show less" : "Show more"}
                    <ChevronDown size={14} className={`${showAllAccounts ? "rotate-180" : ""} transition delay-500 ease-in-out`} />
                </button>
            </div>
            <div
                className={`fixed z-100000 top-0 left-0 w-screen ${showCloseStore ? "h-screen" : "h-0 overflow-hidden"} bg-black/80 backdrop-blur-sm flex flex-col gap-6 justify-center items-center transition-all duration-500 ease-in-out`}
            >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <div className="flex flex-col justify-between text-white border border-slate-500 p-4 rounded-2xl sm:col-span-2">
                        <h1 className="text-sm font-bold">{warehouseName}</h1>
                        <table className="w-full border-b border-slate-500 text-sm">
                            <tbody>
                                <tr>
                                    <td className="p-1">Total Pendapatan</td>
                                    <td className="text-end font-bold">{formatNumber(totalSetoran)}</td>
                                </tr>
                                <tr>
                                    <td className="p-1">Kas Awal</td>
                                    <td className="text-end font-bold">{formatNumber(openingCash)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <h1 className="text-sm font-bold mt-5">Total Uang Disetor</h1>
                        <h1 className="text-xl font-semibold text-end text-yellow-300 dark:text-yellow-500">
                            {formatRupiah(dailyDashboard?.data?.totalCash > openingCash ? totalSetoran - openingCash : totalSetoran)}
                        </h1>

                        {isClosingComplete ? (
                            <span className="text-xs text-slate-300 py-2 flex items-center gap-1">
                                Setoran selesai <Check size={14} className="text-green-500" />
                            </span>
                        ) : (
                            <button
                                type="button"
                                className={`py-2 px-4 bg-amber-500 rounded-lg disabled:bg-slate-500 hover:bg-amber-400 mt-4`}
                                onClick={() => handleClosing()}
                                disabled={totalSetoran < openingCash || loading || isClosingComplete}
                            >
                                {loading ? statusText : "Setorkan Kas"}
                            </button>
                        )}
                    </div>
                </div>
                <button type="button" className={`p-4 bg-red-500 rounded-full`} onClick={() => setShowCloseStore(false)}>
                    <X size={20} />
                </button>
            </div>
        </>
    );
};

export default CashBankBalance;
