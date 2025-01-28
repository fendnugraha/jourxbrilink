"use client";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";

const ExpenseTable = ({ data }) => {
    const [expenses, setExpenses] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);
    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-expenses`);
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
    }, []);

    const totalExpense = expenses.reduce((total, expense) => {
        return total + Number(expense.fee_amount);
    }, 0);
    return (
        <div className="my-4 flex gap-4">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl w-3/4">
                <h1 className="px-6 pt-6 font-bold text-xl text-red-600">Pengeluaran (Biaya Operasional)</h1>
                <table className="table w-full mb-4">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody key={data}>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id}>
                                    <td>{expense.description}</td>
                                    <td>{expense.debt.acc_name}</td>
                                    <td>{formatNumber(-expense.fee_amount)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-sky-700 text-white overflow-hidden shadow-sm sm:rounded-2xl flex-1 flex flex-col justify-center items-center">
                <h1>Expense Total</h1>
                <h1 className="text-4xl font-bold">{formatNumber(-totalExpense)}</h1>
            </div>
        </div>
    );
};

export default ExpenseTable;
