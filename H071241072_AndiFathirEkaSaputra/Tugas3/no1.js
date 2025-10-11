function countEvenNumbers(start, end) {
    // Mengecek apakah parameter yang dimasukkan adalah angka
    if (isNaN(start) || isNaN(end)) {
        throw new Error("Input harus berupa angka!");
    }

    // Menyimpan bilangan genap dalam array
    let evens = [];

    // Melakukan perulangan dari start sampai end
    for (let i = start; i <= end; i++) {
        // Mengecek apakah i genap
        if (i % 2 === 0) {
            // Jika genap, masukkan ke array evens
            evens.push(i);
        }
    }

    // Mengembalikan jumlah bilangan genap dan daftar angkanya
    return `${evens.length} [${evens.join(", ")}]`;
}

// Contoh penggunaan sesuai soal
console.log(countEvenNumbers(1, 10)); 