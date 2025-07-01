"use client";
import { useState, useEffect, useRef } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";

const CreateCashWithdrawal = ({ isModalOpen, filteredCashBankByWarehouse, notification, fetchJournalsByWarehouse, user, calculateFee }) => {
    const [formData, setFormData] = useState({
        debt_code: "",
        cred_code: user.role.warehouse.chart_of_account_id,
        amount: "",
        trx_type: "Tarik Tunai",
        fee_amount: "",
        description: "",
        custName: "General",
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-transfer", formData);
            const successMessage =
                response.data.journal.debt.acc_name +
                " sebesar " +
                formatNumber(response.data.journal.amount) +
                " (Adm: " +
                formatNumber(response.data.journal.fee_amount) +
                ")";
            notification("success", "Penarikan tunai dari " + successMessage);
            setFormData({
                debt_code: formData.debt_code,
                cred_code: user.role.warehouse.chart_of_account_id,
                amount: "",
                trx_type: "Tarik Tunai",
                fee_amount: "",
                description: "",
                custName: "General",
            });
            fetchJournalsByWarehouse();
            // isModalOpen(false);
            setErrors([]);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="mb-2 sm:mb-4">
                    <Label>Ke Rekening</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <select
                            onChange={(e) => setFormData({ ...formData, debt_code: e.target.value })}
                            value={formData.debt_code}
                            className="form-select"
                            required
                        >
                            <option value="">--Pilih Rekening--</option>
                            {filteredCashBankByWarehouse.map((cashBank) => (
                                <option key={cashBank.id} value={cashBank.id}>
                                    {cashBank.acc_name}
                                </option>
                            ))}
                        </select>
                        {errors.debt_code && <span className="text-red-500 text-xs">{errors.debt_code}</span>}
                    </div>
                </div>
                <div className="mb-2 sm:mb-4">
                    <Label>Jumlah Penarikan</Label>
                    <div className="col-span-1">
                        <input
                            className={"form-control"}
                            type="number"
                            placeholder="Rp."
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                        {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                        {formData.amount && (
                            <h1 className="text-sm">
                                Jml: <span className="font-bold">{formatNumber(formData.amount)}</span>, Adm:{" "}
                                <span className="font-bold">{formatNumber(formData.fee_amount)}</span>
                            </h1>
                        )}
                    </div>
                </div>
                <div className="mb-2 sm:mb-4">
                    <Label>Fee (Admin)</Label>
                    <div className="col-span-1">
                        <input
                            className={"form-control"}
                            type="number"
                            placeholder="Rp."
                            value={formData.fee_amount}
                            onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                            required
                        />
                        {errors.fee_amount && <span className="text-red-500 text-xs">{errors.fee_amount}</span>}
                        {formData.amount && (
                            <span
                                type="button"
                                onClick={(e) => setFormData({ ...formData, fee_amount: calculateFee(formData.amount) })}
                                className="text-xs cursor-pointer bg-yellow-300 hover:bg-yellow-200 rounded-lg px-2 py-1 mt-1"
                            >
                                {formatNumber(calculateFee(formData.amount))}
                            </span>
                        )}
                    </div>
                </div>
                <div className="mb-2 sm:mb-4">
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

export default CreateCashWithdrawal;
