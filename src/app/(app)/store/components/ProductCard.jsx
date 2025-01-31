import formatNumber from "@/libs/formatNumber";
import { PlusCircleIcon } from "lucide-react";

const ProductCard = ({ product, onAddToCart }) => {
    return (
        <div className="bg-white rounded-2xl px-6 py-3 shadow-md">
            <h1 className="text-sm font-bold">{product.name}</h1>
            <small className="text-xs text-gray-500">Stock: {product.end_stock}</small>
            <div className="flex justify-between items-center">
                <h4 className="my-2 text-amber-500 font-bold">Rp. {formatNumber(product.price)}</h4>
                <button onClick={() => onAddToCart(product)} className="hover:scale-105 hover:text-blue-500">
                    <PlusCircleIcon className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
