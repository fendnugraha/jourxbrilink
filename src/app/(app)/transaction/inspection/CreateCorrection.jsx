import axios from "@/libs/axios";
import { useState } from "react";
import Label from "@/components/Label";
import { DateTimeNow } from "@/libs/format";

const CreateCorrection = ({ isModalOpen, notification, fetchJournalsByWarehouse, fetchCorrection, warehouse }) => {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        journal_id: "",
        amount: "",
        warehouse_id: warehouse,
        description: "",
        image_url: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/correction", formData);
            notification({ type: "success", message: response.data.message });
            fetchJournalsByWarehouse();
            fetchCorrection();
            setFormData({
                date_issued: today,
                journal_id: "",
                amount: "",
                warehouse_id: warehouse,
                description: "",
                image_url: "",
            });
            setErrors([]);
            isModalOpen(false);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-2 sm:mb-4 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Tanggal</Label>
                <div className="col-span-1 sm:col-span-2">
                    <input
                        type="datetime-local"
                        className={"form-control"}
                        placeholder="Rp."
                        value={formData.date_issued}
                        onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                        required
                    />
                    {errors.date_issued && <span className="text-red-500 text-xs">{errors.date_issued}</span>}
                </div>
            </div>
            <div className="mb-2 sm:mb-4 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Journal ID</Label>
                <div className="">
                    <input
                        type="text"
                        className={"form-control"}
                        placeholder="ID"
                        value={formData.journal_id}
                        onChange={(e) => setFormData({ ...formData, journal_id: e.target.value })}
                    />
                    {errors.journal_id && <span className="text-red-500 text-xs">{errors.journal_id}</span>}
                </div>
            </div>
            <div className="mb-2 sm:mb-4 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Jumlah</Label>
                <div className="col-span-1 sm:col-span-2">
                    <input
                        type="number"
                        className={"form-control"}
                        placeholder="Rp."
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />
                    {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                </div>
            </div>
            <div className="mb-4 sm:mb-4 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
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
            <div className="mb-4 sm:mb-4 grid grid-cols-1">
                <Label>Image URL</Label>
                <div className="col-span-1 sm:col-span-2">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="(Optional)"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                    {errors.image_url && <span className="text-red-500 text-xs">{errors.image_url}</span>}
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

export default CreateCorrection;
