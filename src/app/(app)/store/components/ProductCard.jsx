import formatNumber from "@/libs/formatNumber";
import { PlusCircleIcon } from "lucide-react";

const ProductCard = ({ product, onAddToCart }) => {
    return (
        <div className="bg-white rounded-2xl px-6 py-3 shadow-md">
            <h1 className=" font-bold">{product.name}</h1>
            <small className="text-xs text-gray-500">Stock: {product.end_stock}</small>
            <div className="flex justify-between items-center">
                <h4 className="my-2 ">{formatNumber(product.price)}</h4>
                <button onClick={() => onAddToCart(product)} className="">
                    <PlusCircleIcon className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
