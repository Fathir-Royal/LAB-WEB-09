const readline = require("readline");

function tebakAngka() {
    // Membuat interface readline
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Komputer memilih angka random antara 1-100
    let target = Math.ceil(Math.random() * 100);
    // Menghitung jumlah percobaan
    let attempts = 0;

    // Fungsi untuk menanyakan tebakan
    function ask() {
        rl.question("Masukkan salah satu dari angka 1 sampai 100: ", (input) => {
            // Ubah input ke integer
            let guess = parseInt(input);

            // Validasi input harus angka 1-100
            if (isNaN(guess) || guess < 1 || guess > 100) {
                console.log("Input tidak valid! Masukkan angka antara 1-100.");
                ask(); // Ulangi pertanyaan
                return;
            }

            // Tambah jumlah percobaan
            attempts++;

            // Cek tebakan
            if (guess > target) {
                console.log("Terlalu tinggi! Coba lagi.");
                ask(); // Ulangi
            } else if (guess < target) {
                console.log("Terlalu rendah! Coba lagi.");
                ask(); // Ulangi
            } else {
                // Jika benar
                console.log(`Selamat! kamu berhasil menebak angka ${target} dengan benar.`);
                console.log(`Sebanyak ${attempts}x percobaan.`);
                rl.close();
            }
        });
    }

    // Mulai permainan
    ask();
}
tebakAngka();