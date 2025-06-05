"use client";
import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";

const CreateMutationToHq = ({ isModalOpen, cashBank, notification, fetchJournalsByWarehouse, user, accountBalance, openingCash }) => {
    const [formData, setFormData] = useState({
        debt_code: "",
        cred_code: "",
        amount: "",
        fee_amount: 0,
        trx_type: "Mutasi Kas",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [balanceDifference, setBalanceDifference] = useState(0);

    const hqAccount = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === 1);
    const branchAccount = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === Number(user.role?.warehouse_id));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-mutation", formData);
            notification("success", "Pengembalian saldo berhasil");
            setFormData({
                debt_code: "",
                cred_code: "",
                amount: "",
                fee_amount: 0,
                trx_type: "Mutasi Kas",
                description: "",
            });
            fetchJournalsByWarehouse();
            setErrors([]);
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
            setErrors(error.response?.data?.errors);
        } finally {
            setLoading(false);
        }
    };

    const initBalances = JSON.parse(localStorage.getItem("initBalances")) ?? {};
    const selectedBranchAccount = accountBalance.data?.find((account) => Number(account.account_id) === Number(formData.cred_code));

    const cashAccountBalance = accountBalance?.data?.find((account) => Number(account.account_id) === Number(user?.role?.warehouse?.chart_of_account_id));
    const calculateDepositCash = cashAccountBalance?.balance - openingCash;

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Dari (Cabang)</Label>
                <div className="col-span-1 sm:col-span-2">
                    <select
                        onChange={(e) => {
                            const selectedCredCode = Number(e.target.value);

                            const selectedAccount = accountBalance?.data?.find((acc) => Number(acc.account_id) === selectedCredCode);
                            const initBalance = initBalances[selectedCredCode] ?? 0;
                            const balanceDifference = (selectedAccount?.balance ?? 0) - initBalance;
                            setFormData({
                                ...formData,
                                cred_code: Number(e.target.value),
                                amount:
                                    Number(e.target.value) === Number(user?.role?.warehouse?.chart_of_account_id)
                                        ? Number(calculateDepositCash)
                                        : balanceDifference > 0
                                        ? balanceDifference
                                        : 0,
                                debt_code: Number(e.target.value) === Number(user?.role?.warehouse?.chart_of_account_id) ? 2 : "",
                            });
                        }}
                        value={formData.cred_code}
                        className="w-full rounded-md border p-2 text-xs sm:text-sm shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        required
                    >
                        <option value="">--Pilih sumber dana--</option>
                        {branchAccount.map((br) => (
                            <option key={br.id} value={br.id}>
                                {br.acc_name}
                            </option>
                        ))}
                    </select>
                    {errors.cred_code && <span className="text-red-500 text-xs">{errors.cred_code}</span>}
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
                        className="w-full rounded-md border p-2 text-xs sm:text-sm shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        required
                    >
                        <option value="">--Pilih tujuan mutasi--</option>
                        {hqAccount.map((hq) => (
                            <option key={hq.id} value={hq.id}>
                                {hq.acc_name}
                            </option>
                        ))}
                    </select>
                    {errors.debt_code && <span className="text-red-500 text-xs">{errors.debt_code}</span>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Jumlah transfer</Label>
                <div className="col-span-1">
                    <Input
                        type="number"
                        className={"w-full text-xs sm:text-sm"}
                        placeholder="Rp."
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />
                    {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
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
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Keterangan</Label>
                <div className="col-span-1 sm:col-span-2">
                    <textarea
                        className="w-full rounded-md border p-2 text-xs sm:text-sm shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
    );
};

export default CreateMutationToHq;
