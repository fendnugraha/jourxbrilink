"use client";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const VoucherSalesTable = ({ warehouse, warehouses }) => {
    const [transactions, setTransactions] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const fetchTransaction = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-trx-vcr/${selectedWarehouse}/${startDate}/${endDate}`);
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
    }, [selectedWarehouse]);

    const totalCost = transactions?.reduce((total, transaction) => {
        return total + Number(transaction.total_cost);
    }, 0);
    return (
        <div className="my-4 flex gap-4">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl w-3/4">
                <h1 className="px-6 pt-6 font-bold text-xl text-blue-600">Total Penjualan Voucher & SP</h1>
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
                                    <td className="text-center">{formatNumber(-transaction.quantity)}</td>
                                    <td className="text-end">{formatNumber(-transaction.total_price)}</td>
                                    <td className="text-end">{formatNumber(-transaction.total_cost)}</td>
                                    <td className="text-end">{formatNumber(-Number(transaction.total_price - transaction.total_cost))}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-sky-700 text-white overflow-hidden shadow-sm sm:rounded-2xl flex-1 flex flex-col justify-center items-center">
                <h1>Cost Total</h1>
                <h1 className="text-4xl font-bold">{formatNumber(totalCost < 0 ? totalCost * -1 : 0)}</h1>
            </div>
        </div>
    );
};

export default VoucherSalesTable;
