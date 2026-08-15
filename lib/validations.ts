import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Category ─────────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only",
    ),
  prefix: z.string().min(1).max(3, "Prefix max 3 characters"),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// ─── Brand ────────────────────────────────────────────────────────────────────

export const BrandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/),
  logo: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// ─── Attribute ────────────────────────────────────────────────────────────────

export const AttributeGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unit: z.string().optional(),
  isFilterable: z.boolean().default(true),
  isVariantDefining: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const AttributeValueSchema = z.object({
  groupId: z.string().min(1),
  value: z.string().min(1, "Value is required"),
  sortOrder: z.number().int().default(0),
});

// ─── Product ──────────────────────────────────────────────────────────────────

export const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]).default("DRAFT"),
  condition: z.enum(["NEW", "OPEN_BOX", "REFURBISHED"]).default("NEW"),
  warrantyMonths: z.number().int().min(0).default(12),
  warrantyNote: z.string().optional(),
  useCaseTags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
});

export const ProductVariantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z.number().positive("Price must be positive"),
  salePrice: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  attributeValueIds: z.array(z.string()), // IDs of AttributeValues for this variant
});

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const AddToCartSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().int().min(1).max(99).default(1),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

// ─── Checkout ─────────────────────────────────────────────────────────────────

export const CheckoutSchema = z.object({
  shippingName: z.string().min(2, "Full name is required"),
  shippingPhone: z.string().min(6, "Phone number is required"),
  shippingEmail: z.string().email().optional().or(z.literal("")),
  shippingAddress: z.string().min(5, "Address is required"),
  shippingCity: z.string().min(2, "City is required"),
  shippingZip: z.string().optional(),
  orderNote: z.string().optional(),
  paymentMethod: z.enum(["COD", "MOCK_CARD", "BANK_TRANSFER"]).default("COD"),
  cartId: z.string().optional(), // for guest checkout
});

// ─── Order status update (admin) ──────────────────────────────────────────────

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
  ]),
  note: z.string().optional(),
});

// ─── User Profile ───────────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// ─── Address ───────────────────────────────────────────────────────────────────

export const AddressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(6, "Phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default("US"),
  isDefault: z.boolean().default(true),
});

// ─── Admin User Management ────────────────────────────────────────────────────

export const UpdateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "MANAGER", "CUSTOMER"]),
  isActive: z.boolean(),
});

// ─── Type exports ─────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export type BrandInput = z.infer<typeof BrandSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type ProductVariantInput = z.infer<typeof ProductVariantSchema>;
export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type AddressInput = z.infer<typeof AddressSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
