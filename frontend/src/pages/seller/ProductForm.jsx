/**
 * Product Add/Edit Form for Sellers
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { createProduct, updateProduct, getProductById } from '../../api/productApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORIES = ['Home Textiles', 'Apparel', 'Surplus Materials'];
const SUB_CATEGORIES = {
  'Home Textiles': ['Placemats', 'Table Runners', 'Cushion Covers', 'Quilts', 'Curtains'],
  'Apparel': ['Shirts', 'Trousers', 'Kurtas', 'Sarees', 'Ready-made Garments'],
  'Surplus Materials': ['Threads', 'Fabric Remnants', 'Excess Materials', 'Raw Fabric'],
};

const defaultForm = {
  name: '', description: '', category: 'Home Textiles', subCategory: '',
  price: '', discountedPrice: '', moq: '10', unit: 'pieces',
  stockType: 'Regular', countInStock: '',
  isFeatured: false, isSurplusDeal: false,
  specifications: { material: '', dimensions: '', weight: '', color: '', washCare: '', origin: 'India' },
  tags: '',
};

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [images, setImages] = useState([]); // New files to upload
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      getProductById(id).then(({ data }) => {
        const p = data.product;
        setForm({
          name: p.name, description: p.description,
          category: p.category, subCategory: p.subCategory || '',
          price: p.price, discountedPrice: p.discountedPrice || '',
          moq: p.moq, unit: p.unit,
          stockType: p.stockType, countInStock: p.countInStock,
          isFeatured: p.isFeatured, isSurplusDeal: p.isSurplusDeal,
          specifications: p.specifications || defaultForm.specifications,
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
        });
        setExistingImages(p.images || []);
      }).finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const change = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const changeSpec = (field, value) => setForm((p) => ({ ...p, specifications: { ...p.specifications, [field]: value } }));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'specifications') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      images.forEach((img) => formData.append('images', img));

      if (isEdit) {
        await updateProduct(id, formData);
        toast.success('Product updated!');
      } else {
        await createProduct(formData);
        toast.success('Product created!');
      }
      navigate('/seller/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner text="Loading product..." />;

  return (
    <div className="page-wrapper">
      <div className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="section-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Product Name *</label>
                  <input className="input" value={form.name} onChange={(e) => change('name', e.target.value)} required placeholder="e.g., Premium Cotton Placemats Set" />
                </div>
                <div>
                  <label className="label">Description *</label>
                  <textarea className="input min-h-[100px] resize-y" value={form.description} onChange={(e) => change('description', e.target.value)} required placeholder="Describe your product in detail..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Category *</label>
                    <select className="input" value={form.category} onChange={(e) => change('category', e.target.value)}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Sub-Category</label>
                    <select className="input" value={form.subCategory} onChange={(e) => change('subCategory', e.target.value)}>
                      <option value="">Select sub-category</option>
                      {(SUB_CATEGORIES[form.category] || []).map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Pricing & Stock</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Price (₹) *</label>
                  <input className="input" type="number" min="0" value={form.price} onChange={(e) => change('price', e.target.value)} required placeholder="500" />
                </div>
                <div>
                  <label className="label">Discounted Price (₹)</label>
                  <input className="input" type="number" min="0" value={form.discountedPrice} onChange={(e) => change('discountedPrice', e.target.value)} placeholder="Leave empty if no discount" />
                </div>
                <div>
                  <label className="label">MOQ *</label>
                  <input className="input" type="number" min="1" value={form.moq} onChange={(e) => change('moq', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <select className="input" value={form.unit} onChange={(e) => change('unit', e.target.value)}>
                    {['pieces', 'meters', 'kg', 'dozen', 'set'].map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Stock Count *</label>
                  <input className="input" type="number" min="0" value={form.countInStock} onChange={(e) => change('countInStock', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Stock Type *</label>
                  <select className="input" value={form.stockType} onChange={(e) => change('stockType', e.target.value)}>
                    <option>Regular</option>
                    <option>Surplus</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-6 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => change('isFeatured', e.target.checked)} className="accent-primary-600 w-4 h-4" />
                  <span className="text-sm font-medium">Mark as Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isSurplusDeal} onChange={(e) => change('isSurplusDeal', e.target.checked)} className="accent-amber-500 w-4 h-4" />
                  <span className="text-sm font-medium">Mark as Surplus Deal 🔥</span>
                </label>
              </div>
            </div>

            {/* Images */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Product Images (Max 5)</h3>
              {existingImages.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {existingImages.map((img, i) => (
                    <img key={i} src={img.url} className="w-16 h-16 object-cover rounded-lg border border-gray-200" alt="" />
                  ))}
                </div>
              )}
              <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                <FiUpload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload images</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB each</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
              {images.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(img)} className="w-16 h-16 object-cover rounded-lg" alt="" />
                      <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specs */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(form.specifications).map(([key, val]) => (
                  <div key={key}>
                    <label className="label capitalize">{key}</label>
                    <input className="input" value={val} onChange={(e) => changeSpec(key, e.target.value)} placeholder={`e.g., ${key === 'material' ? '100% Cotton' : key === 'dimensions' ? '45cm x 30cm' : key}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="card p-6">
              <label className="label">Tags (comma-separated)</label>
              <input className="input" value={form.tags} onChange={(e) => change('tags', e.target.value)} placeholder="placemats, cotton, home textiles, bulk" />
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/seller/dashboard')} className="btn-outline">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 flex-1 justify-center py-3">
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : (
                  isEdit ? 'Update Product' : 'Create Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
