import { ArrowUpDown } from "lucide-react";

const MutationContent = () => {
    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 bg-slate-600 rounded-4xl p-4">
                    <label className="text-sm">Cabang</label>
                    <select className="bg-slate-700 rounded-2xl p-2">
                        <option value="1"> Cabang 1</option>
                        <option value="2"> Cabang 2</option>
                        <option value="3"> Cabang 3</option>
                    </select>
                    {/* <input type="number" className="bg-slate-700 rounded-2xl p-2" /> */}
                </div>
                <div className="flex flex-col gap-4 relative">
                    <div className="flex flex-col gap-2 bg-slate-600 rounded-4xl p-4">
                        <label className="text-sm">Sumber Dana</label>
                        <select className="bg-slate-700 rounded-2xl p-2">
                            <option value="1"> Sumber Dana 1</option>
                            <option value="2"> Sumber Dana 2</option>
                            <option value="3"> Sumber Dana 3</option>
                        </select>
                        {/* <input type="number" className="bg-slate-700 rounded-2xl p-2" /> */}
                    </div>
                    <div className="flex flex-col gap-2 bg-slate-600 rounded-4xl p-4">
                        <label className="text-sm">Tujuan</label>
                        <select className="bg-slate-700 rounded-2xl p-2">
                            <option value="1"> Tujuan 1</option>
                            <option value="2"> Tujuan 2</option>
                            <option value="3"> Tujuan 3</option>
                        </select>
                        {/* <input type="number" className="bg-slate-700 rounded-2xl p-2" /> */}
                    </div>
                    <button className="bg-slate-900 rounded-4xl p-4 absolute -right-4 -top-2" type="button">
                        <ArrowUpDown size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MutationContent;
