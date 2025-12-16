import { Button } from '@/components/ui/Button';
import { MessageCircle, Calendar, Sparkles } from 'lucide-react';

export function LeadMagnet() {
    return (
        <section className="py-16 md:py-24 bg-gradient-to-br from-green-600 to-green-800 text-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        ¿Listo para Comenzar Tu Transformación?
                    </h2>

                    <p className="text-lg md:text-xl text-green-50 mb-10 max-w-2xl mx-auto">
                        Agenda una evaluación gratuita conmigo y descubre cómo podemos ayudarte a alcanzar tus objetivos de bienestar.
                    </p>

                    {/* Features */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span>Sin Compromiso</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            <span>100% Gratis</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            <span>Personalizado</span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <a
                        href="https://wa.me/525512345678?text=Hola!%20Me%20interesa%20una%20evaluación%20gratuita"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                    >
                        <Button
                            variant="solid"
                            size="large"
                            className="bg-white text-green-600 hover:bg-gray-100 shadow-xl gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Contáctame por WhatsApp
                        </Button>
                    </a>

                    <p className="mt-6 text-sm text-green-100">
                        Respondo en menos de 24 horas
                    </p>
                </div>
            </div>
        </section>
    );
}
