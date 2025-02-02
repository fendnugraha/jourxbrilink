"use client";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const ExpenseTable = ({ warehouse, warehouses }) => {
    const [expenses, setExpenses] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
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
        <div className="my-4 flex gap-4">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl w-3/4">
                <h1 className="px-6 pt-6 font-bold text-xl text-red-600">Pengeluaran (Biaya Operasional)</h1>
                <div className="px-6 pt-4">
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
                </div>
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Category</th>
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
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id}>
                                    <td>
                                        <span className="text-xs text-slate-500">{formatDateTime(expense.created_at)}</span>
                                        <br />
                                        {expense.description}
                                    </td>
                                    <td>{expense.debt.acc_name}</td>
                                    <td className="text-right">{formatNumber(-expense.fee_amount)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-red-500 text-white overflow-hidden shadow-sm sm:rounded-2xl flex-1 flex flex-col justify-center items-center">
                <h1>Expense Total</h1>
                <h1 className="text-4xl font-bold">{formatNumber(totalExpense < 0 ? totalExpense * -1 : 0)}</h1>
            </div>
        </div>
    );
};

export default ExpenseTable;
