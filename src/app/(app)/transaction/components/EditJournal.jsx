"use client";
import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";

const EditJournal = ({ isModalOpen, journal, branchAccount, notification, fetchJournalsByWarehouse }) => {
    const [formData, setFormData] = useState({
        debt_code: "",
        cred_code: "",
        amount: "",
        fee_amount: "",
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
                fee_amount: journal.fee_amount || "",
                description: journal.description || "",
            });
        }
    }, [journal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/journals/${journal.id}`, formData);
            notification("success", response.data.message);
            fetchJournalsByWarehouse();
            isModalOpen(false);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="relative">
            {journal.id === undefined && <div className="absolute h-full w-full flex items-center justify-center bg-white">Loading data ...</div>}
            <h1 className="text-sm sm:text-xl font-bold mb-4">
                {journal.trx_type} ({journal.invoice})
            </h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-2 grid-cols-1 grid sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Rekening</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <select
                            onChange={(e) => {
                                if (journal.trx_type === "Tarik Tunai") {
                                    setFormData({ ...formData, debt_code: e.target.value });
                                } else {
                                    setFormData({ ...formData, cred_code: e.target.value });
                                }
                            }}
                            value={journal.trx_type === "Tarik Tunai" ? formData.debt_code : formData.cred_code}
                            className="form-control"
                        >
                            <option value="">--Pilih rekening--</option>
                            {branchAccount.map((br) => (
                                <option key={br.id} value={br.id}>
                                    {br.acc_name}
                                </option>
                            ))}
                        </select>
                        {errors.cred_code && <span className="text-red-500 text-xs">{errors.cred_code}</span>}
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
                <div className="mb-2 grid-cols-1 grid sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Fee</Label>
                    <div className="col-span-1">
                        <input
                            type="number"
                            className={"form-control"}
                            placeholder="Rp."
                            value={formData.fee_amount}
                            onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                        />
                        {errors.fee_amount && <span className="text-red-500 text-xs">{errors.fee_amount}</span>}
                    </div>
                    <h1 className="text-lg font-bold">{formatNumber(formData.fee_amount)}</h1>
                </div>
                <div className="mb-2 grid-cols-1 grid sm:grid-cols-3 gap-4">
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
                <div className="flex justify-end mt-4">
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

export default EditJournal;
