// components/SimpleLeaveCalendar.js
"use client";

import { useState } from "react";
import {
    // Fungsi date-fns yang diperlukan
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    getDay,
    addDays,
    subDays,
    startOfWeek,
    getISOWeek,
    setDay, // Fungsi ini lebih mudah untuk mengatur hari tertentu
} from "date-fns";

// --- 1. Data Karyawan Awal (Jadwal Awal) ---
// Catatan: Indeks hari di sini disesuaikan dengan standar JS/date-fns (0=Minggu, 1=Senin, ..., 6=Sabtu)
const EMPLOYEE_SCHEDULES = [
    // Budi libur hari Senin di minggu pertama.
    { id: 101, name: "Budi Santoso", initialDay: 1 },
    // Ani libur hari Kamis di minggu pertama.
    { id: 102, name: "Ani Wijaya", initialDay: 4 },
    // Candra libur hari Minggu di minggu pertama.
    { id: 103, name: "Candra Jaya", initialDay: 0 },
];

// --- 2. Logika Perhitungan Rotasi ---

/**
 * Menghitung semua hari libur rotasi dalam rentang bulan yang diberikan untuk satu karyawan.
 * @param {Date} startDate - Tanggal awal rentang perhitungan.
 * @param {Date} endDate - Tanggal akhir rentang perhitungan.
 * @param {number} initialDayIndex - Indeks hari libur awal karyawan (0=Minggu, 6=Sabtu).
 * @param {string} employeeName - Nama karyawan.
 * @returns {Array<{date: string, employee: string}>} - Daftar hari libur.
 */
const calculateRotatingHolidays = (startDate, endDate, initialDayIndex, employeeName) => {
    const holidays = [];

    // Tentukan tanggal awal yang benar untuk memulai perhitungan minggu (misal: 1 Januari tahun ini)
    // Untuk konsistensi, kita mulai perhitungan dari awal tahun yang sama.
    const rotationStartDate = startOfWeek(startOfMonth(startDate), { weekStartsOn: 1 });
    const initialWeekNumber = getISOWeek(rotationStartDate);

    let currentWeekStart = rotationStartDate;

    // Iterasi melalui setiap minggu dalam rentang waktu yang relevan
    while (currentWeekStart <= endDate) {
        // 1. Hitung selisih minggu (N) dari minggu awal
        const currentWeekNumber = getISOWeek(currentWeekStart);
        // Hitung perbedaan minggu, dengan penanganan transisi tahun (misal minggu 52 ke minggu 1)
        const weekDifference = (currentWeekNumber - initialWeekNumber + 52) % 52;

        // 2. Rumus Rotasi: (Indeks Hari Libur Awal + Nomor Minggu) mod 7
        // Catatan: Modulus 7 mengurus rotasi dari Minggu kembali ke Senin
        const rotatedDayIndex = (initialDayIndex + weekDifference) % 7;

        // 3. Dapatkan Hari Libur yang Dihitung
        // setDay() mengatur tanggal ke hari tertentu dari minggu yang sama (0=Min, 6=Sab)
        const holidayDay = setDay(currentWeekStart, rotatedDayIndex);

        // 4. Hanya masukkan ke daftar jika berada dalam rentang bulan yang diminta
        if (holidayDay >= startDate && holidayDay <= endDate) {
            holidays.push({
                date: format(holidayDay, "yyyy-MM-dd"),
                employee: employeeName,
            });
        }

        // Pindah ke awal minggu berikutnya
        currentWeekStart = addDays(currentWeekStart, 7);
    }

    return holidays;
};

// --- 3. Komponen Utama Kalender ---

const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function SimpleLeaveCalendar() {
    // Atur tanggal awal (misal: hari ini)
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // Hitung rentang 3 bulan (bulan sebelumnya, bulan saat ini, dan bulan berikutnya) untuk memastikan semua hari libur yang relevan dihitung.
    const calculationStart = subMonths(monthStart, 1);
    const calculationEnd = addMonths(monthEnd, 1);

    // --- Hitung Semua Jadwal Libur ---
    const calculatedHolidays = EMPLOYEE_SCHEDULES.flatMap((schedule) =>
        calculateRotatingHolidays(calculationStart, calculationEnd, schedule.initialDay, schedule.name)
    );

    // --- Logika Grid Kalender yang Akurat ---
    const startDayOfWeek = getDay(monthStart);
    const startDisplayDate = subDays(monthStart, startDayOfWeek);
    const totalDaysToShow = 42;
    const endDisplayDate = addDays(startDisplayDate, totalDaysToShow - 1);
    const daysInGrid = eachDayOfInterval({
        start: startDisplayDate,
        end: endDisplayDate,
    });

    // --- Fungsi Data dan Navigasi ---

    const getEmployeeOnLeave = (day) => {
        const formattedDay = format(day, "yyyy-MM-dd");
        const leave = calculatedHolidays.find((item) => item.date === formattedDay);
        return leave ? leave.employee : null;
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // --- Tampilan Render ---
    return (
        <div className="max-w-4xl mx-auto p-4 border rounded-lg shadow-lg bg-white">
            {/* Header Kalender */}
            <div className="flex justify-between items-center mb-4 border-b pb-3">
                <button onClick={prevMonth} className="p-2 border rounded-full hover:bg-gray-100 transition duration-150">
                    &lt;
                </button>
                <h2 className="text-2xl font-extrabold text-gray-800">{format(currentDate, "MMMM yyyy")}</h2>
                <button onClick={nextMonth} className="p-2 border rounded-full hover:bg-gray-100 transition duration-150">
                    &gt;
                </button>
            </div>

            {/* Grid Kalender */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {/* Nama Hari */}
                {daysOfWeek.map((day) => (
                    <div key={day} className="font-semibold text-sm py-2 bg-blue-100 text-blue-800 rounded-sm">
                        {day}
                    </div>
                ))}

                {/* Tanggal dan Data Libur */}
                {daysInGrid.map((day, index) => {
                    const employeeName = getEmployeeOnLeave(day);
                    const isToday = isSameDay(day, new Date());

                    let dayClasses = "p-2 border min-h-24 flex flex-col justify-start items-center relative transition duration-150";

                    // Styling untuk tanggal yang BUKAN di bulan ini
                    if (!isSameMonth(day, currentDate)) {
                        dayClasses += " text-gray-400 bg-gray-50";
                    }

                    // Styling untuk tanggal hari ini
                    if (isToday && isSameMonth(day, currentDate)) {
                        dayClasses += " border-2 border-red-500 bg-red-50 font-bold";
                    }

                    // Styling untuk tanggal libur
                    if (employeeName) {
                        dayClasses += " bg-red-100";
                    }

                    return (
                        <div key={index} className={dayClasses}>
                            {/* Nomor Tanggal */}
                            <span className="text-sm font-medium self-start">{format(day, "d")}</span>

                            {/* Tempat Menampilkan Nama Karyawan Libur */}
                            {employeeName && (
                                <div className="mt-1 text-xs text-white bg-red-600 rounded-full px-2 py-0.5 max-w-full truncate" title={employeeName}>
                                    {employeeName.split(" ")[0]} {/* Tampilkan hanya nama depan */}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
