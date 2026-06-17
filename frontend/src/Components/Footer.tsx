const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    {}
                    <div>
                        <h3 className="text-2xl font-bold text-green-500 mb-4">EcoSwap</h3>
                        <p className="text-gray-400">
                            Plataforma de segunda mano sostenible<br />
                            Compra y vende de forma responsable.
                        </p>
                    </div>

                    {}
                    <div>
                        <h4 className="font-semibold mb-4">Síguenos</h4>
                        <div className="flex gap-6">
                            <a href="#" target="_blank" className="hover:scale-110 transition">
                                <img src="https://cdn-icons-png.flaticon.com/128/145/145802.png" alt="Facebook" className="h-10 w-10" />
                            </a>
                            <a href="#" target="_blank" className="hover:scale-110 transition">
                                <img src="https://cdn-icons-png.flaticon.com/128/3955/3955024.png" alt="Instagram" className="h-10 w-10" />
                            </a>
                            <a href="#" target="_blank" className="hover:scale-110 transition">
                                <img src="https://cdn-icons-png.flaticon.com/128/5969/5969020.png" alt="X" className="h-10 w-10" />
                            </a>
                        </div>
                    </div>

                    {}
                    <div>
                        <h4 className="font-semibold mb-4">Contacto</h4>
                        <div className="text-gray-400 space-y-2">
                            <p>📞 <a href="tel:+34600112233" className="hover:text-white">+34 600 112 233</a></p>
                            <p>✉️ <a href="mailto:info@ecoswap.es" className="hover:text-white">info@ecoswap.es</a></p>
                            <p className="text-sm mt-4">Madrid, España</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
                    © 2026 EcoSwap - Proyecto Intermodular DAW
                </div>
            </div>
        </footer>
    );
};

export default Footer;