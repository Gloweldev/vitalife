import Image from 'next/image';

export function IdentitySection() {
    return (
        <section className="py-20 md:py-32 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Text Content - Left */}
                    <div className="order-2 md:order-1">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Más que batidos,{' '}
                            <span className="text-green-600">somos tu red de apoyo</span>
                        </h2>

                        <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                            <p>
                                En Club Vitalife, fundado por <span className="font-semibold text-gray-900">[Nombre de Mamá]</span>,
                                no solo vendemos productos. Nuestro propósito es guiarte paso a paso.
                            </p>

                            <p>
                                Desde Ixtaczoquitlán, brindamos asesoría personalizada, retos de transformación
                                y una comunidad que celebra cada uno de tus logros.
                            </p>

                            <p className="text-green-700 font-medium italic">
                                "Porque tu transformación no es solo física, es un cambio de vida completo."
                            </p>
                        </div>

                        {/* Stats or Trust Indicators */}
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">500+</div>
                                <div className="text-sm text-gray-600">Clientes Activos</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">5+</div>
                                <div className="text-sm text-gray-600">Años</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">100%</div>
                                <div className="text-sm text-gray-600">Compromiso</div>
                            </div>
                        </div>
                    </div>

                    {/* Image - Right */}
                    <div className="order-1 md:order-2">
                        {/* Coach Photo */}
                        <div className="relative">
                            <div className="relative h-[400px] md:h-[450px] lg:h-[500px] max-h-[500px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop"
                                    alt="Tu Coach Personal"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>

                            {/* Decorative frame border */}
                            <div className="absolute inset-0 border-8 border-white/20 rounded-2xl pointer-events-none"></div>
                        </div>

                        {/* Floating badge */}
                        <div className="relative -mt-8 mx-auto w-11/12 bg-white rounded-xl shadow-xl p-6 text-center">
                            <div className="text-sm text-gray-600 font-medium">Tu Coach Personal</div>
                            <div className="text-2xl font-bold text-green-600 mt-1">Desde Orizaba</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
