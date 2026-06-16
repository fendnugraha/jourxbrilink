import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { type, message, warehouse } = await request.json();

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

        // 2. Gunakan axios.post (Lebih ringkas, tanpa JSON.stringify)
        await axios.post(telegramUrl, {
            chat_id: chatId,
            text: `🚨 *${type}* 🚨\n\n${message}\n\n📍 *Gudang:* ${warehouse}`,
            parse_mode: "Markdown",
        });

        return NextResponse.json({ success: true, message: "Laporan berhasil dikirim!" });
    } catch (error) {
        // 3. Axios menyimpan detail error dari Telegram di error.response
        const errorMsg = error.response?.data?.description || error.message;
        console.error("Gagal kirim ke Telegram:", errorMsg);

        return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
}
