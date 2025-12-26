# Role-Based Access Control (RBAC) System

Dokumentasi sistem kontrol akses berdasarkan peran (Role-Based Access Control) untuk sistem warehouse.

## Daftar Isi
1. [Deskripsi Sistem](#deskripsi-sistem)
2. [Role yang Tersedia](#role-yang-tersedia)
3. [Akses Berdasarkan Role](#akses-berdasarkan-role)
4. [Implementasi Teknis](#implementasi-teknis)
5. [Komponen yang Digunakan](#komponen-yang-digunakan)

## Deskripsi Sistem

Sistem ini mengimplementasikan kontrol akses berdasarkan peran pengguna (Role-Based Access Control/RBAC) untuk membatasi akses ke fitur-fitur tertentu dalam aplikasi warehouse. Sistem ini memungkinkan pembatasan akses berdasarkan tiga peran utama: admin, manager, dan user.

## Role yang Tersedia

### 1. Admin
- Akses penuh ke semua fitur dan halaman
- Dapat mengedit inventory
- Dapat mengakses semua laporan dan statistik

### 2. Manager
- Hampir sama dengan admin
- Tidak dapat mengakses halaman `/admin/edit-inventory` dan `/edit-inventory`
- Dapat mengakses sebagian besar fitur admin kecuali edit inventory

### 3. User
- Bisa mengakses halaman utama (dashboard, inbound, outbound, inventory, dan history) tanpa login
- Setelah login, bisa mengakses halaman `/admin/dashboard` dan `/admin/rack-status`
- Di halaman admin, tidak bisa mengakses edit-product, edit-inventory, dan statistik
- Tidak bisa mengakses halaman admin lainnya selain `/admin/dashboard` dan `/admin/rack-status`

## Akses Berdasarkan Role

### Halaman yang Dibatasi
- **Edit Inventory (`/admin/edit-inventory`, `/edit-inventory`)**: Hanya dapat diakses oleh admin
- **Halaman Admin Lainnya**: Bisa diakses oleh admin dan manager, tetapi tidak oleh user
- **Dashboard Utama (`/`)**: Dapat diakses oleh semua role
- **Inventory (`/inventory`)**: Dapat diakses oleh semua role
- **Status Rak (`/admin/rack-status`)**: Dapat diakses oleh semua role

### Hak Akses Lainnya
- **Inbound/Outbound/History**: Hanya dapat diakses oleh admin dan manager
- **Edit Product**: Hanya dapat diakses oleh admin dan manager
- **Statistik**: Hanya dapat diakses oleh admin dan manager

## Implementasi Teknis

### Middleware
Middleware di `middleware.ts` digunakan untuk melindungi rute berdasarkan role:
- Mengecek apakah pengguna sudah login
- Mengecek role pengguna dari cookie
- Membatasi akses ke rute tertentu berdasarkan role

### Cookie
Sistem menyimpan informasi role di cookie `userRole` saat login:
- Diset saat login di `/api/auth/login`
- Dihapus saat logout di `/api/auth/logout`
- Digunakan oleh middleware untuk menentukan akses

### Proteksi Halaman
Beberapa halaman menggunakan komponen `RoleProtected` untuk menampilkan konten berdasarkan role pengguna.

## Komponen yang Digunakan

### RoleProtected
Komponen ini digunakan untuk melindungi bagian-bagian UI berdasarkan role pengguna:
```jsx
<RoleProtected allowedRoles={['admin']} fallback={<div>Akses ditolak</div>}>
  {/* Konten yang hanya bisa diakses admin */}
</RoleProtected>
```

### withRoleProtection
Komponen HOC yang dapat digunakan untuk melindungi seluruh halaman berdasarkan role:
```jsx
export default withRoleProtection(YourComponent, {
  allowedRoles: ['admin', 'manager'],
  redirectPath: '/'
});
```

### useAuth Hook
Hook ini menyediakan informasi tentang status login dan role pengguna:
```jsx
const { user, loading, isLoggedIn } = useAuth();
```

## Catatan Penting

1. Sistem bergantung pada keberadaan field `role` di tabel `users` di database
2. Middleware akan otomatis mengarahkan pengguna ke halaman login jika belum login
3. Middleware akan mengarahkan pengguna ke halaman yang sesuai jika tidak memiliki akses
4. Cookie role disimpan secara aman dengan atribut httpOnly dan secure