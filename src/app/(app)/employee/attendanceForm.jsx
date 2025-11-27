"use client";

import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import axios from "@/libs/axios";

export default function AttendanceForm() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [location, setLocation] = useState(null);

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

        await axios.post("/attendance", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        alert("Absensi berhasil!");
    };

    return (
        <div className="p-4">
            {/* Lokasi otomatis */}
            {location ? (
                <p className="mb-4">
                    📍 Lokasi Terdeteksi: {location.lat}, {location.lng}
                </p>
            ) : (
                <p className="mb-4 text-red-500">Mengambil lokasi...</p>
            )}

            <input type="file" capture="environment" className="form-control" accept="image/*" onChange={handleFileChange} />

            {preview && <img src={preview} className="w-48 mt-4 rounded shadow" alt="preview" />}

            <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded mt-4">
                Submit Absensi
            </button>
        </div>
    );
}
