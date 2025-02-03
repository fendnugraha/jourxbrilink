"use client";
import formatNumber from "@/libs/formatNumber";
import axios from "@/libs/axios";
import { useState, useEffect } from "react";
import { FilterIcon, LoaderIcon, RefreshCcwIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const DailyDashboard = ({ notification, warehouse, warehouses }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    const getDailyDashboard = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/daily-dashboard/${selectedWarehouse}/${startDate}/${endDate}`);
            setData(response.data.data);
            localStorage.setItem("dailyDashboard", JSON.stringify(response.data.data));
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDailyDashboard();
    }, [selectedWarehouse]);
    return (
        <div className="relative">
            <div className="w-1/2 mb-2 flex gap-2">
                <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                    {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => setIsModalFilterDataOpen(true)}
                    className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                >
                    <FilterIcon className="size-4" />
                </button>
                <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                    <div className="mb-4">
                        <Label className="font-bold">Tanggal</Label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div className="mb-4">
                        <Label className="font-bold">s/d</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <button
                        onClick={() => {
                            fetchTransaction();
                            setIsModalFilterDataOpen(false);
                        }}
                        className="btn-primary"
                    >
                        Submit
                    </button>
                </Modal>
            </div>
            <button className="absolute bottom-3 left-3 text-white hover:scale-110 transition-transform duration-75" onClick={getDailyDashboard}>
                <RefreshCcwIcon className="w-5 h-5" />
            </button>
            <div className="min-h-[28rem] grid grid-cols-1 sm:grid-cols-5 sm:grid-rows-4 gap-1 sm:gap-3">
                <div className="bg-gray-800 w-full h-full p-3 rounded-lg sm:rounded-3xl flex flex-col gap-6 items-center justify-center col-span-2 row-span-2">
                    <div className="flex gap-2 flex-col justify-center items-center">
                        <h4 className="text-md sm:text-xl font-bold text-white">Saldo Kas Tunai</h4>
                        <h1 className="text-2xl sm:text-4xl font-black text-yellow-300">
                            {loading ? <LoaderIcon className="animate-pulse" /> : formatNumber(data?.totalCash)}
                        </h1>
                    </div>
                    <div className="flex gap-2 w-full justify-evenly">
                        <div>
                            <h4 className="text-xs text-white">Saldo Bank</h4>
                            <h1 className="text-sm font-bold text-white">
                                {loading ? <LoaderIcon className="animate-pulse" /> : formatNumber(data?.totalBank)}
                            </h1>
                        </div>
                        <div>
                            <h4 className="text-xs text-yellow-400">Total Kas & Bank</h4>
                            <h1 className="text-sm font-bold text-white">
                                {loading ? <LoaderIcon className="animate-pulse" /> : formatNumber(data?.totalCash + data?.totalBank)}
                            </h1>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800 w-full h-full p-3 rounded-lg sm:rounded-3xl flex flex-col gap-2 items-center justify-center col-span-2 row-span-2">
                    <div className="flex gap-5 justify-between flex-col items-center">
                        <div className="flex gap-2 flex-col justify-center items-center">
                            <h4 className="text-md sm:text-lg font-bold text-white">Voucher & SP</h4>
                            <h1 className="text-2xl sm:text-3xl font-black text-yellow-300">
                                {loading ? <LoaderIcon className="animate-pulse" /> : formatNumber(data?.totalVoucher)}
                            </h1>
                        </div>
                        {data?.totalAccessories > 0 && (
                            <div className="flex gap-2 flex-col justify-center items-center">
                                <h4 className="text-md sm:text-lg font-bold text-white">Accessories</h4>
                                <h1 className="text-2xl sm:text-3xl font-black text-yellow-300">
                                    {loading ? <LoaderIcon className="animate-pulse" /> : formatNumber(data?.totalAccessories)}
                                </h1>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-violet-700 rounded-lg sm:rounded-3xl w-full h-full p-3 flex flex-col gap-1 items-center justify-center">
                    <h4 className="text-md sm:text-xl text-white">Total Setoran</h4>
                    <h1 className="text-2xl font-extrabold text-white">
                        {loading ? (
                            <LoaderIcon className="animate-pulse" />
                        ) : (
                            formatNumber(data?.totalCashDeposit + data?.profit + data?.totalCash + data?.totalVoucher + data?.totalAccessories)
                        )}
                    </h1>
                </div>
                <div className="bg-orange-500 rounded-lg sm:rounded-3xl w-full h-full p-3 flex flex-col gap-1 items-center justify-center">
                    <h4 className="text-md sm:text-xl text-white">Fee (Admin)</h4>
                    <h1 className="text-2xl font-extrabold text-white">{loading ? <LoaderIcon className="animate-pulse" /> : formatNumber(data?.totalFee)}</h1>
                </div>
                <div className="bg-gray-800 w-full h-full p-3 rounded-lg sm:rounded-3xl flex flex-col gap-4 sm:gap-6 items-center justify-center col-span-2 row-span-2">
                    <div className="flex gap-2 flex-col justify-center items-center">
                        <h4 className="text-md sm:text-xl font-bold text-white">Laba (Profit)</h4>
                        <h1 className="text-2xl sm:text-4xl font-black text-yellow-300">
                            {loading ? <LoaderIcon className="animate-pulse" /> : formatNumber(data?.profit)}
                        </h1>
                    </div>
                    <div className="flex gap-2 w-full justify-evenly">
                        <div>
                            <h4 className="text-xs text-white">Transfer Uang</h4>
                            <h1 className="text-sm font-bold text-white">
                                {loading ? <LoaderIcon className="animate-pulse" /> : formatNumber(data?.totalTransfer)}
                            </h1>
                        </div>
                        <div>
                            <h4 className="text-xs text-white">Tarik Tunai</h4>
                            <h1 className="text-sm font-bold text-white">
                                {loading ? <LoaderIcon className="animate-pulse" /> : formatNumber(data?.totalCashWithdrawal)}
                            </h1>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800 w-full h-full p-3 rounded-lg sm:rounded-3xl flex flex-col gap-2 items-center justify-center col-span-2 row-span-2">
                    <h4 className="text-md sm:text-xl font-bold text-white">Deposit</h4>
                    <h1 className="text-2xl sm:text-4xl font-black text-yellow-300">
                        {loading ? <LoaderIcon className="animate-pulse" /> : formatNumber(data?.totalCashDeposit)}
                    </h1>
                </div>
                <div className="bg-red-600 rounded-lg sm:rounded-3xl w-full h-full p-3 flex flex-col gap-1 items-center justify-center">
                    <h4 className="text-md sm:text-xl text-white">Biaya</h4>
                    <h1 className="text-2xl font-extrabold text-white">
                        {loading ? <LoaderIcon className="animate-pulse" /> : formatNumber(data?.totalExpense < 0 ? data?.totalExpense * -1 : 0)}
                    </h1>
                </div>
                <div className="bg-gray-700 rounded-lg sm:rounded-3xl w-full h-full p-3 flex flex-col gap-1 items-center justify-center">
                    <h4 className="text-md sm:text-xl text-white">Transaksi</h4>
                    <h1 className="text-2xl font-extrabold text-white">
                        {loading ? <LoaderIcon className="animate-pulse" /> : formatNumber(data?.salesCount)}
                    </h1>
                </div>
            </div>
            {/* <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm h-full w-full flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner animate-spin text-white text-3xl"></i>
                    <p className="text-white text-sm font-bold">Loading data, please wait...</p>
                </div>
            </div> */}
        </div>
    );
};

export default DailyDashboard;
