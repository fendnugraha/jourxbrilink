"use client";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import { FilterIcon, RefreshCcwIcon } from "lucide-react";
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

const ExpenseTable = ({ warehouse, warehouses, userRole }) => {
    const [expenses, setExpenses] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };
    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-expenses/${selectedWarehouse}/${startDate}/${endDate}`);
            setExpenses(response.data.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [selectedWarehouse]);

    const totalExpense = expenses.reduce((total, expense) => {
        return total + Number(expense.fee_amount);
    }, 0);
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-6">
                <h1 className="font-bold text-xl text-red-600 dark:text-red-400">
                    Pengeluaran (Biaya Operasional)
                    <span className="text-xs block font-normal">
                        Periode: {startDate} - {endDate}
                    </span>
                </h1>
                <div className="flex justify-between gap-1 flex-col sm:flex-row flex-nowrap h-fit">
                    {["Administrator", "Super Admin"].includes(userRole) && (
                        <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} className="form-select">
                            <option value="all">Semua Cabang</option>
                            {warehouses?.data?.map((warehouse) => (
                                <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <div className="flex gap-1">
                        <button onClick={fetchExpenses} className="small-button">
                            <RefreshCcwIcon className="size-4" />
                        </button>
                        <button onClick={() => setIsModalFilterDataOpen(true)} className="small-button">
                            <FilterIcon className="size-4" />
                        </button>
                    </div>
                    <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                        <div className="mb-4">
                            <Label className="font-bold">Tanggal</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control" />
                        </div>
                        <div className="mb-4">
                            <Label className="font-bold">s/d</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control" />
                        </div>
                        <button
                            onClick={() => {
                                fetchExpenses();
                                setIsModalFilterDataOpen(false);
                            }}
                            className="btn-primary"
                        >
                            Submit
                        </button>
                    </Modal>
                </div>
            </div>
            <div className="flex gap-4 sm:flex-row flex-col">
                <div className="card overflow-hidden drop-shadow-sm wfull sm:w-3/4">
                    <div className="overflow-x-auto">
                        <table className="table w-full text-xs">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="text-center">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center">
                                            Tidak ada pengeluaran
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map((expense) => (
                                        <tr key={expense.id}>
                                            <td>
                                                <span className="text-xs text-slate-500 dark:text-yellow-100 font-bold">
                                                    {formatDateTime(expense.date_issued)} {expense.cred?.acc_name}
                                                </span>
                                                <br />
                                                {expense.description}
                                            </td>
                                            <td className="text-right text-sm font-bold">{formatNumber(-expense.fee_amount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-red-500 text-white py-2 overflow-hidden drop-shadow-sm rounded-3xl flex-1 flex flex-col justify-center items-center">
                    <h1>Total Biaya</h1>
                    <h1 className="text-4xl font-bold">{formatNumber(totalExpense < 0 ? totalExpense * -1 : 0)}</h1>
                </div>
            </div>
        </>
    );
};

export default ExpenseTable;
