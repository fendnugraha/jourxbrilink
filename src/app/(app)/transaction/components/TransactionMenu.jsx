"use client";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import Modal from "@/components/Modal";
import { ArrowDownIcon, ArrowUpIcon, ChevronRightIcon, HandCoinsIcon, ShoppingBagIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CreateTransfer from "./CreateTransfer";
import CreateCashWithdrawal from "./CreateCashWithdrawal";
import CreateVoucher from "./CreateVoucher";
import CreateDeposit from "./CreateDeposit";
import CreateMutationToHq from "./CreateMutationToHq";
import CreateBankAdminFee from "./CreateBankAdminFee";
import CreateExpense from "./CreateExpense";
import VoucherSalesTable from "../../dashboard/components/VoucherSalesTable";

const TransactionMenu = ({ user, fetchJournalsByWarehouse, accountBalance, setNotification, cashBank }) => {
    const warehouse = Number(user?.role?.warehouse_id);
    const warehouseCashId = Number(user?.role?.warehouse?.chart_of_account_id);
    const warehouseName = user?.role?.warehouse?.name;

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
            setOpeningCash(initBalances[warehouseCashId] || 0);
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
    };

    const filteredCashBankByWarehouse = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === warehouse);

    const calculateFee = (amount) => {
        if (amount < 100000) {
            return 3000;
        }

        const chunkSize = 2500000;
        const feePerChunk = 5000;

        const chunkCount = Math.ceil(amount / chunkSize);
        return chunkCount * feePerChunk;
    };

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
        <>
            <div className="hidden sm:flex gap-2 mb-4 px-4">
                <Button
                    buttonType="primary"
                    className="mb-4 group text-nowrap"
                    onClick={() => {
                        setIsModalCreateTransferOpen(true);
                        setIsTransferActive(true);
                        setIsCashWithdrawalActive(false);
                    }}
                >
                    Transfer Uang <ArrowDownIcon size={18} className="inline group-hover:scale-125 delay-300 transition-transform duration-200" />
                </Button>
                <Button
                    buttonType="primary"
                    className="mb-4 group"
                    onClick={() => {
                        setIsModalCreateCashWithdrawalOpen(true);
                        setIsTransferActive(false);
                        setIsCashWithdrawalActive(true);
                    }}
                >
                    Tarik Tunai <ArrowUpIcon size={18} className="inline group-hover:scale-125 delay-300 transition-transform duration-200" />
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
                        <li className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-500 ">
                            <button className="w-full text-sm text-left py-2 px-4 " onClick={() => setIsModalCreateVoucherOpen(true)}>
                                Voucher & SP
                            </button>
                        </li>
                        <li className="hover:bg-slate-100 dark:hover:bg-slate-500">
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
                        <li className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-500 ">
                            <button className="w-full text-sm text-left py-2 px-4 " onClick={() => setIsModalCreateMutationToHqOpen(true)}>
                                Pengembalian Saldo Kas & Bank
                            </button>
                        </li>
                        <li className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-500 ">
                            <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateExpenseOpen(true)}>
                                Biaya Operasional
                            </button>
                        </li>
                        <li className="hover:bg-slate-100 dark:hover:bg-slate-500">
                            <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateBankAdminFeeOpen(true)}>
                                Biaya Admin Bank
                            </button>
                        </li>
                    </ul>
                </Dropdown>
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
        </>
    );
};

export default TransactionMenu;
