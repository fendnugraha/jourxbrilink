"use client";
import formatNumber from "@/libs/formatNumber";
import axios from "@/libs/axios";
import useSWR, { mutate } from "swr";
import { useState, useEffect } from "react";
import { CableIcon, FilterIcon, GemIcon, LoaderIcon, RefreshCcwIcon, SmartphoneIcon, TicketIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import { useGetDailyDashboard } from "@/libs/getDailyDashboard";
import { formatNumberToK } from "@/libs/formatNumberToK";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const DailyDashboard = ({ notification, warehouse, warehouses, userRole }) => {
    const [filterData, setFilterData] = useState({
        startDate: getCurrentDate(),
        endDate: getCurrentDate(),
    });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const { dailyDashboard, loading: isLoading, error: dailyDashboardError } = useGetDailyDashboard(selectedWarehouse, startDate, endDate);

    const handleFilterData = () => {
        setStartDate(filterData.startDate);
        setEndDate(filterData.endDate);
        setIsModalFilterDataOpen(false);
    };

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    useEffect(() => {
        mutate(["/api/daily-dashboard", { warehouse, startDate, endDate }]);
    }, [selectedWarehouse, startDate, endDate]);

    return (
        <div className="h-auto sm:h-[calc(100vh-80px-64px)] mb-12 flex flex-col bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-4xl overflow-y-auto">
            <div className="flex items-start justify-between flex-col sm:flex-row gap-2 mb-2">
                <h1 className="font-bold text-xl text-slate-600 dark:text-white">
                    {selectedWarehouse === "all"
                        ? "Semua Cabang"
                        : warehouses?.data?.find((warehouse) => Number(warehouse.id) === Number(selectedWarehouse))?.name}
                    <span className="text-xs block font-normal text-nowrap">
                        Periode: {startDate} s/d {endDate}
                    </span>
                </h1>
                <div className="mb-2 flex justify-end gap-2 w-full sm:w-1/2">
                    {["Administrator", "Super Admin"].includes(userRole) && (
                        <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} className="form-select block w-full p-2.5">
                            <option value="all">Semua Cabang</option>
                            {warehouses?.data?.map((warehouse) => (
                                <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <button onClick={() => setIsModalFilterDataOpen(true)} className="small-button">
                        <FilterIcon className="size-4" />
                    </button>
                </div>
                <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                    <div className="mb-4">
                        <Label className="font-bold">Tanggal</Label>
                        <Input
                            type="date"
                            value={filterData.startDate}
                            onChange={(e) => setFilterData({ ...filterData, startDate: e.target.value })}
                            className="form-control"
                        />
                    </div>
                    <div className="mb-4">
                        <Label className="font-bold">s/d</Label>
                        <Input
                            type="date"
                            value={filterData.endDate}
                            onChange={(e) => setFilterData({ ...filterData, endDate: e.target.value })}
                            className="form-control"
                        />
                    </div>
                    <button
                        onClick={() => {
                            // mutate(`/api/daily-dashboard/${selectedWarehouse}/${startDate}/${endDate}`);
                            // setIsModalFilterDataOpen(false);
                            handleFilterData();
                        }}
                        className="btn-primary"
                    >
                        Submit
                    </button>
                </Modal>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 grid-row-1 sm:grid-rows-4 gap-4 flex-grow h-full">
                <div className="bg-lime-200/80 dark:bg-lime-200 text-green-900 p-3 sm:p-5 rounded-2xl sm:rounded-3xl drop-shadow-xs flex flex-col gap-2 sm:gap-4 items-start justify-between col-span-1 sm:col-span-2 row-span-1 sm:row-span-2">
                    <div className={`flex flex-col`}>
                        <h4 className="text-lg">Kas Tunai</h4>
                        <h1 className="text-2xl sm:text-4xl font-bold text-lime-700">
                            {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(Number(dailyDashboard?.data?.totalCash))}
                        </h1>
                    </div>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full`}>
                        <div className={`flex flex-col justify-between w-full bg-white/50 dark:bg-white/60 p-2 rounded-2xl`}>
                            <h4 className="text-sm">Bank</h4>
                            <h1 className="text-lg sm:text-xl font-semibold text-slate-500">
                                {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(Number(dailyDashboard?.data?.totalBank))}
                            </h1>
                        </div>
                        <div className={`flex flex-col justify-between w-full bg-white/50 dark:bg-white/60 p-2 rounded-2xl`}>
                            <h4 className="text-sm">Total Uang</h4>
                            <h1 className="text-lg sm:text-xl font-semibold text-slate-500">
                                {isLoading ? (
                                    <LoaderIcon className="animate-spin" />
                                ) : (
                                    formatNumber(Number(dailyDashboard?.data?.totalBank + dailyDashboard?.data?.totalCash))
                                )}
                            </h1>
                        </div>
                    </div>
                </div>
                <div className="bg-teal-200/80 dark:bg-teal-200 text-green-900 p-3 sm:p-5 rounded-2xl sm:rounded-3xl drop-shadow-xs flex flex-col gap-2 sm:gap-4 items-start justify-between col-span-1 sm:col-span-2 row-span-auto sm:row-span-2 col-start-1 sm:col-start-3">
                    {" "}
                    <div className={`flex flex-col`}>
                        <h4 className="text-lg">
                            <GemIcon size={20} className="inline" /> Laba (Net Profit)
                        </h4>
                        <h1 className="text-2xl sm:text-4xl font-bold text-slate-500 dark:text-teal-700">
                            {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(Number(dailyDashboard?.data?.profit))}
                        </h1>
                    </div>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full`}>
                        <div className={`flex flex-col justify-between w-full bg-white/50 dark:bg-white/60 p-2 rounded-2xl`}>
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm text-nowrap overflow-hidden">Tranfer Uang</h4>
                                <h4 className="text-sm font-semibold px-2 py-0.5 bg-teal-200/40 dark:bg-slate-500 text-slate-500 dark:text-white rounded-full">
                                    {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(Number(dailyDashboard?.data?.totalTransfer?.count))}
                                </h4>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-slate-500">
                                {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumberToK(Number(dailyDashboard?.data?.totalTransfer?.total))}
                            </h1>
                        </div>
                        <div className={`flex flex-col justify-between w-full bg-white/50 dark:bg-white/60 p-2 rounded-2xl`}>
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm text-nowrap">Tarik Tunai</h4>
                                <h4 className="text-sm font-semibold px-2 py-0.5 bg-teal-200/40 dark:bg-slate-500 text-slate-500 dark:text-white rounded-full">
                                    {isLoading ? (
                                        <LoaderIcon className="animate-spin" />
                                    ) : (
                                        formatNumber(Number(dailyDashboard?.data?.totalCashWithdrawal?.count))
                                    )}
                                </h4>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-slate-500">
                                {isLoading ? (
                                    <LoaderIcon className="animate-spin" />
                                ) : (
                                    formatNumberToK(Number(dailyDashboard?.data?.totalCashWithdrawal?.total))
                                )}
                            </h1>
                        </div>
                    </div>
                </div>
                <div className="col-start-1 sm:col-start-5 row-span-4 rounded-2xl flex flex-col justify-between items-center">
                    <div className="bg-violet-200 sm:rounded-3xl drop-shadow-xs p-3 flex flex-col justify-center items-center w-full">
                        <h1 className="text-xl sm:text-2xl font-bold text-violet-500">
                            {isLoading ? (
                                <LoaderIcon className="animate-spin" />
                            ) : (
                                formatNumber(
                                    dailyDashboard?.data?.totalCashDeposit?.total +
                                        dailyDashboard?.data?.profit +
                                        dailyDashboard?.data?.totalCash +
                                        dailyDashboard?.data?.totalVoucher?.total +
                                        dailyDashboard?.data?.totalAccessories?.total
                                )
                            )}
                        </h1>
                        <h1 className="text-slate-500">Total Setoran</h1>
                    </div>
                    <div className="bg-orange-200 rounded-2xl sm:rounded-3xl drop-shadow-xs p-3 flex flex-col justify-center items-center w-full">
                        {" "}
                        <h1 className="text-xl sm:text-2xl font-bold text-orange-500">
                            {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(dailyDashboard?.data?.totalFee)}
                        </h1>
                        <h1 className="text-slate-500">Fee (Admin)</h1>
                    </div>
                    <div className="bg-green-200 rounded-2xl sm:rounded-3xl drop-shadow-xs p-3 flex flex-col justify-center items-center w-full">
                        {" "}
                        <h1 className="text-xl sm:text-2xl font-bold text-green-500">
                            {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(dailyDashboard?.data?.totalBankFee)}
                        </h1>
                        <h1 className="text-slate-500">Fee/Bunga Bank</h1>
                    </div>
                    <div className="w-full bg-red-200 rounded-2xl sm:rounded-3xl drop-shadow-xs p-3 flex flex-col justify-center items-center">
                        {" "}
                        <h1 className="text-xl sm:text-2xl font-bold text-red-500">
                            {isLoading ? (
                                <LoaderIcon className="animate-spin" />
                            ) : (
                                formatNumber(dailyDashboard?.data?.totalExpense < 0 ? dailyDashboard?.data?.totalExpense * -1 : 0)
                            )}
                        </h1>
                        <h1 className="text-slate-500">Biaya</h1>
                    </div>
                    <div className="w-full bg-blue-200 rounded-2xl sm:rounded-3xl drop-shadow-xs p-3 flex flex-col justify-center items-center">
                        {" "}
                        <h1 className="text-xl sm:text-2xl font-bold text-blue-500">
                            {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(dailyDashboard?.data?.salesCount)}
                        </h1>
                        <h1 className="text-slate-500">Transaksi</h1>
                    </div>
                </div>
                {/* <div className="col-start-1 sm:col-start-5 row-start-auto sm:row-start-2 bg-orange-200 rounded-2xl sm:rounded-3xl drop-shadow-xs p-3 sm:p-5 flex flex-col justify-center items-center">
                    {" "}
                    <h1 className="text-xl sm:text-2xl font-bold text-orange-500">
                        {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(dailyDashboard?.data?.totalFee)}
                    </h1>
                    <h1 className="text-slate-500">Fee (Admin)</h1>
                </div>
                <div className="col-start-1 sm:col-start-5 row-start-auto sm:row-start-3 bg-red-200 rounded-2xl sm:rounded-3xl drop-shadow-xs p-3 sm:p-5 flex flex-col justify-center items-center">
                    {" "}
                    <h1 className="text-xl sm:text-2xl font-bold text-red-500">
                        {isLoading ? (
                            <LoaderIcon className="animate-spin" />
                        ) : (
                            formatNumber(dailyDashboard?.data?.totalExpense < 0 ? dailyDashboard?.data?.totalExpense * -1 : 0)
                        )}
                    </h1>
                    <h1 className="text-slate-500">Biaya</h1>
                </div>
                <div className="col-start-1 sm:col-start-5 row-start-auto sm:row-start-4 bg-blue-200 rounded-2xl sm:rounded-3xl drop-shadow-xs p-3 sm:p-5 flex flex-col justify-center items-center">
                    {" "}
                    <h1 className="text-xl sm:text-2xl font-bold text-blue-500">
                        {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(dailyDashboard?.data?.salesCount)}
                    </h1>
                    <h1 className="text-slate-500">Transaksi</h1>
                </div> */}

                <div className="col-span-1 sm:col-span-4 row-span-1 sm:row-span-2 col-start-1 row-start-auto sm:row-start-3 flex flex-col sm:flex-row gap-4 items-center justify-between w-full h-full">
                    <div className="bg-slate-200 dark:bg-yellow-100 w-full h-full rounded-2xl sm:rounded-3xl drop-shadow-xs p-3 sm:p-5 flex flex-col justify-between">
                        <div>
                            <h1 className="text-lg text-slate-500">Voucher & SP</h1>
                            <TicketIcon size={50} strokeWidth={1.5} className="text-slate-500" />
                        </div>
                        <div>
                            <h1 className="text-sm bg-slate-500/50 px-2 rounded-full w-fit font-semibold text-white">
                                {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(Number(dailyDashboard?.data?.totalVoucher?.count))}
                            </h1>
                            <h1 className="text-2xl sm:text-4xl font-bold text-slate-500">
                                {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(Number(dailyDashboard?.data?.totalVoucher?.total))}
                            </h1>
                        </div>
                    </div>
                    <div className="bg-slate-200 dark:bg-yellow-100 w-full h-full rounded-2xl sm:rounded-3xl drop-shadow-xs p-3 sm:p-5 flex flex-col justify-between">
                        <div>
                            <h1 className="text-lg text-slate-500">Accessories</h1>
                            <CableIcon size={50} strokeWidth={1.5} className="text-slate-500" />
                        </div>
                        <div>
                            <h1 className="text-sm bg-slate-500/50 px-2 rounded-full w-fit font-semibold text-white">
                                {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(Number(dailyDashboard?.data?.totalAccessories?.count))}
                            </h1>
                            <h1 className="text-2xl sm:text-4xl font-bold text-slate-500">
                                {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(Number(dailyDashboard?.data?.totalAccessories?.total))}
                            </h1>
                        </div>
                    </div>
                    <div className="bg-slate-200 dark:bg-yellow-100 w-full h-full rounded-2xl sm:rounded-3xl drop-shadow-xs p-3 sm:p-5 flex flex-col justify-between">
                        <div>
                            {" "}
                            <h1 className="text-lg text-slate-500">Deposit (Pulsa, Token, Dll)</h1>
                            <SmartphoneIcon size={50} strokeWidth={1.5} className="text-slate-500" />
                        </div>
                        <div>
                            <h1 className="text-sm bg-slate-500/50 px-2 rounded-full w-fit font-semibold text-white">
                                {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(Number(dailyDashboard?.data?.totalCashDeposit?.count))}
                            </h1>
                            <h1 className="text-2xl sm:text-4xl font-bold text-slate-500">
                                {isLoading ? <LoaderIcon className="animate-spin" /> : formatNumber(Number(dailyDashboard?.data?.totalCashDeposit?.total))}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyDashboard;
