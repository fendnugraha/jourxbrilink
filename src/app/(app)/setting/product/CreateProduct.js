"use client";
import Input from "@/components/Input";
import { useState } from "react";
import axios from "@/libs/axios";
import Button from "@/components/Button";

const CreateProduct = ({ isModalOpen, notification, fetchProducts, productCategories }) => {
    const [errors, setErrors] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: "",
        category: "",
        price: 0,
        cost: 0,
    });

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/products", newProduct);
            notification("success", response.data.message);
            if (response.status === 201) {
                // Reset form fields and close modal on success
                setNewProduct({
                    name: "",
                    category: "",
                    price: 0,
                    cost: 0,
                });
            }
            isModalOpen(false);
            // console.log('Form reset:', newAccount, response.status)
            fetchProducts();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message);
        }
    };
    return (
        <form>
            <div className="mb-4">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Product Name
                </label>
                <input
                    type="text"
                    id="name"
                    value={newProduct.name}
                    onChange={(e) =>
                        setNewProduct({
                            ...newProduct,
                            name: e.target.value,
                        })
                    }
                    className={`form-control ${errors.name ? "border-red-500" : ""}`}
                    placeholder="Enter product name"
                    autoComplete="off"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">
                    Category
                </label>
                <select
                    className={`form-select ${errors.category ? "border-red-500" : ""}`}
                    value={newProduct.category}
                    onChange={(e) =>
                        setNewProduct({
                            ...newProduct,
                            category: e.target.value,
                        })
                    }
                >
                    <option value="">Select category</option>
                    {productCategories.map((category) => (
                        <option key={category.id} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
            </div>
            <div className="flex gap-4 mb-4">
                <div>
                    <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900">
                        Price
                    </label>
                    <input
                        type="number"
                        id="price"
                        value={newProduct.price}
                        onChange={(e) =>
                            setNewProduct({
                                ...newProduct,
                                price: e.target.value,
                            })
                        }
                        className={`form-control ${errors.price ? "border-red-500" : ""}`}
                        placeholder="Enter product price"
                    />
                    {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
                </div>
                <div>
                    <label htmlFor="cost" className="block mb-2 text-sm font-medium text-gray-900">
                        Cost
                    </label>
                    <input
                        type="number"
                        id="cost"
                        value={newProduct.cost}
                        onChange={(e) =>
                            setNewProduct({
                                ...newProduct,
                                cost: e.target.value,
                            })
                        }
                        className={`form-control ${errors.cost ? "border-red-500" : ""}`}
                        placeholder="Enter product cost"
                    />
                    {errors.cost && <p className="text-red-500 text-xs">{errors.cost}</p>}
                </div>
            </div>
            <div className="flex justify-end">
                <Button buttonType="primary" onClick={handleCreateProduct}>
                    Create
                </Button>
            </div>
        </form>
    );
};

export default CreateProduct;
