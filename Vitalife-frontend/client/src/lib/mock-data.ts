import { Product } from '@/types';

/**
 * Mock product data for Club Vitalife
 * Enhanced V3: Multiple images per product + flavor variants
 * COMPLIANCE: No prices included
 */
export const products: Product[] = [
    {
        id: '1',
        name: 'Batido Nutricional Formula 1',
        category: 'Nutrición',
        images: [
            'https://images.unsplash.com/photo-1622484211783-8c99c9e70a3a?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=800&fit=crop'
        ],
        description: 'Batido nutritivo con 20+ vitaminas y minerales esenciales.',
        shortDescription: 'Batido nutritivo con 20+ vitaminas y minerales esenciales.',
        fullDescription: 'El Batido Nutricional Formula 1 es la base de una nutrición equilibrada. Con una mezcla balanceada de proteínas de alta calidad, carbohidratos saludables y nutrientes esenciales, este batido te ayuda a mantener un estilo de vida activo.\n\nCada porción está diseñada para ser una comida completa y balanceada, proporcionando todos los macro y micronutrientes que tu cuerpo necesita. Disponible en múltiples sabores deliciosos que puedes combinar con frutas frescas.\n\nIdeal para quienes buscan control de peso, nutrición deportiva o simplemente una opción de comida rápida y saludable.',
        benefits: [
            '20+ vitaminas y minerales esenciales',
            'Proteína de alta calidad para mantener masa muscular',
            'Solo 200 calorías por porción',
            'Bajo en azúcar y grasa',
            'Fácil y rápido de preparar',
            'Múltiples sabores disponibles'
        ],
        flavors: ['Vainilla', 'Chocolate', 'Fresa', 'Cookies & Cream', 'Café Latte']
    },
    {
        id: '2',
        name: 'Té Herbal Concentrado',
        category: 'Bienestar',
        images: [
            'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1597318167218-8c2b21b84e25?w=800&h=800&fit=crop'
        ],
        description: 'Energizante natural con extractos botánicos y antioxidantes.',
        shortDescription: 'Energizante natural con extractos botánicos y antioxidantes.',
        fullDescription: 'El Té Herbal Concentrado es tu aliado perfecto para comenzar el día con energía. Formulado con una mezcla única de extractos botánicos, té verde y té negro, proporciona un impulso natural de energía sin los efectos secundarios del exceso de cafeína.\n\nRico en antioxidantes que ayudan a combatir los radicales libres y apoyar tu sistema inmunológico. Su fórmula concentrada significa que una pequeña cantidad rinde mucho, haciendo que cada envase dure más.\n\nDisfrútalo caliente o frío, y experimenta con diferentes sabores para encontrar tu favorito. Perfecto para antes del ejercicio o como reemplazo saludable de bebidas azucaradas.',
        benefits: [
            'Energía natural y sostenida',
            'Rico en antioxidantes',
            'Apoya el metabolismo',
            'Solo 5 calorías por porción',
            'Ayuda a la concentración mental',
            'Fórmula concentrada de alto rendimiento'
        ],
        flavors: ['Original', 'Limón', 'Frambuesa', 'Durazno']
    },
    {
        id: '3',
        name: 'Aloe Vera Concentrado',
        category: 'Bienestar',
        images: [
            'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=800&fit=crop'
        ],
        description: 'Bebida refrescante de aloe vera que apoya la digestión saludable.',
        shortDescription: 'Bebida refrescante de aloe vera que apoya la digestión saludable.',
        fullDescription: 'Nuestro Aloe Vera Concentrado contiene 40% de aloe vera certificado, una de las concentraciones más altas del mercado. El aloe vera ha sido valorado durante siglos por sus propiedades calmantes y su capacidad para apoyar la salud digestiva.\n\nEste refrescante concentrado se mezcla fácilmente con agua para crear una bebida deliciosa que hidrata y nutre desde dentro. La fórmula incluye vitamina C para apoyar tu sistema inmunológico y antioxidantes naturales.\n\nPerfecto para tomar en ayunas por la mañana o después de las comidas. Muchos de nuestros clientes lo describen como su "ritual de bienestar" diario.',
        benefits: [
            '40% de aloe vera certificado',
            'Apoya la digestión saludable',
            'Hidratación profunda',
            'Rico en vitamina C',
            'Propiedades calmantes naturales',
            'Sabor refrescante y agradable'
        ]
    },
    {
        id: '4',
        name: 'Proteína Personalizada',
        category: 'Nutrición',
        images: [
            'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1579722821273-0f6c7d36c2c1?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1622484211783-8c99c9e70a3a?w=800&h=800&fit=crop'
        ],
        description: 'Proteína en polvo premium para construcción muscular y recuperación.',
        shortDescription: 'Proteína en polvo premium para construcción muscular y recuperación.',
        fullDescription: 'La Proteína Personalizada es perfecta para atletas, entusiastas del fitness y cualquiera que busque aumentar su ingesta proteica. Formulada con una mezcla de proteínas de suero y soya de alta calidad, proporciona todos los aminoácidos esenciales que tu cuerpo necesita.\n\nCon 24g de proteína por porción, es ideal para la recuperación post-entrenamiento y la construcción de masa muscular magra. Su fórmula incluye enzimas digestivas para una mejor absorción y menos molestias estomacales.\n\nMézclala con tu batido Formula 1 para una comida completa, o úsala sola después del ejercicio. Disponible en sabores que se mezclan perfectamente con agua, leche o tu bebida favorita.',
        benefits: [
            '24g de proteína de alta calidad por porción',
            'Mezcla de proteínas de suero y soya',
            'Todos los aminoácidos esenciales',
            'Incluye enzimas digestivas',
            'Apoya la recuperación muscular',
            'Bajo en grasa y carbohidratos'
        ],
        flavors: ['Vainilla', 'Chocolate']
    },
    {
        id: '5',
        name: 'Complejo Multivitamínico',
        category: 'Nutrición',
        images: [
            'https://images.unsplash.com/photo-1550572017-edd951aa8f29?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=800&fit=crop'
        ],
        description: 'Suplemento completo con vitaminas y minerales esenciales diarios.',
        shortDescription: 'Suplemento completo con vitaminas y minerales esenciales diarios.',
        fullDescription: 'El Complejo Multivitamínico es tu seguro nutricional diario. En el mundo moderno, puede ser difícil obtener todos los nutrientes que necesitas solo de los alimentos. Este suplemento llena esos vacíos nutricionales con una fórmula científicamente balanceada.\n\nContiene 23 vitaminas y minerales esenciales en las cantidades que tu cuerpo puede absorber y utilizar efectivamente. Incluye antioxidantes como vitaminas C y E, vitaminas del complejo B para energía, y minerales como calcio y magnesio para huesos fuertes.\n\nPerfecto para complementar tu nutrición diaria y asegurar que tu cuerpo tenga todo lo que necesita para funcionar óptimamente.',
        benefits: [
            '23 vitaminas y minerales esenciales',
            'Fórmula de absorción optimizada',
            'Apoya la energía y vitalidad',
            'Fortalece el sistema inmunológico',
            'Incluye antioxidantes poderosos',
            'Una dosis fácil al día'
        ]
    },
    {
        id: '6',
        name: 'Fibra Activa en Polvo',
        category: 'Bienestar',
        images: [
            'https://images.unsplash.com/photo-1628773822990-202d4b812105?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1609840113808-59924b532e95?w=800&h=800&fit=crop'
        ],
        description: 'Fibra soluble e insoluble para apoyar la salud digestiva.',
        shortDescription: 'Fibra soluble e insoluble para apoyar la salud digestiva.',
        fullDescription: 'La Fibra Activa proporciona 5g de fibra por porción, una combinación perfecta de fibra soluble e insoluble que tu sistema digestivo necesita. La mayoría de las personas no consumen suficiente fibra en su dieta diaria, lo que puede afectar la digestión y el bienestar general.\n\nEsta fórmula en polvo fácil de mezclar se disuelve rápidamente en agua, jugos o batidos sin alterar significativamente el sabor. La fibra soluble ayuda a mantener niveles saludables de colesterol, mientras que la fibra insoluble apoya la regularidad digestiva.\n\nIncorpora esta fibra a tu rutina diaria para sentirte mejor, más ligero y con más energía.',
        benefits: [
            '5g de fibra por porción',
            'Mezcla de fibra soluble e insoluble',
            'Apoya la digestión regular',
            'Ayuda a sentirse satisfecho',
            'Sin sabor, fácil de incorporar',
            'Apoya niveles saludables de colesterol'
        ]
    }
];
