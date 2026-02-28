"use client";
import Dropdown from "@/components/Dropdown";
import Modal from "@/components/Modal";
import axios from "@/libs/axios";
import { formatDateTime, formatRupiah } from "@/libs/format";
import formatNumber from "@/libs/formatNumber";
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

const CashBankBalance = ({ accountBalance, dailyDashboard, isLoading, isValidating, mutateCashBankBalance, user }) => {
    const summarizeBalance = accountBalance?.data?.chartOfAccounts?.reduce((total, account) => total + account.balance, 0);
    const [showBalanceReport, setShowBalanceReport] = useState(true);
    const [showCashBankBalance, setShowCashBankBalance] = useState(true);
    const [showDailyReport, setShowDailyReport] = useState(false);
    const [isModalSettingInitBalancesOpen, setIsModalSettingInitBalancesOpen] = useState(false);
    const [initBalances, setInitBalances] = useState({});
    const [loaded, setLoaded] = useState(false);
    const [limits, setLimits] = useState({});
    const warehouse = Number(user?.role?.warehouse_id);
    const warehouseName = user?.role?.warehouse?.name;
    const warehouseCashId = Number(user?.role?.warehouse?.chart_of_account_id);
    const [isCopied, setIsCopied] = useState(false);
    const [openingCash, setOpeningCash] = useState(0);

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
            { name: "Koreksi", value: formatNumber(dailyDashboard?.data?.totalCorrection ?? 0) },
            { name: "Acc", value: formatNumber(dailyDashboard?.data?.totalAccessories?.total) },
            { name: "Laba", value: formatNumber(dailyDashboard?.data?.profit) },
        ];

        const lines = dailyReportData.map(({ name, value }) => `${name}: ${value}`);

        return `${formatDateTime(getCurrentDate())}\nReport ${warehouseName}:\n\n${lines.join("\n")}\n\nTotal Setoran: ${formatNumber(
            dailyDashboard?.data?.totalCash > openingCash ? totalSetoran - openingCash : totalSetoran,
        )}`;
    };
    const limitSummary = accountBalance?.data?.chartOfAccounts?.reduce((total, account) => total + Number(account.limit?.limit_amount), 0);
    return (
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
                <div className="flex justify-center items-center bg-slate-200 dark:bg-slate-600 flex-col backdrop-blur-sm rounded-2xl py-4 text-white shadow-lg">
                    {accountBalance?.data?.chartOfAccounts?.length > 0 ? (
                        <>
                            <h1 className="text-xs text-slate-600 dark:text-white">Total Saldo</h1>
                            <h1 className="text-2xl text-slate-600 dark:text-white font-black">{formatRupiah(summarizeBalance ?? 0)}</h1>
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
                className={`bg-slate-200 dark:bg-black/40 backdrop-blur-sm rounded-3xl transform ${
                    showBalanceReport ? "opacity-100 scale-y-100 max-h-[700px]" : "opacity-0 scale-y-0 max-h-0 "
                } origin-top transition-all duration-300 ease-in-out`}
            >
                <div hidden={!showCashBankBalance} className="max-h-[calc(60px*7)] mt-2 overflow-y-scroll">
                    {accountBalance?.data?.chartOfAccounts?.map((account) => (
                        <div
                            className="group px-4 py-2 border-b border-slate-300 dark:border-slate-700 first:mt-1 last:border-b-0 rounded-3xl"
                            key={account.id}
                        >
                            <div className="flex justify-between items-center">
                                <h1 className="text-xs group-hover:text-base text-nowrap text-slate-600 dark:text-slate-400 font-bold transition-all delay-100 duration-150 ease-out">
                                    {account.account_group}
                                </h1>

                                <div className="flex flex-col items-end justify-between">
                                    <h1 className="group-hover:scale-105 text-sm text-slate-700 dark:text-lime-400 font-bold transition delay-100 duration-150 ease-out">
                                        {formatNumber(account.balance)}
                                    </h1>
                                    {account.balance - account.limit?.limit_amount !== 0 && (
                                        <h2
                                            className={`text-xs ${
                                                account.balance - account.limit?.limit_amount > 0
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-red-600 dark:text-red-400"
                                            } group-hover:scale-105 transition delay-100 duration-150 ease-out`}
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
                            <button
                                className="cursor-pointer text-slate-600 dark:text-slate-100 hover:scale-110 transition-transform duration-75"
                                onClick={() => copyData()}
                            >
                                <CopyIcon className={`w-5 h-5 ${isCopied ? "text-green-500" : ""}`} />
                            </button>
                            <button
                                className="cursor-pointer text-slate-600 dark:text-slate-100 hover:scale-110 transition-transform duration-75"
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
                        <h1 className="text-xs font-bold text-red-400 dark:text-red-200 text-end">{formatNumber(dailyDashboard?.data?.totalExpense ?? 0)}</h1>
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
        </div>
    );
};

export default CashBankBalance;
