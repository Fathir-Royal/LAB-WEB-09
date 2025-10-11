const readline = require("readline");

// Fungsi utama untuk menghitung diskon
function diskonBarang() {
    // Membuat interface readline untuk input/output
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Pertanyaan pertama: harga barang
    rl.question("Masukkan harga barang: ", (hargaInput) => {
        // Mengubah input menjadi angka
        let harga = parseFloat(hargaInput);

        // Validasi jika bukan angka atau <= 0
        if (isNaN(harga) || harga <= 0) {
            console.log("Input harga tidak valid!");
            rl.close(); // Menutup input
            return;
        }

        // Pertanyaan kedua: jenis barang
        rl.question("Masukkan jenis barang (Elektronik, Pakaian, Makanan, Lainnya): ", (jenis) => {
            let diskon = 0; // Inisialisasi diskon

            // Menentukan diskon berdasarkan jenis barang (case insensitive)
            switch (jenis.toLowerCase()) {
                case "elektronik": diskon = 0.10; break;
                case "pakaian": diskon = 0.20; break;
                case "makanan": diskon = 0.05; break;
                case "lainnya": diskon = 0.0; break;
                default:
                    // Jika jenis barang tidak dikenali
                    console.log("Jenis barang tidak valid!");
                    rl.close();
                    return;
            }

            // Menghitung potongan harga
            let potongan = harga * diskon;
            // Menghitung harga setelah diskon
            let total = harga - potongan;

            // Menampilkan hasil sesuai format soal
            console.log(`Harga awal: Rp ${harga}`);
            console.log(`Diskon: ${diskon * 100}%`);
            console.log(`Harga setelah diskon: Rp ${total}`);

            rl.close(); // Menutup input
        });
    });
}
diskonBarang();