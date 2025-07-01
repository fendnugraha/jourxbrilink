"use client";
import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";

const CreateMutationFromHq = ({ isModalOpen, cashBank, notification, fetchJournalsByWarehouse, warehouses }) => {
    const [formData, setFormData] = useState({
        debt_code: "",
        cred_code: "",
        amount: "",
        fee_amount: 0,
        trx_type: "Mutasi Kas",
        description: "",
        admin_fee: "" || 0,
    });
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(1);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const hqAccount = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === 1);
    const branchAccount = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === Number(selectedWarehouseId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-mutation", formData);
            const successMessage =
                response.data.journal.cred.acc_name + " ke " + response.data.journal.debt.acc_name + " sebesar " + formatNumber(response.data.journal.amount);
            notification("success", response.data.message + " " + successMessage);
            fetchJournalsByWarehouse();
            isModalOpen(true);
            setFormData({
                debt_code: "",
                cred_code: formData.cred_code,
                amount: "",
                fee_amount: 0,
                trx_type: "Mutasi Kas",
                description: "",
                admin_fee: "" || 0,
            });
            setErrors([]);
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
            setErrors(error.response?.data?.errors);
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Pilih Cabang</Label>
                <div className="col-span-1 sm:col-span-2">
                    <select
                        onChange={(e) => {
                            setSelectedWarehouseId(e.target.value);
                            setFormData({ ...formData, debt_code: "" });
                        }}
                        value={selectedWarehouseId}
                        className="form-select"
                        required
                    >
                        {warehouses?.map((wh) => (
                            <option key={wh.id} value={wh.id}>
                                {wh.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Dari (Pusat)</Label>
                <div className="col-span-1 sm:col-span-2">
                    <select
                        onChange={(e) => setFormData({ ...formData, cred_code: e.target.value })}
                        value={formData.cred_code}
                        className="form-select"
                        required
                    >
                        <option value="">--Pilih sumber dana--</option>
                        {hqAccount.map((br) => (
                            <option key={br.id} value={br.id}>
                                {br.acc_name}
                            </option>
                        ))}
                    </select>
                    {errors?.cred_code && <span className="text-red-500 text-xs">{errors?.cred_code}</span>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Ke (Cabang)</Label>
                <div className="col-span-1 sm:col-span-2">
                    <select
                        onChange={(e) => setFormData({ ...formData, debt_code: e.target.value })}
                        value={formData.debt_code}
                        className="form-select"
                        disabled={!selectedWarehouseId}
                        required
                    >
                        <option value="">--Pilih tujuan mutasi--</option>
                        {branchAccount.map((hq) => (
                            <option key={hq.id} value={hq.id}>
                                {hq.acc_name}
                            </option>
                        ))}
                    </select>
                    {errors?.debt_code && <span className="text-red-500 text-xs">{errors?.debt_code}</span>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Jumlah transfer</Label>
                <div className="col-span-1">
                    <input
                        className="form-control"
                        type="number"
                        placeholder="Rp."
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />
                    {errors?.amount && <span className="text-red-500 text-xs">{errors?.amount}</span>}
                </div>

                {formData.amount > 0 && <h1 className="text-sm sm:text-lg font-bold">{formatNumber(formData.amount)}</h1>}
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Biaya admin bank</Label>
                <div className="col-span-1">
                    <input
                        className="form-control"
                        type="number"
                        placeholder="Rp."
                        value={formData.admin_fee}
                        onChange={(e) => setFormData({ ...formData, admin_fee: e.target.value })}
                    />
                    {errors?.admin_fee && <span className="text-red-500 text-xs">{errors?.admin_fee}</span>}
                </div>

                {formData.admin_fee > 0 && <h1 className="text-sm sm:text-lg font-bold">{formatNumber(formData.admin_fee)}</h1>}
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Keterangan</Label>
                <div className="col-span-1 sm:col-span-2">
                    <textarea
                        className="form-control"
                        type="text"
                        placeholder="(Optional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    {errors?.description && <span className="text-red-500 text-xs">{errors?.description}</span>}
                </div>
            </div>
            <button
                className="bg-indigo-500 hover:bg-indigo-600 rounded-xl px-8 py-3 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                disabled={loading}
            >
                {loading ? "Loading..." : "Simpan"}
            </button>
        </form>
    );
};

export default CreateMutationFromHq;
