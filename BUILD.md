# Build with Obfuscator

## Setup

Install dependencies terlebih dahulu:

```bash
npm install
```

## Build Commands

### Development Build (No Obfuscation)
```bash
npm run dev
```

### Production Build (With Obfuscation)
```bash
npm run build
```

File hasil build akan ada di folder `dist/` dengan code yang sudah di-obfuscate dan minify.

**Output files:**
- `dist/assets/index.min.js` - Main obfuscated & minified JavaScript (with copyright banner)
- `dist/assets/*.min.js` - Chunk files (jika ada code splitting)
- `dist/assets/style.min.css` - Minified CSS (with copyright banner)
- `dist/index.html` - HTML file
- `dist/assets/*` - Asset files (images, fonts, etc.)

**Copyright Banner:**
Setiap file JS dan CSS akan memiliki header comment berisi:
- Nama project dan deskripsi
- Version number
- Copyright dan license information
- Repository URL
- Build date dan tools yang digunakan

**Customize Banner:**
Untuk mengubah informasi banner:
1. Edit `package.json` - Update `name`, `version`, `author`, `repository.url`
2. Edit `vite.config.ts` - Customize banner text sesuai kebutuhan

## Obfuscator Features

- **String Encryption**: String di-encode dengan base64
- **Control Flow Flattening**: Alur code diubah jadi lebih rumit
- **Dead Code Injection**: Menambahkan code palsu yang tidak dijalankan
- **Self Defending**: Proteksi terhadap code beautifier
- **Console Output Disabled**: Menghapus semua `console.log()`
- **Variable Name Obfuscation**: Nama variable diubah jadi hexadecimal

## Konfigurasi

Edit `vite.config.ts` untuk mengubah level obfuscation. Opsi yang bisa diatur:

- `compact`: Code jadi satu baris
- `controlFlowFlatteningThreshold`: 0-1, semakin tinggi semakin rumit (default: 0.75)
- `stringArrayThreshold`: 0-1, persentase string yang di-encrypt (default: 0.75)
- `selfDefending`: Proteksi anti-debug (default: true)

**Note**: Obfuscation akan membuat file size sedikit lebih besar dan performance sedikit menurun, tapi code jadi sangat sulit dibaca.
