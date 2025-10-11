"use client";
import axios from "@/libs/axios";
import MainPage from "../main";
import { DateTimeNow, formatDate, formatDateTime, formatNumber } from "@/libs/format";
import { useCallback, useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import CreateMutationFromHq from "../dashboard/components/CreateMutationFromHq";
import Modal from "@/components/Modal";
import { set } from "date-fns";
import useGetWarehouses from "@/libs/getAllWarehouse";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";

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
    const [errors, setErrors] = useState([]);
    const [journals, setJournals] = useState([]);
    const fetchJournals = useCallback(
        async (url = `/api/mutation-journal/${startDate}/${endDate}`) => {
            try {
                const response = await axios.get(url);
                setJournals(response.data.data);
            } catch (error) {
                setErrors(error.response?.data?.errors || ["Something went wrong."]);
                console.log(error);
            }
        },
        [startDate, endDate]
    );

    useEffect(() => {
        fetchJournals();
    }, [fetchJournals]);
    return (
        <MainPage headerTitle="Delivery">
            <div className="py-4 sm:py-8 px-4 sm:px-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
                    <div className="h-auto sm:h-[calc(100vh-80px-64px)] overflow-auto">
                        {journals
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
                                                statusText={journal.status === 0 ? "Dalam Pengiriman" : "Sudah Diterima"}
                                            />
                                        </div>
                                        <h1 className="text-xs">Tujuan</h1>
                                        <h1 className="font-bold text-md mb-2">{journal.debt?.warehouse?.name}</h1>
                                        <h1 className="font-bold text-2xl text-right p-2 border border-slate-300 dark:border-slate-500 rounded-2xl bg-slate-500">
                                            Rp {formatNumber(journal.amount)}
                                        </h1>
                                        <button className="px-6 py-2 mt-4 w-full min-w-40 hover:drop-shadow-md bg-green-500 dark:bg-green-600 hover:bg-green-400 dark:hover:bg-green-500 text-white rounded-xl text-sm cursor-pointer transition duration-300 ease-in-out">
                                            Sudah Diterima
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                        <div className="overflow-x-auto">
                            <table className="table-auto table w-full text-xs">
                                <thead>
                                    <tr>
                                        <th className="">Date</th>
                                        <th className="">Description</th>
                                        <th className="">Amount</th>
                                        <th className="">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {journals.map((journal) => (
                                        <tr key={journal.id}>
                                            <td className="">
                                                <Link
                                                    href={`/delivery/invoice/${journal.invoice}`}
                                                    className="block hover:underline font-bold text-yellow-500 dark:text-yellow-300"
                                                >
                                                    {journal.invoice}
                                                </Link>
                                                {formatDateTime(journal.created_at)}
                                            </td>
                                            <td className="">{journal.description}</td>
                                            <td className="text-right text-lg font-bold">{formatNumber(journal.amount)}</td>
                                            <td className="text-center">
                                                <StatusBadge
                                                    status={journal.status === 0 ? "In Progress" : "Completed"}
                                                    statusText={journal.status === 0 ? "Dalam Pengiriman" : "Sudah Diterima"}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalCreateMutationFromHqOpen} onClose={closeModal} maxWidth={"max-w-lg"} modalTitle="Penambahan Saldo Kas & Bank">
                <CreateMutationFromHq
                    cashBank={cashBank}
                    isModalOpen={setIsModalCreateMutationFromHqOpen}
                    notification={setNotification}
                    fetchJournalsByWarehouse={fetchJournals}
                    warehouses={warehouses?.data}
                />
            </Modal>
        </MainPage>
    );
};

export default DeliveryPage;
