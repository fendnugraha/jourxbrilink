"use client";
import Notification from "@/components/Notification";
import { useCallback, useEffect, useState } from "react";
import { ArrowBigDown, ArrowBigUp, FilterIcon, MessageCircleWarningIcon, PlusCircleIcon, SearchIcon, XCircleIcon } from "lucide-react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import Link from "next/link";
import Paginator from "@/components/Paginator";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import { useAuth } from "@/libs/auth";
import MainPage from "../main";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const StorePage = () => {
    const { user } = useAuth({ middleware: "auth" });

    const warehouse = user?.role?.warehouse_id;
    const userRole = user?.role?.role;
    const [transactions, setTransactions] = useState([]);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [loading, setLoading] = useState(false);
    const [isModalFilterJournalOpen, setIsModalFilterJournalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const [warehouses, setWarehouses] = useState([]);
    const [isModalDeleteTrxOpen, setIsModalDeleteTrxOpen] = useState(false);
    const [selectedTrxId, setSelectedTrxId] = useState(null);
    const [search, setSearch] = useState("");

    const closeModal = () => {
        setIsModalFilterJournalOpen(false);
        setIsModalDeleteTrxOpen(false);
    };

    const fetchTransaction = useCallback(
        async (url = `/api/get-trx-by-warehouse/${selectedWarehouse}/${startDate}/${endDate}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: search,
                    },
                });
                setTransactions(response.data.data);
            } catch (error) {
                setNotification(error.response?.data?.message || "Something went wrong.");
                console.log(error);
            } finally {
                setLoading(false);
            }
        },
        [selectedWarehouse, startDate, endDate, search]
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchTransaction();
        }, 500);
        return () => clearTimeout(timeout);
    }, [fetchTransaction]);

    const handleChangePage = (url) => {
        fetchTransaction(url);
    };

    const fetchWarehouses = async (url = "/api/get-all-warehouses") => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            setWarehouses(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const handleDeleteTrx = async () => {
        try {
            const response = await axios.delete(`/api/transactions/${selectedTrxId}`);
            setNotification(response.data.message);
            fetchTransaction();
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
            console.log(error);
        }
    };
    const [selectedCategory, setSelectedCategory] = useState([]);
    const addToSelectedCategory = (category) => {
        if (selectedCategory.includes(category)) {
            setSelectedCategory(selectedCategory.filter((item) => item !== category));
        } else {
            setSelectedCategory([...selectedCategory, category]);
        }
    };

    const filterTransactionByCategoryArray = (categoryArray) => {
        const filteredTransactions = transactions.filter((transaction) => {
            return categoryArray.includes(transaction.category);
        });
        setTransactions(filteredTransactions);
    };

    return (
        <MainPage headerTitle="Store">
            <div className="py-4 sm:py-8 px-4 sm:px-12">
                {notification.message && (
                    <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                )}
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white shadow-sm rounded-3xl ">
                        <div className="p-4 flex justify-between sm:flex-row flex-col items-start">
                            <h1 className="text-2xl font-bold mb-4">
                                Transaksi Barang
                                <span className="text-xs block text-slate-500 font-normal">
                                    {warehouses.find((w) => w.id === Number(selectedWarehouse))?.name}, Periode: {startDate} - {endDate}
                                </span>
                            </h1>
                            <div className="flex items-start flex-col sm:flex-row gap-2">
                                <div className="flex items-center gap-2">
                                    <Link href="/store/sales" className="btn-primary text-sm font-normal">
                                        <PlusCircleIcon className="w-4 h-4 inline" /> Penjualan
                                    </Link>
                                    {userRole === "Administrator" && (
                                        <Link href="#" className="btn-primary text-sm font-normal">
                                            <PlusCircleIcon className="w-4 h-4 inline" /> Pembelian
                                        </Link>
                                    )}

                                    {/* <button className="btn-primary text-xs disabled:bg-slate-400 disabled:cursor-not-allowed" disabled={true}>
                                            <PlusCircleIcon className="w-4 h-4 inline" /> Pembelian
                                        </button> */}
                                </div>
                                <button
                                    onClick={() => setIsModalFilterJournalOpen(true)}
                                    className="bg-white font-bold p-2 rounded-lg border border-gray-300 hover:border-gray-400"
                                >
                                    <FilterIcon size={24} />
                                </button>
                                <Modal isOpen={isModalFilterJournalOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                                    {userRole === "Administrator" && (
                                        <div className="mb-4">
                                            <Label>Cabang</Label>
                                            <select
                                                onChange={(e) => {
                                                    setSelectedWarehouse(e.target.value);
                                                }}
                                                value={selectedWarehouse}
                                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            >
                                                <option value="all">Semua Akun</option>
                                                {warehouses.map((w) => (
                                                    <option key={w.id} value={w.id}>
                                                        {w.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div>
                                            <Label>Tanggal</Label>
                                            <Input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <Label>s/d</Label>
                                            <Input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                disabled={!startDate}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            fetchTransaction();
                                            setIsModalFilterJournalOpen(false);
                                        }}
                                        className="btn-primary"
                                    >
                                        Submit
                                    </button>
                                </Modal>
                            </div>
                        </div>
                        <div className="px-4">
                            <div className="relative w-full sm:max-w-sm">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <SearchIcon className="w-6 h-6 text-gray-500" />
                                </div>
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="block w-full text-sm mb-2 pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table w-full text-xs">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Jual</th>
                                        <th>Modal</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="text-center">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : transactions.data?.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-6 text-center">
                                                Tidak ada transaksi
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.data?.map((transaction) => (
                                            <tr key={transaction.id}>
                                                <td className="text-center">
                                                    {transaction.transaction_type === "Purchase" ? (
                                                        <ArrowBigDown size={24} className="text-green-500 inline" />
                                                    ) : (
                                                        <ArrowBigUp size={24} className="text-red-500 inline" />
                                                    )}{" "}
                                                    <span className="">{transaction.transaction_type}</span>
                                                </td>
                                                <td className="font-bold">
                                                    <span className="text-xs font-normal block text-slate-500">
                                                        {formatDateTime(transaction.created_at)} {transaction.invoice}
                                                    </span>

                                                    {transaction.product.name}
                                                </td>
                                                <td className="text-center">
                                                    {formatNumber(transaction.quantity < 0 ? transaction.quantity * -1 : transaction.quantity)}
                                                </td>
                                                <td className="text-end">{formatNumber(transaction.price)}</td>
                                                <td className="text-end">{formatNumber(transaction.cost)}</td>
                                                <td className="text-center">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTrxId(transaction.id);
                                                            setIsModalDeleteTrxOpen(true);
                                                        }}
                                                    >
                                                        <XCircleIcon className="w-4 h-4 text-red-500 inline hover:scale-125 transition-transform duration-300" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4">{transactions.last_page > 1 && <Paginator links={transactions} handleChangePage={handleChangePage} />}</div>
                    </div>
                    <Modal isOpen={isModalDeleteTrxOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                        <div className="flex flex-col items-center justify-center gap-3 mb-4">
                            <MessageCircleWarningIcon size={72} className="text-red-600" />
                            <p className="text-sm">Apakah anda yakin ingin menghapus transaksi ini (ID: {selectedTrxId})?</p>
                        </div>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => {
                                    handleDeleteTrx(selectedTrxId);
                                    setIsModalDeleteTrxOpen(false);
                                }}
                                className="btn-primary w-full"
                            >
                                Ya
                            </button>
                            <button
                                onClick={() => setIsModalDeleteTrxOpen(false)}
                                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Tidak
                            </button>
                        </div>
                    </Modal>
                </div>
            </div>
        </MainPage>
    );
};

export default StorePage;
