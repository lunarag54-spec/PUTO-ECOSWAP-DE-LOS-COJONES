import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { API_URL } from '../services/api';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const editProductSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(100, 'El título es demasiado largo'),
  description: z.string().trim().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'El precio debe ser mayor que 0'),
  category: z.string().min(1, 'Debes seleccionar una categoría'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'USED', 'DAMAGED', 'REFURBISHED']),
});

type EditProductForm = z.infer<typeof editProductSchema>;

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditProductForm>({
    resolver: zodResolver(editProductSchema),
    mode: 'onBlur'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        const p = res.data;
        setProduct(p);
        setPreview(p.imageUrl ? `${API_URL}${p.imageUrl}` : null);
        reset({
          title: p.title,
          description: p.description,
          price: p.price.toString(),
          category: p.category,
          condition: p.condition,
        });
      } catch {
        showToast('Error al cargar el producto', 'error');
        navigate('/my-products');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, navigate, showToast, reset]);

  const onSubmit = async (data: EditProductForm) => {
    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('description', data.description);
      formDataToSend.append('price', data.price);
      formDataToSend.append('category', data.category);
      formDataToSend.append('condition', data.condition);

      if (image) {
        formDataToSend.append('image', image);
      }

      await api.put(`/api/products/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Producto actualizado correctamente', 'success');
      navigate('/my-products');
    } catch {
      showToast('Error al actualizar el producto', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando producto...</div>;
  if (!product) return <div className="p-8 text-center">Producto no encontrado</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Editar Producto</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {preview && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2 font-medium">Imagen del producto:</p>
            <img src={preview} alt="Vista previa" className="w-full max-h-64 object-cover rounded-2xl shadow" />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Cambiar imagen (opcional)</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImage(file);
                setPreview(URL.createObjectURL(file));
              }
            }} 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
          />
        </div>
        <div>
          <input
            {...register('title')}
            type="text"
            placeholder="Título *"
            className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <textarea
            {...register('description')}
            placeholder="Descripción *"
            className="w-full p-4 border border-gray-300 rounded-3xl h-32 focus:outline-none focus:border-green-600"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <input
            {...register('price')}
            type="number"
            step="0.01"
            placeholder="Precio (€) *"
            className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <select
              {...register('category')}
              className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600"
            >
              <option value="">Categoría *</option>
              <option value="Videojuegos">Videojuegos</option>
              <option value="Música">Música</option>
              <option value="Electrónica">Electrónica</option>
              <option value="Moda">Moda</option>
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <select
              {...register('condition')}
              className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600"
            >
              <option value="NEW">Nuevo</option>
              <option value="LIKE_NEW">Como nuevo</option>
              <option value="USED">Usado</option>
              <option value="DAMAGED">Con desperfectos</option>
              <option value="REFURBISHED">Reacondicionado</option>
            </select>
            {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 text-white py-4 rounded-3xl text-xl font-semibold hover:bg-green-700 disabled:opacity-70 transition"
        >
          {saving ? 'Guardando cambios...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;