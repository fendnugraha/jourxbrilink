"use client";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import Modal from "@/components/Modal";
import { ArrowDownIcon, ArrowUpDown, ArrowUpIcon, ChevronRightIcon, HandCoinsIcon, ShoppingBagIcon } from "lucide-react";
import { useEffect, useState } from "react";
import CreateTransfer from "./CreateTransfer";
import CreateCashWithdrawal from "./CreateCashWithdrawal";
import CreateVoucher from "./CreateVoucher";
import CreateDeposit from "./CreateDeposit";
import CreateMutationToHq from "./CreateMutationToHq";
import CreateBankAdminFee from "./CreateBankAdminFee";
import CreateExpense from "./CreateExpense";
import CreateMutation from "./CreateMutation";
import { set } from "date-fns";

const TransactionMenu = ({ user, fetchJournalsByWarehouse, accountBalance, mutateCashBankBalance, setNotification, cashBank }) => {
    const warehouse = Number(user?.role?.warehouse_id);
    const warehouseCashId = Number(user?.role?.warehouse?.chart_of_account_id);

    const [isModalCreateTransferOpen, setIsModalCreateTransferOpen] = useState(false);
    const [isModalCreateCashWithdrawalOpen, setIsModalCreateCashWithdrawalOpen] = useState(false);
    const [isModalCreateDepositOpen, setIsModalCreateDepositOpen] = useState(false);
    const [isModalCreateVoucherOpen, setIsModalCreateVoucherOpen] = useState(false);
    const [isModalCreateExpenseOpen, setIsModalCreateExpenseOpen] = useState(false);
    const [isModalCreateBankAdminFeeOpen, setIsModalCreateBankAdminFeeOpen] = useState(false);
    const [isModalCreateMutationToHqOpen, setIsModalCreateMutationToHqOpen] = useState(false);
    const [isModalCreateMutationOpen, setIsModalCreateMutationOpen] = useState(false);
    const [isMutateToHqActive, setIsMutateToHqActive] = useState(false);

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
        setIsModalCreateMutationOpen(false);
    };

    const filteredCashBankByWarehouse = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === warehouse);

    const calculateFee = (amount, chunk = 2500000, feePerChunk = 5000) => {
        if (amount < 10000 || amount === "") {
            return "";
        }

        if (amount <= 100000) {
            return 3000;
        }

        const chunkSize = chunk;
        const fee = feePerChunk;

        const chunkCount = Math.ceil(amount / chunkSize);
        return chunkCount * fee;
    };

    const [personalSetting, setPersonalSetting] = useState({
        feeAdminAuto: false,
        altFee: false,
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
    const [selectedBankAccount, setSelectedBankAccount] = useState("");
    return (
        <>
            <div className="hidden sm:flex gap-2 mb-4 px-4 justify-between">
                <div className="flex gap-2">
                    <Button
                        buttonType="primary"
                        className="mb-4 group text-nowrap"
                        onClick={() => {
                            setIsModalCreateTransferOpen(true);
                            setIsTransferActive(true);
                            setIsCashWithdrawalActive(false);
                        }}
                    >
                        Transfer <ArrowUpIcon size={18} className="inline group-hover:scale-125 delay-300 transition-transform duration-200" />
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
                        Tarik Tunai <ArrowDownIcon size={18} className="inline group-hover:scale-125 delay-300 transition-transform duration-200" />
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button buttonType="secondary" className="mb-4 group" onClick={() => setIsModalCreateMutationOpen(true)}>
                        Mutasi <ArrowUpDown size={18} className="inline group-hover:scale-125 delay-300 transition-transform duration-200" />
                    </Button>
                    <Dropdown
                        trigger={
                            <Button buttonType="success" className={"group text-nowrap"}>
                                Vcr & Deposit{" "}
                                <ChevronRightIcon size={18} className="inline group-hover:rotate-90 delay-300 transition-transform duration-200" />
                            </Button>
                        }
                        align="left"
                    >
                        <ul className="min-w-max">
                            <li className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-500 ">
                                <button className="w-full text-sm text-left py-2 px-4 " onClick={() => setIsModalCreateVoucherOpen(true)}>
                                    SP & Voucher
                                </button>
                            </li>
                            <li className="hover:bg-slate-100 dark:hover:bg-slate-500">
                                <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateDepositOpen(true)}>
                                    Deposit
                                </button>
                            </li>
                        </ul>
                    </Dropdown>
                    <Dropdown
                        trigger={
                            <Button buttonType="danger" className={"group text-nowrap"}>
                                Biaya <ChevronRightIcon size={18} className="inline group-hover:rotate-90 delay-300 transition-transform duration-200" />
                            </Button>
                        }
                        align="left"
                    >
                        <ul className="min-w-max">
                            <li className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-500 ">
                                <button className="w-full text-sm text-left py-2 px-4 " onClick={() => setIsModalCreateMutationToHqOpen(true)}>
                                    Mutasi ke Pusat (HQ)
                                </button>
                            </li>
                            <li className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-500 ">
                                <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateExpenseOpen(true)}>
                                    By. Operasional
                                </button>
                            </li>
                            <li className="hover:bg-slate-100 dark:hover:bg-slate-500">
                                <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateBankAdminFeeOpen(true)}>
                                    By. Admin Bank
                                </button>
                            </li>
                        </ul>
                    </Dropdown>
                </div>
            </div>
            <Modal
                isOpen={isModalCreateTransferOpen}
                onClose={closeModal}
                maxWidth={"max-w-md"}
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
                        Transfer
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
                        Tarik
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
                        altFee={personalSetting.altFee}
                        selectedBankAccount={selectedBankAccount}
                        setSelectedBankAccount={setSelectedBankAccount}
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
                        altFee={personalSetting.altFee}
                        selectedBankAccount={selectedBankAccount}
                        setSelectedBankAccount={setSelectedBankAccount}
                    />
                )}
            </Modal>

            <Modal
                isOpen={isModalCreateCashWithdrawalOpen}
                onClose={closeModal}
                maxWidth={"max-w-md"}
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
                        altFee={personalSetting.altFee}
                        selectedBankAccount={selectedBankAccount}
                        setSelectedBankAccount={setSelectedBankAccount}
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
                        altFee={personalSetting.altFee}
                        selectedBankAccount={selectedBankAccount}
                        setSelectedBankAccount={setSelectedBankAccount}
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
                    mutateCashBankBalance={mutateCashBankBalance}
                    openingCash={openingCash}
                    cashId={warehouseCashId}
                />
            </Modal>
            <Modal
                isOpen={isModalCreateMutationOpen}
                onClose={closeModal}
                maxWidth={"max-w-xl"}
                modalTitle={`${isMutateToHqActive ? "Pengembalian Saldo Kas & Bank" : "Mutasi Saldo Bank"}`}
            >
                <div className="flex mb-4 justify-evenly w-full">
                    <button
                        onClick={() => {
                            setIsMutateToHqActive(false);
                        }}
                        className={`${
                            !isMutateToHqActive ? "bg-lime-500 text-white scale-105 text-sm" : "bg-slate-400 text-slate-300 text-xs"
                        } w-full py-1 cursor-pointer hover:text-sm transition-all duration-100 ease-in`}
                    >
                        Ke Akun Sendiri
                    </button>
                    <button
                        onClick={() => {
                            setIsMutateToHqActive(true);
                        }}
                        className={`${
                            isMutateToHqActive ? "bg-lime-500 text-white scale-105 text-sm" : "bg-slate-400 text-slate-300 text-xs"
                        } w-full py-1 cursor-pointer hover:text-sm transition-all duration-100 ease-in`}
                    >
                        Ke Pusat (Headquarter)
                    </button>
                </div>
                {isMutateToHqActive ? (
                    <CreateMutationToHq
                        cashBank={cashBank}
                        isModalOpen={setIsModalCreateMutationToHqOpen}
                        notification={setNotification}
                        fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                        user={user}
                        accountBalance={accountBalance}
                        mutateCashBankBalance={mutateCashBankBalance}
                        openingCash={openingCash}
                        cashId={warehouseCashId}
                    />
                ) : (
                    <CreateMutation
                        cashBank={cashBank}
                        isModalOpen={setIsModalCreateMutationOpen}
                        notification={setNotification}
                        fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                        user={user}
                        accountBalance={accountBalance}
                        openingCash={openingCash}
                    />
                )}
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
