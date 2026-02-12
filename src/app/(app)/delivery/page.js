"use client";
import axios from "@/libs/axios";
import MainPage from "../main";
import { DateTimeNow, formatDate, formatDateTime, formatDurationTime, formatNumber } from "@/libs/format";
import { use, useCallback, useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import CreateMutationFromHq from "../dashboard/components/CreateMutationFromHq";
import Modal from "@/components/Modal";
import useGetWarehouses from "@/libs/getAllWarehouse";
import { CheckCheck, PlusCircleIcon, Bike, LoaderIcon, MapPin } from "lucide-react";
import Notification from "@/components/Notification";
import { mutate } from "swr";
import useGetMutationJournal from "@/libs/getMutationJournal";
import { getUserGeoLocation } from "@/libs/GetUserGeolocation";
import DeliveryTable from "./DeliveryTable";
import CourierTable from "./CourierTable";
import CreateMutationFromHqMultiple from "../dashboard/components/CreateMutationFromHqMultiple";
import useCashBankBalance from "@/libs/cashBankBalance";

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
        if (!confirm("Konfirmasi pengiriman kas, pastikan uang sudah diterima dan dihitung?")) return;
        setLoading(true);
        try {
            const response = await axios.put(`/api/update-delivery-status/${journalId}/${status}`);
            mutate(`/api/mutation-journal/${startDate}/${endDate}`);
            setNotification({ type: "success", message: response.data.message });
            getUserGeoLocation();
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
        const matchHqCashAccount = journal?.cred?.warehouse_id === 1 && journal?.cred?.account_id === 1;
        const matchDeliveryStatus = deliveryStatus ? journal?.status === Number(deliveryStatus) : true;

        const matchWarehouse = selectedWarehouse ? journal?.debt?.warehouse?.id === Number(selectedWarehouse) : true;

        const matchSearchTerm = searchTerm
            ? (journal?.invoice ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              (journal?.amount ?? "").toString().toLowerCase().includes(searchTerm.toLowerCase())
            : true;

        return matchHqCashAccount && matchDeliveryStatus && matchWarehouse && matchSearchTerm;
    });

    const [selectTable, setSelectTable] = useState("delivery");
    const [mutationMode, setMutationMode] = useState("single");

    const { accountBalance, error: accountBalanceError, loading: accountBalanceLoading, mutateCashBankBalance } = useCashBankBalance(1, endDate);
    const cashBalance = accountBalance?.data?.chartOfAccounts?.find((acc) => acc?.account_id === 1)?.balance;

    const headquarter = warehouses?.data?.find((warehouse) => warehouse?.id === 1);

    return (
        <MainPage headerTitle="Delivery">
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="py-4 sm:py-8 px-4 sm:px-12">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 ">
                    <div className="h-auto sm:h-[calc(100vh-80px-64px)] overflow-auto">
                        {journals?.filter((journal) => journal?.status === 0).length > 0 ? (
                            journals
                                ?.filter((journal) => journal?.status === 0)
                                .map((journal) => (
                                    <div className="card p-4 mb-4" key={journal?.id}>
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h1 className="font-bold text-xs mb-4">
                                                    {/* <span className="block">{journal?.invoice}</span> */}
                                                    {formatDateTime(journal?.date_issued)}
                                                </h1>
                                                <StatusBadge
                                                    status={journal?.status === 0 ? "In Progress" : "Completed"}
                                                    statusText={journal?.status === 0 ? "On Delivery" : "Delivered"}
                                                />
                                            </div>
                                            {/* <h1 className="text-xs">Tujuan:</h1> */}
                                            <h1 className="font-bold text-md mb-1 text-center pt-2">
                                                {(journal?.debt?.warehouse?.name ?? "").replace(/^konter\s*/i, "")}
                                            </h1>
                                            <h1 className="font-bold text-xl text-yellow-500 text-right px-2 py-1 border border-slate-300 dark:border-slate-500 rounded-2xl">
                                                Rp {formatNumber(journal?.amount)}
                                            </h1>
                                            <button
                                                onClick={() => updateJournalStatus(journal?.id, 1)}
                                                disabled={loading}
                                                className="px-6 py-2 mt-4 w-full min-w-40 hover:drop-shadow-md bg-green-500 dark:bg-green-600 hover:bg-green-400 dark:hover:bg-green-500 text-white rounded-xl text-sm cursor-pointer transition duration-300 ease-in-out"
                                            >
                                                Sudah Diterima
                                            </button>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="h-full flex justify-center items-center">
                                <h1 className="text-xs">Belum ada mutasi kas.</h1>
                            </div>
                        )}
                    </div>
                    <div className="card p-4 sm:col-span-3 h-auto sm:h-[calc(100vh-80px-64px)] overflow-auto relative">
                        {isValidating && (
                            <div className="absolute bottom-2 right-2 flex gap-2 items-center italic bg-white dark:bg-slate-500 py-0.5 px-2 rounded-full text-xs">
                                <LoaderIcon size={18} className="animate-spin" /> Updating data ...
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="card-title mb-4">
                                Rekap Mutasi Kas
                                <span className="card-subtitle">
                                    {formatDate(endDate)} Delivered: {filteredJournals?.filter((journal) => journal?.status === 1).length}/
                                    {filteredJournals?.length} Total: {formatNumber(filteredJournals?.reduce((acc, journal) => acc + journal?.amount, 0))}. Sisa
                                    Kas: {formatNumber(cashBalance)}
                                </span>
                            </h1>
                            <button
                                onClick={() => {
                                    setIsModalCreateMutationFromHqOpen(true);
                                }}
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
                        <div className="flex mt-4">
                            <button
                                onClick={() => setSelectTable("delivery")}
                                className={`${
                                    selectTable === "delivery"
                                        ? "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg border-b-0 rounded-b-none"
                                        : "bg-slate-100 dark:bg-slate-700"
                                } px-3 py-1 cursor-pointer mr-2 text-sm min-w-32`}
                            >
                                Mutasi Kas
                            </button>
                            <button
                                onClick={() => setSelectTable("courier")}
                                className={`${
                                    selectTable === "courier"
                                        ? "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg border-b-0 rounded-b-none"
                                        : "bg-slate-100 dark:bg-slate-700"
                                } px-3 py-1 cursor-pointer mr-2 text-sm min-w-32`}
                            >
                                Kurir
                            </button>
                        </div>
                        {selectTable === "delivery" && (
                            <DeliveryTable
                                headquarter={headquarter}
                                filteredJournals={filteredJournals}
                                loading={isValidating}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        )}
                        {selectTable === "courier" && (
                            <CourierTable
                                filteredJournals={filteredJournals}
                                loading={isValidating}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalCreateMutationFromHqOpen} onClose={closeModal} maxWidth="max-w-2xl" modalTitle="Penambahan Saldo Kas & Bank">
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
                        notification={setNotification}
                        fetchJournalsByWarehouse={() => mutate(`/api/mutation-journal/${startDate}/${endDate}`)}
                        warehouses={warehouses?.data}
                        accountBalance={accountBalance}
                    />
                ) : (
                    <CreateMutationFromHqMultiple
                        cashBank={cashBank}
                        isModalOpen={setIsModalCreateMutationFromHqOpen}
                        notification={setNotification}
                        fetchJournalsByWarehouse={() => mutate(`/api/mutation-journal/${startDate}/${endDate}`)}
                        warehouses={warehouses?.data}
                    />
                )}
            </Modal>
        </MainPage>
    );
};

export default DeliveryPage;
