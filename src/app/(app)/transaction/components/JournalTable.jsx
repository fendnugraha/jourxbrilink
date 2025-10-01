"use client";

import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import axios from "@/libs/axios";
import { useState } from "react";
import Pagination from "@/components/PaginateList";
import { CheckCheck, CheckIcon, FilterIcon, MessageCircleWarningIcon, PencilIcon, SearchIcon, TrashIcon, XIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import EditJournal from "./EditJournal";
import TimeAgo from "@/libs/formatDateDistance";
import EditMutationJournal from "./EditMutationJournal";
import EditDeposit from "./EditDeposit";

const getCurrentDate = () => {
    const nowUTC = new Date();
    const jakartaOffset = 7 * 60; // WIB = UTC+7 (dalam menit)
    const local = new Date(nowUTC.getTime() + jakartaOffset * 60 * 1000);

    const year = local.getUTCFullYear();
    const month = String(local.getUTCMonth() + 1).padStart(2, "0");
    const day = String(local.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const JournalTable = ({
    cashBank,
    journalsByWarehouse,
    warehouses,
    warehouse,
    warehouseId,
    notification,
    fetchJournalsByWarehouse,
    user,
    loading,
    hqCashBank,
}) => {
    const [selectedAccount, setSelectedAccount] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isModalFilterJournalOpen, setIsModalFilterJournalOpen] = useState(false);
    const [isModalDeleteJournalOpen, setIsModalDeleteJournalOpen] = useState(false);
    const [isModalEditJournalOpen, setIsModalEditJournalOpen] = useState(false);
    const [isModalEditDepositOpen, setIsModalEditDepositOpen] = useState(false);
    const [isModalEditMutationJournalOpen, setIsModalEditMutationJournalOpen] = useState(false);
    const [selectedJournalId, setSelectedJournalId] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const userRole = user?.role?.role;
    const warehouseCash = Number(user?.role?.warehouse?.chart_of_account_id);
    const closeModal = () => {
        setIsModalFilterJournalOpen(false);
        setIsModalDeleteJournalOpen(false);
        setIsModalEditJournalOpen(false);
        setIsModalEditMutationJournalOpen(false);
        setIsModalEditDepositOpen(false);
    };

    const filterSelectedJournalId = journalsByWarehouse?.data?.find((journal) => journal.id === selectedJournalId);

    const handleDeleteJournal = async (id) => {
        try {
            const response = await axios.delete(`/api/journals/${id}`);
            notification({ type: "success", message: response.data.message });
            fetchJournalsByWarehouse();
        } catch (error) {
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
            console.log(error);
        }
    };

    const branchAccount = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === Number(selectedWarehouse));
    const filteredJournals =
        journalsByWarehouse?.data?.filter((journal) => {
            const matchAccount =
                selectedAccount && (Number(journal.cred_code) === Number(selectedAccount) || Number(journal.debt_code) === Number(selectedAccount));

            const matchSearchTerm =
                searchTerm &&
                ((journal.debt?.acc_name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.cred?.acc_name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.description ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.id ?? "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.invoice ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.amount ?? "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.transaction ?? []).some((t) => (t.product?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())));

            if (selectedAccount && searchTerm) {
                return matchAccount && matchSearchTerm;
            }

            if (selectedAccount) {
                return matchAccount;
            }

            if (searchTerm) {
                return matchSearchTerm;
            }

            return true;
        }) || [];

    const totalItems = filteredJournals?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredJournals?.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const hqCashBankIds = hqCashBank.map((cashBank) => cashBank.id);

    const formatLongDate = (dateString) => {
        const tanggal = new Date(dateString);
        const formatted = new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(tanggal);

        return formatted;
    };

    const ConfirmJournalIsClean = async (id) => {
        try {
            const response = await axios.put(`/api/update-confirm-status/${id}`);
            notification({ type: "success", message: response.data.message });
            fetchJournalsByWarehouse();
        } catch (error) {
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
            console.log(error);
        }
    };
    return (
        <>
            <div className="flex gap-2 px-4">
                <button className="small-button" onClick={() => setShowSearch(!showSearch)}>
                    <SearchIcon size={20} />
                </button>
                <select
                    onChange={(e) => {
                        setSelectedAccount(e.target.value);
                        setCurrentPage(1);
                    }}
                    value={selectedAccount}
                    className="form-select block w-full p-2.5"
                >
                    <option value="">Semua Akun</option>
                    {branchAccount.map((account, index) => (
                        <option key={index} value={account.id}>
                            {account.acc_name}
                        </option>
                    ))}
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
                <button onClick={() => setIsModalFilterJournalOpen(true)} className="small-button">
                    <FilterIcon className="size-4" />
                </button>
                <Modal isOpen={isModalFilterJournalOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                    {["Administrator", "Super Admin"].includes(userRole) && (
                        <div className="mb-4">
                            <Label>Cabang</Label>
                            <select
                                onChange={(e) => {
                                    setSelectedWarehouse(e.target.value);
                                    setCurrentPage(1);
                                }}
                                value={selectedWarehouse}
                                className="form-control"
                            >
                                <option value="Semua">Semua Akun</option>
                                {warehouses?.data?.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                            <Label>Dari</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control" />
                        </div>
                        <div>
                            <Label>Sampai</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control" disabled={!startDate} />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            fetchJournalsByWarehouse(selectedWarehouse, startDate, endDate);
                            warehouseId(selectedWarehouse);

                            setIsModalFilterJournalOpen(false);
                            setSelectedAccount("");
                            setCurrentPage(1);
                        }}
                        className="btn-primary"
                    >
                        Submit
                    </button>
                </Modal>
            </div>
            <input
                type="search"
                className={`transform transition-all duration-500 ease-in-out origin-top-left 
                            ${showSearch ? "form-control !w-1/2 !py-1 opacity-100 scale-100 mt-1 drop-shadow-sm" : "opacity-0 scale-0 h-0 p-0"}
                        `}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
            />

            <div className="pt-1 px-4">
                <h4 className="text-xs text-slate-500 dark:text-slate-200">
                    {warehouses?.data?.find((w) => w.id === Number(selectedWarehouse))?.name},{" "}
                    {startDate === endDate ? formatLongDate(endDate) : `${formatLongDate(startDate)} s/d ${formatLongDate(endDate)}`}
                </h4>
            </div>
            <div className="pb-4 mt-2">
                <div className="overflow-x-auto">
                    <table className="table w-full text-xs">
                        <thead>
                            <tr>
                                <th>Deskripsi</th>
                                <th>Jumlah</th>
                                <th className="hidden sm:table-cell">Action</th>
                                <th className="hidden sm:table-cell" hidden={!["Super Admin"].includes(userRole)}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center">
                                        <span className="text-sm text-slate-500">{loading ? "Loading..." : "No data found."}</span>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((journal, index) => (
                                    <tr key={index} className="group hover:bg-slate-500 hover:text-white">
                                        <td>
                                            <span className="text-xs text-blue-700 dark:text-blue-300 group-hover:dark:text-blue-200 group-hover:text-blue-400 block">
                                                #{journal.id} <span className="font-bold hidden sm:inline">{journal.invoice}</span>{" "}
                                                {formatDateTime(journal.created_at)}{" "}
                                                {journal.is_confirmed ? (
                                                    <span className="font-bold bg-green-300 text-green-700 rounded-full px-1 inline-flex gap-1 items-center">
                                                        <CheckCheck size={12} />
                                                        Clear
                                                    </span>
                                                ) : (
                                                    ""
                                                )}
                                            </span>
                                            <span className="font-bold text-xs block text-lime-600 dark:text-lime-300 group-hover:text-lime-700 group-hover:dark:text-lime-400">
                                                {journal.trx_type === "Voucher & SP" || journal.trx_type === "Accessories" ? (
                                                    <ul className="list-disc font-normal scale-95">
                                                        {journal.transaction.map((trx) => (
                                                            <li key={trx.id}>
                                                                {trx.product.name} x {trx.quantity * -1}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : journal.trx_type === "Mutasi Kas" ? (
                                                    journal.cred.acc_name + " -> " + journal.debt.acc_name
                                                ) : Number(journal.debt_code) === warehouseCash ? (
                                                    journal.cred.acc_name
                                                ) : (
                                                    journal.debt.acc_name
                                                )}
                                                .{" "}
                                                <span className="font-normal hidden sm:inline text-slate-500 dark:text-slate-300">
                                                    Note: {journal.description}
                                                </span>
                                            </span>
                                            <span className="text-xs hidden sm:block text-slate-500 dark:text-slate-400">
                                                Last update at <TimeAgo timestamp={journal.updated_at} />
                                            </span>
                                            <div className="flex mt-1 gap-3 sm:hidden">
                                                <button
                                                    className=" hover:scale-125 transtition-all duration-200"
                                                    hidden={!["Deposit"].includes(journal.trx_type)}
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalEditDepositOpen(true);
                                                    }}
                                                >
                                                    <PencilIcon className="size-4 text-indigo-700 dark:text-indigo-300 group-hover:dark:text-white group-hover:text-slate-600" />
                                                </button>
                                                <button
                                                    className=" hover:scale-125 transtition-all duration-200"
                                                    hidden={!["Transfer Uang", "Tarik Tunai"].includes(journal.trx_type)}
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalEditJournalOpen(true);
                                                    }}
                                                >
                                                    <PencilIcon className="size-4 text-indigo-700 dark:text-indigo-300 group-hover:dark:text-white group-hover:text-slate-600" />
                                                </button>
                                                <button
                                                    className=" hover:scale-125 transtition-all duration-200"
                                                    hidden={!["Mutasi Kas"].includes(journal.trx_type) || hqCashBankIds.includes(journal.cred_code)}
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalEditMutationJournalOpen(true);
                                                    }}
                                                >
                                                    <PencilIcon className="size-4 text-indigo-700 dark:text-indigo-300 group-hover:dark:text-white group-hover:text-slate-600" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalDeleteJournalOpen(true);
                                                    }}
                                                    disabled={
                                                        ["Voucher & SP", "Accessories", null].includes(journal.trx_type) ||
                                                        (userRole !== "Administrator" && hqCashBankIds.includes(journal.cred_code))
                                                    }
                                                    className="disabled:text-slate-300 disabled:cursor-not-allowed text-red-600 dark:text-red-400 hover:scale-125 transition-all group-hover:dark:text-white group-hover:text-slate-600 duration-200"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="font-bold text-end text-slate-600 dark:text-slate-300 ">
                                            <span
                                                className={`${Number(journal.debt_code) === Number(selectedAccount) ? "text-green-500 dark:text-green-400" : ""}
                                    ${Number(journal.cred_code) === Number(selectedAccount) ? "text-red-500 dark:text-red-400" : ""}
                                        text-sm group-hover:text-sky-400 group-hover:dark:text-yellow-400 sm:text-base xl:text-lg`}
                                            >
                                                {formatNumber(journal.amount)}
                                            </span>
                                            {journal.fee_amount !== 0 && (
                                                <span className="text-xs text-yellow-600 group-hover:text-slate-600 group-hover:dark:text-white block">
                                                    {formatNumber(journal.fee_amount)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="hidden sm:table-cell">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    className=" hover:scale-125 transtition-all duration-200"
                                                    hidden={!["Deposit"].includes(journal.trx_type)}
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalEditDepositOpen(true);
                                                    }}
                                                >
                                                    <PencilIcon className="size-4 text-indigo-700 dark:text-indigo-300 group-hover:dark:text-white group-hover:text-slate-600" />
                                                </button>
                                                <button
                                                    className=" hover:scale-125 transtition-all duration-200"
                                                    hidden={!["Transfer Uang", "Tarik Tunai"].includes(journal.trx_type)}
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalEditJournalOpen(true);
                                                    }}
                                                >
                                                    <PencilIcon className="size-4 text-indigo-700 dark:text-indigo-300 group-hover:dark:text-white group-hover:text-slate-600" />
                                                </button>
                                                <button
                                                    className=" hover:scale-125 transtition-all duration-200"
                                                    hidden={!["Mutasi Kas"].includes(journal.trx_type) || hqCashBankIds.includes(journal.cred_code)}
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalEditMutationJournalOpen(true);
                                                    }}
                                                >
                                                    <PencilIcon className="size-4 text-indigo-700 dark:text-indigo-300 group-hover:dark:text-white group-hover:text-slate-600" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalDeleteJournalOpen(true);
                                                    }}
                                                    disabled={
                                                        ["Voucher & SP", "Accessories", null].includes(journal.trx_type) ||
                                                        (userRole !== "Administrator" && hqCashBankIds.includes(journal.cred_code))
                                                    }
                                                    className="disabled:text-slate-300 disabled:cursor-not-allowed text-red-600 dark:text-red-400 hover:scale-125 transition-all group-hover:dark:text-white group-hover:text-slate-600 duration-200"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell w-16" hidden={!["Super Admin"].includes(userRole)}>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Are you sure to confirm this journal?")) ConfirmJournalIsClean(journal.id);
                                                }}
                                                className={`hover:scale-125 transtition-all duration-200 ${
                                                    journal.is_confirmed ? "bg-red-500" : "bg-green-500"
                                                } p-2 rounded-full cursor-pointer`}
                                            >
                                                {journal.is_confirmed ? (
                                                    <XIcon size={20} className="text-white" />
                                                ) : (
                                                    <CheckIcon size={20} className="text-white" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <Pagination
                        className="w-full px-4"
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
            <Modal isOpen={isModalDeleteJournalOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                <div className="flex flex-col items-center justify-center gap-3 mb-4">
                    <MessageCircleWarningIcon size={100} className="text-red-600" />
                    <h1 className="text-2xl font-bold text-slate-500 text-center">Apakah anda yakin ??</h1>
                    <p className="text-sm text-center">(ID: {selectedJournalId})</p>
                </div>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => setIsModalDeleteJournalOpen(false)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Tidak
                    </button>
                    <button
                        onClick={() => {
                            handleDeleteJournal(selectedJournalId);
                            setIsModalDeleteJournalOpen(false);
                        }}
                        className="btn-primary w-full"
                    >
                        Ya
                    </button>
                </div>
            </Modal>
            <Modal isOpen={isModalEditJournalOpen} onClose={closeModal} modalTitle="Edit Journal" maxWidth="max-w-2xl">
                <EditJournal
                    isModalOpen={setIsModalEditJournalOpen}
                    journal={filterSelectedJournalId}
                    branchAccount={branchAccount}
                    notification={notification}
                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                />
            </Modal>
            <Modal isOpen={isModalEditDepositOpen} onClose={closeModal} modalTitle="Edit Penjualan Deposit" maxWidth="max-w-2xl">
                <EditDeposit
                    isModalOpen={setIsModalEditDepositOpen}
                    journal={filterSelectedJournalId}
                    branchAccount={branchAccount}
                    notification={notification}
                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                />
            </Modal>
            <Modal isOpen={isModalEditMutationJournalOpen} onClose={closeModal} modalTitle="Edit Mutasi Journal" maxWidth="max-w-2xl">
                <EditMutationJournal
                    isModalOpen={setIsModalEditMutationJournalOpen}
                    selectedWarehouse={selectedWarehouse}
                    journal={filterSelectedJournalId}
                    cashBank={cashBank}
                    notification={notification}
                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                />
            </Modal>
        </>
    );
};

export default JournalTable;
