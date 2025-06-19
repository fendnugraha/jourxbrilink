"use client";
import Notification from "@/components/Notification";
import { useCallback, useEffect, useRef, useState } from "react";
import formatNumber from "@/libs/formatNumber";
import { ChevronUpIcon, LoaderCircleIcon, MinusCircleIcon, PlusCircleIcon, SearchIcon, ShoppingCartIcon, TrashIcon } from "lucide-react";
import axios from "@/libs/axios";
import ProductCard from "../components/ProductCard";
import Modal from "@/components/Modal";
import MainPage from "../../main";

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
            setNotification(response.data.message);
            handleClearCart();
            setIsModalCheckOutOpen(false);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <MainPage headerTitle="Store - Sales Order">
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="px-6 py-4 h-[60px]">
                <h1 className="text-2xl font-bold">Penjualan Barang</h1>
                <span className="text-sm text-slate-500">Penjualan barang online melalui AgenBRI Link</span>
            </div>
            <div className="grid grid-cols-3 h-[calc(100vh-140px)] p-4">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold">Penjualan Barang</h1>
                </div>
                <div className="bg-white rounded-s-3xl px-6 py-4">
                    <h1 className="text-2xl font-bold">Detail Order</h1>
                </div>
                <div className="bg-white rounded-e-3xl px-6 py-4">
                    <h1 className="text-2xl font-bold">Detail Order</h1>
                </div>
            </div>
        </MainPage>
    );
};

export default Sales;
