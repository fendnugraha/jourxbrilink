"use client";
import { useState, useEffect, useRef } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";
import { set } from "date-fns";
import { DateTimeNow } from "@/libs/format";

const CreateCashWithdrawal = ({
    isModalOpen,
    filteredCashBankByWarehouse,
    setNotification,
    fetchJournalsByWarehouse,
    user,
    calculateFee,
    setPersonalSetting,
    feeAdminAuto,
    selectedBankAccount,
    setSelectedBankAccount,
}) => {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        debt_code: selectedBankAccount,
        cred_code: user.role.warehouse.chart_of_account_id,
        amount: "",
        trx_type: "Tarik Tunai",
        fee_amount: "",
        description: "",
        custName: "General",
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFee, setIsFee] = useState(false);

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
            setNotification({
                type: "success",
                message: "Penarikan uang ke " + successMessage,
            });
            setFormData({
                date_issued: today,
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
            setNotification({
                type: "error",
                message: error.response?.data?.message || "Something went wrong.",
            });
        } finally {
            setLoading(false);
            setIsFee(false);
        }
    };

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            fee_amount: isFee ? prev.amount : feeAdminAuto ? calculateFee(prev.amount) : prev.fee_amount,
            trx_type: isFee ? "Bank Fee" : "Tarik Tunai",
        }));
    }, [isFee, feeAdminAuto]);

    useEffect(() => {
        setIsFee(formData.amount && formData.amount === Number(formData.fee_amount));
    }, [formData.amount, formData.fee_amount]);

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
                <div className="mb-2 sm:mb-4">
                    <Label>Ke Rekening</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <select
                            onChange={(e) => {
                                setFormData({ ...formData, debt_code: e.target.value });
                                setSelectedBankAccount(e.target.value);
                            }}
                            value={formData.debt_code}
                            className="form-select"
                            required
                        >
                            <option value="">--Pilih Rekening--</option>
                            {filteredCashBankByWarehouse
                                .filter((cashBank) => Number(cashBank.account_id === 2))
                                .map((cashBank) => (
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
                            className="form-control"
                            type="number"
                            placeholder="Rp."
                            value={formData.amount}
                            onChange={(e) => {
                                const value = Number(e.target.value); // pastikan number
                                setFormData({
                                    ...formData,
                                    amount: value,
                                    fee_amount: feeAdminAuto && !isFee ? calculateFee(value) : formData.fee_amount,
                                });
                            }}
                            required
                        />

                        {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                        <div className="flex justify-between">
                            <div>
                                <input
                                    type="checkbox"
                                    id="isFee"
                                    className="mt-2 mr-2"
                                    checked={isFee}
                                    onChange={(e) => {
                                        setIsFee(e.target.checked);
                                    }}
                                />
                                <label htmlFor="isFee" className={`text-sm `}>
                                    Fee/Bunga Bank
                                </label>
                            </div>

                            {formData.amount && (
                                <h1 className="text-sm">
                                    Jml: <span className="font-bold">{formatNumber(formData.amount)}</span>, Adm:{" "}
                                    <span className="font-bold">{formatNumber(formData.fee_amount)}</span>
                                </h1>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mb-2 sm:mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
                    <div>
                        <Label className={"flex gap-2"}>
                            Fee (Admin){" "}
                            <button
                                onClick={() => setPersonalSetting((prev) => ({ ...prev, feeAdminAuto: !prev.feeAdminAuto }))}
                                type="button"
                                className={`w-8 h-4 rounded-full bg-slate-600 text-white flex items-center transition-all duration-300 ease-in-out ${
                                    !feeAdminAuto ? "justify-start" : "justify-end"
                                }`}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full transition-all duration-300 ease-in-out ${
                                        !feeAdminAuto ? "bg-slate-400" : "bg-green-500"
                                    }`}
                                >
                                    {feeAdminAuto ? "A" : "M"}
                                </div>
                            </button>
                        </Label>
                        <div className="">
                            <input
                                className={`form-control ${feeAdminAuto ? "!bg-green-200 text-green-700 font-bold" : ""}`}
                                type="number"
                                placeholder={feeAdminAuto ? "Rp. (Autofilled)" : "Rp."}
                                value={formData.fee_amount}
                                onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                                disabled={isFee}
                                required
                            />
                            {errors.fee_amount && <span className="text-red-500 text-xs">{errors.fee_amount}</span>}
                        </div>
                    </div>
                    {formData.amount && !feeAdminAuto && (
                        <div>
                            <h1
                                type="button"
                                onClick={(e) => setFormData({ ...formData, fee_amount: calculateFee(formData.amount) })}
                                className="text-xs dark:bg-yellow-500 cursor-pointer w-fit bg-yellow-300 hover:bg-yellow-200 rounded-lg px-2 py-0.5 mt-1"
                            >
                                {formatNumber(calculateFee(formData.amount))}
                            </h1>
                        </div>
                    )}
                    {/* <div>
                        <input
                            type="checkbox"
                            id="feeAdminAuto"
                            className="mt-2 mr-2"
                            checked={feeAdminAuto}
                            onChange={(e) => setPersonalSetting((prev) => ({ ...prev, feeAdminAuto: e.target.checked }))}
                        />
                        <label htmlFor="feeAdminAuto" className={`text-sm ${feeAdminAuto ? "text-green-600" : ""}`}>
                            Fee Admin Auto
                        </label>
                    </div> */}
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
                        Tutup
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
