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
            notification(response.data.message);
            fetchJournalsByWarehouse();
            setFormData({
                price: "",
                cost: "",
                description: "",
            });
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };
    return (
        <form>
            <div className="mb-2 grid grid-cols-3 gap-4 items-center">
                <Label>Harga jual</Label>
                <div className="col-span-2">
                    <Input type="number" placeholder="Rp." value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                    {errors.price && <span className="text-red-500 text-xs">{errors.price}</span>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-3 gap-4 items-center">
                <Label>Harga modal</Label>
                <div className="col-span-2">
                    <Input type="number" placeholder="Rp." value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} />
                    {errors.cost && <span className="text-red-500 text-xs">{errors.cost}</span>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-3 gap-4 items-center">
                <Label>Keterangan</Label>
                <div className="col-span-2">
                    <textarea
                        className="w-full rounded-md border p-2 shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        type="text"
                        placeholder="(Optional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
                </div>
            </div>
            <button
                onClick={handleSubmit}
                className="bg-indigo-500 hover:bg-indigo-600 rounded-xl px-8 py-3 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                disabled={loading}
            >
                {loading ? "Loading..." : "Simpan"}
            </button>
        </form>
    );
};

export default CreateDeposit;
