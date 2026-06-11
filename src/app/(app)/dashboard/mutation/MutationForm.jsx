"use client";
import { ArrowUpDown, Calendar, Hourglass, Search, SearchIcon, WalletMinimal, X } from "lucide-react";
import { DateTimeNow, formatNumber } from "@/libs/format";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
const MutationForm = ({ setNotification, warehouses, accounts, fetchJournalsByWarehouse, accountBalance, mutateCashBankBalance }) => {
    const [switchTab, setSwitchTab] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [isConfirmAuto, setIsConfirmAuto] = useState(false);
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        debt_code: "",
        cred_code: "",
        amount: "",
        fee_amount: 0,
        is_confirmed: true,
        confirmation: 0,
        trx_type: "Mutasi Kas",
        description: "",
        admin_fee: "" || 0,
        warehouse_id: 1,
    });

    const filteredWarehouses = warehouses?.data?.filter((warehouse) => warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const selectedWarehouseId = selectedWarehouse?.id;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-mutation", formData);
            const successMessage = `
            ${response.data.journal.cred.account_group} ke ${response.data.journal.debt.account_group} ${response.data.journal.debt.warehouse?.name}
            sebesar ${formatNumber(response.data.journal.amount)}
            `;
            console.log(response.data);
            setNotification({
                type: "success",
                message: response.data.message + " " + successMessage,
            });
            mutateCashBankBalance();
            fetchJournalsByWarehouse();
            setFormData({
                date_issued: today,
                debt_code: "",
                cred_code: formData.cred_code,
                amount: "",
                fee_amount: 0,
                is_confirmed: true,
                confirmation: 0,
                trx_type: "Mutasi Kas",
                description: "",
                admin_fee: "" || 0,
                warehouse_id: 1,
            });
            setErrors([]);
            setSwitchTab(false);
        } catch (error) {
            setNotification({
                type: "error",
                message: error.response?.data?.message || "Something went wrong.",
            });
            setErrors(error.response?.data?.errors);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        selectedWarehouse && setSelectedWarehouse(null);
        setFormData({
            date_issued: today,
            debt_code: "",
            cred_code: "",
            amount: "",
            fee_amount: 0,
            is_confirmed: true,
            confirmation: 0,
            trx_type: "Mutasi Kas",
            description: "",
            admin_fee: "" || 0,
            warehouse_id: 1,
        });
        setErrors([]);
    };

    useEffect(() => {
        if (switchTab) return;
        if (!formData.cred_code || !accounts?.data?.length || selectedWarehouseId === 1) return;

        // Ambil account_group berdasarkan cred_code
        const selectedCred = accounts?.data?.find((acc) => Number(acc.id) === Number(formData.cred_code));

        if (!selectedCred) return;

        // Cari akun lain dengan group yang sama (misalnya di cabang HQ)
        const matchingDebt = accounts?.data?.find(
            (acc) => acc.account_group === selectedCred.account_group && Number(acc.warehouse_id) === Number(selectedWarehouseId),
        );

        // Update debt_code hanya kalau ditemukan
        if (matchingDebt) {
            setFormData((prev) => ({
                ...prev,
                debt_code: matchingDebt.id,
            }));
        }
    }, [formData.cred_code, accounts?.data, selectedWarehouseId, switchTab]);

    const findAccount = accountBalance?.data?.chartOfAccounts?.find((acc) => acc.warehouse_id === 1 && acc.id === Number(formData.cred_code));
    useEffect(() => {
        if (switchTab) {
            setFormData({
                ...formData,
                warehouse_id: selectedWarehouseId,
            });
        } else {
            setFormData({
                ...formData,
                warehouse_id: 1,
            });
        }
    }, [switchTab]);

    useEffect(() => {
        if (isConfirmAuto) {
            setFormData({
                ...formData,
                confirmation: 1,
            });
        } else {
            setFormData({
                ...formData,
                confirmation: 0,
            });
        }
    }, [isConfirmAuto]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 bg-white dark:bg-slate-600 rounded-2xl p-4 drop-shadow">
                    <label className="text-xs">Cabang</label>
                    <div className="flex items-center gap-2 w-full bg-slate-300 dark:bg-slate-700 rounded-full p-2">
                        <SearchIcon size={20} className="text-slate-600 dark:text-slate-100" />
                        <input
                            type="search"
                            className="w-full outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                            placeholder="Cari Cabang"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            // disabled={selectedWarehouse}
                        />
                    </div>
                    <div className="flex flex-col gap-2 max-h-fit bg-amber-100 dark:bg-slate-700 rounded-2xl p-2" hidden={!searchTerm && !selectedWarehouse}>
                        {selectedWarehouse && (
                            <div className="flex items-center gap-2 justify-between bg-amber-300 dark:bg-slate-800 rounded-xl p-2">
                                <button className="text-start text-xs">{selectedWarehouse.name}</button>
                                <button
                                    className="bg-red-500 rounded-full w-5 h-5 flex justify-center items-center text-start text-xs"
                                    onClick={() => {
                                        setSelectedWarehouse(null);
                                        setSearchTerm("");
                                        setFormData({ ...formData, cred_code: "", debt_code: "" });
                                    }}
                                >
                                    <X size={14} className="text-slate-100" />
                                </button>
                            </div>
                        )}
                        {searchTerm &&
                            filteredWarehouses?.map((warehouse) => (
                                <button
                                    key={warehouse.id}
                                    className="hover:bg-amber-300 dark:hover:bg-slate-800 rounded-lg p-2 text-start text-xs"
                                    onClick={() => {
                                        setSelectedWarehouse(warehouse);
                                        setSearchTerm("");
                                        setFormData({ ...formData, date_issued: today });
                                    }}
                                >
                                    {warehouse.name}
                                </button>
                            ))}
                    </div>
                </div>
                <div className="flex flex-col gap-2 ">
                    <div className={`flex flex-col gap-2 bg-white dark:bg-slate-600 rounded-2xl p-4`}>
                        <label className="text-xs">Sumber Dana</label>
                        <select
                            className="bg-yellow-200 dark:bg-slate-700 rounded-2xl p-2 disabled:cursor-not-allowed disabled:text-slate-400 text-sm appearance-none"
                            value={formData.cred_code}
                            onChange={(e) => setFormData({ ...formData, cred_code: e.target.value })}
                            disabled={!selectedWarehouse}
                        >
                            <option value="">Pilih Sumber Dana</option>
                            {accounts?.data
                                ?.filter((account) => (!switchTab ? account.warehouse_id === 1 : account.warehouse_id === selectedWarehouseId))
                                .map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.acc_name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="relative">
                        <div className={`flex flex-col gap-2 bg-white dark:bg-slate-600 rounded-2xl p-4`}>
                            <label className="text-xs">Tujuan</label>
                            <select
                                className="bg-yellow-200 dark:bg-slate-700 rounded-2xl p-2 disabled:cursor-not-allowed disabled:text-slate-400 text-sm appearance-none"
                                value={formData.debt_code}
                                onChange={(e) => setFormData({ ...formData, debt_code: e.target.value, date_issued: today })}
                                disabled={formData.cred_code === ""}
                            >
                                <option value="">Pilih Tujuan</option>
                                {accounts?.data
                                    ?.filter((account) => (!switchTab ? account.warehouse_id === selectedWarehouseId : account.warehouse_id === 1))
                                    .map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.acc_name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="absolute -top-5 w-full flex items-center justify-start -left-4 drop-shadow-2xl">
                            <button
                                className="bg-slate-900 rounded-full outline-slate-600 outline-4 p-2 disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"
                                onClick={() => {
                                    setSwitchTab(!switchTab);
                                    setFormData({
                                        ...formData,
                                        debt_code: formData.cred_code,
                                        cred_code: formData.debt_code,
                                        date_issued: today,
                                    });
                                }}
                                disabled={formData.cred_code == "" && formData.debt_code == ""}
                            >
                                <ArrowUpDown size={14} className={`text-slate-100 ${switchTab ? "rotate-180" : ""} transform duration-300`} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="relative flex flex-col gap-2 bg-white dark:bg-slate-600 rounded-2xl p-4">
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 w-full bg-yellow-200 dark:bg-slate-700 rounded-full p-2">
                            <WalletMinimal size={20} className="text-slate-500 dark:text-slate-300" />
                            <input
                                type="number"
                                className="w-full outline-none text-sm "
                                placeholder="Jumlah"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                disabled={formData.cred_code == "" && formData.debt_code == ""}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-yellow-200 dark:bg-slate-700 rounded-full p-2">
                            <WalletMinimal size={20} className="text-slate-500 dark:text-slate-300" />
                            <input
                                type="number"
                                className="w-full outline-none text-sm"
                                placeholder="Admin Bank"
                                value={formData.admin_fee}
                                onChange={(e) => setFormData({ ...formData, admin_fee: e.target.value })}
                                disabled={formData.cred_code == "" && formData.debt_code == ""}
                            />
                        </div>
                    </div>
                    <label className="text-xs">Tanggal</label>
                    <div className="flex items-center gap-2 w-full bg-yellow-200 dark:bg-slate-700 rounded-full p-2">
                        <Calendar size={20} className="text-slate-500 dark:text-slate-300" />
                        <input
                            type="datetime-local"
                            className="w-full outline-none text-sm"
                            placeholder="Tanggal"
                            value={formData.date_issued}
                            onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                        />
                    </div>
                    <span className="text-xs text-right">Saldo: {formData.cred_code && formatNumber(findAccount?.balance || 0)}</span>
                    <h1 className="text-3xl font-semibold text-right">
                        <sup className="text-sm">Rp</sup> {formatNumber(formData.amount)}
                        <span className="text-sm" hidden={formData.admin_fee == 0}>
                            /{formatNumber(formData.admin_fee)}
                        </span>
                        <span className="text-xs block">{formatNumber(findAccount?.balance - formData.amount - formData.admin_fee || 0)}</span>
                    </h1>
                    <button
                        type="button"
                        className={`bottom-2 left-2 absolute text-[10px] border border-slate-800 py-1 px-2 rounded-2xl ${isConfirmAuto ? "bg-green-500 text-slate-100" : "text-slate-500 dark:text-shadow-slate-300"}`}
                        onClick={() => setIsConfirmAuto(!isConfirmAuto)}
                    >
                        Auto Confirm
                    </button>
                </div>
                <div className="flex gap-4">
                    <button
                        type="button"
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 py-4 rounded-2xl"
                        onClick={handleCancel}
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="w-full bg-blue-800 hover:bg-blue-700 text-slate-100 py-4 rounded-2xl disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={loading || formData.cred_code == "" || formData.debt_code == ""}
                    >
                        {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default MutationForm;
