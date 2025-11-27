"use client";

import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import axios from "@/libs/axios";
import { TimeOnly } from "@/libs/format";
import { LiveClock } from "@/libs/LiveClock";
import Button from "@/components/Button";
import { set } from "date-fns";
import useAttendanceCheck from "@/libs/attendanceCheck";

export default function AttendanceForm({ logout }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const [type, setType] = useState("Kasir");
    const [error, setError] = useState(null);

    // 🔥 Ambil lokasi otomatis saat komponen tampil
    useEffect(() => {
        if (!navigator.geolocation) {
            alert("Browser tidak mendukung GPS");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            (err) => {
                console.error(err);
                alert("Tidak dapat mengambil lokasi. Pastikan GPS aktif!");
            }
        );
    }, []);

    // Handle Foto + Compress
    const handleFileChange = async (e) => {
        const imageFile = e.target.files[0];
        setPreview(URL.createObjectURL(imageFile));

        const compressed = await imageCompression(imageFile, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
        });

        setFile(compressed);
    };

    async function getAddress(lat, lng) {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        setAddress(data.address);
    }

    useEffect(() => {
        if (location) {
            getAddress(location.lat, location.lng);
        }
    }, [location]);

    // Upload ke Backend Laravel
    const handleSubmit = async () => {
        if (!file) {
            alert("Upload foto dulu!");
            return;
        }
        if (!location) {
            alert("Lokasi belum berhasil diambil!");
            return;
        }

        const formData = new FormData();
        formData.append("photo", file);
        formData.append("latitude", location.lat);
        formData.append("longitude", location.lng);
        formData.append("type", type);

        try {
            await axios.post("/api/create-attendance", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Absensi berhasil!");
            setFile(null);
            setPreview(null);
            setLocation(null);
        } catch (error) {
            // alert("Absensi gagal! " + error.response.data.message);
            setError(error.response.data.message);
            console.error(error);
            return;
        }
    };

    return (
        <div className="p-4 fixed h-screen overflow-hidden z-9999 bg-slate-700/90 w-screen">
            <div className="p-4 flex flex-col items-center justify-center h-full w-full sm:w-1/3 mx-auto">
                {/* Lokasi otomatis */}
                <LiveClock textSize="text-5xl" style="font-bold" />
                {location ? (
                    <p className="mb-4 text-sm">
                        {address?.town}, {address?.county}
                    </p>
                ) : (
                    <p className="mb-4 text-red-500">Mengambil lokasi...</p>
                )}

                <div className="flex mb-4 bg-slate-300 dark:bg-slate-500 rounded-full">
                    <button onClick={() => setType("Kasir")} className={`${type === "Kasir" && "bg-green-600"} text-white px-4 py-1 rounded-full w-24`}>
                        Kasir
                    </button>
                    <button onClick={() => setType("Backup")} className={`${type === "Backup" && "bg-green-600"} text-white px-4 py-1 rounded-full w-24`}>
                        Backup
                    </button>
                </div>
                <input type="file" capture="environment" className="form-control" accept="image/*" onChange={handleFileChange} />
                {error && <p className="text-red-500 text-xs">{error}</p>}

                {preview && <img src={preview} className="w-48 mt-4 rounded shadow" alt="preview" />}

                <Button buttonType="primary" onClick={handleSubmit} className="mt-2">
                    Submit Absensi
                </Button>
                <button className="mt-2 hover:underline" onClick={logout}>
                    Logout
                </button>
            </div>
        </div>
    );
}
