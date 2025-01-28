"use client";
import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";

const CreateCashWithdrawal = ({ isModalOpen, filteredCashBankByWarehouse, notification, fetchJournalsByWarehouse, user }) => {
    const [formData, setFormData] = useState({
        debt_code: "",
        cred_code: user.role.warehouse.chart_of_account_id,
        amount: "",
        trx_type: "Tarik Tunai",
        fee_amount: "",
        description: "",
        custName: "XXX",
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-transfer", formData);
            notification(response.data.message);
            setFormData({
                cred_code: "",
                amount: "",
                fee_amount: "",
                description: "",
                custName: "",
            });
            fetchJournalsByWarehouse();
            isModalOpen(false);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <form>
                <div className="mb-2 grid grid-cols-3 gap-4 items-center">
                    <Label>Ke Rekening</Label>
                    <div className="col-span-2">
                        <select
                            onChange={(e) => setFormData({ ...formData, debt_code: e.target.value })}
                            value={formData.debt_code}
                            className="w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
                <div className="mb-2 grid grid-cols-3 gap-4 items-center">
                    <Label>Jumlah Penarikan</Label>
                    <div className="col-span-1">
                        <Input
                            className={"w-full"}
                            type="number"
                            placeholder="Rp."
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                        {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                    </div>
                    <h1 className="text-lg font-bold">{formatNumber(formData.amount)}</h1>
                </div>
                <div className="mb-2 grid grid-cols-3 gap-4 items-center">
                    <Label>Fee (Admin)</Label>
                    <div className="col-span-1">
                        <Input
                            className={"w-1/2"}
                            type="number"
                            placeholder="Rp."
                            value={formData.fee_amount}
                            onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                        />
                        {errors.fee_amount && <span className="text-red-500 text-xs">{errors.fee_amount}</span>}
                    </div>
                    <h1 className="text-lg font-bold">{formatNumber(formData.fee_amount)}</h1>
                </div>
                <div className="mb-2 grid grid-cols-3 gap-4 items-center">
                    <Label>Keterangan</Label>
                    <div className="col-span-2">
                        <textarea
                            className="w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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

export default CreateCashWithdrawal;
