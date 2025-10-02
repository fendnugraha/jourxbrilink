import formatNumber from "@/libs/formatNumber";
import { BoxesIcon, Plus, PlusCircleIcon, ShoppingCartIcon } from "lucide-react";

const ProductCard = ({ product, onAddToCart }) => {
    return (
        <div className="group hover:bg-yellow-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 flex justify-center gap-2 items-center card px-4 py-3 hover:drop-shadow-xs">
            {/* <div className="w-[50px] bg-slate-400 rounded-lg h-[50px] flex justify-center items-center">
                <BoxesIcon size={20} className="text-slate-100" />
            </div> */}
            <div className="flex flex-col justify-between h-full w-full">
                <div>
                    <h1 className="text-xs font-bold">{product?.name.toUpperCase()}</h1>
                    <span className="text-xs text-gray-500 dark:text-gray-100">Stock: {product?.end_stock}</span>
                </div>
                <div className="flex justify-between items-end w-full">
                    <h1 className="text-sm font-bold">
                        <span className="text-xs font-light">Rp</span> {formatNumber(product?.price)}
                    </h1>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="group-hover:scale-125 hover:bg-green-500 rounded-full transition-transform duration-300 ease-out flex items-center gap-1 bg-green-600 cursor-pointer"
                    >
                        <Plus size={20} className="inline" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
