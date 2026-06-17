import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {}
      <div
        className="h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071')"
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            EcoSwap
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-10">
            Compra, vende y dale una segunda vida a tus artículos favoritos
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/products')}
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl text-xl font-semibold transition"
            >
              Ver Catálogo
            </button>

            <button
              onClick={() => navigate('/create-product')}
              className="bg-white hover:bg-gray-100 text-gray-900 px-10 py-4 rounded-2xl text-xl font-semibold transition"
            >
              Publicar Producto
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Categorías Populares</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Videojuegos",
                image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800",
                desc: "Consolas, juegos retro y ediciones especiales",
                color: "from-blue-600 to-cyan-600"
              },
              {
                name: "Música",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                desc: "Vinilos, CDs, instrumentos y merchandising",
                color: "from-purple-600 to-violet-600"
              },
              {
                name: "Moda",
                image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800",
                desc: "Ropa vintage, sneakers y accesorios únicos",
                color: "from-pink-600 to-rose-600"
              },
              {
                name: "Electrónica",
                image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
                desc: "Móviles, ordenadores, auriculares y gadgets",
                color: "from-amber-600 to-orange-600"
              },
            ].map((cat, i) => (
              <div
                key={i}
                className="group flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/products')}
              >
                <div className="md:w-1/2 h-64 md:h-auto relative">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${cat.color} opacity-40`}></div>
                </div>

                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold mb-3">{cat.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;