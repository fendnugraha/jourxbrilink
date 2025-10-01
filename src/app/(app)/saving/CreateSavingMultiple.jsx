"use client";
import Input from "@/components/Input";
import Label from "@/components/Label";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { DateTimeNow } from "@/libs/format";
import SimplePagination from "@/components/SimplePagination";

const CreateSavingMultiple = ({ isModalOpen, fetchFinance, notification }) => {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        amount: "",
        debt_code: "",
        type: "Saving",
    });
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [accounts, setAccounts] = useState([]);
    const [errors, setErrors] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);

    const fetchContacts = async (url = "/api/get-all-contacts/Employee") => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            setContacts(response.data.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchAccounts = async ({ account_ids }) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-account-by-account-id`, { params: { account_ids } });
            setAccounts(response.data.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts({ account_ids: [1, 2] });
    }, []);

    const filterCashAccounts = accounts.filter((account) => account.warehouse_id === 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/store-saving-multiple", {
                ...formData,
                contact_ids: selectedContacts.map((contact) => contact.id),
            });
            notification({ type: "success", message: response.data.message });
            isModalOpen(false);
            fetchFinance();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const totalItems = contacts?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = contacts?.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <form onSubmit={handleSubmit} className="sm:col-span-2">
                <div className="mb-3">
                    <Label htmlFor="date_issued">Tanggal</Label>
                    <div className="">
                        <Input
                            type="datetime-local"
                            className="form-control text-sm !py-1.5"
                            value={formData.date_issued}
                            onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <Label htmlFor="debt_code">Rekening</Label>
                    <div className="col-span-2">
                        <select value={formData.debt_code} onChange={(e) => setFormData({ ...formData, debt_code: e.target.value })} className="form-select">
                            <option value="">--Pilih Rekening--</option>
                            {filterCashAccounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.acc_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mb-3">
                    <Label htmlFor="amount">Jumlah</Label>
                    <div className="col-span-1">
                        <Input
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            min="0"
                            type="number"
                            className="form-control"
                            placeholder="Rp"
                        />
                    </div>
                    <h1 className="font-bold text-end">{formatNumber(formData.amount)}</h1>
                </div>
                <div className="flex gap-1 text-xs mb-3 flex-wrap p-1.5 border border-slate-100 dark:border-slate-600 rounded-xl">
                    {selectedContacts.length > 0 ? (
                        selectedContacts.map((contact) => (
                            <div key={contact.id} className="bg-slate-500 text-white rounded-full px-2">
                                {contact.name}
                            </div>
                        ))
                    ) : (
                        <span className="text-slate-400 text-center w-full">No contacts selected</span>
                    )}
                    <span>{selectedContacts.length > 0 ? `(${selectedContacts.length})` : ""}</span>
                </div>
                <button
                    type="submit"
                    className="bg-indigo-500 hover:bg-indigo-600 rounded-xl px-8 py-3 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Simpan"}
                </button>
            </form>
            <div>
                <input type="search" placeholder="Search" className="" onChange={(e) => setSearch(e.target.value)} />
                <button
                    type="button"
                    className="text-xs hover:underline hover:text-white text-slate-400"
                    onClick={() => {
                        if (selectedContacts.length === contacts.length) {
                            setSelectedContacts([]);
                        } else {
                            setSelectedContacts([...contacts]);
                        }
                    }}
                    title="Pilih Semua"
                >
                    {selectedContacts.length === contacts.length ? "Deselect All" : "Select All"}
                </button>
                {currentItems.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={contact.id}
                            className="size-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            name="contact"
                            value={contact.id}
                            checked={selectedContacts.some((c) => c.id === contact.id)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedContacts([...selectedContacts, contact]);
                                } else {
                                    setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
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
    );
};

export default CreateSavingMultiple;
