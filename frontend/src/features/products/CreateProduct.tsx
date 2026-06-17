import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const createProductSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(100, 'El título es demasiado largo'),
  description: z.string().trim().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'El precio debe ser mayor que 0'),
  category: z.string().min(1, 'Debes seleccionar una categoría'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'USED', 'DAMAGED', 'REFURBISHED']),
});

type CreateProductForm = z.infer<typeof createProductSchema>;

const CreateProduct = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema),
    mode: 'onBlur'
  });

  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: CreateProductForm) => {
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('title', data.title);
    formDataToSend.append('description', data.description);
    formDataToSend.append('price', data.price);
    formDataToSend.append('category', data.category);
    formDataToSend.append('condition', data.condition);

    if (image) formDataToSend.append('image', image);

    try {
      await api.post('/api/products', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('¡Producto publicado con éxito!', 'success');
      reset();
      setImage(null);
      setPreview(null);
      navigate('/products');
    } catch (error: unknown) {
      let message = 'Error al publicar el producto';
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as Record<string, unknown>).response;
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as Record<string, unknown>).data;
          if (data && typeof data === 'object' && 'message' in data) {
            message = String(data.message);
          }
        }
      }
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-12 relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2071')" }}
    >
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 w-full max-w-2xl bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-900">Publicar Nuevo Producto</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {}
          {preview && (
            <div className="mb-6">
              <img src={preview} alt="Vista previa" className="w-full max-h-64 object-cover rounded-2xl shadow" />
            </div>
          )}

          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
          />

          <div>
            <input 
              {...register('title')} 
              placeholder="Título del producto *" 
              className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <textarea 
              {...register('description')} 
              placeholder="Descripción detallada *" 
              className="w-full p-4 border border-gray-300 rounded-3xl h-32 focus:outline-none focus:border-green-600"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <select 
                {...register('category')} 
                className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600"
              >
                <option value="">Selecciona categoría *</option>
                <option value="Videojuegos">Videojuegos</option>
                <option value="Música">Música</option>
                <option value="Electrónica">Electrónica</option>
                <option value="Moda">Moda</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <div>
            <select 
              {...register('condition')} 
              className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600"
            >
              <option value="">Estado del producto *</option>
              <option value="NEW">Nuevo</option>
              <option value="LIKE_NEW">Como nuevo</option>
              <option value="USED">Usado</option>
              <option value="DAMAGED">Con desperfectos</option>
              <option value="REFURBISHED">Reacondicionado</option>
            </select>
            {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || loading}
            className="w-full bg-green-600 text-white py-4 rounded-3xl text-xl font-semibold hover:bg-green-700 disabled:opacity-70 transition"
          >
            {isSubmitting || loading ? 'Publicando...' : 'Publicar Producto'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;