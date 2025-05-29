import formatNumber from "@/libs/formatNumber";
import { BoxesIcon, PlusCircleIcon, ShoppingCartIcon } from "lucide-react";

const ProductCard = ({ product, onAddToCart }) => {
    return (
        <div className="group hover:border-indigo-300 border flex justify-start gap-2 items-start bg-white p-2 rounded-2xl drop-shadow-sm">
            <div className="w-20 bg-slate-400 rounded-lg h-20 flex justify-center items-center">
                <BoxesIcon size={40} className="text-slate-100" />
            </div>
            <div className="flex flex-col justify-between h-full w-full">
                <div>
                    <h1 className="text-xs font-bold">{product.name}</h1>
                    <span className="text-xs text-gray-500">Stock: {product.end_stock}</span>
                </div>
                <div className="flex justify-between items-end w-full">
                    <h1 className="text-lg font-bold">
                        <sup>Rp</sup> {formatNumber(product.price)}
                    </h1>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="group-hover:scale-105 hover:text-yellow-300 transition-transform duration-300 ease-out flex items-center gap-1 mr-4 bg-slate-500 hover:bg-slate-600 py-2 px-4 text-xs text-white rounded-lg"
                    >
                        <PlusCircleIcon size={20} className="inline" /> Add to cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
