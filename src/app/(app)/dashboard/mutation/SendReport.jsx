"use client";
import axios from "axios";
import { useState } from "react";

export default function ReportForm() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Sedang mengirim...");

        // Di dalam fungsi handleSubmit komponen React Anda:
        try {
            const res = await axios.post("/api/send-report", formData);

            // Axios otomatis menaruh data respon di properti .data
            if (res.data.success) {
                setStatus("✅ Laporan sukses terkirim ke Telegram!");
                setFormData({ name: "", email: "", message: "" });
            }
        } catch (error) {
            console.error("Gagal mengirim laporan:", error);
            const pesanError = error.response?.data?.error || "Terjadi kesalahan jaringan.";
            setStatus(`❌ Gagal: ${pesanError}`);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc" }}>
            <h2>Kirim Laporan</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nama Anda"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
                />
                <input
                    type="email"
                    placeholder="Email Anda"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
                />
                <textarea
                    placeholder="Isi Laporan..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    style={{ width: "100%", marginBottom: "10px", padding: "8px", height: "100px" }}
                />
                <button type="submit" style={{ width: "100%", padding: "10px", background: "#0088cc", color: "white", border: "none", cursor: "pointer" }}>
                    Kirim Laporan
                </button>
            </form>
            {status && <p style={{ marginTop: "10px", fontWeight: "bold" }}>{status}</p>}
        </div>
    );
}
