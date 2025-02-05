"use client";
import Modal from "@/components/Modal";
import CreateTransfer from "./components/CreateTransfer";
import Header from "../Header";
import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Notification from "@/components/notification";
import { useAuth } from "@/libs/auth";
import CreateCashWithdrawal from "./components/CreateCashWithdrawal";
import CreateVoucher from "./components/CreateVoucher";
import JournalTable from "./components/JournalTable";
import Dropdown from "@/components/Dropdown";
import CreateDeposit from "./components/CreateDeposit";
import CreateMutationToHq from "./components/CreateMutationToHq";
import CreateBankAdminFee from "./components/CreateBankAdminFee";
import CreateExpense from "./components/CreateExpense";
import CashBankBalance from "./components/CashBankBalance";
import formatNumber from "@/libs/formatNumber";
import Loading from "../loading";
import { ArrowDownCircleIcon, ArrowUpCircleIcon, ChevronDownIcon, ChevronRightIcon, PlusCircleIcon } from "lucide-react";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const TransactionPage = () => {
    const { user } = useAuth({ middleware: "auth" });

    if (!user) {
        return <Loading />;
    }
    const [journalsByWarehouse, setJournalsByWarehouse] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cashBank, setCashBank] = useState([]);
    const [accountBalance, setAccountBalance] = useState([]);
    const [isModalCreateTransferOpen, setIsModalCreateTransferOpen] = useState(false);
    const [isModalCreateCashWithdrawalOpen, setIsModalCreateCashWithdrawalOpen] = useState(false);
    const [isModalCreateDepositOpen, setIsModalCreateDepositOpen] = useState(false);
    const [isModalCreateVoucherOpen, setIsModalCreateVoucherOpen] = useState(false);
    const [isModalCreateExpenseOpen, setIsModalCreateExpenseOpen] = useState(false);
    const [isModalCreateBankAdminFeeOpen, setIsModalCreateBankAdminFeeOpen] = useState(false);
    const [isModalCreateMutationToHqOpen, setIsModalCreateMutationToHqOpen] = useState(false);
    const [notification, setNotification] = useState("");
    const getDailyDashboard = () => JSON.parse(localStorage.getItem("dailyDashboard")) || [];
    const [dailyDashboard, setDailyDashboard] = useState(getDailyDashboard);

    const closeModal = () => {
        setIsModalCreateTransferOpen(false);
        setIsModalCreateCashWithdrawalOpen(false);
        setIsModalCreateDepositOpen(false);
        setIsModalCreateVoucherOpen(false);
        setIsModalCreateMutationToHqOpen(false);
        setIsModalCreateBankAdminFeeOpen(false);
        setIsModalCreateExpenseOpen(false);
    };
    const warehouse = user.role?.warehouse_id;
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouse);
    const [warehouses, setWarehouses] = useState([]);
    const fetchWarehouses = async (url = "/api/get-all-warehouses") => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            setWarehouses(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);
    const fetchJournalsByWarehouse = async (selectedWarehouse = warehouse, startDate = getCurrentDate(), endDate = getCurrentDate()) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-journal-by-warehouse/${selectedWarehouse}/${startDate}/${endDate}`);
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
    }, []); // Include startDate and endDate in the dependency array

    const getAccountBalance = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-cash-bank-balance/${selectedWarehouseId}`);
            setAccountBalance(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAccountBalance();
    }, [journalsByWarehouse]);

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

    const filteredCashBankByWarehouse = cashBank.filter((cashBank) => cashBank.warehouse_id === selectedWarehouseId);
    return (
        <>
            <Header title="Transaction" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6">
                    {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
                    <div className="overflow-hidden sm:rounded-lg">
                        <div className="mb-2 flex justify-start gap-2">
                            <button
                                onClick={() => setIsModalCreateTransferOpen(true)}
                                className="bg-indigo-600 group text-sm min-w-44 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg"
                            >
                                Tansfer Uang <ArrowUpCircleIcon className="size-4 group-hover:scale-110 inline" />
                            </button>
                            <Modal isOpen={isModalCreateTransferOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Transfer Uang">
                                <CreateTransfer
                                    filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                                    isModalOpen={setIsModalCreateTransferOpen}
                                    notification={(message) => setNotification(message)}
                                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                    user={user}
                                />
                            </Modal>
                            <button
                                onClick={() => setIsModalCreateCashWithdrawalOpen(true)}
                                className="bg-indigo-600 group text-sm min-w-44 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg"
                            >
                                Tarik Tunai <ArrowDownCircleIcon className="size-4 group-hover:scale-110 inline" />
                            </button>
                            <Modal isOpen={isModalCreateCashWithdrawalOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Tarik Tunai">
                                <CreateCashWithdrawal
                                    filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                                    isModalOpen={setIsModalCreateCashWithdrawalOpen}
                                    notification={(message) => setNotification(message)}
                                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                    user={user}
                                />
                            </Modal>
                            <Modal isOpen={isModalCreateVoucherOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Penjualan Voucher & Kartu">
                                <CreateVoucher
                                    isModalOpen={setIsModalCreateVoucherOpen}
                                    notification={(message) => setNotification(message)}
                                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                    user={user}
                                />
                            </Modal>
                            <Modal isOpen={isModalCreateDepositOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Penjualan Deposit">
                                <CreateDeposit
                                    isModalOpen={setIsModalCreateDepositOpen}
                                    notification={(message) => setNotification(message)}
                                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                />
                            </Modal>
                            {/* Expenses */}
                            <Modal isOpen={isModalCreateMutationToHqOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Pengembalian Saldo Kas & Bank">
                                <CreateMutationToHq
                                    cashBank={cashBank}
                                    isModalOpen={setIsModalCreateMutationToHqOpen}
                                    notification={(message) => setNotification(message)}
                                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                    user={user}
                                />
                            </Modal>
                            <Modal isOpen={isModalCreateBankAdminFeeOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Biaya Administrasi Bank">
                                <CreateBankAdminFee
                                    filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                                    isModalOpen={setIsModalCreateBankAdminFeeOpen}
                                    notification={(message) => setNotification(message)}
                                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                />
                            </Modal>
                            <Modal isOpen={isModalCreateExpenseOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Biaya Operasional">
                                <CreateExpense
                                    isModalOpen={setIsModalCreateExpenseOpen}
                                    notification={(message) => setNotification(message)}
                                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                    user={user}
                                />
                            </Modal>

                            <Dropdown
                                trigger={
                                    <button className="bg-green-600 text-sm hover:bg-green-700 text-white py-2 px-6 rounded-lg group">
                                        Voucher & Deposit
                                        <ChevronRightIcon size={18} className="inline group-hover:rotate-90 transition-transform duration-200" />
                                    </button>
                                }
                                align="left"
                            >
                                <ul className="min-w-max">
                                    <li className="border-b hover:bg-slate-100 ">
                                        <button className="w-full text-sm text-left py-2 px-4 " onClick={() => setIsModalCreateVoucherOpen(true)}>
                                            Voucher & SP
                                        </button>
                                    </li>
                                    <li className="border-b hover:bg-slate-100 ">
                                        <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateDepositOpen(true)}>
                                            Penjualan Pulsa dll.
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                            <Dropdown
                                trigger={
                                    <button className="bg-red-600 text-sm hover:bg-red-700 text-white py-2 px-6 rounded-lg group">
                                        Pengeluaran (Biaya){" "}
                                        <ChevronRightIcon size={18} className="inline group-hover:rotate-90 transition-transform duration-200" />
                                    </button>
                                }
                                align="left"
                            >
                                <ul className="min-w-max">
                                    <li className="border-b hover:bg-slate-100 ">
                                        <button className="w-full text-sm text-left py-2 px-4 " onClick={() => setIsModalCreateMutationToHqOpen(true)}>
                                            Pengembalian Saldo Kas & Bank
                                        </button>
                                    </li>
                                    <li className="border-b hover:bg-slate-100 ">
                                        <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateExpenseOpen(true)}>
                                            Biaya Operasional
                                        </button>
                                    </li>
                                    <li className="border-b hover:bg-slate-100 ">
                                        <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateBankAdminFeeOpen(true)}>
                                            Biaya Admin Bank
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="col-span-3 bg-white py-6 rounded-2xl">
                                <JournalTable
                                    cashBank={cashBank}
                                    notification={(message) => setNotification(message)}
                                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                    journalsByWarehouse={journalsByWarehouse}
                                    warehouses={warehouses}
                                    warehouse={warehouse}
                                    warehouseId={(warehouseId) => setSelectedWarehouseId(warehouseId)}
                                    user={user}
                                />
                            </div>
                            <div>
                                <CashBankBalance warehouse={warehouse} accountBalance={accountBalance} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TransactionPage;
