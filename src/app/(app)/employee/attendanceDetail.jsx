import { formatTime } from "@/libs/format";
import Image from "next/image";

const AttendanceDetail = ({ selectedWarehouse }) => {
    return (
        <div className="flex gap-2">
            {selectedWarehouse?.attendance?.[0]?.photo ? (
                <Image src={selectedWarehouse?.attendance[0]?.photo_url} alt={selectedWarehouse?.name} width={150} height={250} />
            ) : (
                <div className="text-gray-400 border border-gray-300 rounded-2xl dark:border-gray-500 p-2 h-[250px] w-[150px]">Tidak ada foto</div>
            )}
            <div className="flex-1">
                <h1 className="text-lg font-bold">{selectedWarehouse?.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedWarehouse?.address}</p>
                <h1 className="text-lg font-bold">Kasir</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedWarehouse?.contact?.name}</p>
                <h1 className="text-lg font-bold">Jam Masuk</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedWarehouse?.attendance?.[0]?.created_at && formatTime(selectedWarehouse?.attendance[0]?.created_at)} (
                    {selectedWarehouse?.attendance?.[0]?.created_at ? selectedWarehouse?.attendance[0]?.approval_status : "Belum absen"})
                </p>
                <h1 className="text-lg font-bold">Status</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">-</p>
            </div>
        </div>
    );
};
export default AttendanceDetail;
