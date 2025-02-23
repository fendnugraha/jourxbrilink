import axios from "@/libs/axios";
import { useState } from "react";
import Label from "@/components/Label";
import Input from "@/components/Input";

const CreateDeposit = ({ isModalOpen, notification, fetchJournalsByWarehouse }) => {
    const [formData, setFormData] = useState({
        price: "",
        cost: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-deposit", formData);
            notification("success", response.data.message);
            fetchJournalsByWarehouse();
            setFormData({
                price: "",
                cost: "",
                description: "",
            });
            setErrors([]);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Harga jual</Label>
                <div className="col-span-1 sm:col-span-2">
                    <Input
                        type="number"
                        className={"w-full sm:w-1/2 text-sm"}
                        placeholder="Rp."
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    {errors.price && <span className="text-red-500 text-xs">{errors.price}</span>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Harga modal</Label>
                <div className="col-span-1 sm:col-span-2">
                    <Input
                        type="number"
                        className={"w-full sm:w-1/2 text-sm"}
                        placeholder="Rp."
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    />
                    {errors.cost && <span className="text-red-500 text-xs">{errors.cost}</span>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Keterangan</Label>
                <div className="col-span-1 sm:col-span-2">
                    <textarea
                        className="w-full rounded-md border text-sm p-2 shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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

export default CreateDeposit;
