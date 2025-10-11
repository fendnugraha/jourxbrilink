"use client";
import axios from "@/libs/axios";
import MainPage from "../main";
import { DateTimeNow, formatDate, formatDateTime, formatNumber } from "@/libs/format";
import { use, useCallback, useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import CreateMutationFromHq from "../dashboard/components/CreateMutationFromHq";
import Modal from "@/components/Modal";
import useGetWarehouses from "@/libs/getAllWarehouse";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import Notification from "@/components/Notification";
import SimplePagination from "@/components/SimplePagination";
import { mutate } from "swr";
import useGetMutationJournal from "@/libs/getMutationJournal";

const DeliveryPage = () => {
    const { today } = DateTimeNow();
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const { warehouses, warehousesError } = useGetWarehouses();
    const [cashBank, setCashBank] = useState([]);
    const fetchCashBank = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-cash-and-bank`);
            setCashBank(response.data.data); // Commented out as it's not used
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, [notification]);

    useEffect(() => {
        fetchCashBank();
    }, [fetchCashBank]);

    const [isModalCreateMutationFromHqOpen, setIsModalCreateMutationFromHqOpen] = useState(false);
    const closeModal = () => {
        setIsModalCreateMutationFromHqOpen(false);
    };
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const { journals, error, isValidating } = useGetMutationJournal(startDate, endDate);
    useEffect(() => {
        mutate(`/api/mutation-journal/${startDate}/${endDate}`);
    }, [startDate, endDate]);
    const updateJournalStatus = async (journalId, status) => {
        if (!confirm("Konfirmasi pengiriman kas, apakah anda yakin kas sudah diterima?")) return;
        setLoading(true);
        try {
            const response = await axios.put(`/api/update-delivery-status/${journalId}/${status}`);
            mutate(`/api/mutation-journal/${startDate}/${endDate}`);
            setNotification({ type: "success", message: response.data.message });
        } catch (error) {
            console.log(error);
            setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [deliveryStatus, setDeliveryStatus] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState("");

    const filteredJournals = journals?.filter((journal) => {
        const matchDeliveryStatus = deliveryStatus ? journal.status === Number(deliveryStatus) : true;

        const matchWarehouse = selectedWarehouse ? journal.debt?.warehouse?.id === Number(selectedWarehouse) : true;

        const matchSearchTerm = searchTerm
            ? (journal.invoice ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              (journal.amount ?? "").toString().toLowerCase().includes(searchTerm.toLowerCase())
            : true;

        return matchDeliveryStatus && matchWarehouse && matchSearchTerm;
    });

    const totalItems = filteredJournals?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredJournals?.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    return (
        <MainPage headerTitle="Delivery">
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="py-4 sm:py-8 px-4 sm:px-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
                    <div className="h-auto sm:h-[calc(100vh-80px-64px)] overflow-auto">
                        {journals?.filter((journal) => journal.status === 0).length > 0 ? (
                            journals
                                .filter((journal) => journal.status === 0)
                                .map((journal) => (
                                    <div className="card p-4 mb-4" key={journal.id}>
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h1 className="font-bold text-xs mb-4">
                                                    <span className="block">{journal.invoice}</span>
                                                    {formatDate(journal.date_issued)}
                                                </h1>
                                                <StatusBadge
                                                    status={journal.status === 0 ? "In Progress" : "Completed"}
                                                    statusText={journal.status === 0 ? "On Delivery" : "Sudah Diterima"}
                                                />
                                            </div>
                                            <h1 className="text-xs">Tujuan</h1>
                                            <h1 className="font-bold text-md mb-2">{journal.debt?.warehouse?.name}</h1>
                                            <h1 className="font-bold text-2xl text-white text-right p-2 border border-slate-300 dark:border-slate-500 rounded-2xl bg-slate-500">
                                                Rp {formatNumber(journal.amount)}
                                            </h1>
                                            <button
                                                onClick={() => updateJournalStatus(journal.id, 1)}
                                                disabled={loading}
                                                className="px-6 py-2 mt-4 w-full min-w-40 hover:drop-shadow-md bg-green-500 dark:bg-green-600 hover:bg-green-400 dark:hover:bg-green-500 text-white rounded-xl text-sm cursor-pointer transition duration-300 ease-in-out"
                                            >
                                                Sudah Diterima
                                            </button>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="card p-4 mb-4 h-full flex justify-center items-center">
                                <h1 className="text-xs">Belum ada mutasi kas.</h1>
                            </div>
                        )}
                    </div>
                    <div className="card p-4 sm:col-span-2">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="card-title mb-4">Rekap Mutasi Kas</h1>
                            <button
                                onClick={() => setIsModalCreateMutationFromHqOpen(true)}
                                className="bg-indigo-500 text-sm sm:text-xs min-w-36 hover:bg-indigo-600 text-white py-4 sm:py-2 px-2 sm:px-6 rounded-lg"
                            >
                                Mutasi Saldo <PlusCircleIcon className="size-4 inline" />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="search"
                                placeholder="Search..."
                                className="form-control flex-1"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select className="form-select !w-fit block p-2.5" value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}>
                                <option value={""}>Semua</option>
                                {warehouses.data?.map((warehouse) => (
                                    <option key={warehouse.id} value={warehouse.id}>
                                        {warehouse.name}
                                    </option>
                                ))}
                            </select>
                            <select className="form-select !w-fit block p-2.5" value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)}>
                                <option value={""}>Semua</option>
                                <option value={0}>On Delivery</option>
                                <option value={1}>Diterima</option>
                            </select>
                            <select
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="form-select !w-fit block p-2.5"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table-auto table w-full text-xs">
                                <thead>
                                    <tr>
                                        <th className="">Date</th>
                                        <th className="">Tujuan</th>
                                        <th className="">Amount</th>
                                        <th className="">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((journal) => (
                                        <tr key={journal.id}>
                                            <td className="">
                                                <Link
                                                    href={`/delivery/invoice/${journal.invoice}`}
                                                    className="block hover:underline font-bold text-yellow-500 dark:text-yellow-300"
                                                >
                                                    {journal.invoice}
                                                </Link>
                                                {formatDateTime(journal.date_issued)}
                                            </td>
                                            <td className="">{journal.debt?.warehouse?.name}</td>
                                            <td className="text-right text-lg font-bold">{formatNumber(journal.amount)}</td>
                                            <td className="text-center">
                                                <StatusBadge
                                                    status={journal.status === 0 ? "In Progress" : "Completed"}
                                                    statusText={journal.status === 0 ? "On Delivery" : "Sudah Diterima"}
                                                />
                                                {/* <span className="block text-xs">({formatDateTime(journal.updated_at)})</span> */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <SimplePagination
                                className="w-full px-4"
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalCreateMutationFromHqOpen} onClose={closeModal} maxWidth="max-w-lg" modalTitle="Penambahan Saldo Kas & Bank">
                <CreateMutationFromHq
                    cashBank={cashBank}
                    isModalOpen={setIsModalCreateMutationFromHqOpen}
                    notification={setNotification}
                    fetchJournalsByWarehouse={() => mutate(`/api/mutation-journal/${startDate}/${endDate}`)}
                    warehouses={warehouses?.data}
                />
            </Modal>
        </MainPage>
    );
};

export default DeliveryPage;
