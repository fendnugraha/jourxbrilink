"use client";
import Modal from "@/components/Modal";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateReceivable from "./CreateReceivable";
import { formatNumber } from "@/libs/format";
import { format } from "date-fns";
import SimplePagination from "@/components/SimplePagination";
import CreateRcvPayment from "./CreateRcvPayment";

const ReceivableTable = ({ notification, finance, fetchFinance, selectedContactId, setSelectedContactId, type, setType }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("Unpaid");
    const filteredFinance =
        finance?.filter((fnc) => {
            const matchesSearch = searchTerm === "" || fnc.contact_name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesUnpaidCondition = paymentStatus === "Unpaid" ? fnc.sisa > 0 : paymentStatus === "Paid" ? Number(fnc.sisa) === 0 : true;

            return matchesSearch && matchesUnpaidCondition;
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
    const [isModalCreateReceivableOpen, setIsModalCreateReceivableOpen] = useState(false);
    const [isModalPaymentOpen, setIsModalPaymentOpen] = useState(false);
    const closeModal = () => {
        setIsModalCreateReceivableOpen(false);
        setIsModalPaymentOpen(false);
    };

    const totalReceivable = filteredFinance.reduce((total, item) => total + Number(item.sisa), 0);
    return (
        <div className="card p-4 sm:col-span-2 h-fit">
            <div className="flex justify-between mb-4">
                <h1 className="card-title">
                    Piutang Karyawan
                    <span className="card-subtitle">Total: Rp{formatNumber(totalReceivable)}</span>
                </h1>
                <button className="small-button h-fit" onClick={() => setIsModalCreateReceivableOpen(true)}>
                    <Plus size={14} />
                </button>
            </div>
            <div className="flex gap-2">
                <select
                    className="form-control"
                    value={type}
                    onChange={(e) => {
                        (setType(e.target.value), setCurrentPage(1));
                    }}
                >
                    <option value="EmployeeReceivable">Kasbon (Full Payment)</option>
                    <option value="InstallmentReceivable">Cicilan (Installment Payment)</option>
                </select>
                <select
                    className="form-control !w-fit"
                    value={paymentStatus}
                    onChange={(e) => {
                        (setPaymentStatus(e.target.value), setCurrentPage(1));
                    }}
                >
                    <option value="Paid">Lunas</option>
                    <option value="Unpaid">Belum</option>
                </select>
                <select
                    className="form-control !w-fit"
                    value={itemsPerPage}
                    onChange={(e) => {
                        (setItemsPerPage(e.target.value), setCurrentPage(1));
                    }}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
            <input type="search" placeholder="Search" className="form-control w-full mt-2" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                                <td className="text-end">{formatNumber(item.tagihan - item.terbayar)}</td>
                                <td className="text-center">
                                    <button
                                        onClick={() => {
                                            setIsModalPaymentOpen(true);
                                            setSelectedContactId(item.contact_id);
                                        }}
                                        type="button"
                                        className="hover:underline"
                                        disabled={Number(item.sisa) === 0}
                                    >
                                        {Number(item.sisa) === 0 ? "Lunas" : "Bayar"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-end mt-4">
                    <SimplePagination totalItems={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={handlePageChange} />
                </div>
            )}
            <Modal isOpen={isModalCreateReceivableOpen} onClose={closeModal} modalTitle="Tambah Piutang" maxWidth="max-w-md">
                <CreateReceivable isModalOpen={setIsModalCreateReceivableOpen} fetchFinance={fetchFinance} notification={notification} />
            </Modal>
            <Modal isOpen={isModalPaymentOpen} onClose={closeModal} modalTitle="Form Pembayaran" maxWidth="max-w-2xl">
                <CreateRcvPayment
                    selectedContactId={selectedContactId}
                    isModalOpen={setIsModalPaymentOpen}
                    fetchFinance={fetchFinance}
                    notification={notification}
                    type={type}
                />
            </Modal>
        </div>
    );
};

export default ReceivableTable;
