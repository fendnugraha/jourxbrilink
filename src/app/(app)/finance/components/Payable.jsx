"use client";
import { ArrowBigDown, ArrowBigUp, MessageCircleWarningIcon, PlusCircleIcon, XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import Modal from "@/components/Modal";
import CreateContact from "../../setting/contact/CreateContact";
import CreatePayable from "./CreatePayable";
import formatNumber from "@/libs/formatNumber";
import Notification from "@/components/Notification";
import formatDateTime from "@/libs/formatDateTime";
import PaymentForm from "./PaymentForm";
import Paginator from "@/components/Paginator";
import CreateReceivable from "./CreateReceivable";
import Pagination from "@/components/PaginateList";
import Input from "@/components/Input";
import { set } from "date-fns";
const Payable = () => {
    const [isModalCreateContactOpen, setIsModalCreateContactOpen] = useState(false);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [isModalCreatePayableOpen, setIsModalCreatePayableOpen] = useState(false);
    const [isModalCreateReceivableOpen, setIsModalCreateReceivableOpen] = useState(false);
    const [isModalDeleteFinanceOpen, setIsModalDeleteFinanceOpen] = useState(false);
    const [isModalPaymentOpen, setIsModalPaymentOpen] = useState(false);
    const [finance, setFinance] = useState([]);
    const [financeType, setFinanceType] = useState("Payable");
    const [selectedFinanceId, setSelectedFinanceId] = useState(null);
    const [selectedContactId, setSelectedContactId] = useState("All");
    const [selectedContactIdPayment, setSelectedContactIdPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const fetchFinance = async (url = `/api/finance-by-type/${selectedContactId}/${financeType}`) => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            setFinance(response.data.data);
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinance();
    }, [selectedContactId, financeType]);
    const closeModal = () => {
        setIsModalCreateContactOpen(false);
        setIsModalCreatePayableOpen(false);
        setIsModalCreateReceivableOpen(false);
        setIsModalDeleteFinanceOpen(false);
        setIsModalPaymentOpen(false);
    };

    const [paymentStatus, setPaymentStatus] = useState("Unpaid");

    const filteredFinance =
        finance.financeGroupByContactId?.filter((fnc) => {
            const matchesSearch = searchTerm === "" || fnc.contact.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesUnpaidCondition = paymentStatus === "Unpaid" ? fnc.sisa > 0 : paymentStatus === "Paid" ? Number(fnc.sisa) === 0 : true;

            const matchesFinanceType = fnc.finance_type === financeType;

            return matchesSearch && matchesUnpaidCondition && matchesFinanceType;
        }) || [];

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Calculate the total number of pages
    const totalItems = filteredFinance.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get the items for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredFinance.slice(startIndex, startIndex + itemsPerPage);

    // Handle page change from the Pagination component
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDeleteFinance = async (id) => {
        try {
            const response = await axios.delete(`/api/finance/${id}`);
            setNotification({ type: "success", message: response.data.message });
            fetchFinance();
        } catch (error) {
            console.log(error);
        }
    };
    const handleChangePage = (url) => {
        fetchFinance(url);
    };
    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="overflow-hidden">
                <div className="card mb-4">
                    <div className="p-4 flex justify-between flex-col sm:flex-row">
                        <select
                            onChange={(e) => {
                                setFinanceType(e.target.value);
                            }}
                            className="form-select !w-40"
                        >
                            <option value="Payable">Hutang</option>
                            <option value="Receivable">Piutang</option>
                        </select>
                        <div className="flex items-center gap-2 overflow-auto">
                            <button onClick={() => setIsModalCreatePayableOpen(true)} className="btn-primary text-xs">
                                <PlusCircleIcon className="w-4 h-4 mr-1 inline" /> Hutang
                            </button>
                            <button
                                onClick={() => setIsModalCreateReceivableOpen(true)}
                                className="btn-primary text-xs disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                                <PlusCircleIcon className="w-4 h-4 mr-1 inline" /> Piutang
                            </button>
                            <Modal isOpen={isModalCreatePayableOpen} onClose={closeModal} modalTitle="Create Payable">
                                <CreatePayable isModalOpen={setIsModalCreatePayableOpen} notification={setNotification} fetchFinance={fetchFinance} />
                            </Modal>
                            <Modal isOpen={isModalCreateReceivableOpen} onClose={closeModal} modalTitle="Create Receivable">
                                <CreateReceivable
                                    isModalOpen={setIsModalCreateReceivableOpen}
                                    notification={(message) => notification(message)}
                                    fetchFinance={fetchFinance}
                                />
                            </Modal>
                            <button onClick={() => setIsModalCreateContactOpen(true)} className="btn-primary text-xs">
                                <PlusCircleIcon className="w-4 h-4 mr-1 inline" /> Contact
                            </button>
                            <Modal isOpen={isModalCreateContactOpen} onClose={closeModal} modalTitle="Create Contact">
                                <CreateContact isModalOpen={setIsModalCreateContactOpen} notification={(message) => notification(message)} />
                            </Modal>
                        </div>
                    </div>
                    <div className="p-4 w-full sm:w-1/2 flex justify-between gap-2">
                        <Input type="search" className="form-control" value={searchTerm} placeholder="Search" onChange={(e) => setSearchTerm(e.target.value)} />
                        <select
                            className="border border-slate-300 dark:border-slate-500 rounded-lg p-2"
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                        >
                            <option value="All">Semua</option>
                            <option value="Paid">Lunas</option>
                            <option value="Unpaid">Belum lunas</option>
                        </select>
                        <select
                            onChange={(e) => {
                                setItemsPerPage(e.target.value), setCurrentPage(1);
                            }}
                            className="border border-slate-300 dark:border-slate-500 rounded-lg p-2"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table w-full text-xs">
                            <thead>
                                <tr>
                                    <th>Contact</th>
                                    <th>Tagihan</th>
                                    <th>Dibayar</th>
                                    <th>Sisa</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item, index) => (
                                    <tr key={index} className="" onClick={() => setSelectedContactId(item.contact_id)}>
                                        <td>
                                            <button className="hover:underline">{item.contact.name}</button>
                                        </td>
                                        <td className="text-end">{formatNumber(item.tagihan)}</td>
                                        <td className="text-end">{formatNumber(item.terbayar)}</td>
                                        <td className="text-end">{formatNumber(item.sisa)}</td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => {
                                                    setIsModalPaymentOpen(true);
                                                    setSelectedContactIdPayment(item.contact_id);
                                                }}
                                                type="button"
                                                className="bg-blue-500 hover:bg-yellow-300 hover:text-slate-700 text-white font-bold py-2 px-6 rounded-xl disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer hover:scale-110 transition-transform duration-300 ease-out"
                                                disabled={Number(item.sisa) === 0}
                                            >
                                                {Number(item.sisa) === 0 ? "Lunas" : "Bayar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="text-lg">
                                    <th colSpan={3}>Total {financeType === "Payable" ? "Hutang" : "Piutang"}</th>
                                    <th>{formatNumber(filteredFinance.reduce((total, item) => total + Number(item.sisa), 0))}</th>
                                    <th></th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <Pagination
                            className={"w-full px-3 pb-3"}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
                <div className="card">
                    <div className="p-4 flex justify-between">
                        <h1 className="text-2xl font-bold mb-4">Riwayat Transaksi</h1>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table w-full text-xs">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Description</th>
                                    <th>Contact</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center animate-pulse">
                                            Loading data, please wait...
                                        </td>
                                    </tr>
                                ) : (
                                    finance.finance?.data.map((item, index) => (
                                        <tr key={index} className="">
                                            <td className="text-center whitespace-nowrap">
                                                {item.bill_amount > 0 ? (
                                                    <ArrowBigDown className="inline text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <ArrowBigUp className="inline text-red-600 dark:text-red-400" />
                                                )}
                                            </td>
                                            <td
                                                className={`text-end font-bold ${
                                                    item.bill_amount > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                                }`}
                                            >
                                                {formatNumber(item.bill_amount > 0 ? item.bill_amount : item.payment_amount)}
                                            </td>
                                            <td className="">{item.account.acc_name}</td>
                                            <td className="whitespace-normal break-words max-w-xs">
                                                <span className="font-bold text-xs text-slate-400 block">
                                                    {formatDateTime(item.created_at)} | {item.invoice}
                                                </span>
                                                Note: {item.description}
                                            </td>
                                            <td className="">{item.contact.name}</td>
                                            <td className="text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedFinanceId(item.id);
                                                        setIsModalDeleteFinanceOpen(true);
                                                    }}
                                                    type="button"
                                                    className=""
                                                >
                                                    <XCircleIcon className="w-4 h-4 mr-2 inline text-red-600 dark:text-red-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-4 sm:py-0">
                        {finance.finance?.last_page > 1 && <Paginator links={finance.finance} handleChangePage={handleChangePage} />}
                    </div>
                </div>
                <Modal isOpen={isModalDeleteFinanceOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                    <div className="flex flex-col items-center justify-center gap-3 mb-4">
                        <MessageCircleWarningIcon size={72} className="text-red-600" />
                        <p className="text-sm">Apakah anda yakin ingin menghapus transaksi ini (ID: {selectedFinanceId})?</p>
                    </div>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => {
                                handleDeleteFinance(selectedFinanceId);
                                setIsModalDeleteFinanceOpen(false);
                            }}
                            className="btn-primary w-full"
                        >
                            Ya
                        </button>
                        <button
                            onClick={() => setIsModalDeleteFinanceOpen(false)}
                            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-400 drop-shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Tidak
                        </button>
                    </div>
                </Modal>
                <Modal isOpen={isModalPaymentOpen} onClose={closeModal} modalTitle="Form Pembayaran" maxWidth="max-w-2xl">
                    <PaymentForm
                        contactId={selectedContactIdPayment}
                        notification={setNotification}
                        isModalOpen={setIsModalPaymentOpen}
                        fetchFinance={fetchFinance}
                        onClose={closeModal}
                    />
                </Modal>
            </div>
        </>
    );
};

export default Payable;
