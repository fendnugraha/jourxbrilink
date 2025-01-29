"use client";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";

const VoucherSalesTable = ({}) => {
    const [transactions, setTransactions] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);
    const fetchTransaction = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/transactions`);
            setTransactions(response.data.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransaction();
    }, []);

    const totalCost = transactions?.reduce((total, transaction) => {
        return total + Number(transaction.total_cost);
    }, 0);
    return (
        <div className="my-4 flex gap-4">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl w-3/4">
                <h1 className="px-6 pt-6 font-bold text-xl text-blue-600">Total Penjualan Voucher & SP</h1>
                <table className="table w-full mb-4 text-xs">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Jual</th>
                            <th>Modal</th>
                            <th>Laba</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : (
                            transactions?.map((transaction) => (
                                <tr key={transaction.product_id}>
                                    <td>{transaction.product.name}</td>
                                    <td>{formatNumber(-transaction.quantity)}</td>
                                    <td>{formatNumber(-transaction.total_price)}</td>
                                    <td>{formatNumber(-transaction.total_cost)}</td>
                                    <td>{formatNumber(-Number(transaction.total_price - transaction.total_cost))}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-sky-700 text-white overflow-hidden shadow-sm sm:rounded-2xl flex-1 flex flex-col justify-center items-center">
                <h1>Cost Total</h1>
                <h1 className="text-4xl font-bold">{formatNumber(-totalCost)}</h1>
            </div>
        </div>
    );
};

export default VoucherSalesTable;
