"use client";

import Modal from "@/components/Modal";
import { useCallback, useEffect, useState } from "react";
import CreateSaving from "./CreateSaving";
import axios from "@/libs/axios";
import { formatNumber } from "@/libs/format";
import DepositWithdraw from "./DepositWithdraw";
import SavingLog from "./SavingLog";
import Notification from "@/components/Notification";
import Dropdown from "@/components/Dropdown";
import CreateSavingMultiple from "./CreateSavingMultiple";
import SimplePagination from "@/components/SimplePagination";

const SavingContent = () => {
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [isModalPaymentOpen, setIsModalPaymentOpen] = useState(false);
    const [isModalCreateSavingOpen, setIsModalCreateSavingOpen] = useState(false);
    const [isModalCreateSavingMultipleOpen, setIsModalCreateSavingMultipleOpen] = useState(false);

    const closeModal = () => {
        setIsModalCreateSavingOpen(false);
        setIsModalCreateSavingMultipleOpen(false);
        setIsModalPaymentOpen(false);
        setSelectedFinanceId(null);
    };
    const [finance, setFinance] = useState([]);
    const [selectedFinanceId, setSelectedFinanceId] = useState(null);
    const [selectedContactId, setSelectedContactId] = useState("All");
    const [selectedContactIdPayment, setSelectedContactIdPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchFinance = useCallback(
        async (url = `/api/finance-by-type/${selectedContactId}/Saving`) => {
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
        [selectedContactId]
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
    const totalItems = filteredFinance.filter((f) => f.finance_type === "Saving").length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get the items for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredFinance.filter((f) => f.finance_type === "Saving").slice(startIndex, startIndex + itemsPerPage);

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
                        <h1 className="card-title mb-4">Simpanan Karyawan</h1>

                        <Dropdown trigger={<button className="btn btn-primary">Tambah</button>} align="left">
                            <ul className="min-w-max">
                                <li className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-500 ">
                                    <button className="w-full text-sm text-left py-2 px-4 " onClick={() => setIsModalCreateSavingOpen(true)}>
                                        Deposit
                                    </button>
                                </li>
                                <li className="hover:bg-slate-100 dark:hover:bg-slate-500">
                                    <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateSavingMultipleOpen(true)}>
                                        Deposit (Multiple)
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
                                    <th>Saldo</th>
                                    <th className="text-center w-16">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item, index) => (
                                    <tr key={index} className="" onClick={() => setSelectedContactId(item.contact_id)}>
                                        <td>
                                            <button className="hover:underline">{item.contact.name}</button>
                                        </td>
                                        <td className="text-end">{formatNumber(item.sisa)}</td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => {
                                                    setIsModalPaymentOpen(true);
                                                    setSelectedContactIdPayment(item.contact_id);
                                                }}
                                                type="button"
                                                className="bg-blue-500 hover:bg-yellow-300 hover:text-slate-700 text-white font-bold py-1 px-4 rounded-xl disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer hover:scale-110 transition-transform duration-300 ease-out"
                                                disabled={Number(item.sisa) === 0}
                                            >
                                                {Number(item.sisa) === 0 ? "Lunas" : "Tarik"}
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
                                            filteredFinance.filter((f) => f.finance_type === "Saving").reduce((total, item) => total + Number(item.sisa), 0)
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
                <SavingLog finance={finance} notification={setNotification} fetchFinance={fetchFinance} />
                <Modal isOpen={isModalCreateSavingOpen} onClose={closeModal} modalTitle="Tambah Simpanan Karyawan">
                    <CreateSaving isModalOpen={setIsModalCreateSavingOpen} notification={setNotification} fetchFinance={fetchFinance} />
                </Modal>
                <Modal isOpen={isModalCreateSavingMultipleOpen} onClose={closeModal} modalTitle="Tambah Simpanan Karyawan (Multiple)" maxWidth="max-w-2xl">
                    <CreateSavingMultiple isModalOpen={setIsModalCreateSavingMultipleOpen} notification={setNotification} fetchFinance={fetchFinance} />
                </Modal>
                <Modal isOpen={isModalPaymentOpen} onClose={closeModal} modalTitle="Form Penarikan Saldo Simpanan" maxWidth="max-w-2xl">
                    <DepositWithdraw
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

export default SavingContent;
