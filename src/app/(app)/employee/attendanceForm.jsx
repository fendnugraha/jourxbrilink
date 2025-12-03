"use client";

import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import axios from "@/libs/axios";
import { formatTime } from "@/libs/format";
import { LiveClock } from "@/libs/LiveClock";
import Button from "@/components/Button";
import useAttendanceCheck from "@/libs/attendanceCheck";
import { useAuth } from "@/libs/auth";
import { CameraIcon, LocateIcon, MapPin, Trash2Icon, Undo } from "lucide-react";

export default function AttendanceForm({ attCheckMutate, openMessage }) {
    const { user, authLoading, logout } = useAuth({ middleware: "auth" });
    const userWarehouseName = user?.role?.warehouse?.name;
    const userWhCashier = user?.role?.warehouse?.contact?.name;
    const whBackupCahsier = user?.role?.warehouse?.zone?.contact?.name;
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const [type, setType] = useState("Kasir");
    const [error, setError] = useState(null);
    const [timeIn, setTimeIn] = useState(null);
    const [successMessgageOpen, setSuccessMessageOpen] = useState(false);

    // 🔥 Ambil lokasi otomatis saat komponen tampil
    const getLocation = () => {
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

                if (err.code === 1) {
                    alert("Izin lokasi ditolak. Aktifkan GPS dan izinkan lokasi.");
                } else if (err.code === 2) {
                    alert("Lokasi tidak tersedia. Coba ke area terbuka.");
                } else if (err.code === 3) {
                    alert("GPS timeout. Pastikan GPS aktif dan sinyal kuat.");
                } else {
                    alert("Tidak dapat mengambil lokasi.");
                }
            },
            {
                enableHighAccuracy: true, // supaya lebih akurat
                timeout: 10000, // maksimal 10 detik
                maximumAge: 0, // jangan pakai lokasi cache
            }
        );
    };

    useEffect(() => {
        getLocation();
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
        setTimeIn(formatTime(new Date()));
    };

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    async function getAddress(lat, lng) {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
            headers: {
                "User-Agent": "YourAppName/1.0 (your-email@example.com)",
                "Accept-Language": "id",
            },
        });

        const data = await res.json();
        setAddress(data.address); // biasanya berisi city, suburb, road, etc.
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
        formData.append("time_in", timeIn);

        try {
            await axios.post("/api/create-attendance", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Absensi berhasil!");
            setFile(null);
            setPreview(null);
            setLocation(null);
            openMessage(true);
        } catch (error) {
            // alert("Absensi gagal! " + error.response.data.message);
            setError(error.response.data.message);
            console.error(error);
            return;
        } finally {
            attCheckMutate();
        }
    };

    return (
        <>
            {/* Lokasi otomatis */}
            <span className="text-sm text-red-500 italic animate-pulse">INFO: INI MASIH DALAM MODE TESTING</span>
            <span className="text-xl font-bold">{userWarehouseName}</span>
            {location ? (
                <p className="mb-4 text-sm">
                    {address?.town}, {address?.county}
                </p>
            ) : (
                <p className="mb-4 text-red-500">Mengambil lokasi...</p>
            )}

            <div className="flex bg-slate-300 dark:bg-slate-500 rounded-full">
                <button onClick={() => setType("Kasir")} className={`${type === "Kasir" && "bg-blue-600 text-white"} px-4 py-1 rounded-full w-32`}>
                    Kasir
                </button>
                <button onClick={() => setType("Backup")} className={`${type === "Backup" && "bg-blue-600 text-white"} px-4 py-1 rounded-full w-32`}>
                    Backup
                </button>
            </div>
            {userWhCashier && type === "Kasir" ? (
                <p className="text-sm text-center">
                    <span className="text-lg font-bold text-green-300 block">{userWhCashier}</span>
                </p>
            ) : (
                <p className="text-sm">
                    <span className="text-lg font-bold text-green-300 block">{whBackupCahsier}</span>
                </p>
            )}
            {timeIn ? <span className="text-6xl my-4 font-bold text-blue-200 block">{timeIn}</span> : <LiveClock textSize="text-6xl my-4" style="font-bold" />}

            <div className="flex items-center gap-2 w-full">
                <label
                    htmlFor={file ? null : "photo"}
                    className={`p-4 w-full flex justify-center gap-2 items-center rounded-2xl text-white cursor-pointer ${
                        location ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                    }`}
                    hidden={file}
                >
                    <CameraIcon size={28} strokeWidth={2} /> Ambil foto
                </label>

                <input id="photo" type="file" capture="environment" accept="image/*" className="hidden" disabled={!location} onChange={handleFileChange} />
                {file && (
                    <div className="flex w-full gap-2">
                        <button
                            onClick={() => {
                                setFile(null);
                                setPreview(null);
                                setError(null);
                                setTimeIn(null);
                            }}
                            className="p-2 w-full flex justify-center gap-2 items-center text-center rounded-2xl text-white bg-red-500 hover:bg-red-300"
                        >
                            <Undo size={28} strokeWidth={2} /> Ganti foto
                        </button>
                        <button
                            onClick={() => {
                                getLocation();
                            }}
                            className="p-2 w-full flex justify-center gap-2 items-center text-center rounded-2xl text-white bg-green-500 hover:bg-green-300"
                        >
                            <MapPin size={28} strokeWidth={2} /> Reset lokasi
                        </button>
                    </div>
                )}
            </div>
            {/* <input
                    type="file"
                    capture="environment"
                    className="form-control disabled:text-slate-400"
                    disabled={!location}
                    accept="image/*"
                    onChange={handleFileChange}
                /> */}
            {error && <p className="text-red-500 text-xs">{error}</p>}

            {preview && <img src={preview} className="w-48 mt-4 rounded-full h-48 object-cover shadow" alt="preview" />}

            <Button buttonType="info" onClick={handleSubmit} className="mt-2 !p-4 w-full sm:w-auto !text-lg" hidden={!location || !file}>
                Submit Absensi
            </Button>

            <button className="mt-2 hover:underline" onClick={logout}>
                Logout
            </button>
        </>
    );
}
