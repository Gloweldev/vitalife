import { UserCircle, Users, FileText } from 'lucide-react';

export function SupportSection() {
    const services = [
        {
            icon: UserCircle,
            title: 'Seguimiento Personal',
            description: 'No eres un número. Yo personalmente ajustaré tu plan según tus progresos semanales.'
        },
        {
            icon: Users,
            title: 'Comunidad Vitalife',
            description: 'Únete a nuestro grupo exclusivo de motivación y retos diarios.'
        },
        {
            icon: FileText,
            title: 'Producto Genuino',
            description: 'Garantía total de producto sellado y fresco directo de almacén.'
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        La Diferencia Vitalife
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Tu Coach Personal contigo en cada paso
                    </p>
                </div>

                {/* Services Grid - Premium Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div
                                key={index}
                                className="group relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                            >
                                {/* Icon with gradient background */}
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                    <Icon className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {service.title}
                                </h3>

                                <p className="text-gray-600 leading-relaxed text-base">
                                    {service.description}
                                </p>

                                {/* Subtle top accent line */}
                                <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-green-500 to-green-700 rounded-b-full"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
