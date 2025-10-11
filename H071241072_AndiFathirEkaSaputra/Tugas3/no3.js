const readline = require("readline");

function hitungHari() {
    // Membuat interface readline
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Array nama hari dalam seminggu (huruf kecil semua)
    const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

    // Pertanyaan pertama: masukkan nama hari
    rl.question("Masukkan hari: ", (hari) => {
        // Cari index hari dalam array
        let index = days.indexOf(hari.toLowerCase());

        // Validasi jika hari tidak ada dalam array
        if (index === -1) {
            console.log("Nama hari tidak valid!");
            rl.close();
            return;
        }

        // Pertanyaan kedua: berapa hari ke depan
        rl.question("Masukkan hari yang akan datang: ", (jumlahInput) => {
            // Ubah input ke integer
            let jumlah = parseInt(jumlahInput);

            // Validasi jika input bukan angka atau negatif
            if (isNaN(jumlah) || jumlah < 0) {
                console.log("Jumlah hari tidak valid!");
                rl.close();
                return;
            }

            // Hitung index hari masa depan
            let futureIndex = (index + jumlah) % 7;
            // Ambil nama hari
            let futureDay = days[futureIndex];

            // Cetak hasil dengan huruf awal kapital
            console.log(`${jumlah} hari setelah ${hari} adalah ${futureDay.charAt(0).toUpperCase() + futureDay.slice(1)}`);

            rl.close();
        });
    });
}
hitungHari();