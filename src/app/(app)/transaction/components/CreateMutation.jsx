"use client";
import { useState } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import formatNumber from "@/libs/formatNumber";
import { DateTimeNow } from "@/libs/format";

const CreateMutation = ({ isModalOpen, cashBank, notification, fetchJournalsByWarehouse, user, accountBalance }) => {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        debt_code: "",
        cred_code: "",
        is_confirmed: true,
        amount: "",
        fee_amount: 0,
        trx_type: "Mutasi Kas",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const branchAccount = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === Number(user.role?.warehouse_id));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-mutation", formData);
            const successMessage =
                response.data.journal.cred.acc_name + " ke " + response.data.journal.debt.acc_name + " Rp " + formatNumber(response.data.journal.amount);
            notification({
                type: "success",
                message: response.data.message + " " + successMessage,
            });
            setFormData({
                date_issued: today,
                debt_code: "",
                cred_code: "",
                is_confirmed: true,
                amount: "",
                fee_amount: 0,
                trx_type: "Mutasi Kas",
                description: "",
            });
            fetchJournalsByWarehouse();
        } catch (error) {
            setErrors(error.response?.data?.errors);
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
            console.log(error);
        } finally {
            setLoading(false);
            setErrors([]);
        }
    };

    const initBalances = JSON.parse(localStorage.getItem("initBalances")) ?? {};
    const selectedBranchAccount = accountBalance?.data?.chartOfAccounts?.find((account) => Number(account.id) === Number(formData.cred_code));

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Tanggal</Label>
                <div className="col-span-1 sm:col-span-2">
                    <input
                        type="datetime-local"
                        value={formData.date_issued}
                        className="form-control"
                        required
                        onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                    />
                    {errors?.date_issued && <span className="text-red-500 text-xs">{errors?.date_issued}</span>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Dari (Cabang)</Label>
                <div className="col-span-1 sm:col-span-2">
                    <select
                        onChange={(e) => {
                            const selectedCredCode = Number(e.target.value);

                            const selectedAccount = accountBalance?.data?.chartOfAccounts?.find((acc) => Number(acc.id) === selectedCredCode);
                            const initBalance = initBalances[selectedCredCode] ?? 0;
                            const balanceDifference = (selectedAccount?.balance ?? 0) - initBalance;
                            setFormData({
                                ...formData,
                                cred_code: Number(e.target.value),
                            });
                        }}
                        value={formData.cred_code}
                        className="form-select"
                        required
                    >
                        <option value="">--Pilih sumber dana--</option>
                        {branchAccount.map((br) => (
                            <option key={br.id} value={br.id}>
                                {br.acc_name}
                            </option>
                        ))}
                    </select>
                    {errors?.cred_code && <span className="text-red-500 text-xs">{errors?.cred_code}</span>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Ke (Pusat)</Label>
                <div className="col-span-1 sm:col-span-2">
                    <select
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                debt_code: e.target.value,
                            })
                        }
                        value={formData.debt_code}
                        className="form-select"
                        disabled={!formData.cred_code}
                        required
                    >
                        <option value="">--Pilih tujuan mutasi--</option>
                        {branchAccount
                            .filter((acc) => acc.id !== formData.cred_code)
                            .map((hq) => (
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
                        type="number"
                        className={"form-control"}
                        placeholder="Rp."
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />
                    {errors?.amount && <span className="text-red-500 text-xs">{errors?.amount}</span>}
                </div>
                <h1 className="text-sm sm:text-lg font-bold">{formatNumber(formData.amount)}</h1>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label></Label>
                <div className="col-span-1 sm:col-span-2">
                    <h1 className="text-sm sm:text-sm font-bold">
                        {formData.cred_code && (
                            <>
                                {formatNumber(selectedBranchAccount?.balance)} - {formatNumber(formData.amount)} ={" "}
                                {formatNumber((selectedBranchAccount?.balance || 0) - (formData.amount || 0))}
                            </>
                        )}
                    </h1>
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
                    {errors?.description && <span className="text-red-500 text-xs">{errors?.description}</span>}
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
    );
};

export default CreateMutation;
