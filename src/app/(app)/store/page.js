"use client";
import Notification from "@/components/notification";
import Header from "../Header";
import { useEffect, useState } from "react";
import { ArrowBigDown, ArrowBigUp, PlusCircleIcon, XCircleIcon } from "lucide-react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import Link from "next/link";

const StorePage = () => {
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

    return (
        <>
            {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
            <div className="">
                {/* <h1 className="text-2xl font-bold mb-4">Point of Sales - Add to Cart</h1> */}
                <Header title={"Store"} />
                <div className="py-8">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="overflow-hidden">
                            <div className="bg-white shadow-sm sm:rounded-2xl ">
                                <div className="p-4 flex justify-between">
                                    <h1 className="text-2xl font-bold mb-4">Transaksi Barang</h1>
                                    <div>
                                        <Link href="/store/sales" className="btn-primary text-xs mr-2">
                                            <PlusCircleIcon className="w-4 h-4 mr-2 inline" /> Penjualan
                                        </Link>
                                        <button className="btn-primary text-xs disabled:bg-slate-400 disabled:cursor-not-allowed" disabled={true}>
                                            <PlusCircleIcon className="w-4 h-4 mr-2 inline" /> Pembelian
                                        </button>
                                    </div>
                                </div>
                                <table className="table w-full text-xs">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Product</th>
                                            <th>Qty</th>
                                            <th>Jual</th>
                                            <th>Modal</th>
                                            <th>Waktu</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((transaction) => (
                                            <tr key={transaction.id}>
                                                <td className="text-center">
                                                    {transaction.transaction_type === "Purchase" ? (
                                                        <ArrowBigDown size={24} className="text-green-500 inline" />
                                                    ) : (
                                                        <ArrowBigUp size={24} className="text-red-500 inline" />
                                                    )}{" "}
                                                    <span className="">{transaction.transaction_type}</span>
                                                </td>
                                                <td>{transaction.product.name}</td>
                                                <td className="text-center">
                                                    {formatNumber(transaction.quantity < 0 ? transaction.quantity * -1 : transaction.quantity)}
                                                </td>
                                                <td className="text-end">{formatNumber(transaction.price)}</td>
                                                <td className="text-end">{formatNumber(transaction.cost)}</td>
                                                <td className="text-center">{formatDateTime(transaction.created_at)}</td>
                                                <td className="text-center">
                                                    <button>
                                                        <XCircleIcon className="w-4 h-4 text-red-500 inline" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StorePage;
