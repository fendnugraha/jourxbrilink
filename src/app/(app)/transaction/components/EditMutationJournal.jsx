"use client";
import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";
import { DateTimeNow } from "@/libs/format";

const EditMutationJournal = ({ isModalOpen, journal, cashBank, selectedWarehouse, notification, fetchJournalsByWarehouse }) => {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        debt_code: "",
        cred_code: "",
        amount: "",
        fee_amount: 0,
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    // Update formData when journalById changes
    useEffect(() => {
        if (journal.debt_code || journal.cred_code) {
            setFormData({
                debt_code: journal.debt_code || "",
                cred_code: journal.cred_code || "",
                amount: journal.amount || "",
                fee_amount: 0,
                description: journal.description || "",
            });
        }
    }, [journal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/journals/${journal.id}`, formData);
            notification({ type: "success", message: response.data.message });
            fetchJournalsByWarehouse();
            isModalOpen(false);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const branchAccount = cashBank.filter((cashBank) => cashBank.warehouse_id === Number(selectedWarehouse));
    const hqAccount = cashBank.filter((cashBank) => cashBank.warehouse_id === 1);
    return (
        <div className="relative">
            {journal.id === undefined && <div className="absolute h-full w-full flex items-center justify-center bg-white">Loading data ...</div>}
            <h1 className="text-sm sm:text-xl font-bold mb-4">
                {journal.trx_type} ({journal.invoice})
            </h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-2 grid-cols-1 grid sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Tanggal</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <input
                            type="datetime-local"
                            value={formData.date_issued}
                            className="form-control"
                            onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                        />
                        {errors.date_issued && <span className="text-red-500 text-xs">{errors.date_issued}</span>}
                    </div>
                </div>
                <div className="mb-2 grid-cols-1 grid sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Dari (Cabang)</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <select
                            onChange={(e) => {
                                setFormData({ ...formData, cred_code: e.target.value });
                            }}
                            value={formData.cred_code}
                            className="form-select"
                        >
                            <option value="">--Pilih rekening--</option>
                            {branchAccount.map((br) => (
                                <option key={br.id} value={br.id}>
                                    {br.acc_name}
                                </option>
                            ))}
                        </select>
                        {errors.cred_code && <span className="text-red-500 text-xs">{errors.cred_code}</span>}
                    </div>
                </div>
                <div className="mb-2 grid-cols-1 grid sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Ke (Pusat)</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <select
                            onChange={(e) => {
                                setFormData({ ...formData, debt_code: e.target.value });
                            }}
                            value={formData.debt_code}
                            className="form-select"
                        >
                            <option value="">--Pilih rekening--</option>
                            {hqAccount.map((br) => (
                                <option key={br.id} value={br.id}>
                                    {br.acc_name}
                                </option>
                            ))}
                        </select>
                        {errors.debt_code && <span className="text-red-500 text-xs">{errors.debt_code}</span>}
                    </div>
                </div>
                <div className="mb-2 grid-cols-1 grid sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Jumlah</Label>
                    <div className="col-span-1">
                        <input
                            type="number"
                            className={"form-control"}
                            placeholder="Rp."
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                        {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                    </div>
                    <h1 className="text-lg font-bold">{formatNumber(formData.amount)}</h1>
                </div>
                <div className="mb-4 grid-cols-1 grid sm:grid-cols-3 gap-4">
                    <Label>Keterangan</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <textarea
                            className="form-control"
                            type="text"
                            placeholder="(Optional)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
                    </div>
                </div>
                <div className="flex justify-end">
                    <button className="rounded-xl px-8 py-3 text-red-300 hover:border-red-300 hover:border mr-1" onClick={() => isModalOpen(false)}>
                        Cancel
                    </button>
                    <button
                        className="bg-green-500 hover:bg-green-600 rounded-xl px-8 py-3 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Update"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditMutationJournal;
