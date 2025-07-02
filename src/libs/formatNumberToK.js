export function formatNumberToK(num) {
    const absNum = Math.abs(num);
    let formatted;

    const format = (n, suffix) => {
        return (
            n
                .toFixed(2)
                .replace(/(\.\d*[1-9])0+$|\.0+$/, "$1") // hilangkan .0/.00
                .replace(".", ",") + suffix // ganti titik ke koma
        );
    };

    if (absNum >= 1_000_000_000) {
        formatted = format(absNum / 1_000_000_000, "B");
    } else if (absNum >= 1_000_000) {
        formatted = format(absNum / 1_000_000, "M");
    } else if (absNum >= 1_000) {
        formatted = format(absNum / 1_000, "K");
    } else {
        formatted = absNum.toString().replace(".", ",");
    }

    return num < 0 ? `-${formatted}` : formatted;
}
