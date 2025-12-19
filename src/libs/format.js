import { differenceInDays, differenceInMinutes, formatDistanceToNow, getMonth, getYear, parse } from "date-fns";

/**
 * Format angka dengan separator ribuan.
 * @param {number} value
 * @returns {string}
 */
export const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(value);
};

/**
 * Format angka menjadi format mata uang Rupiah.
 * @param {number} value
 * @returns {string}
 */
export const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Format tanggal ke format 'DD/MM/YYYY'.
 * @param {Date | string} date
 * @returns {string}
 */
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID");
};

/**
 * Format tanggal ke format 'DD MMMM YYYY'.
 * @param {Date | string} date
 * @returns {string}
 */
export const formatLongDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

/**
 * Format tanggal dan jam ke format 'DD/MM/YYYY, HH:mm:ss'.
 * @param {Date | string} date
 * @returns {string}
 */
export const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false, // Use 12-hour format; set to false for 24-hour format
        timeZone: "Asia/Jakarta",
    });
};

export const todayDate = () => {
    const now = new Date();

    // Fungsi untuk memastikan angka memiliki dua digit (misal: 5 menjadi 05)
    const pad = (n) => `0${n}`.slice(-2);

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1); // getMonth() dimulai dari 0
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());

    return `${year}-${month}-${day}`;
};

export const TimeAgo = ({ timestamp }) => {
    return <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>;
};

export function formatNumberToK(num) {
    const absNum = Math.abs(num); // Ambil angka absolut (tanpa minus) untuk perhitungan
    let formatted;

    if (absNum >= 1_000_000_000) {
        formatted = (absNum / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    } else if (absNum >= 1_000_000) {
        formatted = (absNum / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    } else if (absNum >= 1_000) {
        formatted = (absNum / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    } else {
        formatted = absNum.toString(); // Di bawah 1000, tampilkan angka apa adanya
    }

    // Tambahkan minus jika angka awalnya negatif
    return num < 0 ? `-${formatted}` : formatted;
}

export function formatDuration(toDate = new Date(), fromDate) {
    const days = differenceInDays(toDate, new Date(fromDate));

    if (days < 7) {
        return `${days} Day${days > 1 ? "s" : ""}`;
    } else if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks} Week${weeks > 1 ? "s" : ""}`;
    } else if (days < 365) {
        const months = Math.floor(days / 30);
        return `${months} Bln ${days % 30} Hr`;
    } else {
        const years = Math.floor(days / 365);
        return `${years} Year${years > 1 ? "s" : ""}`;
    }
}

export const DateTimeNow = () => {
    const timeZone = "Asia/Jakarta";

    const now = new Date(
        new Intl.DateTimeFormat("en-US", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).format(new Date())
    );

    const pad = (n) => n.toString().padStart(2, "0");

    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const thisMonth = now.getMonth() + 1;
    const lastMonth = `${now.getFullYear()}-${pad(now.getMonth())}-01T00:00`;
    const thisYear = now.getFullYear();
    const lastYear = `${now.getFullYear() - 1}-01-01T00:00`;

    const thisTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    return {
        today,
        thisMonth,
        lastMonth,
        thisYear,
        lastYear,
        thisTime,
    };
};

export const formatDurationTime = (to, from) => {
    const diffMs = new Date(to) - new Date(from); // selisih dalam milidetik
    const totalSeconds = Math.floor(diffMs / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
};

export const calculateFee = (amount, chunkSize = 2500000, feePerChunk = 5000, minFee = 3000, minAmount = 100000) => {
    if (amount < 10000 || amount === "") {
        return "";
    }

    if (amount < minAmount) {
        return minFee;
    }

    const chunkCount = Math.ceil(amount / chunkSize);
    return chunkCount * feePerChunk;
};

export const formatTime = (time) => {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${hours}:${minutes}:${seconds}`;
};

export function diffTimeHuman(t1, t2) {
    const time1 = parse(t1, "HH:mm:ss", new Date());
    const time2 = parse(t2, "HH:mm:ss", new Date());

    const diff = differenceInMinutes(time2, time1);
    if (diff < 0) {
        return "";
    }
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    if (hours === 0) {
        return `${minutes} menit`;
    } else if (minutes === 0) {
        return `${hours} jam`;
    } else if (hours === 0 && minutes === 0) {
        return "";
    } else {
        return `${hours} jam ${minutes} menit`;
    }
}

export function getMonthYear(monthNumber, year) {
    const date = new Date(year, monthNumber - 1);
    // date.setMonth(monthNumber - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
}

export function getDay(date, weekday) {
    if (!weekday) {
        return new Date(date).getDate();
    }
}

export function formatDateTimeColumn(date) {
    const d = new Date(date);

    const day = d.getDate();
    const shortMonth = d.toLocaleString("default", { month: "short" });
    const month = d.toLocaleString("default", { month: "long" });
    const shortYear = d.getFullYear().toString().slice(-2);
    const hours = d.getHours();
    const minutes = d.getMinutes();

    return (
        <div className="flex flex-col items-center">
            <span className="font-bold text-xl">{day}</span>
            <span className="text-xs">
                {shortMonth} {shortYear}
            </span>
        </div>
    );
}
