"use client";
import { useCallback, useEffect, useState } from "react";
import MainPage from "../../main";
import { useAuth } from "@/libs/auth";
import useGetWarehouses from "@/libs/getAllWarehouse";
import axios from "@/libs/axios";
import { DateTimeNow, formatLongDate, todayDate } from "@/libs/format";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import Notification from "@/components/Notification";
import CreateCorrection from "./CreateCorrection";
import CorrectionTable from "./CorrectionTable";
import TransactionTable from "./TransactionTable";
import { set } from "date-fns";
import PercentageCount from "./PercentageCount";

const InspectionPage = () => {
    const { today } = DateTimeNow();
    const { user } = useAuth({ middleware: "auth" });
    const warehouse = Number(user?.role?.warehouse_id);
    const { warehouses, warehousesError } = useGetWarehouses();
    const [cashBank, setCashBank] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(todayDate());
    const [endDate, setEndDate] = useState(todayDate());
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isModalCreateCorrectionOpen, setIsModalCreateCorrectionOpen] = useState(false);
    const closeModal = () => {
        setIsModalCreateCorrectionOpen(false);
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

    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [journalsByWarehouse, setJournalsByWarehouse] = useState([]);

    const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouse);
    const [selectedAccount, setSelectedAccount] = useState("");
    const branchAccount = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === Number(selectedWarehouseId));
    const fetchJournalsByWarehouse = useCallback(
        async (selectedWarehouse = selectedWarehouseId, start_Date = startDate, end_Date = endDate) => {
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
        [selectedWarehouseId, startDate, endDate]
    );

    useEffect(() => {
        fetchJournalsByWarehouse();
    }, [fetchJournalsByWarehouse]); // Include startDate and endDate in the dependency array

    const [filterConfirmed, setFilterConfirmed] = useState("");
    const filteredJournals =
        journalsByWarehouse?.data?.filter((journal) => {
            const lowerSearch = searchTerm?.toLowerCase() || "";

            const matchAccountId = journal.debt?.account_id === 2 || journal.cred?.account_id === 2;

            const matchAccount = selectedAccount && [journal.cred_code, journal.debt_code].some((code) => Number(code) === Number(selectedAccount));

            const matchSearchTerm =
                lowerSearch &&
                ((journal.debt?.acc_name ?? "").toLowerCase().includes(lowerSearch) ||
                    (journal.cred?.acc_name ?? "").toLowerCase().includes(lowerSearch) ||
                    (journal.description ?? "").toLowerCase().includes(lowerSearch) ||
                    (journal.id ?? "").toString().toLowerCase().includes(lowerSearch) ||
                    (journal.invoice ?? "").toLowerCase().includes(lowerSearch) ||
                    (journal.amount ?? "").toString().toLowerCase().includes(lowerSearch) ||
                    (journal.transaction ?? []).some((t) => (t.product?.name ?? "").toLowerCase().includes(lowerSearch)));

            // 🔹 Filter berdasarkan konfirmasi
            if (filterConfirmed !== "") {
                const confirmedMatch = Number(journal.is_confirmed) === Number(filterConfirmed);

                if (selectedAccount && searchTerm) return matchAccountId && matchAccount && matchSearchTerm && confirmedMatch;
                if (selectedAccount) return matchAccountId && matchAccount && confirmedMatch;
                if (searchTerm) return matchAccountId && matchSearchTerm && confirmedMatch;
                return matchAccountId && confirmedMatch;
            }

            if (selectedAccount && searchTerm) return matchAccountId && matchAccount && matchSearchTerm;
            if (selectedAccount) return matchAccountId && matchAccount;
            if (searchTerm) return matchAccountId && matchSearchTerm;

            return matchAccountId; // default tetap hanya account_id=2
        }) || [];
    const [selectedJournalIds, setSelectedJournalIds] = useState([]);
    const totalTransaction = journalsByWarehouse?.data?.filter((j) => Number(j.debt?.account_id) === 2 || Number(j.cred?.account_id) === 2).length || 0;

    const totalConfirmedTransaction =
        journalsByWarehouse?.data?.filter((j) => (Number(j.debt?.account_id) === 2 || Number(j.cred?.account_id) === 2) && Number(j.is_confirmed) === 1)
            .length || 0;

    const calculatePercentage = () => {
        if (totalTransaction > 0) {
            return ((totalConfirmedTransaction / totalTransaction) * 100).toFixed(2);
        }
        return 0;
    };

    const handleConfirmSelected = async () => {
        if (!confirm("Are you sure you want to confirm selected journal?")) return;
        setLoading(true);
        try {
            const response = await axios.post("/api/update-confirm-status-batch", { journal_ids: selectedJournalIds });
            setNotification({ type: "success", message: response.data.message });
            setSelectedJournalIds([]);
            fetchJournalsByWarehouse(selectedWarehouseId, startDate, endDate);
        } catch (error) {
            setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const selectedarehouseCashId = warehouses?.data?.find((w) => w.id === Number(selectedWarehouseId))?.chart_of_account_id;
    const [selectTable, setSelectTable] = useState("transaksi");

    const [correction, setCorrection] = useState([]);
    const fetchCorrection = useCallback(
        async (url = "/api/correction") => {
            setLoading(true);
            try {
                const response = await axios.get(url, { params: { warehouse_id: selectedWarehouseId, start_date: startDate, end_date: endDate } });
                setCorrection(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [selectedWarehouseId, endDate, startDate]
    );

    useEffect(() => {
        fetchCorrection();
    }, [fetchCorrection]);

    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            {selectedJournalIds.length > 0 && (
                <button
                    className="py-2 px-4 text-sm w-fit bg-blue-600 hover:bg-blue-500 drop-shadow-2xl rounded-2xl fixed bottom-4 right-8"
                    disabled={loading || selectedJournalIds.length === 0}
                    onClick={handleConfirmSelected}
                >
                    Confirm selected <span className="font-bold bg-white text-blue-600 px-2 py-0.5 rounded-full">{selectedJournalIds.length}</span>
                </button>
            )}

            <MainPage headerTitle="Inspection">
                <div className="grid grid-cols-4 gap-4 p-4 sm:p-8">
                    <div className="card p-4 col-span-3">
                        <div className="flex justify-between items-start">
                            <h1 className="card-title mb-4">
                                {warehouses?.data?.find((w) => w.id === Number(selectedWarehouseId))?.name},{" "}
                                {startDate === endDate ? formatLongDate(endDate) : `${formatLongDate(startDate)} s/d ${formatLongDate(endDate)}`}
                            </h1>
                            <button className="btn-primary !bg-yellow-500" onClick={() => setIsModalCreateCorrectionOpen(true)}>
                                Buat Koreksi
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <button
                                    onClick={() => setSelectTable("transaksi")}
                                    className={`${
                                        selectTable === "transaksi"
                                            ? "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg border-b-0 rounded-b-none"
                                            : "bg-slate-100 dark:bg-slate-700"
                                    } px-3 py-1 mr-2 text-sm`}
                                >
                                    Transaksi
                                </button>
                                <button
                                    onClick={() => setSelectTable("koreksi")}
                                    className={`${
                                        selectTable === "koreksi"
                                            ? "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg border-b-0 rounded-b-none"
                                            : "bg-slate-100 dark:bg-slate-700"
                                    } px-3 py-1 mr-2 text-sm`}
                                >
                                    Koreksi
                                </button>
                                <button
                                    onClick={() => setSelectTable("summary")}
                                    className={`${
                                        selectTable === "summary"
                                            ? "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg border-b-0 rounded-b-none"
                                            : "bg-slate-100 dark:bg-slate-700"
                                    } px-3 py-1 text-sm`}
                                >
                                    Summary
                                </button>
                            </div>
                            <div className="flex justify-end gap-2">
                                <select
                                    onChange={(e) => {
                                        setSelectedAccount(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    value={selectedAccount}
                                    className="form-select p-2.5"
                                >
                                    <option value="">Semua Akun</option>
                                    {branchAccount
                                        .filter((account) => account.account_id === 2)
                                        .map((account, index) => (
                                            <option key={index} value={account.id}>
                                                {account.acc_name}
                                            </option>
                                        ))}
                                </select>
                                <select className="form-select p-2.5 !w-fit" value={filterConfirmed} onChange={(e) => setFilterConfirmed(e.target.value)}>
                                    <option value={""}>Semua</option>
                                    <option value={1}>Confirmed</option>
                                    <option value={0}>Unconfirmed</option>
                                </select>
                                <select
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="form-select !w-fit p-2.5"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                        {selectTable === "transaksi" && (
                            <TransactionTable
                                filteredJournals={filteredJournals}
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                                setCurrentPage={setCurrentPage}
                                selectedarehouseCashId={selectedarehouseCashId}
                                selectedAccount={selectedAccount}
                                selectedJournalIds={selectedJournalIds}
                                setSelectedJournalIds={setSelectedJournalIds}
                                cashBank={cashBank}
                            />
                        )}
                        {selectTable === "koreksi" && (
                            <CorrectionTable
                                correctionData={correction}
                                selectedWarehouseCashId={selectedarehouseCashId}
                                fetchCorrection={fetchCorrection}
                                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                notification={setNotification}
                            />
                        )}
                        {selectTable === "summary" && <PercentageCount startDate={startDate} endDate={endDate} />}
                    </div>
                    <div className="card p-4 h-fit">
                        <h1 className="card-title mb-4">Filter</h1>

                        <input
                            type="search"
                            className="form-control mb-2 mt-4"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                        />

                        <div className="my-4">
                            <Label>Cabang</Label>
                            <select
                                onChange={(e) => {
                                    setSelectedWarehouseId(e.target.value);
                                    setCurrentPage(1);
                                    setSelectedAccount("");
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
                        <div className="grid grid-cols-1 gap-2 mb-2">
                            <div>
                                <Label>Dari</Label>
                                <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control" />
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
                                fetchCorrection();
                                setSelectedAccount("");
                                setCurrentPage(1);
                            }}
                            className="btn-primary w-full"
                        >
                            Submit
                        </button>

                        <div className="font-semibold text-4xl h-24 flex flex-col justify-center items-center bg-green-200 dark:bg-green-600 rounded-2xl mt-2">
                            <h1>{calculatePercentage()}</h1>
                            <h1 className="font-normal text-xs">Complete (%)</h1>
                        </div>
                    </div>
                </div>
                <Modal isOpen={isModalCreateCorrectionOpen} onClose={closeModal} modalTitle="Koreksi Kesalahan" maxWidth="max-w-xl">
                    <CreateCorrection
                        isModalOpen={setIsModalCreateCorrectionOpen}
                        notification={setNotification}
                        fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                        fetchCorrection={fetchCorrection}
                        warehouse={selectedWarehouseId}
                    />
                </Modal>
            </MainPage>
        </>
    );
};

export default InspectionPage;
