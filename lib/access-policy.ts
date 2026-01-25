export type Role =
  | "super_admin"
  | "staf_material"
  | "admin_material"
  | "staf_fg"
  | "admin_fg"
  | "user"

export const ACCESS_POLICY: Record<Role, string[]> = {
 "super_admin": [
    "/admin/edit-inventory",
    "/admin/edit-product",
    "/admin/admin-material/edit-material-bom",
    "/admin/admin-material/edit-material-inventory",
    "/admin/admin-material/material-shipping",
  ],

  "staf_fg": [
    "/admin/edit-product",
  ],

  "admin_fg": [
    "/admin/edit-inventory",
    "/admin/edit-product",
  ],
  "staf_material": [
    "/admin/admin-material/edit-material-bom",
    "/admin/admin-material/material-shipping",
  ],
  "admin_material": [
    "/admin/admin-material/edit-material-bom",
    "/admin/admin-material/edit-material-inventory",
    "/admin/admin-material/material-shipping",
  ],
  "user": [
    
  ],
}
