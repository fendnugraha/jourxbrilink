"use client";
import Notification from "@/components/Notification";
import { useCallback, useEffect, useRef, useState } from "react";
import formatNumber from "@/libs/formatNumber";
import { BoxesIcon, ChevronUpIcon, LoaderCircleIcon, MinusIcon, PencilIcon, PlusIcon, SearchIcon, ShoppingCartIcon, Trash2Icon, TrashIcon } from "lucide-react";
import axios from "@/libs/axios";
import ProductCard from "../components/ProductCard";
import Modal from "@/components/Modal";
import MainPage from "../../main";
import Dropdown from "@/components/Dropdown";

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler); // Clean up on component unmount or when value changes
        };
    }, [value, delay]);

    return debouncedValue;
};

const Sales = () => {
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);

    const [productList, setProductList] = useState([]);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500); // Apply debounce with 500ms delay
    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isModalCheckOutOpen, setIsModalCheckOutOpen] = useState(false);
    const [showCartMobile, setShowCartMobile] = useState(false);
    const closeModal = () => {
        setIsModalCheckOutOpen(false);
    };

    // Handle search input change
    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const cartMobileRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (cartMobileRef.current && !cartMobileRef.current.contains(event.target)) {
                setShowCartMobile(false);
            }
        };
        document.addEventListener("click", handleOutsideClick);
        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, []);

    // Fetch product list based on debounced search term
    const fetchProduct = useCallback(async () => {
        if (debouncedSearch.length > 3) {
            setLoading(true);
            try {
                const response = await axios.get("/api/products", {
                    params: { search: debouncedSearch },
                });
                setProductList(response.data.data);
            } catch (error) {
                console.log("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        } else {
            setProductList([]); // Clear product list if search is too short
        }
    }, [debouncedSearch]);

    // Add product to cart
    const handleAddToCart = (product) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find((item) => item.id === product.id);
            if (existingProduct) {
                // If product is already in the cart, increase its quantity
                return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            }
            // Otherwise, add the product to the cart with quantity 1
            return [...prevCart, { ...product, quantity: 1 }];
        });

        setNotification({
            type: "success",
            message: "Product added to cart",
        });
    };

    // Update product quantity in cart
    const handleUpdateQuantity = (product, newQuantity) => {
        setCart((prevCart) => {
            return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: newQuantity } : item));
        });
    };

    // update product price in cart
    const handleUpdatePrice = (product, newPrice) => {
        setCart((prevCart) => {
            return prevCart.map((item) => (item.id === product.id ? { ...item, price: newPrice } : item));
        });
    };

    // Check if a product is in the cart
    const isProductInCart = (product) => {
        return cart.some((item) => item.id === product.id);
    };

    // Add quantity by 1
    const handleIncrementQuantity = (product) => {
        setCart((prevCart) => {
            return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        });
    };

    // Subtract quantity by 1
    const handleDecrementQuantity = (product) => {
        //if quantity is 1, remove product from cart
        if (product.quantity === 1) {
            handleRemoveFromCart(product);
            return;
        }
        setCart((prevCart) => {
            return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item));
        });
    };

    // Calculate total price
    const calculateTotalPrice = useCallback(() => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
        // return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cart]);

    const calculateTotalQuantity = useCallback(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    // Remove product from cart
    const handleRemoveFromCart = (product) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== product.id));
    };

    // Handle clear cart
    const handleClearCart = () => {
        setCart([]);
    };

    // Load cart from localStorage on component mount
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
    }, []);

    // Fetch product list when debounced search term changes
    useEffect(() => {
        fetchProduct();
    }, [debouncedSearch, fetchProduct]);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
        setTotalPrice(calculateTotalPrice());
    }, [cart, calculateTotalPrice]);

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/api/transactions", { cart, transaction_type: "Sales" });
            setNotification({ type: "success", message: response.data.message });
            handleClearCart();
            setIsModalCheckOutOpen(false);
        } catch (error) {
            setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };
    return (
        <MainPage
            headerTitle={
                <>
                    Store / <span className="text-slate-500 font-light">Sales Order</span>
                </>
            }
        >
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="px-6 py-4 h-[60px]">
                <h1 className="text-2xl font-bold">Penjualan Barang</h1>
                <span className="text-sm text-slate-500">Penjualan barang online melalui AgenBRI Link</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-[calc(100vh-140px)] p-4">
                <div className="sm:col-span-2">
                    <div>
                        <div className="flex items-center">
                            <input
                                type="search"
                                className="bg-gray-50 text-gray-900 text-sm rounded-full outline-1 outline-gray-300 focus:outline-orange-500/50 focus:outline-2 block w-full px-4 py-2.5"
                                placeholder="Cari Barang"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3 max-h-[calc((78px+4px)*5))] overflow-y-scroll">
                                {productList?.data?.map((product) => (
                                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl px-6 py-4 hidden sm:flex flex-col justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Detail Order</h1>
                        <div className="max-h-[calc(49px*7)] overflow-y-scroll">
                            {cart.length > 0 ? (
                                cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center py-2 border-b border-slate-200 border-dashed hover:bg-slate-50"
                                    >
                                        <div className="flex gap-2 items-center">
                                            <div className="w-[30px] bg-slate-400 rounded-lg h-[30px] flex justify-center items-center">
                                                <BoxesIcon size={18} className="text-slate-50" />
                                            </div>
                                            <div>
                                                <h1 className="text-xs mb-1">{item.name.toUpperCase()}</h1>
                                                <div className="flex gap-4 items-center">
                                                    <div className="flex gap-2 items-center bg-slate-300 rounded-full px-0.5 w-fit">
                                                        <button
                                                            onClick={() => handleDecrementQuantity(item)}
                                                            className="text-slate-500 bg-white hover:text-slate-500 cursor-pointer rounded-full"
                                                        >
                                                            <MinusIcon size={15} className="" />
                                                        </button>
                                                        <h1 className="text-sm text-slate-700">{formatNumber(item.quantity)}</h1>
                                                        <button
                                                            onClick={() => handleIncrementQuantity(item)}
                                                            className="text-slate-500 bg-white hover:text-slate-500 cursor-pointer rounded-full"
                                                        >
                                                            <PlusIcon size={15} className="" />
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => handleUpdatePrice(item, e.target.value)}
                                                        className="text-xs p-0.5 rounded-sm text-right outline-1 outline-gray-200 focus:outline-orange-500/50 focus:outline-2 bg-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <button onClick={() => handleRemoveFromCart(item)} className="cursor-pointer hover:scale-110">
                                                <Trash2Icon size={18} className="text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex justify-center items-center h-full">
                                    <h1 className="text-lg">Cart is empty</h1>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between">
                            <h1 className="text-sm">Quantity</h1>
                            <h1 className="text-sm font-bold">
                                {formatNumber(calculateTotalQuantity())}{" "}
                                <span className="text-xs font-light">{calculateTotalQuantity() > 1 ? "Items" : "Item"}</span>
                            </h1>
                        </div>
                        <div className="flex justify-between">
                            <h1 className="text-sm font-bold">Total</h1>
                            <h1 className="text-sm font-bold">
                                <span className="text-xs font-light">Rp</span> {formatNumber(totalPrice)}
                            </h1>
                        </div>
                        <div className="flex justify-between gap-2 mt-2">
                            <button
                                onClick={() => setIsModalCheckOutOpen(true)}
                                disabled={cart.length === 0}
                                className="w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-full py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Checkout
                            </button>
                            <button
                                onClick={() => handleClearCart()}
                                disabled={cart.length === 0}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-full py-2 px-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2Icon size={18} className="" />
                            </button>
                        </div>
                    </div>
                    <Modal isOpen={isModalCheckOutOpen} onClose={closeModal} maxWidth={"max-w-sm"} modalTitle="Checkout" bgColor="bg-white">
                        <div className="flex justify-center flex-col items-center gap-2 border-b border-gray-300 border-dashed py-2">
                            <h1 className="text-7xl text-green-500 font-bold">{calculateTotalQuantity()}</h1>
                            <span className="text-sm font-light">{calculateTotalQuantity() > 1 ? "Items" : "Item"}</span>
                        </div>
                        <div className="flex justify-between items-center my-4">
                            <h1 className="text-xl">Total</h1>
                            <h1 className="text-xl">Rp. {formatNumber(totalPrice)}</h1>
                        </div>
                        <button
                            onClick={handleCheckOut}
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-4 px-6 disabled:bg-slate-300 disabled:cursor-wait rounded-full"
                            disabled={loading}
                        >
                            {loading ? <LoaderCircleIcon className="animate-spin" /> : "Simpan"}
                        </button>
                    </Modal>
                </div>
            </div>

            {/* Checkout session mobile */}
            {cart.length > 0 && (
                <div ref={cartMobileRef} className="fixed sm:hidden bottom-0 w-full bg-white p-4">
                    <div className="flex justify-between items-center">
                        <button onClick={() => setShowCartMobile(!showCartMobile)} className="group font-bold">
                            <ChevronUpIcon
                                className={`w-5 h-5 inline ${
                                    showCartMobile ? "rotate-180 group-hover:translate-y-1 " : "group-hover:-translate-y-1 "
                                } transition-transform duration-300 delay-500 ease-out`}
                            />{" "}
                            Items ({cart.length})
                        </button>
                        <button onClick={handleClearCart} className="text-red-600 hover:underline">
                            Clear all
                        </button>
                    </div>
                    <div className={`overflow-y-auto ${showCartMobile ? "max-h-[399px] my-4" : "max-h-0 my-2"} transition-all duration-300 ease-in-out`}>
                        <div className="bg-slate-200 rounded-2xl p-2">
                            {cart.length === 0 ? (
                                <div>Cart is empty</div>
                            ) : (
                                cart.map((item) => (
                                    <div className="border-b border-gray-300 border-dashed py-1 last:border-0" key={item.id}>
                                        <div className="flex justify-between align-top">
                                            <h1 className="font-bold text-xs">{item.name}</h1>
                                            <button onClick={() => handleRemoveFromCart(item)} className="hover:scale-105">
                                                <TrashIcon className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center my-2">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleDecrementQuantity(item)} className="active:text-red-500 active:scale-95">
                                                    <MinusIcon className="w-5 h-5" />
                                                </button>
                                                <span className="mx-2">{item.quantity}</span>
                                                <button onClick={() => handleIncrementQuantity(item)} className="active:text-red-500 active:scale-95">
                                                    <PlusIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                            {/* <h1 className="text-lg text-gray-700 font-bold">
                                                    {formatNumber(
                                                        item.price *
                                                            item.quantity,
                                                    )}
                                                </h1> */}
                                            <div>
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => handleUpdatePrice(item, e.target.value)}
                                                    className="w-full text-xs text-end px-3 py-1 border border-slate-300 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalCheckOutOpen(true)}
                        className="bg-indigo-600 w-full hover:bg-indigo-500 text-white py-4 px-6 rounded-xl flex justify-between items-center"
                    >
                        <span>Checkout</span>
                        <div>
                            <span className="font-bold text-yellow-200">
                                {formatNumber(totalPrice)} <br />
                            </span>
                        </div>
                    </button>
                </div>
            )}
            {/* End checkout session mobile */}
        </MainPage>
    );
};

export default Sales;
