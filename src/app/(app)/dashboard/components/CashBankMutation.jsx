"use client";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import Modal from "@/components/Modal";
import CreateMutationFromHq from "./CreateMutationFromHq";
import { ArrowUpRight, FilterIcon, LoaderCircleIcon, PlusCircleIcon, RefreshCcwIcon } from "lucide-react";
import CreateJournal from "./CreateJournal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import useCashBankBalance from "@/libs/cashBankBalance";
import { mutate } from "swr";
import CreateMutationFromHqMultiple from "./CreateMutationFromHqMultiple";
import Link from "next/link";
import BalanceMutationHistory from "./BalanceMutationHistory";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const CashBankMutation = ({ warehouse, warehouses, userRole, notification }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [cashBank, setCashBank] = useState([]);
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [journalsByWarehouse, setJournalsByWarehouse] = useState([]);
    const [isModalCreateMutationFromHqOpen, setIsModalCreateMutationFromHqOpen] = useState(false);
    const [isModalCreateJournalOpen, setIsModalCreateJournalOpen] = useState(false);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const [currentPage, setCurrentPage] = useState(1);
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

    const { accountBalance, error: accountBalanceError, loading: isValidating, mutateCashBankBalance } = useCashBankBalance(selectedWarehouse, endDate);

    const fetchJournalsByWarehouse = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-journal-by-warehouse/${selectedWarehouse}/${endDate}/${endDate}`);
            setJournalsByWarehouse(response.data);
        } catch (error) {
            console.error(error);
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    const mutationInSumById = (acc_id) => {
        return journalsByWarehouse?.data?.reduce(
            (sum, journal) => (Number(journal.debt_code) === Number(acc_id) && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
            0
        );
    };

    const mutationOutSumById = (acc_id) => {
        return journalsByWarehouse.data?.reduce(
            (sum, journal) => (Number(journal.cred_code) === Number(acc_id) && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
            0
        );
    };

    useEffect(() => {
        fetchJournalsByWarehouse();
    }, [selectedWarehouse, endDate]);

    useEffect(() => {
        mutate(`/api/get-cash-bank-balance/${selectedWarehouse}/${endDate}`);
    }, [journalsByWarehouse, endDate]);

    const mutationInSum = accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + mutationInSumById(acc.id), 0);

    const mutationOutSum = accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + mutationOutSumById(acc.id), 0);

    const [mutationMode, setMutationMode] = useState("single");
    return (
        <>
            <div className="w-full flex justify-end gap-2 mb-2 sm:mb-0">
                {["Administrator", "Super Admin"].includes(userRole) && (
                    <>
                        <button
                            onClick={() => setIsModalCreateJournalOpen(true)}
                            className="bg-indigo-500 text-sm sm:text-xs min-w-36 hover:bg-indigo-600 text-white py-4 sm:py-2 px-2 sm:px-6 rounded-lg"
                        >
                            Jurnal Umum <PlusCircleIcon className="size-4 inline" />
                        </button>
                        <button
                            onClick={() => setIsModalCreateMutationFromHqOpen(true)}
                            className="bg-indigo-500 text-sm sm:text-xs min-w-36 hover:bg-indigo-600 text-white py-4 sm:py-2 px-2 sm:px-6 rounded-lg"
                        >
                            Mutasi Saldo <PlusCircleIcon className="size-4 inline" />
                        </button>
                        <select
                            value={selectedWarehouse}
                            onChange={(e) => {
                                setSelectedWarehouse(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="form-select block w-fit p-2.5"
                        >
                            {warehouses?.data?.map((warehouse) => (
                                <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                </option>
                            ))}
                        </select>
                    </>
                )}
                <button
                    onClick={() => {
                        mutateCashBankBalance();
                        fetchJournalsByWarehouse();
                    }}
                    className="small-button"
                >
                    <RefreshCcwIcon className="size-4" />
                </button>
                <button onClick={() => setIsModalFilterDataOpen(true)} className="small-button">
                    <FilterIcon className="size-4" />
                </button>
                {/* <Link href={`/dashboard/mutation`} className="small-button">
                    <ArrowUpRight className="size-4" />
                </Link> */}
                <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                    <div className="mb-4">
                        <Label className="font-bold">Tanggal</Label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control" />
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
            <Modal isOpen={isModalCreateMutationFromHqOpen} onClose={closeModal} maxWidth={"max-w-2xl"} modalTitle="Penambahan Saldo Kas & Bank">
                <div className="flex mb-4 justify-evenly w-full">
                    <button
                        onClick={() => {
                            setMutationMode("single");
                        }}
                        className={`${
                            mutationMode === "single" ? "bg-lime-500 text-white scale-105 text-sm" : "bg-slate-400 text-slate-300 text-xs"
                        } w-full py-1 cursor-pointer hover:text-sm transition-all duration-100 ease-in`}
                    >
                        Single
                    </button>
                    <button
                        onClick={() => {
                            setMutationMode("multiple");
                        }}
                        className={`${
                            mutationMode === "multiple" ? "bg-lime-500 text-white scale-105 text-sm" : "bg-slate-400 text-slate-300 text-xs"
                        } w-full py-1 cursor-pointer hover:text-sm transition-all duration-100 ease-in`}
                    >
                        Multiple
                    </button>
                </div>
                {mutationMode === "single" ? (
                    <CreateMutationFromHq
                        cashBank={cashBank}
                        isModalOpen={setIsModalCreateMutationFromHqOpen}
                        notification={notification}
                        fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                        warehouses={warehouses?.data}
                        accountBalance={accountBalance}
                    />
                ) : (
                    <CreateMutationFromHqMultiple
                        cashBank={cashBank}
                        isModalOpen={setIsModalCreateMutationFromHqOpen}
                        notification={notification}
                        fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                        warehouses={warehouses?.data}
                    />
                )}
            </Modal>
            <Modal isOpen={isModalCreateJournalOpen} onClose={closeModal} modalTitle="Jurnal umum">
                <CreateJournal
                    cashBank={cashBank}
                    isModalOpen={setIsModalCreateJournalOpen}
                    notification={notification}
                    warehouses={warehouses?.data}
                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                />
            </Modal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="mb-4 card p-4 sm:col-span-2 h-fit">
                    {loading || (isValidating && <LoaderCircleIcon size={20} className="animate-spin absolute top-2 text-slate-400 left-2" />)}
                    <h1 className="card-title">
                        Mutasi Saldo
                        <span className="card-subtitle text-nowrap">Periode: {endDate}</span>
                    </h1>
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
                                {accountBalance?.data?.chartOfAccounts?.map((account, index) => (
                                    <tr key={index}>
                                        <td>
                                            {account.acc_name}
                                            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold block sm:hidden">
                                                {formatNumber(account.balance)}
                                            </span>
                                        </td>
                                        <td className="text-end text-yellow-500 dark:text-yellow-200 font-bold hidden sm:table-cell">
                                            {formatNumber(account.balance ?? 0)}
                                        </td>
                                        <td className="text-end">{formatNumber(mutationInSumById(account.id) ?? 0)}</td>
                                        <td className="text-end">{formatNumber(mutationOutSumById(account.id) ?? 0)}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="font-bold ">
                                        {Number(selectedWarehouse) === 1 ? "Penambahan saldo ke Cabang" : "Penambahan saldo dari HQ"}
                                    </td>
                                    <td className="text-end font-bold hidden sm:table-cell"></td>
                                    <td className="text-end font-bold"></td>
                                    <td className="text-end font-bold">
                                        {(() => {
                                            const remaining = mutationInSum - mutationOutSum;

                                            if (remaining === 0) {
                                                return <span className="text-green-600">Completed</span>;
                                            }

                                            if (loading || isValidating) {
                                                return "...";
                                            }

                                            return <span className="text-red-600 dark:text-red-400">{formatNumber(remaining)}</span>;
                                        })()}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr className="">
                                    <th>
                                        Total{" "}
                                        <span className="font-bold text-blue-500 block sm:hidden">
                                            {loading ||
                                                (isValidating &&
                                                    formatNumber(accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + acc.balance, 0)))}
                                        </span>
                                    </th>
                                    <th className="text-end font-bold hidden sm:table-cell">
                                        {loading || isValidating
                                            ? "..."
                                            : formatNumber(accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + acc.balance, 0))}
                                    </th>
                                    <th className="text-end">{loading || isValidating ? "..." : formatNumber(mutationInSum)}</th>
                                    <th className="text-end">{loading || isValidating ? "..." : formatNumber(mutationOutSum)}</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <BalanceMutationHistory
                    cashBank={cashBank}
                    warehouse={warehouse}
                    notification={notification}
                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                    selectedWarehouse={selectedWarehouse}
                    journalsByWarehouse={journalsByWarehouse}
                    userRole={userRole}
                    warehouses={warehouses?.data}
                    accountBalance={accountBalance}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </>
    );
};

export default CashBankMutation;
