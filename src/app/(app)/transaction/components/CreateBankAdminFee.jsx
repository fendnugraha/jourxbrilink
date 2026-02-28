"use client";
import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import { set } from "date-fns";
import { DateTimeNow } from "@/libs/format";

const CreateBankAdminFee = ({ isModalOpen, filteredCashBankByWarehouse, notification, fetchJournalsByWarehouse, user }) => {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        debt_code: user?.role?.warehouse?.chart_of_account_id,
        cred_code: "",
        amount: "",
        fee_amount: "",
        trx_type: "Pengeluaran",
        description: "Biaya Administrasi Bank",
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-mutation", formData);
            notification({ type: "success", message: "Pengeluaran operasional berhasil" });
            setFormData({
                date_issued: today,
                debt_code: user?.role?.warehouse?.chart_of_account_id,
                cred_code: "",
                amount: "",
                fee_amount: "",
                trx_type: "Pengeluaran",
                description: "Biaya Administrasi Bank",
            });
            fetchJournalsByWarehouse();
            isModalOpen(false);
            setErrors([]);
        } catch (error) {
            setErrors(error.response.data.errors || ["Something went wrong."]);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Tanggal</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <input
                            type="datetime-local"
                            className="form-control"
                            value={formData.date_issued}
                            onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                            required
                        />
                        {errors.date_issued && <span className="text-red-500 text-xs">{errors.date_issued}</span>}
                    </div>
                </div>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Dari Rekening</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <select
                            onChange={(e) => setFormData({ ...formData, cred_code: e.target.value })}
                            value={formData.cred_code}
                            className="form-select"
                            required
                        >
                            <option value="">--Pilih Rekening--</option>
                            {filteredCashBankByWarehouse
                                .filter((cashBank) => Number(cashBank.account_id === 2))
                                .map((cashBank) => (
                                    <option key={cashBank.id} value={cashBank.id}>
                                        {cashBank.account_group}
                                    </option>
                                ))}
                        </select>
                        {errors.cred_code && <span className="text-red-500 text-xs">{errors.cred_code}</span>}
                    </div>
                </div>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Jumlah</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Rp."
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value, fee_amount: -e.target.value })}
                            required
                        />
                        {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                    </div>
                </div>
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
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
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => isModalOpen(false)}
                        type="button"
                        className="bg-white border border-red-300 hover:bg-red-200 rounded-xl px-8 py-3 text-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 rounded-xl px-8 py-3 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Simpan"}
                    </button>
                </div>
            </form>
        </>
    );
};

export default CreateBankAdminFee;
