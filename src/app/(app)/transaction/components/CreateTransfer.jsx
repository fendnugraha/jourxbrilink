"use client";
import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";
import { DateTimeNow } from "@/libs/format";

const CreateTransfer = ({
    isModalOpen,
    filteredCashBankByWarehouse,
    notification,
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
        debt_code: user.role.warehouse.chart_of_account_id,
        cred_code: selectedBankAccount,
        amount: "",
        fee_amount: "",
        trx_type: "Transfer Uang",
        description: "",
        custName: "",
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-transfer", formData);
            const successMessage =
                response.data.journal.cred.acc_name +
                " sebesar " +
                formatNumber(response.data.journal.amount) +
                " (Adm: " +
                formatNumber(response.data.journal.fee_amount) +
                ")";
            notification({
                type: "success",
                message: "Transfer uang ke " + successMessage,
            });
            setFormData({
                date_issued: today,
                debt_code: user.role.warehouse.chart_of_account_id,
                cred_code: formData.cred_code,
                amount: "",
                trx_type: "Transfer Uang",
                fee_amount: "",
                description: "",
                custName: "",
            });
            fetchJournalsByWarehouse();
            // isModalOpen(false);
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
                <div className="mb-2 sm:mb-4">
                    <Label>Dari Rekening</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <select
                            onChange={(e) => {
                                setFormData({ ...formData, cred_code: e.target.value });
                                setSelectedBankAccount(e.target.value);
                            }}
                            value={formData.cred_code}
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
                        {errors.cred_code && <span className="text-red-500 text-xs">{errors.cred_code}</span>}
                    </div>
                </div>
                <div className="mb-2 sm:mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                    <div className=" col-span-1 sm:col-span-2">
                        <Label>Jumlah transfer</Label>
                        <div>
                            <input
                                className="form-control"
                                type="number"
                                placeholder="Rp."
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        amount: e.target.value,
                                        fee_amount: feeAdminAuto ? calculateFee(e.target.value) : formData.fee_amount,
                                    })
                                }
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
                    <div className="">
                        <Label>
                            Fee (Admin) <span className="text-green-500 font-bold">{feeAdminAuto ? "(Auto)" : ""}</span>
                        </Label>
                        <div className="">
                            <input
                                className={`form-control ${feeAdminAuto ? "!bg-green-200 !text-green-700 font-bold" : ""}`}
                                type="number"
                                placeholder={feeAdminAuto ? "Rp. (Autofilled)" : "Rp."}
                                value={formData.fee_amount}
                                onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                                required
                            />
                            {errors.fee_amount && <span className="text-red-500 text-xs">{errors.fee_amount}</span>}
                            {formData.amount && (
                                <span
                                    onClick={(e) => setFormData({ ...formData, fee_amount: calculateFee(formData.amount) })}
                                    className=" text-xs cursor-pointer bg-yellow-300 dark:bg-yellow-500 hover:bg-yellow-200 rounded-lg px-2 py-0.5 mt-1"
                                >
                                    {formatNumber(calculateFee(formData.amount))}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mb-2 sm:mb-4">
                    <Label>Nama Rek. Customer</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <input
                            className={"form-control"}
                            type="text"
                            placeholder="Atasnama"
                            value={formData.custName}
                            onChange={(e) => setFormData({ ...formData, custName: e.target.value })}
                            required
                        />
                        {errors.custName && <span className="text-red-500 text-xs">{errors.custName}</span>}
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

export default CreateTransfer;
