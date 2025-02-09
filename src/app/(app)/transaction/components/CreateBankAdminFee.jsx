"use client";
import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";

const CreateBankAdminFee = ({ isModalOpen, filteredCashBankByWarehouse, notification, fetchJournalsByWarehouse, user }) => {
    const [formData, setFormData] = useState({
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
            notification("Pengeluaran biaya administrasi bank berhasil");
            setFormData({
                debt_code: user?.role?.warehouse?.chart_of_account_id,
                cred_code: "",
                amount: "",
                fee_amount: "",
                trx_type: "Pengeluaran",
                description: "Biaya Administrasi Bank",
            });
            fetchJournalsByWarehouse();
            isModalOpen(false);
        } catch (error) {
            setErrors(error.response.data.errors || ["Something went wrong."]);
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <form>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Dari Rekening</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <select
                            onChange={(e) => setFormData({ ...formData, cred_code: e.target.value })}
                            value={formData.cred_code}
                            className="w-full rounded-md border p-2 shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">--Pilih Rekening--</option>
                            {filteredCashBankByWarehouse.map((cashBank) => (
                                <option key={cashBank.id} value={cashBank.id}>
                                    {cashBank.acc_name}
                                </option>
                            ))}
                        </select>
                        {errors.cred_code && <span className="text-red-500 text-xs">{errors.cred_code}</span>}
                    </div>
                </div>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Jumlah</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <Input
                            type="number"
                            placeholder="Rp."
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value, fee_amount: -e.target.value })}
                        />
                        {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                    </div>
                </div>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Keterangan</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <textarea
                            className="w-full rounded-md border p-2 shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            type="text"
                            placeholder="(Optional)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-indigo-500 hover:bg-indigo-600 rounded-xl px-8 py-3 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Simpan"}
                </button>
            </form>
        </>
    );
};

export default CreateBankAdminFee;
