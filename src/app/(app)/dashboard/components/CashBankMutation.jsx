"use client";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import Modal from "@/components/Modal";
import CreateMutationFromHq from "./CreateMutationFromHq";
import Notification from "@/components/notification";
import Pagination from "@/components/PaginateList";
import { MoveRightIcon, PlusCircleIcon } from "lucide-react";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const CashBankMutation = ({ warehouse, warehouses }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [cashBank, setCashBank] = useState([]);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [journalsByWarehouse, setJournalsByWarehouse] = useState([]);
    const [isModalCreateMutationFromHqOpen, setIsModalCreateMutationFromHqOpen] = useState(false);
    const [notification, setNotification] = useState("");
    const closeModal = () => {
        setIsModalCreateMutationFromHqOpen(false);
    };

    const fetchCashBank = async () => {
        try {
            const response = await axios.get(`/api/get-cash-and-bank`);
            setCashBank(response.data.data); // Commented out as it's not used
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        }
    };

    useEffect(() => {
        fetchCashBank();
    }, []);

    const [accountBalance, setAccountBalance] = useState([]);
    const getAccountBalance = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-cash-bank-balance/${warehouse}`);
            setAccountBalance(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };

    const fetchJournalsByWarehouse = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-journal-by-warehouse/${warehouse}/${startDate}/${endDate}`);
            setJournalsByWarehouse(response.data);
        } catch (error) {
            console.error(error);
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJournalsByWarehouse();
    }, []);

    useEffect(() => {
        getAccountBalance();
    }, [journalsByWarehouse]);

    const mutationInSum = (acc_id) => {
        return journalsByWarehouse?.data?.reduce(
            (sum, journal) => (Number(journal.debt_code) === acc_id && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
            0
        );
    };

    const mutationOutSum = (acc_id) => {
        return journalsByWarehouse.data?.reduce(
            (sum, journal) => (Number(journal.cred_code) === acc_id && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
            0
        );
    };

    const filteredJournals = journalsByWarehouse.data?.filter((journal) => journal.trx_type === "Mutasi Kas");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Number of items per page
    const totalItems = filteredJournals?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredJournals?.length > 0 ? filteredJournals.slice(startIndex, startIndex + itemsPerPage) : [];

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="my-4">
            {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
            <div className="mb-4 bg-white overflow-hidden shadow-sm sm:rounded-2xl">
                <div className="px-6 pt-6 flex justify-between">
                    <h1 className="font-bold text-xl">Mutasi Saldo</h1>
                    <button
                        onClick={() => setIsModalCreateMutationFromHqOpen(true)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-6 rounded-lg"
                    >
                        Mutasi Saldo <PlusCircleIcon className="size-4 inline" />
                    </button>
                    <Modal isOpen={isModalCreateMutationFromHqOpen} onClose={closeModal} modalTitle="Penambahan Saldo Kas & Bank">
                        <CreateMutationFromHq
                            cashBank={cashBank}
                            isModalOpen={setIsModalCreateMutationFromHqOpen}
                            notification={(message) => setNotification(message)}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            warehouses={warehouses}
                        />
                    </Modal>
                </div>
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th>Nama akun</th>
                            <th>Saldo Akhir</th>
                            <th>Masuk</th>
                            <th>Keluar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accountBalance.map((account, index) => (
                            <tr key={index}>
                                <td>{account.acc_name}</td>
                                <td className="text-end">{formatNumber(account.balance)}</td>
                                <td className="text-end">{formatNumber(mutationInSum(account.id))}</td>
                                <td className="text-end">{formatNumber(mutationOutSum(account.id))}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Total</th>
                            <th className="text-end">{formatNumber(accountBalance.reduce((sum, acc) => sum + acc.balance, 0))}</th>
                            <th className="text-end">{formatNumber(accountBalance.reduce((sum, acc) => sum + mutationInSum(acc.id), 0))}</th>
                            <th className="text-end">{formatNumber(accountBalance.reduce((sum, acc) => sum + mutationOutSum(acc.id), 0))}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
            {currentItems.length > 0 && (
                <div className="mb-4 bg-white overflow-hidden shadow-sm sm:rounded-2xl">
                    <h1 className="px-6 pt-6 font-bold text-xl text-green-600">History Mutasi Kas</h1>
                    <table className="table w-full text-xs">
                        <thead>
                            <tr>
                                <th>
                                    Dari <MoveRightIcon className="size-5 inline" /> Ke
                                </th>
                                <th>Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((journal, index) => (
                                <tr key={index}>
                                    <td className="">
                                        <span className="block font-bold text-slate-500">{formatDateTime(journal.created_at)}</span>
                                        {journal.cred.acc_name} <MoveRightIcon className="size-5 inline" /> {journal.debt.acc_name}
                                    </td>
                                    <td className="text-end">{formatNumber(journal.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <Pagination
                            className="w-full px-6 pb-6"
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default CashBankMutation;
