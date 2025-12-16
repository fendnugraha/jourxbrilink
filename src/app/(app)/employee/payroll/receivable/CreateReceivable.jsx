"use client";
import Input from "@/components/Input";
import Label from "@/components/Label";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { DateTimeNow } from "@/libs/format";

const CreateReceivable = ({ isModalOpen, fetchFinance, notification }) => {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        contact_id: "",
        amount: "",
        description: "",
        debt_code: 8,
        cred_code: 1,
        type: "EmployeeReceivable",
    });
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);

    const fetchContacts = async (url = "/api/get-all-contacts/Employee") => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            setContacts(response.data.data);
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/finance", formData);
            notification({ type: "success", message: response.data.message });
            isModalOpen(true);
            fetchFinance();
            setFormData({
                date_issued: today,
                contact_id: "",
                amount: "",
                description: "",
                debt_code: 8,
                cred_code: 1,
                type: "EmployeeReceivable",
            });
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mb-2 items-center">
                    <Label htmlFor="date_issued">Tanggal</Label>
                    <div className="col-span-2">
                        <Input
                            type="datetime-local"
                            className="form-control"
                            value={formData.date_issued}
                            onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mb-2 items-center">
                    <Label htmlFor="contact">Contact</Label>
                    <div className="col-span-2">
                        <select
                            value={formData.contact_id}
                            onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                            className={`form-control ${errors.contact_id ? "border-red-500" : ""}`}
                        >
                            <option value="">--Pilih Contact--</option>
                            {contacts.map((contact) => (
                                <option key={contact.id} value={contact.id}>
                                    {contact.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mb-2 items-center">
                    <Label htmlFor="type">Jenis Pembayaran</Label>
                    <div className="col-span-2">
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className={`form-control ${errors.type ? "border-red-500" : ""}`}
                        >
                            <option value="EmployeeReceivable">Kasbon (Full Payment)</option>
                            <option value="InstallmentReceivable">Cicilan (Installment Payment)</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 items-center">
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mb-4 items-center">
                    <Label htmlFor="description">Catatan</Label>
                    <div className="col-span-2">
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="form-control"
                            placeholder="Catatan (Optional)"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-indigo-500 hover:bg-indigo-600 rounded-xl px-8 py-3 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Simpan"}
                </button>
            </form>
        </div>
    );
};

export default CreateReceivable;
