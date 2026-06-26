export const SuratPeringatan = ({
    nomorSurat,
    namaKaryawan,
    jabatan,
    tempatTugas,
    keteranganKesalahan,
    jenisPeringatan = "1",
    tanggalTerbit = new Date(),
    namaPenandatangan,
    jabatanPenandatangan,
}) => {
    // Hitung masa berlaku otomatis 3 bulan (90 hari) ke depan
    const tglTerbitObj = new Date(tanggalTerbit);
    const tglBerakhirObj = new Date(tanggalTerbit);
    tglBerakhirObj.setMonth(tglTerbitObj.getMonth() + 3);

    const formatTglIndo = (dateObj) => {
        return dateObj.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="max-w-4xl mx-auto my-8 p-16 bg-white text-black shadow-lg border border-slate-200 font-serif leading-relaxed text-base print:shadow-none print:border-none print:my-0 print:p-0">
            {/* KOP SURAT FORMAL */}
            <div className="text-center border-b-2 border-black pb-3 mb-6">
                <h1 className="text-2xl font-bold tracking-wider font-sans uppercase">THREE KOMUNIKA</h1>
                <p className="text-xs font-sans text-slate-700 mt-1 not-italic">
                    Jalan Kp. Rancaengang RT004 RW008, Des. Rancamulya, Kec. Pameungpeuk, Bandung 40376
                    <br />
                    Telepon: 081280348866 | Email: threekomunika@yahoo.com
                </p>
            </div>

            {/* METADATA SURAT */}
            <div className="mb-6 text-sm font-sans">
                <table className="w-full max-w-sm">
                    <tbody>
                        <tr>
                            <td className="w-20 py-0.5 font-medium">Nomor</td>
                            <td className="w-4 py-0.5">:</td>
                            <td className="py-0.5">{nomorSurat}</td>
                        </tr>
                        <tr>
                            <td className="py-0.5 font-medium">Perihal</td>
                            <td className="py-0.5">:</td>
                            <td className="py-0.5 font-bold">
                                Surat Peringatan {jenisPeringatan} (SP{jenisPeringatan})
                            </td>
                        </tr>
                        <tr>
                            <td className="py-0.5 font-medium">Lampiran</td>
                            <td className="py-0.5">:</td>
                            <td className="py-0.5">-</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* PIHAK YANG DITUJU */}
            <div className="mb-6 text-sm font-sans">
                <p className="font-medium">Kepada Yth.</p>
                <p className="font-bold text-base mt-0.5">{namaKaryawan}</p>
                <table className="w-full max-w-md mt-1">
                    <tbody>
                        <tr>
                            <td className="w-24 py-0.5 text-slate-600">Jabatan</td>
                            <td className="w-4 py-0.5">:</td>
                            <td className="py-0.5 font-medium">{jabatan}</td>
                        </tr>
                        <tr>
                            <td className="py-0.5 text-slate-600">Tempat Tugas</td>
                            <td className="py-0.5">:</td>
                            <td className="py-0.5 font-medium">{tempatTugas}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ISI SURAT */}
            <div className="space-y-4 text-justify text-sm">
                <p>Dengan hormat,</p>

                <p>
                    Berdasarkan hasil pemantauan, evaluasi kinerja, serta rekam kedisiplinan kerja internal di lingkungan <strong>Three Komunika</strong>, kami
                    mendapati adanya tindakan pelanggaran komitmen kerja yang Saudara lakukan, dengan rincian tindakan sebagai berikut:
                </p>

                {/* BLOK DETAIL PELANGGARAN DINAMIS */}
                <div className="bg-slate-50 p-4 border-l-4 border-amber-500 font-sans italic my-4 rounded-r-md print:bg-white print:border-l-2 print:pl-6 text-slate-700 print:text-black">
                    {keteranganKesalahan}
                </div>

                <p>
                    Tindakan tersebut di atas merupakan bentuk pelanggaran nyata terhadap Peraturan Perusahaan mengenai tata tertib dan manajemen waktu
                    kedisiplinan, di mana seluruh karyawan diwajibkan untuk hadir dan membuka unit operasional tepat waktu sesuai dengan ketentuan jam kerja
                    yang telah ditetapkan bersama.
                </p>

                <p>
                    Melalui surat ini, manajemen memberikan sanksi berupa{" "}
                    <strong>
                        Surat Peringatan {jenisPeringatan} (SP{jenisPeringatan})
                    </strong>{" "}
                    sebagai bentuk teguran resmi dan keras. Kami meminta Saudara untuk segera melakukan perbaikan sikap, meningkatkan kedisiplinan, serta
                    mematuhi seluruh regulasi kerja yang berlaku di perusahaan tanpa pengecualian.
                </p>

                <p className="font-semibold">
                    Surat Peringatan ini berlaku efektif selama 3 (tiga) bulan (90 hari) terhitung sejak tanggal diterbitkan, yaitu mulai tanggal{" "}
                    <span className="underline">{formatTglIndo(tglTerbitObj)}</span> sampai dengan tanggal{" "}
                    <span className="underline">{formatTglIndo(tglBerakhirObj)}</span>.
                </p>

                <p>
                    Apabila dalam kurun waktu masa berlaku tersebut Saudara terbukti kembali melakukan kelalaian atau pelanggaran disiplin kerja lainnya, maka
                    perusahaan akan mengambil tindakan tegas berupa pemberian sanksi lanjutan yang lebih berat sesuai dengan regulasi ketenagakerjaan yang
                    berlaku.
                </p>

                <p>
                    Besar harapan kami agar Surat Peringatan ini dijadikan sebagai bahan refleksi dan dorongan positif bagi Saudara untuk menjalankan tugas
                    serta tanggung jawab profesi secara lebih tertib di kemudian hari.
                </p>

                <p className="pt-2">Atas perhatian dan kerja sama yang diberikan, kami ucapkan terima kasih.</p>
            </div>

            {/* BLOK TANDA TANGAN DOUBLE */}
            <div className="mt-16 flex justify-between font-sans text-xs print:mt-24">
                <div className="text-center w-48">
                    <p className="mb-24 text-slate-600">Penerima Peringatan,</p>
                    <p className="font-bold underline uppercase">{namaKaryawan}</p>
                    <p className="text-slate-500 mt-0.5">{jabatan}</p>
                </div>

                <div className="text-center w-56">
                    <p className="text-slate-600 mb-1">Bandung, {formatTglIndo(tglTerbitObj)}</p>
                    <p className="mb-24 font-medium text-slate-800">Three Komunika,</p>
                    <p className="font-bold underline uppercase">{namaPenandatangan}</p>
                    <p className="text-slate-500 mt-0.5">{jabatanPenandatangan}</p>
                </div>
            </div>

            {/* TOMBOL PRINT */}
            <div className="mt-12 text-right print:hidden">
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors duration-200"
                >
                    🖨️ Cetak Surat Resmi
                </button>
            </div>
        </div>
    );
};
