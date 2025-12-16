import Modal from "@/components/Modal";
import Paginator from "@/components/Paginator";
import axios from "@/libs/axios";
import { formatDateTime, formatNumber, todayDate } from "@/libs/format";
import { ArrowBigDown, ArrowBigUp, Filter, MessageCircleWarningIcon, XCircleIcon } from "lucide-react";
import { useState } from "react";

const ReceivableLog = ({ financeLog, notification, fetchFinance }) => {
    const [startDate, setStartDate] = useState(todayDate());
    const [endDate, setEndDate] = useState(todayDate());

    const [isModalDeleteFinanceOpen, setIsModalDeleteFinanceOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedFinanceId, setSelectedFinanceId] = useState(null);

    const closeModal = () => {
        setIsModalDeleteFinanceOpen(false);
        setSelectedFinanceId(null);
    };

    const handleChangePage = (url) => {
        fetchFinance(url);
    };

    const handleDeleteFinance = async (id) => {
        try {
            const response = await axios.delete(`/api/finance/${id}`);
            notification({ type: "success", message: response.data.message });
            fetchFinance();
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div className="card p-4 sm:col-span-3">
            <div className="flex justify-between mb-4">
                <h1 className="card-title">
                    History Piutang
                    <span className="card-subtitle">Nama:-</span>
                </h1>
                <button className="small-button h-fit">
                    <Filter size={14} />
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Jumlah</th>
                            <th>Keterangan</th>
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
                            financeLog?.data.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-700 hover:dark:text-white">
                                    <td className="text-center whitespace-nowrap !w-8">
                                        {item.bill_amount > 0 ? (
                                            <ArrowBigDown className="inline text-green-600 dark:text-green-400" />
                                        ) : (
                                            <ArrowBigUp className="inline text-red-600 dark:text-red-400" />
                                        )}
                                    </td>
                                    <td
                                        className={`text-end font-bold w-16 ${
                                            item.bill_amount > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                        }`}
                                    >
                                        {formatNumber(item.bill_amount > 0 ? item.bill_amount : item.payment_amount)}
                                    </td>
                                    <td className="whitespace-normal wrap-break-word max-w-xs">
                                        <span className="font-bold text-xs text-slate-400 dark:text-yellow-200 block">
                                            {formatDateTime(item.created_at)} | {item.invoice}
                                        </span>
                                        <span className="font-bold block">
                                            {item.contact?.name} | {item.account.acc_name}
                                        </span>
                                        Note: {item.description}
                                    </td>
                                    <td className="text-center">
                                        <button
                                            onClick={() => {
                                                setSelectedFinanceId(item.id);
                                                setIsModalDeleteFinanceOpen(true);
                                            }}
                                            type="button"
                                            className="hover:scale-110 transition-transform duration-300 ease-in-out cursor-pointer"
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
            <div className="px-4 py-4 sm:py-0">{financeLog?.last_page > 1 && <Paginator links={financeLog} handleChangePage={handleChangePage} />}</div>

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
        </div>
    );
};

export default ReceivableLog;
