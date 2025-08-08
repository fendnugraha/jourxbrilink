"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, ChevronRightIcon, HandCoinsIcon, ShoppingBagIcon } from "lucide-react";
import CreateTransfer from "./CreateTransfer";
import CreateCashWithdrawal from "./CreateCashWithdrawal";
import CreateVoucher from "./CreateVoucher";
import CreateDeposit from "./CreateDeposit";
import CreateMutationToHq from "./CreateMutationToHq";
import CreateBankAdminFee from "./CreateBankAdminFee";
import CreateExpense from "./CreateExpense";
import Modal from "@/components/Modal";

const TransactionMenuMobile = ({ user, fetchJournalsByWarehouse, accountBalance, setNotification, cashBank, warehouseCashId, warehouse }) => {
    const [isVoucherMenuOpen, setIsVoucherMenuOpen] = useState(false);
    const [isExpenseMenuOpen, setIsExpenseMenuOpen] = useState(false);

    const [isModalCreateTransferOpen, setIsModalCreateTransferOpen] = useState(false);
    const [isModalCreateCashWithdrawalOpen, setIsModalCreateCashWithdrawalOpen] = useState(false);
    const [isModalCreateDepositOpen, setIsModalCreateDepositOpen] = useState(false);
    const [isModalCreateVoucherOpen, setIsModalCreateVoucherOpen] = useState(false);
    const [isModalCreateExpenseOpen, setIsModalCreateExpenseOpen] = useState(false);
    const [isModalCreateBankAdminFeeOpen, setIsModalCreateBankAdminFeeOpen] = useState(false);
    const [isModalCreateMutationToHqOpen, setIsModalCreateMutationToHqOpen] = useState(false);

    const [isTransferActive, setIsTransferActive] = useState(false);
    const [isCashWithdrawalActive, setIsCashWithdrawalActive] = useState(false);

    const [openingCash, setOpeningCash] = useState(0);
    useEffect(() => {
        const initBalances = JSON.parse(localStorage.getItem("initBalances"));
        if (initBalances) {
            setOpeningCash(initBalances[warehouseCashId]);
        }
    });

    const closeModal = () => {
        setIsModalCreateTransferOpen(false);
        setIsModalCreateCashWithdrawalOpen(false);
        setIsModalCreateDepositOpen(false);
        setIsModalCreateVoucherOpen(false);
        setIsModalCreateMutationToHqOpen(false);
        setIsModalCreateBankAdminFeeOpen(false);
        setIsModalCreateExpenseOpen(false);
        setIsVoucherMenuOpen(false);
        setIsExpenseMenuOpen(false);
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

    const menuRef = useRef(null);

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

    const filteredCashBankByWarehouse = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === warehouse);
    const [personalSetting, setPersonalSetting] = useState({
        feeAdminAuto: false,
    });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const storedSetting = localStorage.getItem("personalSetting");
        if (storedSetting) {
            setPersonalSetting(JSON.parse(storedSetting));
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) {
            localStorage.setItem("personalSetting", JSON.stringify(personalSetting));
        }
    }, [personalSetting, loaded]);
    return (
        <div ref={menuRef} className="fixed sm:hidden bottom-0 w-full z-[999]">
            <div className={`text-white ${!isVoucherMenuOpen ? "hidden" : "flex flex-col justify-between items-center px-4"}`}>
                <div className="rounded-2xl bg-white w-full shadow-xl border border-slate-300">
                    <button
                        onClick={() => setIsModalCreateVoucherOpen(true)}
                        className="w-full text-slate-700 p-2 border-b border-slate-300 hover:bg-slate-200"
                    >
                        Penjualan Voucher
                    </button>
                    <button onClick={() => setIsModalCreateDepositOpen(true)} className="w-full text-slate-700 p-2 hover:bg-slate-200">
                        Input Deposit
                    </button>
                </div>
            </div>
            <div className={`text-white ${!isExpenseMenuOpen ? "hidden" : "flex flex-col justify-between items-center px-4"}`}>
                <div className="rounded-2xl bg-white w-full shadow-xl border border-slate-300">
                    <button
                        onClick={() => setIsModalCreateMutationToHqOpen(true)}
                        className="w-full text-slate-700 p-2 border-b border-slate-300 hover:bg-slate-200"
                    >
                        Pengembalian Saldo
                    </button>
                    <button
                        onClick={() => setIsModalCreateExpenseOpen(true)}
                        className="w-full text-slate-700 p-2 border-b border-slate-300 hover:bg-slate-200"
                    >
                        Biaya Operasional
                    </button>
                    <button onClick={() => setIsModalCreateBankAdminFeeOpen(true)} className="w-full text-slate-700 p-2 hover:bg-slate-200">
                        Biaya Admin Bank
                    </button>
                </div>
            </div>
            <div className="h-fit p-2">
                <div className="flex bg-gray-600 shadow-xl border border-slate-300 justify-between items-center rounded-2xl h-full text-white">
                    <button
                        onClick={() => {
                            setIsVoucherMenuOpen(!isVoucherMenuOpen);
                            setIsExpenseMenuOpen(false);
                        }}
                        className="w-full flex flex-col items-center justify-center py-4 text-xs gap-1"
                    >
                        <ShoppingBagIcon className="w-7 h-7" /> Voucher
                    </button>
                    <button
                        onClick={() => {
                            setIsExpenseMenuOpen(!isExpenseMenuOpen);
                            setIsVoucherMenuOpen(false);
                        }}
                        className="w-full flex flex-col items-center justify-center py-4 text-xs gap-1"
                    >
                        <HandCoinsIcon className="w-7 h-7" /> Biaya
                    </button>
                    <button
                        onClick={() => {
                            setIsModalCreateTransferOpen(true);
                            setIsExpenseMenuOpen(false);
                            setIsVoucherMenuOpen(false);
                            setIsTransferActive(true);
                            setIsCashWithdrawalActive(false);
                        }}
                        className="w-full flex flex-col items-center justify-center py-4 text-xs gap-1"
                    >
                        <ArrowUpIcon className="w-7 h-7" /> Transfer
                    </button>
                    <button
                        onClick={() => {
                            setIsModalCreateCashWithdrawalOpen(true);
                            setIsExpenseMenuOpen(false);
                            setIsVoucherMenuOpen(false);
                            setIsTransferActive(false);
                            setIsCashWithdrawalActive(true);
                        }}
                        className="w-full flex flex-col items-center justify-center py-4 text-xs gap-1"
                    >
                        <ArrowDownIcon className="w-7 h-7" /> Tarik Tunai
                    </button>
                </div>
            </div>
            <Modal
                isOpen={isModalCreateTransferOpen}
                onClose={closeModal}
                maxWidth={"max-w-xl"}
                modalTitle={isTransferActive ? "Transfer Uang" : "Penarikan Tunai"}
            >
                <div className="flex mb-4 justify-evenly w-full">
                    <button
                        onClick={() => {
                            setIsTransferActive(true);
                            setIsCashWithdrawalActive(false);
                        }}
                        className={`${
                            isTransferActive ? "bg-lime-500 text-white scale-105 text-sm" : "bg-slate-400 text-slate-300 text-xs"
                        } w-full py-1 cursor-pointer hover:text-sm transition-all duration-100 ease-in`}
                    >
                        Transfer Uang
                    </button>
                    <button
                        onClick={() => {
                            setIsTransferActive(false);
                            setIsCashWithdrawalActive(true);
                        }}
                        className={`${
                            isCashWithdrawalActive ? "bg-lime-500 text-white scale-105 text-sm" : "bg-slate-400 text-slate-300 text-xs"
                        } w-full py-1 cursor-pointer hover:text-sm transition-all duration-100 ease-in`}
                    >
                        Tarik Tunai
                    </button>
                </div>
                {isTransferActive && (
                    <CreateTransfer
                        filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                        isModalOpen={setIsModalCreateTransferOpen}
                        notification={setNotification}
                        fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                        user={user}
                        calculateFee={calculateFee}
                        setPersonalSetting={setPersonalSetting}
                        feeAdminAuto={personalSetting.feeAdminAuto}
                    />
                )}
                {isCashWithdrawalActive && (
                    <CreateCashWithdrawal
                        filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                        isModalOpen={setIsModalCreateCashWithdrawalOpen}
                        setNotification={setNotification}
                        fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                        user={user}
                        calculateFee={calculateFee}
                        setPersonalSetting={setPersonalSetting}
                        feeAdminAuto={personalSetting.feeAdminAuto}
                    />
                )}
            </Modal>

            <Modal
                isOpen={isModalCreateCashWithdrawalOpen}
                onClose={closeModal}
                maxWidth={"max-w-xl"}
                modalTitle={isTransferActive ? "Transfer Uang" : "Penarikan Tunai"}
            >
                <div className="flex mb-4 justify-evenly w-full">
                    <button
                        onClick={() => {
                            setIsTransferActive(true);
                            setIsCashWithdrawalActive(false);
                        }}
                        className={`${
                            isTransferActive ? "bg-lime-500 text-white scale-105 text-sm" : "bg-slate-400 text-slate-300 text-xs"
                        } w-full py-1 cursor-pointer hover:text-sm transition-all duration-100 ease-in`}
                    >
                        Transfer Uang
                    </button>
                    <button
                        onClick={() => {
                            setIsTransferActive(false);
                            setIsCashWithdrawalActive(true);
                        }}
                        className={`${
                            isCashWithdrawalActive ? "bg-lime-500 text-white scale-105 text-sm" : "bg-slate-400 text-slate-300 text-xs"
                        } w-full py-1 cursor-pointer hover:text-sm transition-all duration-100 ease-in`}
                    >
                        Tarik Tunai
                    </button>
                </div>
                {isTransferActive && (
                    <CreateTransfer
                        filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                        isModalOpen={setIsModalCreateTransferOpen}
                        notification={setNotification}
                        fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                        user={user}
                        calculateFee={calculateFee}
                        setPersonalSetting={setPersonalSetting}
                        feeAdminAuto={personalSetting.feeAdminAuto}
                    />
                )}
                {isCashWithdrawalActive && (
                    <CreateCashWithdrawal
                        filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                        isModalOpen={setIsModalCreateCashWithdrawalOpen}
                        setNotification={setNotification}
                        fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                        user={user}
                        calculateFee={calculateFee}
                        setPersonalSetting={setPersonalSetting}
                        feeAdminAuto={personalSetting.feeAdminAuto}
                    />
                )}
            </Modal>
            <Modal isOpen={isModalCreateVoucherOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Penjualan Voucher & Kartu">
                <CreateVoucher
                    isModalOpen={setIsModalCreateVoucherOpen}
                    notification={setNotification}
                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                    user={user}
                />
            </Modal>
            <Modal isOpen={isModalCreateDepositOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Penjualan Deposit">
                <CreateDeposit isModalOpen={setIsModalCreateDepositOpen} notification={setNotification} fetchJournalsByWarehouse={fetchJournalsByWarehouse} />
            </Modal>
            {/* Expenses */}
            <Modal isOpen={isModalCreateMutationToHqOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Pengembalian Saldo Kas & Bank">
                <CreateMutationToHq
                    cashBank={cashBank}
                    isModalOpen={setIsModalCreateMutationToHqOpen}
                    notification={setNotification}
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
                    notification={setNotification}
                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                    user={user}
                />
            </Modal>
            <Modal isOpen={isModalCreateExpenseOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Biaya Operasional">
                <CreateExpense
                    isModalOpen={setIsModalCreateExpenseOpen}
                    notification={setNotification}
                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                    user={user}
                />
            </Modal>
        </div>
    );
};

export default TransactionMenuMobile;
