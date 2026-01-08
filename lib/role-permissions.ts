// config/role-permissions.ts

export const ROLE_PERMISSIONS = {
  admin: {
    // Akses ke halaman utama
    canAccessPublicPages: true,
    // Akses ke dashboard admin
    canAccessAdminDashboard: true,
    // Akses ke edit product
    canAccessEditProduct: true,
    // Akses ke edit inventory
    canAccessEditInventory: true,
    // Akses ke statistik
    canAccessStatistics: true,
    // Akses ke status rak
    canAccessRackStatus: true,
    // Akses ke halaman lainnya
    canAccessOtherAdminPages: true
  },

  manager: {
    // Akses ke halaman utama
    canAccessPublicPages: true,
    // Akses ke dashboard admin
    canAccessAdminDashboard: true,
    // Akses ke edit product
    canAccessEditProduct: true,
    // Akses ke edit inventory
    canAccessEditInventory: false,
    // Akses ke statistik
    canAccessStatistics: true,
    // Akses ke status rak
    canAccessRackStatus: true,
    // Akses ke halaman lainnya
    canAccessOtherAdminPages: true
  },

  user: {
    // Akses ke halaman utama
    canAccessPublicPages: true,
    // Akses ke dashboard admin
    canAccessAdminDashboard: true,
    // Akses ke edit product
    canAccessEditProduct: false,
    // Akses ke edit inventory
    canAccessEditInventory: false,
    // Akses ke statistik
    canAccessStatistics: false,
    // Akses ke status rak
    canAccessRackStatus: true,
    // Akses ke halaman lainnya
    canAccessOtherAdminPages: false
  }
};

// Daftar halaman publik yang bisa diakses tanpa login
export const PUBLIC_PAGES = [
  '/',
  '/inventory',
  '/inbound',
  '/outbound',
  '/history'
];

// Daftar halaman admin yang terbatas berdasarkan role
export const ADMIN_PAGES = {
  editProduct: '/admin/edit-product',
  editInventory: '/admin/edit-inventory',
  statistics: '/admin/statistics',
  rackStatus: '/admin/rack-status',
  dashboard: '/admin/dashboard'
};