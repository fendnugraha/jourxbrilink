"use client";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { CopyIcon, FilterIcon, RefreshCcwIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import Pagination from "@/components/PaginateList";
import SimplePagination from "@/components/SimplePagination";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const VoucherSalesTable = ({ warehouse, warehouseName, warehouses, userRole, showOnlyQty = false, showOnlyVoucher = false }) => {
    const [transactions, setTransactions] = useState([]);
    const [notification, setNotification] = useState("");

    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const [currentPageVoucher, setCurrentPageVoucher] = useState(1);
    const [itemsPerPageVoucher, setItemsPerPageVoucher] = useState(10);

    const [currentPageNonVoucher, setCurrentPageNonVoucher] = useState(1);
    const [itemsPerPageNonVoucher, setItemsPerPageNonVoucher] = useState(10);

    const [isCopied, setIsCopied] = useState(false);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };
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

    const filterTrxVoucher = transactions.filter((transaction) => transaction.product.category === "Voucher & SP");
    const filterTrxNonVoucher = transactions.filter((transaction) => transaction.product.category !== "Voucher & SP");

    const totalCostVoucher = filterTrxVoucher?.reduce((total, transaction) => {
        return total + Number(transaction.total_cost);
    }, 0);

    const totalCostNonVoucher = filterTrxNonVoucher?.reduce((total, transaction) => {
        return total + Number(transaction.total_cost);
    }, 0);

    const formatVoucherText = () => {
        const qtyByProduct = {};

        filterTrxVoucher?.forEach((trx) => {
            const name = trx.product.name;
            const qty = Number(trx.quantity);

            qtyByProduct[name] = (qtyByProduct[name] || 0) + qty;
        });

        const lines = Object.entries(qtyByProduct).map(([name, qty]) => `${name}: *${qty * -1}* pcs`);

        return `Voucher ` + warehouseName + `:\n\n${lines.join("\n")}`;
    };

    const copySalesVoucher = async () => {
        await navigator.clipboard.writeText(formatVoucherText());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
    };

    const paginateData = (data, currentPage = 1, itemsPerPage = 5) => {
        const totalItems = data?.length || 0;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const currentItems = data.slice(startIndex, startIndex + itemsPerPage);

        return {
            totalItems,
            totalPages,
            itemsPerPage,
            currentPage,
            currentItems,
        };
    };

    const handlePageChangeVoucher = (page) => {
        setCurrentPageVoucher(page);
    };

    const handlePageChangeNonVoucher = (page) => {
        setCurrentPageNonVoucher(page);
    };

    const paginateVoucher = paginateData(filterTrxVoucher, currentPageVoucher, itemsPerPageVoucher);
    const paginateNonVoucher = paginateData(filterTrxNonVoucher, currentPageNonVoucher, itemsPerPageNonVoucher);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <h1 className="font-bold text-xl text-slate-600 dark:text-white" hidden={showOnlyVoucher}>
                    Penjualan Barang
                    <span className="text-xs block font-normal">
                        Periode: {startDate} - {endDate}
                    </span>
                </h1>
                <div className="flex justify-between gap-1 flex-col sm:flex-row">
                    {userRole === "Administrator" && (
                        <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} className="form-select flex-1 p-2.5">
                            <option value="all">Semua Cabang</option>
                            {warehouses?.data?.map((warehouse) => (
                                <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <div>
                        <button onClick={() => fetchTransaction()} className="small-button mr-1">
                            <RefreshCcwIcon className="size-4" />
                        </button>
                        <button onClick={() => copySalesVoucher()} className={`small-button mr-1`}>
                            <CopyIcon className="size-4" />
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
                                fetchTransaction();
                                setIsModalFilterDataOpen(false);
                            }}
                            className="btn-primary"
                        >
                            Submit
                        </button>
                    </Modal>
                </div>
            </div>
            <div className="gap-4 flex flex-col sm:flex-row">
                <div className="card w-full overflow-hidden">
                    <div className="flex justify-between items-start px-4 sm:px-6 pt-4">
                        <h1 className="font-bold text-xl text-blue-600 dark:text-blue-300">
                            Voucher & SP{" "}
                            <span className="text-sm block font-normal">Total: {formatNumber(totalCostVoucher < 0 ? totalCostVoucher * -1 : 0)}</span>
                        </h1>
                        <select
                            value={itemsPerPageVoucher}
                            onChange={(e) => setItemsPerPageVoucher(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-500 w-16 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-50 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table w-full text-xs">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th className={`${showOnlyQty ? "hidden" : "hidden sm:table-cell"}`}>Jual</th>
                                    <th className={`${showOnlyQty ? "hidden" : "hidden sm:table-cell"}`}>Modal</th>
                                    <th className={`${showOnlyQty ? "hidden" : "hidden sm:table-cell"}`}>Laba</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    paginateVoucher?.currentItems?.map((transaction) => (
                                        <tr key={transaction.product_id}>
                                            <td>{transaction.product.name}</td>
                                            <td className="text-center">{formatNumber(-transaction.quantity)}</td>
                                            <td className={`text-end ${showOnlyQty ? "hidden" : "hidden sm:table-cell"}`}>
                                                {formatNumber(-transaction.total_price)}
                                            </td>
                                            <td className={`text-end ${showOnlyQty ? "hidden" : "hidden sm:table-cell"}`}>
                                                {formatNumber(-transaction.total_cost)}
                                            </td>
                                            <td className={`text-end ${showOnlyQty ? "hidden" : "hidden sm:table-cell"}`}>
                                                {formatNumber(-Number(transaction.total_price - transaction.total_cost))}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {paginateVoucher?.totalPages > 1 && (
                        <div className="px-2 pb-4">
                            <SimplePagination
                                className="w-full px-4"
                                totalItems={Number(paginateVoucher?.totalItems)}
                                itemsPerPage={Number(paginateVoucher?.itemsPerPage)}
                                currentPage={Number(paginateVoucher?.currentPage)}
                                onPageChange={handlePageChangeVoucher}
                            />
                        </div>
                    )}
                </div>
                <div className="card overflow-hidden w-full" hidden={showOnlyVoucher}>
                    <div className="flex justify-between items-start px-4 sm:px-6 pt-4">
                        <h1 className="font-bold text-xl text-green-600 dark:text-green-300">
                            Accesories{" "}
                            <span className="text-sm block font-normal">Total: {formatNumber(totalCostNonVoucher < 0 ? totalCostNonVoucher * -1 : 0)}</span>
                        </h1>
                        <select
                            value={itemsPerPageNonVoucher}
                            onChange={(e) => setItemsPerPageNonVoucher(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-500 w-16 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-50 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table w-full text-xs">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th className="hidden sm:table-cell">Jual</th>
                                    <th className="hidden sm:table-cell">Modal</th>
                                    <th className="hidden sm:table-cell">Laba</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    paginateNonVoucher?.currentItems?.map((transaction) => (
                                        <tr key={transaction.product_id}>
                                            <td>{transaction.product.name}</td>
                                            <td className="text-center">{formatNumber(-transaction.quantity)}</td>
                                            <td className="text-end hidden sm:table-cell">{formatNumber(-transaction.total_price)}</td>
                                            <td className="text-end hidden sm:table-cell">{formatNumber(-transaction.total_cost)}</td>
                                            <td className="text-end hidden sm:table-cell">
                                                {formatNumber(-Number(transaction.total_price - transaction.total_cost))}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {paginateNonVoucher?.totalPages > 1 && (
                        <div className="px-2 pb-4">
                            <Pagination
                                className="w-full px-4"
                                totalItems={Number(paginateNonVoucher?.totalItems)}
                                itemsPerPage={Number(paginateNonVoucher?.itemsPerPage)}
                                currentPage={Number(paginateNonVoucher?.currentPage)}
                                onPageChange={handlePageChangeNonVoucher}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default VoucherSalesTable;
