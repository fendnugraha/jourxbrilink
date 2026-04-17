"use client";
import { diffTimeHuman, formatDate, formatDateTime, formatLongDate, getDayName } from "@/libs/format";
import { Copy, Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareAttendanceButton({ attendance, style = "px-4 py-5 w-3/4", buttonWithText = true }) {
    const [copied, setCopied] = useState(false);
    const status = attendance?.approval_status === "Late" ? `Telat` : `OK`;

    const shortUrl = async (url) => {
        try {
            const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);

            const text = await res.text();

            if (!res.ok) {
                console.error("TinyURL error:", res.status, text);
                throw new Error("Gagal membuat short URL");
            }

            return text;
        } catch (error) {
            console.error("Short URL failed:", error);
            return url;
        }
    };

    const shareMessage = `
        Absensi Berhasil!
Nama: ${attendance?.contact?.name ?? "-"}
Tanggal: ${getDayName(attendance?.date) ?? "-"}, ${formatLongDate(attendance?.date) ?? "-"}
Jam Masuk: ${attendance?.time_in ?? "-"}
Status: ${status ?? "-"}
Lokasi: ${attendance?.latitude ?? "-"}, ${attendance?.longitude ?? "-"}

Foto: ${attendance?.photo_url ?? "-"}
`.trim();

    const handleShare = async () => {
        if (!attendance) return;

        const short = await shortUrl(attendance.photo_url);
        const photoLink = short ?? attendance.photo_url;

        const message = `Absensi Berhasil!
Nama: ${attendance?.contact?.name ?? "-"}
Tanggal: ${getDayName(attendance?.date) ?? "-"}, ${formatLongDate(attendance?.date) ?? "-"}
Jam Masuk: ${attendance?.time_in ?? "-"}
Status: ${status}
Lokasi: ${attendance?.latitude ?? "-"}, ${attendance?.longitude ?? "-"}

Foto: ${photoLink}`;

        try {
            const response = await fetch(attendance.photo_url);
            const blob = await response.blob();
            const file = new File([blob], "attendance.jpg", { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: "Absensi Berhasil",
                    text: message,
                    files: [file],
                });
            } else {
                window.open(`https://wa.me/?text=${encodeURIComponent(`${photoLink}\n\n${message}`)}`, "_blank");
            }
        } catch (error) {
            console.error("Share failed:", error);

            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
        }
    };

    const copyToClipboard = async () => {
        if (!attendance) return;

        const short = await shortUrl(attendance.photo_url);
        const photoLink = short ?? attendance.photo_url;

        const message = `Absensi Berhasil!
Nama: ${attendance?.contact?.name ?? "-"}
Tanggal: ${getDayName(attendance?.date) ?? "-"}, ${formatLongDate(attendance?.date) ?? "-"}
Jam Masuk: ${attendance?.time_in ?? "-"}
Status: ${status}
Lokasi: ${attendance?.latitude ?? "-"}, ${attendance?.longitude ?? "-"}

Foto: ${photoLink}`;

        try {
            await navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Copy gagal:", err);

            // fallback jadul (biar tetap bisa di browser lama)
            const textarea = document.createElement("textarea");
            textarea.value = message;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);

            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <>
            <button
                onClick={handleShare}
                className={`mt-3 bg-green-600 hover:bg-green-700 text-white ${style} rounded-xl flex justify-center items-center gap-2`}
            >
                <Share2 size={18} />
                {buttonWithText && "Share Absensi"}
            </button>

            <button
                onClick={copyToClipboard}
                className={`mt-3 bg-slate-600 hover:bg-slate-700 text-white ${style} rounded-xl flex justify-center items-center gap-2`}
            >
                <Copy size={20} /> {buttonWithText ? (copied ? "Tersalin!" : "Copy Pesan") : null}
            </button>
        </>
    );
}
