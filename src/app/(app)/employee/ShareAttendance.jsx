"use client";
import { diffTimeHuman } from "@/libs/format";
import { Copy, Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareAttendanceButton({ attendance, warehouseOpeningTime }) {
    const [copied, setCopied] = useState(false);
    const status = attendance?.approval_status === "Late" ? `Telat` : `OK`;

    const shareMessage = `
        Absensi Berhasil!
        Nama: ${attendance?.contact?.name ?? "-"}
        Tanggal: ${attendance?.date ?? "-"}
        Jam Masuk: ${attendance?.time_in ?? "-"}
        Status: ${status ?? "-"}
        Lokasi: ${attendance?.latitude ?? "-"}, ${attendance?.longitude ?? "-"}

        Foto: ${attendance?.photo_url ?? "-"}
        `.trim();

    const handleShare = async () => {
        if (!attendance) return;

        try {
            const response = await fetch(attendance.photo_url);
            const blob = await response.blob();
            const file = new File([blob], "attendance.jpg", { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: "Absensi Berhasil",
                    text: shareMessage,
                    files: [file],
                });
            } else {
                window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank");
            }
        } catch (error) {
            console.error("Share failed:", error);
            window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <>
            <button
                onClick={handleShare}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-5 w-3/4 rounded-xl flex justify-center items-center gap-2"
            >
                <Share2 size={18} />
                Share Absensi
            </button>

            <button
                onClick={copyToClipboard}
                className="mt-3 bg-slate-600 hover:bg-slate-700 text-white px-4 py-5 w-3/4 rounded-xl flex justify-center items-center gap-2"
            >
                <Copy size={20} /> {copied ? "Tersalin!" : "Copy Pesan"}
            </button>
        </>
    );
}
