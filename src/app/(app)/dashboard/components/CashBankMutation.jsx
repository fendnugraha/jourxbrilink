"use client";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import Modal from "@/components/Modal";
import CreateMutationFromHq from "./CreateMutationFromHq";
import Notification from "@/components/notification";
import Pagination from "@/components/PaginateList";
import { FilterIcon, MoveRightIcon, PlusCircleIcon } from "lucide-react";
import CreateJournal from "./CreateJournal";
import Label from "@/components/Label";
import Input from "@/components/Input";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const CashBankMutation = ({ warehouse, warehouses, userRole }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [cashBank, setCashBank] = useState([]);
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [journalsByWarehouse, setJournalsByWarehouse] = useState([]);
    const [isModalCreateMutationFromHqOpen, setIsModalCreateMutationFromHqOpen] = useState(false);
    const [isModalCreateJournalOpen, setIsModalCreateJournalOpen] = useState(false);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const [notification, setNotification] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const closeModal = () => {
        setIsModalCreateMutationFromHqOpen(false);
        setIsModalCreateJournalOpen(false);
        setIsModalFilterDataOpen(false);
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
        try {
            const response = await axios.get(`/api/get-cash-bank-balance/${selectedWarehouse}/${endDate}`);
            setAccountBalance(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        }
    };

    const fetchJournalsByWarehouse = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-journal-by-warehouse/${selectedWarehouse}/${endDate}/${endDate}`);
            setJournalsByWarehouse(response.data);
        } catch (error) {
            console.error(error);
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    const mutationInSumById = (acc_id) => {
        return journalsByWarehouse?.data?.reduce(
            (sum, journal) => (Number(journal.debt_code) === acc_id && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
            0
        );
    };

    const mutationOutSumById = (acc_id) => {
        return journalsByWarehouse.data?.reduce(
            (sum, journal) => (Number(journal.cred_code) === acc_id && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
            0
        );
    };

    useEffect(() => {
        fetchJournalsByWarehouse();
    }, [selectedWarehouse]);

    useEffect(() => {
        getAccountBalance();
    }, [journalsByWarehouse]);

    const mutationInSum = accountBalance.reduce((sum, acc) => sum + mutationInSumById(acc.id), 0);

    const mutationOutSum = accountBalance.reduce((sum, acc) => sum + mutationOutSumById(acc.id), 0);

    const [checkedAccounts, setCheckedAccounts] = useState(null);
    const filteredJournals = journalsByWarehouse.data?.filter((journal) => {
        if (checkedAccounts === null) {
            return journal.trx_type === "Mutasi Kas";
        }
        return journal.trx_type === "Mutasi Kas" && (checkedAccounts.includes(journal.cred_code) || checkedAccounts.includes(journal.debt_code));
    });
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(1);
    const branchAccount = cashBank.filter((cashBank) => cashBank.warehouse_id === Number(selectedWarehouseId));

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
            <div className="mb-4 bg-white shadow-sm sm:rounded-2xl">
                <div className="px-2 sm:px-6 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <h1 className="font-bold text-xl">Mutasi Saldo</h1>
                    <div className="sm:flex gap-2 w-full sm:col-span-2">
                        {userRole === "Administrator" && (
                            <div className="gap-2 sm:flex grid grid-cols-2 mb-2 sm:mb-0">
                                <button
                                    onClick={() => setIsModalCreateJournalOpen(true)}
                                    className="bg-indigo-500 text-sm sm:text-xs min-w-36 hover:bg-indigo-600 text-white py-2 px-2 sm:px-6 rounded-lg"
                                >
                                    Jurnal Umum <PlusCircleIcon className="size-4 inline" />
                                </button>
                                <button
                                    onClick={() => setIsModalCreateMutationFromHqOpen(true)}
                                    className="bg-indigo-500 text-sm sm:text-xs min-w-36 hover:bg-indigo-600 text-white py-2 px-2 sm:px-6 rounded-lg"
                                >
                                    Mutasi Saldo <PlusCircleIcon className="size-4 inline" />
                                </button>
                            </div>
                        )}
                        <div className="w-full flex justify-end gap-2 mb-2 sm:mb-0">
                            {userRole === "Administrator" && (
                                <select
                                    value={selectedWarehouse}
                                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                >
                                    {warehouses.map((warehouse) => (
                                        <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <button
                                onClick={() => setIsModalFilterDataOpen(true)}
                                className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                            >
                                <FilterIcon className="size-4" />
                            </button>
                            <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                                <div className="mb-4">
                                    <Label className="font-bold">Tanggal</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        fetchJournalsByWarehouse();
                                        setIsModalFilterDataOpen(false);
                                    }}
                                    className="btn-primary"
                                >
                                    Submit
                                </button>
                            </Modal>
                        </div>
                    </div>
                    <Modal isOpen={isModalCreateMutationFromHqOpen} onClose={closeModal} modalTitle="Penambahan Saldo Kas & Bank">
                        <CreateMutationFromHq
                            cashBank={cashBank}
                            isModalOpen={setIsModalCreateMutationFromHqOpen}
                            notification={(message) => setNotification(message)}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            warehouses={warehouses}
                        />
                    </Modal>
                    <Modal isOpen={isModalCreateJournalOpen} onClose={closeModal} modalTitle="Jurnal umum">
                        <CreateJournal
                            cashBank={cashBank}
                            isModalOpen={setIsModalCreateJournalOpen}
                            notification={(message) => setNotification(message)}
                            getAccountBalance={getAccountBalance}
                            warehouses={warehouses}
                        />
                    </Modal>
                </div>
                <div className="px-2 sm:px-6">
                    <h4 className="text-xs text-slate-500">Periode: {endDate}</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full text-xs">
                        <thead>
                            <tr>
                                <th>Nama akun</th>
                                <th className="hidden sm:table-cell">Saldo Akhir</th>
                                <th>Masuk</th>
                                <th>Keluar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr className="text-center">
                                    <td colSpan={4}>Loading ...</td>
                                </tr>
                            ) : (
                                accountBalance.map((account, index) => (
                                    <tr key={index}>
                                        <td>
                                            {account.acc_name}
                                            <span className="text-xs font-bold block sm:hidden">{formatNumber(account.balance)}</span>
                                        </td>
                                        <td className="text-end font-bold hidden sm:table-cell">{formatNumber(account.balance ?? 0)}</td>
                                        <td className="text-end">{formatNumber(mutationInSumById(account.id) ?? 0)}</td>
                                        <td className="text-end">{formatNumber(mutationOutSumById(account.id) ?? 0)}</td>
                                    </tr>
                                ))
                            )}
                            <tr>
                                <td className="font-bold ">Penambahan saldo dari HQ</td>
                                <td className="text-end font-bold hidden sm:table-cell"></td>
                                <td className="text-end font-bold"></td>
                                <td className="text-end font-bold">
                                    {mutationOutSum - mutationInSum === 0 ? (
                                        <span className="text-green-600">Completed</span>
                                    ) : (
                                        formatNumber(mutationOutSum - mutationInSum)
                                    )}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <th>
                                    Total <span className="font-bold">{formatNumber(accountBalance.reduce((sum, acc) => sum + acc.balance, 0))}</span>
                                </th>
                                <th className="text-end font-bold">{formatNumber(accountBalance.reduce((sum, acc) => sum + acc.balance, 0))}</th>
                                <th className="text-end">{formatNumber(mutationInSum)}</th>
                                <th className="text-end">{formatNumber(mutationOutSum)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            {currentItems.length > 0 && (
                <div className="mb-4 bg-white shadow-sm sm:rounded-2xl">
                    <h1 className="px-2 sm:px-6 pt-6 font-bold text-xl text-green-600">History Mutasi Kas</h1>
                    <div className="overflow-x-auto">
                        <table className="table w-full text-xs">
                            <thead>
                                <tr>
                                    <th>
                                        Dari <MoveRightIcon className="size-5 inline" /> Ke
                                    </th>
                                    <th className="hidden sm:table-cell">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr className="text-center">
                                        <td colSpan={2}>Loading ...</td>
                                    </tr>
                                ) : (
                                    currentItems.map((journal, index) => (
                                        <tr key={index}>
                                            <td className="">
                                                <span className="block font-bold text-slate-500">{formatDateTime(journal.created_at)}</span>
                                                {journal.cred.acc_name} <MoveRightIcon className="size-5 inline" /> {journal.debt.acc_name}
                                                <span className="block sm:hidden font-bold text-blue-500">{formatNumber(journal.amount)}</span>
                                            </td>
                                            <td className="text-end hidden sm:table-cell">{formatNumber(journal.amount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <Pagination
                                className="w-full px-2 sm:px-6 pb-6"
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashBankMutation;
