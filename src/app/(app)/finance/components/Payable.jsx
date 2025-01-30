"use client";
import { ArrowBigDown, ArrowBigUp, PlusCircleIcon, XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import Modal from "@/components/Modal";
import CreateContact from "../../setting/contact/CreateContact";
import Notification from "@/components/notification";
import CreatePayable from "./CreatePayable";
import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
const Payable = () => {
    const [isModalCreateContactOpen, setIsModalCreateContactOpen] = useState(false);
    const [isModalCreatePayableOpen, setIsModalCreatePayableOpen] = useState(false);
    const [finance, setFinance] = useState([]);
    const [notification, setNotification] = useState("");
    const [financeType, setFinanceType] = useState("Payable");

    const [loading, setLoading] = useState(true);
    const fetchFinance = async (url = "/api/finance") => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            setFinance(response.data.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinance();
    }, []);
    const closeModal = () => {
        setIsModalCreateContactOpen(false);
        setIsModalCreatePayableOpen(false);
    };

    const filterFinanceByContactIdAndType = finance.financeGroupByContactId?.filter((fnc) => fnc.finance_type === financeType) || [];

    const filterFinanceByType = finance.finance?.filter((fnc) => fnc.finance_type === financeType) || [];

    return (
        <>
            <div className="bg-slate-400 rounded-2xl mb-4 p-1">
                <div className="flex">
                    <button
                        onClick={() => setFinanceType("Payable")}
                        className={`px-4 ${financeType === "Payable" ? "bg-white text-slate-600 rounded-2xl" : "text-white text-sm"}`}
                    >
                        Hutang
                    </button>
                    <button
                        onClick={() => setFinanceType("Receivable")}
                        className={`px-4 ${financeType === "Receivable" ? "bg-white text-slate-600 rounded-2xl" : "text-white text-sm"}`}
                    >
                        Piutang
                    </button>
                </div>
            </div>
            <div className="overflow-hidden">
                {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
                <div className="bg-white shadow-sm sm:rounded-2xl mb-4">
                    <div className="p-4 flex justify-between">
                        <h1 className="text-2xl font-bold mb-4">{financeType === "Payable" ? "Hutang" : "Piutang"}</h1>
                        <div>
                            <button onClick={() => setIsModalCreatePayableOpen(true)} className="btn-primary text-xs mr-2">
                                <PlusCircleIcon className="w-4 h-4 mr-2 inline" /> Hutang
                            </button>
                            <button className="btn-primary text-xs mr-2 disabled:bg-slate-400 disabled:cursor-not-allowed" disabled={true}>
                                <PlusCircleIcon className="w-4 h-4 mr-2 inline" /> Piutang
                            </button>
                            <Modal isOpen={isModalCreatePayableOpen} onClose={closeModal} modalTitle="Create Payable">
                                <CreatePayable
                                    isModalOpen={setIsModalCreatePayableOpen}
                                    notification={(message) => setNotification(message)}
                                    fetchFinance={fetchFinance}
                                />
                            </Modal>
                            <button onClick={() => setIsModalCreateContactOpen(true)} className="btn-primary text-xs">
                                <PlusCircleIcon className="w-4 h-4 mr-2 inline" /> Contact
                            </button>
                            <Modal isOpen={isModalCreateContactOpen} onClose={closeModal} modalTitle="Create Contact">
                                <CreateContact isModalOpen={setIsModalCreateContactOpen} notification={(message) => setNotification(message)} />
                            </Modal>
                        </div>
                    </div>
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
                            {filterFinanceByContactIdAndType.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-700 hover:text-white">
                                    <td>{item.contact.name}</td>
                                    <td className="text-end">{formatNumber(item.tagihan)}</td>
                                    <td className="text-end">{formatNumber(item.terbayar)}</td>
                                    <td className="text-end">{formatNumber(item.sisa)}</td>
                                    <td className="text-center">
                                        <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl">
                                            Bayar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="text-lg">
                                <td colSpan={3} className="font-bold">
                                    Total {financeType === "Payable" ? "Hutang" : "Piutang"}
                                </td>
                                <td className="font-bold text-end">
                                    {formatNumber(filterFinanceByContactIdAndType.reduce((total, item) => total + Number(item.sisa), 0))}
                                </td>
                                <td className="font-bold text-end"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="bg-white shadow-sm sm:rounded-2xl">
                    <div className="p-4 flex justify-between">
                        <h1 className="text-2xl font-bold mb-4">Riwayat Transaksi</h1>
                    </div>
                    <table className="table w-full text-xs">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Description</th>
                                <th>Contact</th>
                                <th>Date Created</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filterFinanceByType.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-700 hover:text-white">
                                    <td>
                                        {item.bill_amount > 0 ? (
                                            <ArrowBigDown className="inline text-green-600" />
                                        ) : (
                                            <ArrowBigUp className="inline text-red-600" />
                                        )}
                                    </td>
                                    <td className="text-end">{formatNumber(item.bill_amount > 0 ? item.bill_amount : item.payment_amount)}</td>
                                    <td className="">{item.account.acc_name}</td>
                                    <td className="">{item.description}</td>
                                    <td className="">{item.contact.name}</td>
                                    <td className="text-end">{formatDateTime(item.created_at)}</td>
                                    <td className="text-center">
                                        <button type="button" className="">
                                            <XCircleIcon className="w-4 h-4 mr-2 inline text-red-600" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Payable;
