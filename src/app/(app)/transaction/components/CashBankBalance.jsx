"use client";
import Dropdown from "@/components/Dropdown";
import Modal from "@/components/Modal";
import formatNumber from "@/libs/formatNumber";
import { useGetDailyDashboard } from "@/libs/getDailyDashboard";
import { ChevronDown, CircleAlertIcon, CopyIcon, LoaderCircle, RefreshCcwIcon, ScanQrCodeIcon, SettingsIcon, XCircleIcon } from "lucide-react";
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

const CashBankBalance = ({ accountBalance, isValidating, user }) => {
    const summarizeBalance = accountBalance?.data?.chartOfAccounts?.reduce((total, account) => total + account.balance, 0);
    const [showBalanceReport, setShowBalanceReport] = useState(true);
    const [showCashBankBalance, setShowCashBankBalance] = useState(true);
    const [showDailyReport, setShowDailyReport] = useState(false);
    const [isModalSettingInitBalancesOpen, setIsModalSettingInitBalancesOpen] = useState(false);
    const [initBalances, setInitBalances] = useState({});
    const [loaded, setLoaded] = useState(false);

    // Load data saat pertama kali mount
    useEffect(() => {
        const stored = localStorage.getItem("initBalances");
        if (stored) {
            setInitBalances(JSON.parse(stored));
        }
        setLoaded(true);
    }, []);

    // Simpan data hanya setelah load selesai
    useEffect(() => {
        if (loaded) {
            localStorage.setItem("initBalances", JSON.stringify(initBalances));
        }
        setOpeningCash(initBalances[warehouseCashId]);
    }, [initBalances, loaded]);

    // Fungsi untuk update
    const addToInitBalances = (id, balance) => {
        setInitBalances((prevBalances) => ({
            ...prevBalances,
            [id]: balance,
        }));
    };

    const warehouse = Number(user?.role?.warehouse_id);
    const warehouseName = user?.role?.warehouse?.name;
    const warehouseCashId = Number(user?.role?.warehouse?.chart_of_account_id);
    const [isCopied, setIsCopied] = useState(false);
    const [openingCash, setOpeningCash] = useState(initBalances[warehouseCashId]);

    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());

    const { dailyDashboard, loading: isLoading, error: dailyDashboardError } = useGetDailyDashboard(warehouse, getCurrentDate(), getCurrentDate());

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
        setTimeout(() => setIsCopied(false), 3000);
    };

    const copyDailyReport = () => {
        const dailyReportData = [
            { name: "Kas", value: formatNumber(dailyDashboard?.data?.totalCash - openingCash) },
            { name: "Voucher", value: formatNumber(dailyDashboard?.data?.totalVoucher?.total) },
            { name: "Deposit", value: formatNumber(dailyDashboard?.data?.totalCashDeposit?.total) },
            { name: "Acc", value: formatNumber(dailyDashboard?.data?.totalAccessories?.total) },
            { name: "Laba", value: formatNumber(dailyDashboard?.data?.profit) },
        ];

        const lines = dailyReportData.map(({ name, value }) => `${name}: ${value}`);

        return `Report ${warehouseName}:\n\n${lines.join("\n")}\n\nTotal Setoran: ${formatNumber(
            dailyDashboard?.data?.totalCash > openingCash ? totalSetoran - openingCash : totalSetoran
        )}`;
    };

    return (
        <div className="relative hover:drop-shadow-sm">
            {isValidating && (
                <div className="absolute w-full h-full bg-white/10 backdrop-blur-[3px] flex justify-center items-center z-10 rounded-3xl">
                    <LoaderCircle size={60} className=" inline text-white animate-spin" />
                </div>
            )}
            <button onClick={() => setIsModalSettingInitBalancesOpen(true)} className="absolute top-2 right-4 cursor-pointer">
                <SettingsIcon className="w-4 h-4 inline text-white hover:rotate-90 transition-transform delay-150 duration-300" />
            </button>
            <Modal isOpen={isModalSettingInitBalancesOpen} onClose={closeModal} maxWidth={"max-w-lg"} modalTitle="Set Saldo Awal Kas & Bank">
                {accountBalance?.data?.chartOfAccounts?.map((account) => (
                    <div className="group p-2" key={account.id}>
                        <div className="grid grid-cols-2 gap-2">
                            <h1 className="text-xs">{account.acc_name}</h1>
                            <input
                                type="number"
                                className="bg-gray-100 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                value={initBalances[account.id] || ""}
                                onChange={(e) => addToInitBalances(account.id, Number(e.target.value))}
                            />
                        </div>
                    </div>
                ))}
            </Modal>
            <div className="flex justify-center items-center flex-col bg-gray-600 hover:bg-gray-500 py-4 rounded-t-3xl text-white shadow-lg">
                {accountBalance?.data?.chartOfAccounts?.length > 0 ? (
                    <>
                        <h1 className="text-xs">Total Saldo Kas & Bank</h1>
                        <h1 className="text-2xl text-yellow-200 font-black">{formatNumber(summarizeBalance ?? 0)}</h1>
                    </>
                ) : (
                    <span className="font-normal text-sm">Loading...</span>
                )}
            </div>
            <div
                className={`bg-gray-600/75 backdrop-blur-xs px-2 transform ${
                    showBalanceReport ? "opacity-100 scale-y-100 max-h-[700px]" : "opacity-0 scale-y-0 max-h-0 "
                } origin-top transition-all duration-300 ease-in-out`}
            >
                <div className="pt-2">
                    <div className="flex justify-between items-center text-white bg-slate-300 p-0.5 rounded-3xl">
                        <button
                            onClick={() => {
                                setShowCashBankBalance(true);
                                setShowDailyReport(false);
                            }}
                            className={`cursor-pointer hover:font-semibold text-center w-full rounded-xl p-0.5 text-sm ${
                                showCashBankBalance ? "bg-gray-600/70" : "text-slate-600"
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
                                showDailyReport ? "bg-gray-600/70" : "text-slate-600"
                            }`}
                        >
                            Report
                        </button>
                    </div>
                </div>
                <div hidden={!showCashBankBalance}>
                    {accountBalance?.data?.chartOfAccounts?.map((account) => (
                        <div className="group border-b border-slate-300 border-dashed last:border-none pt-2 pb-1" key={account.id}>
                            <div className="text-white">
                                <h1 className="text-xs">{account.acc_name}</h1>

                                <div className="flex justify-between items-center">
                                    <h1 className="text-sm sm:text-lg group-hover:scale-105 text-yellow-200 font-bold transition delay-100 duration-150 ease-out">
                                        {formatNumber(account.balance)}
                                    </h1>
                                    <h2
                                        className={`text-xs ${
                                            account.balance - initBalances[account.id] > 0 ? "text-green-200" : "text-red-200"
                                        } group-hover:scale-105 transition delay-100 duration-150 ease-out`}
                                        hidden={!initBalances[account.id]}
                                    >
                                        {formatNumber(account.balance - initBalances[account.id])}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div hidden={!showDailyReport} className="py-2 text-white">
                    <div className="flex justify-between items-start mb-2">
                        <Dropdown
                            trigger={
                                <button className="cursor-pointer hover:scale-110 transition-transform duration-75 outline-none" onClick={() => copyData()}>
                                    <ScanQrCodeIcon className={`w-5 h-5`} />
                                </button>
                            }
                            align="left"
                            width={"w-fit"}
                        >
                            <div className="p-4">
                                <QRCodeSVG value={copyDailyReport()} size={200} />
                            </div>
                        </Dropdown>
                        <div className="flex gap-1 items-center">
                            <button className="cursor-pointer text-slate-100 hover:scale-110 transition-transform duration-75" onClick={() => copyData()}>
                                <CopyIcon className={`w-5 h-5 ${isCopied ? "text-green-500" : ""}`} />
                            </button>
                            <button
                                className="cursor-pointer text-slate-100 hover:scale-110 transition-transform duration-75"
                                onClick={() => mutate(["/api/daily-dashboard", { warehouse, startDate, endDate }])}
                            >
                                <RefreshCcwIcon className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
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
                    <hr className="border border-slate-300/50 border-dashed" />
                    <div className="flex justify-between mt-1 mb-4">
                        <h1 className="text-xs font-bold">Pendapatan</h1>
                        <h1 className="text-xs font-bold text-end text-teal-300">
                            {formatNumber(
                                dailyDashboard?.data?.totalCash +
                                    dailyDashboard?.data?.totalCashDeposit?.total +
                                    dailyDashboard?.data?.totalAccessories?.total +
                                    dailyDashboard?.data?.totalVoucher?.total
                            )}
                        </h1>
                    </div>
                    <div className="flex justify-between mb-1">
                        <h1 className="text-xs">Fee Admin</h1>
                        <h1 className="text-xs font-bold text-end">{formatNumber(dailyDashboard?.data?.totalFee ?? 0)}</h1>
                    </div>
                    <div className="flex justify-between mb-1">
                        <h1 className="text-xs">Biaya</h1>
                        <h1 className="text-xs font-bold text-red-200 text-end">{formatNumber(dailyDashboard?.data?.totalExpense ?? 0)}</h1>
                    </div>
                    <hr className="border border-slate-300/50 border-dashed" />
                    <div className="flex justify-between mt-1 mb-4">
                        <h1 className="text-xs font-bold">Profit (Laba)</h1>
                        <h1 className="text-xs font-bold text-end text-teal-300">{formatNumber(dailyDashboard?.data?.profit)}</h1>
                    </div>
                    <div className="flex justify-between mt-1 mb-4">
                        <h1 className="text-xs font-bold">Total Pendapatan</h1>
                        <h1 className="text-xs font-bold text-end text-teal-300">
                            {formatNumber(
                                dailyDashboard?.data?.totalFee +
                                    dailyDashboard?.data?.totalCash +
                                    dailyDashboard?.data?.totalCashDeposit?.total +
                                    dailyDashboard?.data?.totalAccessories?.total +
                                    dailyDashboard?.data?.totalVoucher?.total +
                                    dailyDashboard?.data?.totalExpense
                            )}
                        </h1>
                    </div>

                    <div className="mb-4 p-2 border border-slate-300/50 rounded-xl">
                        <h1 className="text-xs font-bold">Total Uang Disetor</h1>

                        <h1 className="text-xs text-end text-red-400">
                            {dailyDashboard?.data?.totalCash < openingCash && (
                                <div className="flex items-center text-red-100 text-xs">
                                    <CircleAlertIcon className="w-3 h-3 mr-1" />
                                    <span>Kas kurang dari uang awal</span>
                                </div>
                            )}
                        </h1>
                        <h1 className="text-xs text-end text-red-200">
                            {formatNumber(openingCash > 0 && dailyDashboard?.data?.totalCash > openingCash ? -openingCash : 0)}
                        </h1>
                        <h1 className="text-lg font-bold text-end text-teal-300">
                            {formatNumber(dailyDashboard?.data?.totalCash > openingCash ? totalSetoran - openingCash : totalSetoran)}
                        </h1>
                    </div>
                </div>
            </div>
            <button
                onClick={() => setShowBalanceReport(!showBalanceReport)}
                className="bg-gray-400 hover:bg-gray-500 w-full pb-1 rounded-b-3xl shadow-md text-white disabled:bg-gray-100"
                disabled={accountBalance?.data?.length === 0}
            >
                <ChevronDown className={`w-4 h-4 inline ${showBalanceReport ? "rotate-180" : ""} transition delay-500 ease-in-out`} />
            </button>
        </div>
    );
};

export default CashBankBalance;
