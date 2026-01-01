# 🏥 Decentralized EHR Blockchain System

Sistem Manajemen Hak Akses Rekam Medis Elektronik (EHR) berbasis Blockchain menggunakan **Hardhat**, **Next.js**, dan **Smart Contracts (Solidity)**. Proyek ini memungkinkan Pasien memiliki kontrol penuh atas siapa yang dapat mengakses data medis mereka, serta mencatat setiap akses secara transparan di Blockchain.

---

## 🛠 Tech Stack

- Blockchain: Ethereum (Localhost / Hardhat Network)

- Smart Contract: Solidity ^0.8.19

- Backend Framework: Hardhat v2 (Stable)

- Frontend: Next.js 14 (App Router), Tailwind CSS

- Web3 Libraries: Wagmi, Viem, RainbowKit

## 📋 Prasyarat

Sebelum memulai, pastikan komputer Anda sudah terinstal:

1. Node.js (Versi 18 atau terbaru)

2. Git

3. MetaMask Extension di Browser

## 🚀 Panduan Instalasi (Step-by-Step)

Ikuti langkah-langkah ini secara berurutan. Anda akan membutuhkan **3 Terminal** yang berjalan bersamaan.

### 1. Setup Backend (Smart Contract)

Buka **Terminal 1**, clone repository ini (atau masuk ke folder root project):

```bash
# Masuk ke folder root proyek
cd ehr-blockchain-project

# Install dependencies untuk Hardhat
npm install

# (Opsional) Jika terjadi error dependensi, gunakan perintah ini:
npm install --save-dev hardhat@^2.28.0 @nomicfoundation/hardhat-toolbox@^5.0.0 --legacy-peer-deps
```


Compile Smart Contract untuk memastikan tidak ada error:

```bash
npx hardhat compile
```


### 2. Menjalankan Blockchain Lokal

Di **Terminal 1** yang sama, jalankan node lokal. Terminal ini **JANGAN DITUTUP** selama pengembangan.

```bash
npx hardhat node
```


> **Catatan:** Terminal ini akan menampilkan daftar 20 Akun Test beserta **Private Key**-nya. Simpan Private Key ini untuk login ke MetaMask nanti.

### 3. Deploy Contract & Seeding Data

Buka **Terminal 2** (Terminal baru), lalu jalankan script untuk deploy kontrak dan mengisi data dummy awal:

```bash
npx hardhat run scripts/seed_dummy_data.js --network localhost
```


Setelah perintah ini selesai, **salin Address Contract** yang muncul di terminal (Contoh: `0x5FbDB...`).

### 4. Setup Frontend

Buka **Terminal 3** (Terminal baru), lalu masuk ke folder frontend:

```bash
cd frontend

# Install dependencies frontend
npm install
```


**Konfigurasi Address Kontrak:**

Buka file `frontend/src/utils/constants.js`.

Ganti nilai `CONTRACT_ADDRESS` dengan address yang baru saja Anda salin dari langkah 3.

Jalankan server website:

```bash
npm run dev
```


Buka browser dan akses: `http://localhost:3000`

## 🦊 Konfigurasi MetaMask

Agar browser bisa berkomunikasi dengan blockchain lokal, Anda perlu mengatur MetaMask.

### 1. Tambah Jaringan Localhost

1. Buka MetaMask -> Klik ikon Network di kiri atas -> **Add network**.

2. Pilih **Add a network manually** (di bagian bawah).

3. Isi data berikut:

    - **Network Name:** `Hardhat Localhost`

    - **New RPC URL:** `http://127.0.0.1:8545`

    - **Chain ID:** `31337`

    - **Currency Symbol:** `ETH`

4. Klik **Save** dan ganti jaringan ke **Hardhat Localhost**.

### 2. Import Akun Test

1. Lihat **Terminal 1** (`npx hardhat node`).

2. Salin **Private Key** dari `Account #0` (Untuk Dokter) dan `Account #1` (Untuk Pasien).

    - Jangan salin Address-nya, tapi Private Key-nya.

3. Di MetaMask: Klik ikon Profil (bulat) -> **Import Account**.

4. Tempel Private Key -> Klik **Import**.

> ⚠️ **PENTING: Mengatasi Error "Nonce too high" / JSON-RPC Error** 
> Setiap kali Anda me-restart npx hardhat node, history blockchain akan terhapus, tetapi MetaMask masih mengingat history lama.
> Jika transaksi gagal, lakukan ini:
>
> 1. Buka MetaMask -> Settings.
>
> 2. Masuk ke Advanced.
>
> 3. Klik Clear activity tab data (Ini hanya mereset history transaksi lokal, saldo aman).

## 🧪 Cara Menggunakan Aplikasi

### Skenario 1: Dokter Input Data

1. Login MetaMask menggunakan Akun Dokter (misal Account #0).

2. Di Web, masuk tab Portal Dokter.

3. Isi Address Pasien, Tipe Penyakit, dan CID.

4. Klik Submit & Konfirmasi di MetaMask.

### Skenario 2: Pasien Memberi Akses

1. Login MetaMask menggunakan Akun Pasien (misal Account #1).

2. Di Web, masuk tab Portal Pasien.

3. Masukkan ID Record (misal: 1) dan Address Dokter tujuan.

4. Klik Berikan Izin & Konfirmasi.

### Skenario 3: Dokter Melihat Data

1. Login kembali sebagai Dokter.

2. Di tab Portal Dokter (bawah), masukkan ID Record.

3. Klik Cek Akses & Data. Data akan muncul jika izin valid.

## 📂 Struktur Folder

```bash
ehr-blockchain-project/
├── contracts/          # File Solidity (MedicalAccess.sol)
├── scripts/            # Script deploy & simulasi data
├── frontend/           # Aplikasi Next.js
│   └── src/
│        ├── app/       # Pages & Layout
│        └── utils/     # ABI & Constants
└── hardhat.config.js   # Konfigurasi Blockchain
```

