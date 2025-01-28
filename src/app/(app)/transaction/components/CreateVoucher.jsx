import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";

const CreateVoucher = ({ isModalOpen, notification, fetchJournalsByWarehouse, user }) => {
    const [formData, setFormData] = useState({
        product_id: "",
        qty: 1,
        price: 0,
        description: "",
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get("/api/get-all-products");
            setProducts(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const incrementQty = (e) => {
        e.preventDefault();
        setFormData({ ...formData, qty: formData.qty + 1 });
    };

    const decrementQty = (e) => {
        e.preventDefault();
        if (formData.qty > 1) {
            setFormData({ ...formData, qty: formData.qty - 1 });
        }
    };

    const selectedProduct = () => {
        const product = products.find((product) => product.id === Number(formData.product_id));
        return product;
    };

    useEffect(() => {
        if (selectedProduct()) {
            setFormData({ ...formData, price: selectedProduct().price });
        }
    }, [formData.product_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-voucher", formData);
            notification(response.data.message);
            fetchJournalsByWarehouse();
            setFormData({
                product_id: "",
                qty: 1,
                price: 0,
                description: "",
            });
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form>
            <div className="mb-2 grid grid-cols-3 gap-4 items-center">
                <Label>Product</Label>
                <div className="col-span-2">
                    <select
                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                        value={formData.product_id}
                        className="w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value="">--Pilih barang--</option>
                        {products?.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name} {" -> "} Rp. {formatNumber(product.price)}
                            </option>
                        ))}
                    </select>
                    {errors.product_id && <span className="text-red-500 text-xs">{errors.product_id}</span>}
                </div>
            </div>
            <div className="my-3 grid grid-cols-3 gap-4 items-center">
                <Label>Qty</Label>
                <div className="col-span-2 flex items-center gap-2">
                    <button
                        className="hover:text-red-600 disabled:text-slate-400 disabled:cursor-not-allowed"
                        onClick={decrementQty}
                        disabled={formData.qty === 1}
                    >
                        <MinusCircleIcon className="w-6 h-6" />
                    </button>
                    <span className="text-md mx-2">{formData.qty}</span>
                    <button className="hover:text-red-600" onClick={incrementQty}>
                        <PlusCircleIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
            <div className="mb-2 grid grid-cols-3 gap-4 items-center">
                <Label>Harga</Label>
                <div className="col-span-1">
                    <Input
                        className={"w-full"}
                        type="number"
                        placeholder="Rp."
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    {errors.price && <span className="text-red-500 text-xs">{errors.price}</span>}
                </div>
                <span className="text-lg font-bold">Rp. {formatNumber(formData.qty * formData.price)}</span>
            </div>
            <div className="mb-2 grid grid-cols-3 gap-4 items-center">
                <Label>Keterangan</Label>
                <div className="col-span-2">
                    <textarea
                        className="w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        type="text"
                        placeholder="(Optional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
                </div>
            </div>
            <button onClick={handleSubmit} className="bg-indigo-500 hover:bg-indigo-600 rounded-xl px-8 py-3 text-white" disabled={loading}>
                {loading ? "Loading..." : "Simpan"}
            </button>
        </form>
    );
};

export default CreateVoucher;
