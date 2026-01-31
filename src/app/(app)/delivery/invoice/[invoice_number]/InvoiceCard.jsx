import { formatDateTime, formatNumber } from "@/libs/format";

const InvoiceCard = ({ journal, footNote = "Pengirim" }) => {
    return (
        <>
            <div className="flex justify-between flex-col">
                <div className="flex flex-col w-full">
                    <h1 className="text-xs font-bold text-center">{journal?.invoice}</h1>
                    <h1 className="text-xs text-center">{formatDateTime(journal?.date_issued)}</h1>
                </div>
                <div className="flex flex-col w-full mt-4">
                    <h1 className="text-xs text-center">Penambahan Kas</h1>
                    <h1 className="text-2xl font-bold text-center">{formatNumber(journal?.amount)}</h1>
                </div>
                <div className="flex flex-col w-full mb-2">
                    {/* <h1 className="text-xs text-center">Tujuan</h1> */}
                    <h1 className="text-sm font-bold text-center">{(journal?.debt?.warehouse?.name ?? "").replace(/^konter\s*/i, "")}</h1>
                    {journal?.description !== "Mutasi Kas" && (
                        <>
                            <h1 className="text-xs">Note: </h1>
                            <h1 className="text-xs italic">{journal?.description}</h1>
                        </>
                    )}
                </div>
            </div>
            <div className="flex justify-between h-[50px] border-y border-dashed border-slate-700 ">
                <h1 className="text-xs border-r border-dashed border-slate-700 w-full text-center first:border-s">Pengirim</h1>
                <h1 className="text-xs border-r border-dashed border-slate-700 w-full text-center">Pengantar</h1>
                <h1 className="text-xs border-r border-dashed border-slate-700 w-full text-center">Penerima</h1>
            </div>
            <h1 className="mt-2 text-xs w-full text-center">-{footNote}-</h1>
            <hr className="border-dashed border-slate-700 my-4" />
        </>
    );
};

export default InvoiceCard;
