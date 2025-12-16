"use client";
import { ArrowBigDown, ArrowBigUp, MessageCircleWarningIcon, PlusCircleIcon, XCircleIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import axios from "@/libs/axios";
import Modal from "@/components/Modal";
import CreateContact from "../../setting/contact/CreateContact";
import CreatePayable from "./CreatePayable";
import formatNumber from "@/libs/formatNumber";
import Notification from "@/components/Notification";
import PaymentForm from "./PaymentForm";
import CreateReceivable from "./CreateReceivable";
import Link from "next/link";
import Dropdown from "@/components/Dropdown";
import FinanceLog from "./FinanceLog";
import SimplePagination from "@/components/SimplePagination";
import { DateTimeNow } from "@/libs/format";

const FinanceContent = () => {
    const { today } = DateTimeNow();
    const [isModalCreateContactOpen, setIsModalCreateContactOpen] = useState(false);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [isModalCreatePayableOpen, setIsModalCreatePayableOpen] = useState(false);
    const [isModalCreateReceivableOpen, setIsModalCreateReceivableOpen] = useState(false);
    const [isModalDeleteFinanceOpen, setIsModalDeleteFinanceOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isModalPaymentOpen, setIsModalPaymentOpen] = useState(false);
    const [financeType, setFinanceType] = useState("Payable");

    const closeModal = () => {
        setIsModalCreateContactOpen(false);
        setIsModalCreatePayableOpen(false);
        setIsModalCreateReceivableOpen(false);
        setIsModalDeleteFinanceOpen(false);
        setIsModalPaymentOpen(false);
        setSelectedFinanceId(null);
    };
    const [finance, setFinance] = useState([]);
    const [selectedFinanceId, setSelectedFinanceId] = useState(null);
    const [selectedContactId, setSelectedContactId] = useState("All");
    const [selectedContactIdPayment, setSelectedContactIdPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchFinance = useCallback(
        async (url = `/api/finance-by-type/${selectedContactId}/${financeType}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url);
                setFinance(response.data.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        },
        [selectedContactId, financeType]
    );

    useEffect(() => {
        fetchFinance();
    }, [fetchFinance]);

    const [paymentStatus, setPaymentStatus] = useState("Unpaid");

    const filteredFinance =
        finance.financeGroupByContactId?.filter((fnc) => {
            const matchesSearch = searchTerm === "" || fnc.contact.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesUnpaidCondition = paymentStatus === "Unpaid" ? fnc.sisa > 0 : paymentStatus === "Paid" ? Number(fnc.sisa) === 0 : true;

            return matchesSearch && matchesUnpaidCondition;
        }) || [];

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Calculate the total number of pages
    const totalItems = filteredFinance.filter((f) => f.finance_type === financeType).length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get the items for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredFinance.filter((f) => f.finance_type === financeType).slice(startIndex, startIndex + itemsPerPage);

    // Handle page change from the Pagination component
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="card p-4 sm:col-span-2 h-fit">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <select value={financeType} onChange={(e) => setFinanceType(e.target.value)}>
                                <option value="Payable">Hutang</option>
                                <option value="Receivable">Piutang</option>
                            </select>
                            <Link href={"saving"} className="text-xs hover:underline">
                                Simpanan Karyawan {" -> "}
                            </Link>
                        </div>

                        <Dropdown trigger={<button className="btn btn-primary">Tambah</button>} align="left">
                            <ul className="min-w-max">
                                <li className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-500 ">
                                    <button className="w-full text-sm text-left py-2 px-4 " onClick={() => setIsModalCreatePayableOpen(true)}>
                                        Hutang
                                    </button>
                                </li>
                                <li className="hover:bg-slate-100 dark:hover:bg-slate-500">
                                    <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateReceivableOpen(true)}>
                                        Piutang
                                    </button>
                                </li>
                                <li className="hover:bg-slate-100 dark:hover:bg-slate-500">
                                    <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateContactOpen(true)}>
                                        Contact
                                    </button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search"
                            className="form-control w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="form-control !w-fit"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(e.target.value), setCurrentPage(1);
                            }}
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
                                    <th>Nama</th>
                                    <th>Sisa</th>
                                    <th className="text-center w-16">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item, index) => (
                                    <tr key={index} className="" onClick={() => setSelectedContactId(item.contact_id)}>
                                        <td>
                                            <button className="hover:underline">{item.contact_name}</button>
                                        </td>
                                        <td className="text-end">{formatNumber(item.sisa)}</td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => {
                                                    setIsModalPaymentOpen(true);
                                                    setSelectedContactIdPayment(item.contact_id);
                                                }}
                                                type="button"
                                                className="bg-blue-500 hover:bg-yellow-300 hover:text-slate-700 text-white font-bold py-0.5 px-3 rounded-xl disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer hover:scale-110 transition-transform duration-300 ease-out"
                                                disabled={Number(item.sisa) === 0}
                                            >
                                                {Number(item.sisa) === 0 ? "Lunas" : "Bayar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th className="">Total</th>
                                    <th className="text-end">
                                        {formatNumber(
                                            filteredFinance.filter((f) => f.finance_type === financeType).reduce((total, item) => total + Number(item.sisa), 0)
                                        )}
                                    </th>
                                    <th></th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-end mt-2">
                            <SimplePagination totalItems={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={handlePageChange} />
                        </div>
                    )}
                </div>
                <FinanceLog finance={finance} notification={setNotification} fetchFinance={fetchFinance} />
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
                <Modal isOpen={isModalCreateContactOpen} onClose={closeModal} modalTitle="Create Contact">
                    <CreateContact isModalOpen={setIsModalCreateContactOpen} notification={(message) => notification(message)} />
                </Modal>
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

export default FinanceContent;
