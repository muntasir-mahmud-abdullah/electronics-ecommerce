"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    brandId: "",
    status: "ACTIVE",
    condition: "NEW",
    warrantyMonths: 12,
  });

  // Default Variant
  const [variantData, setVariantData] = useState({
    sku: "",
    price: "",
    salePrice: "",
    stock: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands")
        ]);
        const catData = await catRes.json();
        const brandData = await brandRes.json();
        
        setCategories(catData.categories || []);
        setBrands(brandData.brands || []);
      } catch (err) {
        console.error("Failed to fetch form dependencies", err);
      }
    }
    fetchData();
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let value: string | number = e.target.value;
    if (e.target.name === "slug") {
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    }
    if (e.target.name === "warrantyMonths") {
      value = parseInt(value as string) || 0;
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    if (e.target.name === "stock") {
      value = parseInt(value as string) || 0;
    }
    setVariantData({ ...variantData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        variants: [
          {
            sku: variantData.sku,
            price: parseFloat(variantData.price),
            ...(variantData.salePrice ? { salePrice: parseFloat(variantData.salePrice) } : {}),
            stock: variantData.stock,
            isActive: true,
            attributeValueIds: [], // Skipping dynamic attributes for MVP
          }
        ]
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/products");
      } else {
        setError(data.error || "Failed to create product");
        console.error(data.details);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Flatten categories for dropdown
  const getCategoryOptions = () => {
    const options: any[] = [];
    categories.forEach(cat => {
      options.push({ id: cat.id, name: cat.name });
      cat.children?.forEach((child: any) => {
        options.push({ id: child.id, name: `-- ${child.name}` });
      });
    });
    return options;
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-900">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Create Product</h2>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-200">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        
        {/* Core Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleProductChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 border"
                placeholder="e.g. Sennheiser HD 600"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL friendly)</label>
              <input
                required
                name="slug"
                value={formData.slug}
                onChange={handleProductChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 border"
                placeholder="e.g. sennheiser-hd-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                required
                name="categoryId"
                value={formData.categoryId}
                onChange={handleProductChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 border bg-white"
              >
                <option value="">Select a category</option>
                {getCategoryOptions().map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleProductChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 border bg-white"
              >
                <option value="">No Brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleProductChange}
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleProductChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 border bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleProductChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 border bg-white"
              >
                <option value="NEW">New</option>
                <option value="OPEN_BOX">Open Box</option>
                <option value="REFURBISHED">Refurbished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Default Variant */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Default Variant & Pricing</h3>
            <p className="text-sm text-gray-500">Every product needs at least one base variant for pricing and stock.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                required
                name="sku"
                value={variantData.sku}
                onChange={handleVariantChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 border"
                placeholder="e.g. SEN-HD600-01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                required
                min="0"
                name="stock"
                value={variantData.stock}
                onChange={handleVariantChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                name="price"
                value={variantData.price}
                onChange={handleVariantChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 border"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price ($) - Optional</label>
              <input
                type="number"
                step="0.01"
                name="salePrice"
                value={variantData.salePrice}
                onChange={handleVariantChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 border"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
