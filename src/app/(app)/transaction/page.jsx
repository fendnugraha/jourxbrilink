"use client";
import Modal from "@/components/Modal";
import CreateTransfer from "./components/CreateTransfer";
import { useState, useEffect, useRef } from "react";
import axios from "@/libs/axios";
import Notification from "@/components/Notification";
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
import Loading from "../loading";
import {
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CircleAlertIcon,
    CopyIcon,
    HandCoinsIcon,
    LayoutDashboardIcon,
    LoaderCircleIcon,
    RefreshCcwIcon,
    ScanQrCodeIcon,
    ShoppingBagIcon,
    XCircleIcon,
} from "lucide-react";
import useCashBankBalance from "@/libs/cashBankBalance";
import { mutate } from "swr";
import useGetWarehouses from "@/libs/getAllWarehouse";
import { useGetDailyDashboard } from "@/libs/getDailyDashboard";
import formatNumber from "@/libs/formatNumber";
import Label from "@/components/Label";
import Input from "@/components/Input";
import { QRCodeSVG } from "qrcode.react";
import MainPage from "../main";
import Button from "@/components/Button";
import { DropdownButton } from "@/components/DropdownLink";

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
    const warehouse = Number(user.role?.warehouse_id);

    const [journalsByWarehouse, setJournalsByWarehouse] = useState([]);
    const [loading, setLoading] = useState(false);
    const [journalLoading, setJournalLoading] = useState(false);
    const [cashBank, setCashBank] = useState([]);
    const [isModalCreateTransferOpen, setIsModalCreateTransferOpen] = useState(false);
    const [isModalCreateCashWithdrawalOpen, setIsModalCreateCashWithdrawalOpen] = useState(false);
    const [isModalCreateDepositOpen, setIsModalCreateDepositOpen] = useState(false);
    const [isModalCreateVoucherOpen, setIsModalCreateVoucherOpen] = useState(false);
    const [isModalCreateExpenseOpen, setIsModalCreateExpenseOpen] = useState(false);
    const [isModalCreateBankAdminFeeOpen, setIsModalCreateBankAdminFeeOpen] = useState(false);
    const [isModalCreateMutationToHqOpen, setIsModalCreateMutationToHqOpen] = useState(false);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());

    const [isVoucherMenuOpen, setIsVoucherMenuOpen] = useState(false);
    const [isExpenseMenuOpen, setIsExpenseMenuOpen] = useState(false);
    const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);
    const initCashValue = localStorage.getItem("openingCash") || 0;
    const [openingCash, setOpeningCash] = useState(initCashValue);
    const [isCopied, setIsCopied] = useState(false);

    const menuRef = useRef(null);
    const { dailyDashboard, loading: isLoading, error: dailyDashboardError } = useGetDailyDashboard(warehouse, getCurrentDate(), getCurrentDate());
    const warehouseName = user?.role?.warehouse?.name;

    const drawerRef = useRef();
    useEffect(() => {
        function handleClickOutside(event) {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                setIsDailyReportOpen(false);
            }
        }

        if (isDailyReportOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDailyReportOpen]);

    const totalSetoran =
        dailyDashboard?.data?.totalFee +
        dailyDashboard?.data?.totalCash +
        dailyDashboard?.data?.totalCashDeposit +
        dailyDashboard?.data?.totalAccessories +
        dailyDashboard?.data?.totalVoucher +
        dailyDashboard?.data?.totalExpense;

    // Event listener untuk klik di luar menu
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsVoucherMenuOpen(false); // Tutup menu jika klik di luar
                setIsExpenseMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const closeModal = () => {
        setIsModalCreateTransferOpen(false);
        setIsModalCreateCashWithdrawalOpen(false);
        setIsModalCreateDepositOpen(false);
        setIsModalCreateVoucherOpen(false);
        setIsModalCreateMutationToHqOpen(false);
        setIsModalCreateBankAdminFeeOpen(false);
        setIsModalCreateExpenseOpen(false);
    };
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouse);
    const { accountBalance, error: accountBalanceError, loading: isValidating } = useCashBankBalance(selectedWarehouseId, endDate);

    const { warehouses, warehousesError } = useGetWarehouses();
    const fetchJournalsByWarehouse = async (selectedWarehouse = warehouse, startDate = getCurrentDate(), endDate = getCurrentDate()) => {
        setJournalLoading(true);
        try {
            const response = await axios.get(`/api/get-journal-by-warehouse/${selectedWarehouse}/${startDate}/${endDate}`);
            setJournalsByWarehouse(response.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setJournalLoading(false);
        }
    };

    useEffect(() => {
        fetchJournalsByWarehouse();
    }, []); // Include startDate and endDate in the dependency array

    useEffect(() => {
        mutate(`/api/get-cash-bank-balance/${selectedWarehouseId}/${endDate}`);
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

    const filteredCashBankByWarehouse = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === warehouse);
    const hqCashBank = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === 1);

    const copyData = async () => {
        await navigator.clipboard.writeText(copyDailyReport());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
    };

    const copyDailyReport = () => {
        const dailyReportData = [
            { name: "Kas", value: formatNumber(dailyDashboard?.data?.totalCash - openingCash) },
            { name: "Voucher", value: formatNumber(dailyDashboard?.data?.totalVoucher) },
            { name: "Deposit", value: formatNumber(dailyDashboard?.data?.totalCashDeposit) },
            { name: "Acc", value: formatNumber(dailyDashboard?.data?.totalAccessories) },
            { name: "Laba", value: formatNumber(dailyDashboard?.data?.profit) },
        ];

        const lines = dailyReportData.map(({ name, value }) => `${name}: ${value}`);

        return `Report ${warehouseName}:\n\n${lines.join("\n")}\n\nTotal Setoran: ${formatNumber(
            dailyDashboard?.data?.totalCash > openingCash ? totalSetoran - openingCash : totalSetoran
        )}`;
    };

    const calculateFee = (amount) => {
        if (amount < 100000) {
            return 3000;
        }

        const chunkSize = 2500000;
        const feePerChunk = 5000;

        const chunkCount = Math.ceil(amount / chunkSize);
        return chunkCount * feePerChunk;
    };

    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <MainPage headerTitle="Transaction">
                <div className="py-4 sm:py-8 px-4 sm:px-12">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-3xl col-span-1 sm:col-span-3 order-2 sm:order-1 hover:drop-shadow-sm">
                            <h1 className="text-2xl font-light mb-4">Transaction List</h1>
                            <div className="flex gap-2 mb-4">
                                <Button className="mb-4" onClick={() => setIsModalCreateTransferOpen(true)}>
                                    Transfer Uang
                                </Button>
                                <Button className="mb-4" onClick={() => setIsModalCreateCashWithdrawalOpen(true)}>
                                    Tarik Tunai
                                </Button>
                                <Dropdown
                                    trigger={
                                        <Button buttonType="success" className={"group text-nowrap"}>
                                            Voucher & Deposit{" "}
                                            <ChevronRightIcon size={18} className="inline group-hover:rotate-90 delay-300 transition-transform duration-200" />
                                        </Button>
                                    }
                                    align="left"
                                >
                                    <ul className="min-w-max">
                                        <li className="border-b border-slate-200 hover:bg-slate-100 ">
                                            <button className="w-full text-sm text-left py-2 px-4 " onClick={() => setIsModalCreateVoucherOpen(true)}>
                                                Voucher & SP
                                            </button>
                                        </li>
                                        <li className="hover:bg-slate-100 ">
                                            <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateDepositOpen(true)}>
                                                Penjualan Pulsa dll.
                                            </button>
                                        </li>
                                    </ul>
                                </Dropdown>
                                <Dropdown
                                    trigger={
                                        <Button buttonType="danger" className={"group text-nowrap"}>
                                            Pengeluaran (Biaya){" "}
                                            <ChevronRightIcon size={18} className="inline group-hover:rotate-90 delay-300 transition-transform duration-200" />
                                        </Button>
                                    }
                                    align="left"
                                >
                                    <ul className="min-w-max">
                                        <li className="border-b border-slate-200 hover:bg-slate-100 ">
                                            <button className="w-full text-sm text-left py-2 px-4 " onClick={() => setIsModalCreateMutationToHqOpen(true)}>
                                                Pengembalian Saldo Kas & Bank
                                            </button>
                                        </li>
                                        <li className="border-b border-slate-200 hover:bg-slate-100 ">
                                            <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateExpenseOpen(true)}>
                                                Biaya Operasional
                                            </button>
                                        </li>
                                        <li className="hover:bg-slate-100 ">
                                            <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateBankAdminFeeOpen(true)}>
                                                Biaya Admin Bank
                                            </button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div>
                            <JournalTable
                                cashBank={cashBank}
                                notification={(type, message) => setNotification({ type, message })}
                                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                journalsByWarehouse={journalsByWarehouse}
                                warehouses={warehouses}
                                warehouse={warehouse}
                                warehouseId={(warehouseId) => setSelectedWarehouseId(warehouseId)}
                                user={user}
                                loading={journalLoading}
                                hqCashBank={hqCashBank}
                            />
                        </div>
                        <div className="order-1 sm:order-2">
                            <CashBankBalance warehouse={warehouse} accountBalance={accountBalance} isValidating={isValidating} />
                        </div>
                    </div>
                    {/* Modals */}
                    <Modal isOpen={isModalCreateTransferOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Transfer Uang">
                        <CreateTransfer
                            filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                            isModalOpen={setIsModalCreateTransferOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            user={user}
                            calculateFee={calculateFee}
                        />
                    </Modal>

                    <Modal isOpen={isModalCreateCashWithdrawalOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Tarik Tunai">
                        <CreateCashWithdrawal
                            filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                            isModalOpen={setIsModalCreateCashWithdrawalOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            user={user}
                            calculateFee={calculateFee}
                        />
                    </Modal>
                    <Modal isOpen={isModalCreateVoucherOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Penjualan Voucher & Kartu">
                        <CreateVoucher
                            isModalOpen={setIsModalCreateVoucherOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            user={user}
                        />
                    </Modal>
                    <Modal isOpen={isModalCreateDepositOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Penjualan Deposit">
                        <CreateDeposit
                            isModalOpen={setIsModalCreateDepositOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                        />
                    </Modal>
                    {/* Expenses */}
                    <Modal isOpen={isModalCreateMutationToHqOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Pengembalian Saldo Kas & Bank">
                        <CreateMutationToHq
                            cashBank={cashBank}
                            isModalOpen={setIsModalCreateMutationToHqOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            user={user}
                            accountBalance={accountBalance}
                            openingCash={openingCash}
                        />
                    </Modal>
                    <Modal isOpen={isModalCreateBankAdminFeeOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Biaya Administrasi Bank">
                        <CreateBankAdminFee
                            filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                            isModalOpen={setIsModalCreateBankAdminFeeOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            user={user}
                        />
                    </Modal>
                    <Modal isOpen={isModalCreateExpenseOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Biaya Operasional">
                        <CreateExpense
                            isModalOpen={setIsModalCreateExpenseOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            user={user}
                        />
                    </Modal>
                </div>
            </MainPage>
        </>
    );
};

export default TransactionPage;
