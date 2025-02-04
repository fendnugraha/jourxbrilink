"use client";

import Header from "@/app/(app)/Header";
import Paginator from "@/components/Paginator";
import axios from "@/libs/axios";
import { useState, useEffect } from "react";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import CreateCategoryProduct from "./CreateCategoryProduct";
import CreateProduct from "./CreateProduct";
import formatNumber from "@/libs/formatNumber";
import Notification from "@/components/notification";
import { EyeIcon, PlusCircleIcon, TrashIcon } from "lucide-react";

export default function Product() {
    const [product, setProduct] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState([]);
    // const [selectedUpdateAccount, setSelectedUpdateAccount] = useState(null)
    const [notification, setNotification] = useState("");
    const [errors, setErrors] = useState([]); // Store validation errors
    const [isModalCreateProductOpen, setIsModalCreateProductOpen] = useState(false);
    const [isModalCreateCategoryProductOpen, setIsModalCreateCategoryProductOpen] = useState(false);
    // const [isModalUpdateAccountOpen, setIsModalUpdateAccountOpen] =
    //     useState(false)

    // Fetch Accounts
    const fetchProducts = async (url = "/api/products") => {
        try {
            const response = await axios.get(url);
            setProduct(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        }
    };

    // const handleSelectProduct = id => {
    //     setSelectedProduct(prevSelected => {
    //         if (prevSelected.includes(id)) {
    //             return prevSelected.filter(item => item !== id)
    //         } else {
    //             return [...prevSelected, id]
    //         }
    //     })
    // }

    // const handleDeleteAccount = async id => {
    //     try {
    //         const response = await axios.delete(`api/accounts/${id}`)
    //         setNotification(response.data.message)
    //         fetchAccount()
    //     } catch (error) {
    //         setErrors(error.response?.data?.errors || ['Something went wrong.'])
    //         setNotification(error.response.data.message)
    //     }
    // }

    const closeModal = () => {
        setIsModalCreateProductOpen(false);
        setIsModalCreateCategoryProductOpen(false);
        // setIsModalUpdateAccountOpen(false)
    };

    const handleSelectProduct = (id) => {
        setSelectedProduct((prevSelected) => {
            // Check if the ID is already in the selectedProduct array
            if (prevSelected.includes(id)) {
                // If it exists, remove it
                return prevSelected.filter((productId) => productId !== id);
            } else {
                // If it doesn't exist, add it
                return [...prevSelected, id];
            }
        });
    };

    // const handleShowAccount = async id => {
    //     try {
    //         const response = await axios.get(`api/accounts/${id}`)
    //         setSelectedUpdateAccount(response.data.data)
    //         setIsModalUpdateAccountOpen(true)
    //     } catch (error) {
    //         setErrors(error.response?.data?.errors || ['Something went wrong.'])
    //         console.log(error.response)
    //     }
    // }

    // const handleDeleteSelectedAccounts = async () => {
    //     try {
    //         const response = await axios.delete(
    //             `api/delete-selected-account`,
    //             { data: { ids: selectedAccount } },
    //         )
    //         setNotification(response.data.message)
    //         fetchAccount()
    //         setSelectedAccount([])
    //     } catch (error) {
    //         setErrors(error.response?.data?.errors || ['Something went wrong.'])
    //     }
    // }

    useEffect(() => {
        fetchProducts("/api/products");
    }, []);

    // useEffect(() => {
    //     // console.log(selectedUpdateAccount)

    //     handleShowAccount()
    // }, [])
    const handleChangePage = (url) => {
        fetchProducts(url);
    };

    return (
        <>
            <Header title="Product" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
                        <div className="p-6 bg-white border-b border-gray-200">
                            {errors.length > 0 && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                    <ul>
                                        {errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="flex justify-between">
                                {/* {selectedAccount.length > 0 && (
                                    <button
                                        className="btn-primary"
                                        onClick={handleDeleteSelectedAccounts}>
                                        Hapus terpilih {selectedAccount.length}
                                    </button>
                                )} */}
                                <div className="flex justify-end gap-2">
                                    <button className="btn-primary text-sm" onClick={() => setIsModalCreateProductOpen(true)}>
                                        Tambah Produk <PlusCircleIcon className="w-5 h-5 inline" />
                                    </button>
                                    <button className="btn-primary text-sm" onClick={() => setIsModalCreateCategoryProductOpen(true)}>
                                        Tambah Kategori <PlusCircleIcon className="w-5 h-5 inline" />
                                    </button>
                                </div>
                                <Modal isOpen={isModalCreateProductOpen} onClose={closeModal} modalTitle="Create account">
                                    <CreateProduct
                                        isModalOpen={setIsModalCreateProductOpen}
                                        notification={(message) => setNotification(message)}
                                        fetchProducts={fetchProducts}
                                    />
                                </Modal>
                                <Modal isOpen={isModalCreateCategoryProductOpen} onClose={closeModal} modalTitle="Create account">
                                    <CreateCategoryProduct
                                        isModalOpen={setIsModalCreateCategoryProductOpen}
                                        notification={(message) => setNotification(message)}
                                        fetchProducts={fetchProducts}
                                    />
                                </Modal>
                            </div>
                            <table className="table w-full text-xs">
                                <thead>
                                    <tr>
                                        <th className="text-center">#</th>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product?.data?.length === 0 ? (
                                        <tr>
                                            <td colSpan="6">No products found</td>
                                        </tr>
                                    ) : (
                                        product?.data?.map((product) => (
                                            <tr key={product.id}>
                                                <td className="text-center">
                                                    <Input
                                                        checked={selectedProduct.includes(product.id)}
                                                        onChange={() => {
                                                            handleSelectProduct(product.id);
                                                        }}
                                                        type="checkbox"
                                                    />
                                                </td>
                                                <td>{product.name}</td>
                                                <td>{product.category}</td>
                                                <td>{formatNumber(product.price)}</td>
                                                <td>{product.end_stock}</td>
                                                <td className="">
                                                    <span className="flex justify-center">
                                                        <button className="bg-indigo-500 py-2 px-4 rounded-lg text-white mr-2">
                                                            <EyeIcon className="size-4" />
                                                        </button>
                                                        <button className="bg-red-600 py-2 px-4 rounded-lg text-white">
                                                            <TrashIcon className="size-4" />
                                                        </button>
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {product?.last_page > 1 && <Paginator links={product} handleChangePage={handleChangePage} />}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
