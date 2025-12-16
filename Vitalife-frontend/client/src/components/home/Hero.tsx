import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative h-[600px] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1920&h=600&fit=crop"
                    alt="Healthy lifestyle"
                    className="w-full h-full object-cover"
                />
                {/* Semi-transparent overlay */}
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* Content */}
            <div className="relative h-full container mx-auto px-4 flex items-center justify-center">
                <div className="max-w-4xl text-center text-white">
                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                        Nutrición Científica,
                        <br />
                        <span className="text-green-400">Calidez Humana</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-2xl mx-auto font-light">
                        Bienvenido a Vitalife, tu espacio de transformación en Veracruz.
                    </p>

                    {/* CTA Buttons - Modern rounded-full design */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-full bg-green-600 text-white hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                            Ver Productos
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-full bg-white/20 text-white border-2 border-white/50 hover:bg-white/30 backdrop-blur-sm transition-all duration-300">
                            Evaluación Gratis
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
