"use client";
import { useState, useEffect, use } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";
import SimplePagination from "@/components/SimplePagination";
import { set } from "date-fns";

const CreateMutationFromHqMultiple = ({ isModalOpen, cashBank, notification, fetchJournalsByWarehouse, warehouses }) => {
    const [formData, setFormData] = useState({
        cred_code: "",
        amount: "",
        confirmation: 0,
        description: "",
    });
    const [search, setSearch] = useState("");

    const [selectedWarehouseIds, setSelectedWarehouseIds] = useState([]);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const hqAccount = cashBank?.filter((cashBank) => Number(cashBank.warehouse_id) === 1 && Number(cashBank.account_id === 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-mutation-multiple", {
                ...formData,
                account_ids: selectedWarehouseIds.map((warehouse) => warehouse.chart_of_account_id),
            });
            notification({
                type: "success",
                message: response.data.message,
            });
            fetchJournalsByWarehouse();
            isModalOpen(true);
            setFormData({
                cred_code: formData.cred_code,
                amount: "",
                confirmation: 0,
                description: "",
            });
            setErrors([]);
        } catch (error) {
            notification({
                type: "error",
                message: error.response?.data?.message || "Something went wrong.",
            });
            setErrors(error.response?.data?.errors);
            console.log(error);
        } finally {
            setLoading(false);
            setSelectedWarehouseIds([]);
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const totalItems = warehouses?.filter((warehouse) => warehouse.id !== 1).length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = warehouses
        ?.filter((warehouse) => warehouse.id !== 1 && warehouse.name.toLowerCase().includes(search.toLowerCase()))
        .slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    return (
        <>
            <div className="flex gap-4">
                <form onSubmit={handleSubmit} className="flex-1">
                    <div className="mb-2">
                        <Label>Dari (Pusat)</Label>
                        <div className="">
                            <select
                                onChange={(e) => {
                                    setFormData({ ...formData, cred_code: e.target.value });
                                }}
                                value={formData.cred_code}
                                className="form-select"
                                required
                            >
                                <option value="">--Pilih sumber dana--</option>
                                {hqAccount?.map((br) => (
                                    <option key={br.id} value={br.id}>
                                        {br.acc_name}
                                    </option>
                                ))}
                            </select>
                            {errors?.cred_code && <span className="text-red-500 text-xs">{errors?.cred_code}</span>}
                        </div>
                    </div>
                    <div className="mb-2">
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
                    <div className="mb-2">
                        <Label>Keterangan</Label>
                        <div className="">
                            <textarea
                                className="form-control"
                                type="text"
                                placeholder="(Optional)"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            {errors?.description && <span className="text-red-500 text-xs">{errors?.description}</span>}
                            <input
                                type="checkbox"
                                id="confrmation"
                                className="mt-2 mr-2"
                                checked={formData.confirmation === 0}
                                onChange={(e) => setFormData({ ...formData, confirmation: e.target.checked ? 0 : 1 })}
                            />
                            <label htmlFor="confrmation" className={`text-sm ${formData.confirmation === 0 ? "text-green-600" : ""}`}>
                                Pakai Konfirmasi
                            </label>
                        </div>
                    </div>

                    <button
                        className="bg-indigo-500 hover:bg-indigo-600 rounded-xl px-8 py-3 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Simpan"}
                    </button>
                </form>
                <div className="w-fit">
                    <input
                        type="search"
                        placeholder="Search"
                        className="w-full outline outline-slate-500 p-0.5 rounded-sm"
                        value={search || ""}
                        onChange={(e) => setSearch(e.target.value)}
                        autoComplete="off"
                    />
                    <button
                        type="button"
                        className="text-xs hover:underline hover:text-white text-slate-400 block mt-2"
                        onClick={() => {
                            if (selectedWarehouseIds.length === warehouses.length) {
                                setSelectedWarehouseIds([]);
                            } else {
                                setSelectedWarehouseIds([...warehouses]);
                            }
                        }}
                        title="Pilih Semua"
                    >
                        {selectedWarehouseIds.length === warehouses.length ? "Deselect All" : "Select All"}
                    </button>
                    {currentItems.map((contact) => (
                        <div key={contact.id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={contact.id}
                                className="size-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                name="contact"
                                value={contact.id}
                                checked={selectedWarehouseIds.some((c) => c.id === contact.id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedWarehouseIds([...selectedWarehouseIds, contact]);
                                    } else {
                                        setSelectedWarehouseIds(selectedWarehouseIds.filter((c) => c.id !== contact.id));
                                    }
                                }}
                            />
                            <label htmlFor={contact.id} className="text-sm text-nowrap">
                                {contact.name}
                            </label>
                        </div>
                    ))}
                    {totalPages > 1 && (
                        <div className="flex justify-end mt-2">
                            <SimplePagination totalItems={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={handlePageChange} />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex gap-1 text-xs mt-3 flex-wrap p-1.5 border border-slate-100 dark:border-slate-600 rounded-xl">
                {selectedWarehouseIds.length > 0 ? (
                    selectedWarehouseIds.map((warehouse) => (
                        <div key={warehouse.id} className="bg-slate-500 text-white rounded-full px-2">
                            {warehouse.name}
                        </div>
                    ))
                ) : (
                    <span className="text-slate-400 text-center w-full">No warehouses selected</span>
                )}
                <span>{selectedWarehouseIds.length > 0 ? `(${selectedWarehouseIds.length})` : ""}</span>
            </div>
        </>
    );
};

export default CreateMutationFromHqMultiple;
