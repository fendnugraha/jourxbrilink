"use client";
import { useCallback, useEffect, useState } from "react";
import MainPage from "../../main";
import { useAuth } from "@/libs/auth";
import useGetWarehouses from "@/libs/getAllWarehouse";
import axios from "@/libs/axios";
import { formatDateTime, formatLongDate, formatNumber, todayDate } from "@/libs/format";
import { CheckCheck, CheckIcon, FilterIcon, SearchIcon, XIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import TimeAgo from "@/libs/formatDateDistance";
import SimplePagination from "@/components/SimplePagination";
import { set } from "date-fns";
import Notification from "@/components/Notification";
import PercentageCount from "./PercentageCount";

const InspectionPage = () => {
    const { user } = useAuth({ middleware: "auth" });
    const warehouse = Number(user?.role?.warehouse_id);
    const warehouseCashId = Number(user?.role?.warehouse?.chart_of_account_id);
    const warehouseName = user?.role?.warehouse?.name;
    const { warehouses, warehousesError } = useGetWarehouses();
    const [cashBank, setCashBank] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(todayDate());
    const [endDate, setEndDate] = useState(todayDate());
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isModalFilterJournalOpen, setIsModalFilterJournalOpen] = useState(false);
    const closeModal = () => {
        setIsModalFilterJournalOpen(false);
    };
    const fetchCashBank = async () => {
        try {
            const response = await axios.get(`/api/get-cash-and-bank`);
            setCashBank(response.data.data); // Commented out as it's not used
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCashBank();
    }, []);
    const hqCashBank = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === 1);

    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [journalsByWarehouse, setJournalsByWarehouse] = useState([]);

    const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouse);
    const [selectedAccount, setSelectedAccount] = useState("");
    const branchAccount = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === Number(selectedWarehouseId));
    const bankAccount = hqCashBank.filter((cashBank) => Number(cashBank.account_id) === 2);
    console.log(bankAccount);
    const fetchJournalsByWarehouse = useCallback(
        async (selectedWarehouse = warehouse, start_Date = startDate, end_Date = endDate) => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/get-journal-by-warehouse/${selectedWarehouse}/${start_Date}/${end_Date}`);
                setJournalsByWarehouse(response.data);
            } catch (error) {
                setNotification({ type: "error", message: "Something went wrong." });
                console.log(error);
            } finally {
                setLoading(false);
            }
        },
        [warehouse, startDate, endDate]
    );

    useEffect(() => {
        fetchJournalsByWarehouse();
    }, [fetchJournalsByWarehouse]); // Include startDate and endDate in the dependency array

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

    const [selectedJournalIds, setSelectedJournalIds] = useState([]);

    const totalTransaction = journalsByWarehouse?.data?.filter((j) => [1, 2].includes(j.debt?.account_id) || [1, 2].includes(j.cred?.account_id)).length;

    const totalConfirmedTransaction = journalsByWarehouse?.data?.filter((j) => j.is_confirmed).length;

    const [trxByWarehouse, setTrxByWarehouse] = useState([]);
    const calculateTrxbyWarehouse = useCallback(
        async (start_Date = startDate, end_Date = endDate) => {
            try {
                const response = await axios.get(`/api/calculate-trx-by-warehouse/${start_Date}/${end_Date}`);
                setTrxByWarehouse(response.data);
            } catch (error) {
                setNotification({ type: "error", message: "Something went wrong." });
                console.log(error);
            }
        },
        [startDate, endDate]
    );

    useEffect(() => {
        calculateTrxbyWarehouse();
    }, [calculateTrxbyWarehouse]);

    const handleConfirmSelected = async () => {
        confirm("Are you sure you want to confirm selected journal?");
        setLoading(true);
        try {
            const response = await axios.post("/api/update-confirm-status-batch", { journal_ids: selectedJournalIds });
            setNotification({ type: "success", message: response.data.message });
            setSelectedJournalIds([]);
            fetchJournalsByWarehouse(selectedWarehouseId, startDate, endDate);
            calculateTrxbyWarehouse(startDate, endDate);
        } catch (error) {
            setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const selectedarehouseCashId = warehouses?.data?.find((w) => w.id === Number(selectedWarehouseId))?.chart_of_account_id;

    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <MainPage headerTitle="Inspection">
                <div className="grid grid-cols-3 gap-4 p-4 sm:p-8">
                    <div className="card p-4 col-span-2">
                        <h1 className="card-title mb-4">
                            Inspection
                            <span className="card-subtitle">
                                {warehouses?.data?.find((w) => w.id === Number(selectedWarehouseId))?.name},{" "}
                                {startDate === endDate ? formatLongDate(endDate) : `${formatLongDate(startDate)} s/d ${formatLongDate(endDate)}`}
                            </span>
                        </h1>
                        <div className="flex gap-2">
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
                                <div className="mb-4">
                                    <Label>Cabang</Label>
                                    <select
                                        onChange={(e) => {
                                            setSelectedWarehouseId(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        value={selectedWarehouseId}
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

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div>
                                        <Label>Dari</Label>
                                        <Input
                                            type="datetime-local"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="form-control"
                                        />
                                    </div>
                                    <div>
                                        <Label>Sampai</Label>
                                        <Input
                                            type="datetime-local"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="form-control"
                                            disabled={!startDate}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        fetchJournalsByWarehouse(selectedWarehouseId, startDate, endDate);

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
                            className="form-control my-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                        />
                        {selectedJournalIds.length > 0 && (
                            <button className="btn-primary" disabled={loading || selectedJournalIds.length === 0} onClick={handleConfirmSelected}>
                                Confirm selected {selectedJournalIds.length}
                            </button>
                        )}
                        <div className="overflow-x-auto">
                            <table className="table w-full text-xs">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th className="text-center">
                                            <CheckCheck />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems?.length > 0 ? (
                                        currentItems.map((journal) => (
                                            <tr key={journal.id}>
                                                <td>
                                                    <span className="text-xs text-blue-700 dark:text-blue-300 group-hover:dark:text-blue-200 group-hover:text-blue-400 block">
                                                        #{journal.id} <span className="font-bold hidden sm:inline">{journal.invoice}</span>{" "}
                                                        {formatDateTime(journal.date_issued)}{" "}
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
                                                        ) : Number(journal.debt_code) === selectedarehouseCashId ? (
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
                                                </td>
                                                <td className="font-bold text-end text-slate-600 dark:text-slate-300 ">
                                                    <span
                                                        className={`${
                                                            Number(journal.debt_code) === Number(selectedAccount) ? "text-green-500 dark:text-green-400" : ""
                                                        }
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
                                                <td className="text-center w-12">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedJournalIds(
                                                                (prev) =>
                                                                    prev.includes(journal.id)
                                                                        ? prev.filter((id) => id !== journal.id) // kalau ada → hapus
                                                                        : [...prev, journal.id] // kalau tidak ada → tambah
                                                            )
                                                        }
                                                        hidden={
                                                            journal.is_confirmed === 1 ||
                                                            bankAccount.includes(journal.cred_code || bankAccount.includes(journal.debt_code))
                                                        }
                                                        className={`hover:scale-125 transtition-all duration-200 ${
                                                            selectedJournalIds?.includes(journal.id) ? "bg-red-500" : "bg-green-500"
                                                        } p-2 rounded-full cursor-pointer`}
                                                    >
                                                        {selectedJournalIds?.includes(journal.id) ? (
                                                            <XIcon size={20} className="text-white" />
                                                        ) : (
                                                            <CheckIcon size={20} className="text-white" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center">
                                                No data found
                                            </td>
                                        </tr>
                                    )}
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
                    <PercentageCount trxByWarehouse={trxByWarehouse} calculateTrxbyWarehouse={calculateTrxbyWarehouse} />
                </div>
            </MainPage>
        </>
    );
};

export default InspectionPage;
