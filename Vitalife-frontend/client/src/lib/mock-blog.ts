/**
 * Mock Blog Data
 * Structured with content blocks for rich text editing simulation
 */

export interface ContentBlock {
    type: 'paragraph' | 'heading' | 'image' | 'product-widget' | 'list';
    content?: string;
    url?: string;
    productId?: string;
    items?: string[];
    level?: 1 | 2 | 3;
}

export interface BlogPost {
    slug: string;
    title: string;
    category: string;
    coverImage: string;
    author: string;
    publishedAt: string;
    excerpt: string;
    readTime: string;
    content: ContentBlock[];
}

export const blogPosts: BlogPost[] = [
    {
        slug: 'waffles-proteicos-frutos-rojos',
        title: 'Waffles Proteicos con Frutos Rojos: Desayuno en 5 Minutos',
        category: 'Recetas',
        coverImage: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&q=80',
        author: 'Tu Coach de Bienestar',
        publishedAt: '2024-12-15',
        excerpt: 'Descubre cómo preparar unos deliciosos waffles proteicos perfectos para empezar el día con energía.',
        readTime: '5 min',
        content: [
            {
                type: 'paragraph',
                content: '¿Quién dijo que comer saludable tiene que ser aburrido? Estos waffles proteicos son la prueba de que puedes disfrutar de un desayuno delicioso mientras cuidas tu nutrición. Con solo 5 minutos de preparación, tendrás un plato lleno de proteínas y sabor.'
            },
            {
                type: 'heading',
                content: 'Ingredientes',
                level: 2
            },
            {
                type: 'list',
                items: [
                    '2 cucharadas de Formula 1 sabor Vainilla',
                    '1 huevo',
                    '2 cucharadas de avena',
                    '1/4 taza de leche de almendras',
                    '1/2 taza de frutos rojos frescos',
                    'Miel o stevia al gusto'
                ]
            },
            {
                type: 'product-widget',
                productId: '4dc14927-c8c7-4d0d-a6d4-d767d555c4be'
            },
            {
                type: 'heading',
                content: 'Preparación',
                level: 2
            },
            {
                type: 'paragraph',
                content: '1. Mezcla todos los ingredientes secos en un bowl hasta obtener una masa homogénea. 2. Precalienta tu wafflera y vierte la mezcla. 3. Cocina por 3-4 minutos hasta que esté dorado. 4. Sirve con frutos rojos frescos y un toque de miel.'
            },
            {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=800&q=80',
                content: 'Waffles servidos con frutos rojos'
            },
            {
                type: 'heading',
                content: 'Beneficios Nutricionales',
                level: 2
            },
            {
                type: 'paragraph',
                content: 'Cada porción de estos waffles te aporta aproximadamente 25g de proteína de alta calidad, perfecta para comenzar el día con energía sostenida. Los frutos rojos añaden antioxidantes esenciales para tu salud celular.'
            }
        ]
    },
    {
        slug: 'guia-batidos-verdes-principiantes',
        title: 'Guía Completa de Batidos Verdes para Principiantes',
        category: 'Nutrición',
        coverImage: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&q=80',
        author: 'Tu Coach de Bienestar',
        publishedAt: '2024-12-10',
        excerpt: 'Aprende todo sobre los batidos verdes: beneficios, ingredientes esenciales y las mejores combinaciones.',
        readTime: '8 min',
        content: [
            {
                type: 'paragraph',
                content: 'Los batidos verdes se han convertido en un pilar fundamental de la nutrición moderna. Son una forma práctica y deliciosa de consumir vegetales, frutas y proteínas en una sola bebida. En esta guía te enseñamos todo lo que necesitas saber.'
            },
            {
                type: 'heading',
                content: '¿Por qué Batidos Verdes?',
                level: 2
            },
            {
                type: 'paragraph',
                content: 'Los batidos verdes ofrecen una concentración única de nutrientes en forma fácilmente digerible. Tu cuerpo absorbe vitaminas y minerales de manera más eficiente cuando están en forma líquida, lo que maximiza los beneficios nutricionales.'
            },
            {
                type: 'list',
                items: [
                    'Mayor absorción de nutrientes',
                    'Energía sostenida durante el día',
                    'Mejora la digestión',
                    'Hidratación óptima',
                    'Control del apetito'
                ]
            },
            {
                type: 'heading',
                content: 'Ingredientes Base Esenciales',
                level: 2
            },
            {
                type: 'paragraph',
                content: 'Para crear el batido verde perfecto, necesitas una base proteica de calidad. El Formula 1 es ideal porque aporta 21 vitaminas y minerales esenciales junto con proteína de alta calidad.'
            },
            {
                type: 'product-widget',
                productId: '4dc14927-c8c7-4d0d-a6d4-d767d555c4be'
            },
            {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=800&q=80',
                content: 'Ingredientes frescos para batidos verdes'
            },
            {
                type: 'heading',
                content: 'Receta Básica',
                level: 2
            },
            {
                type: 'paragraph',
                content: 'Mezcla 2 cucharadas de Formula 1, 1 taza de espinacas frescas, 1/2 plátano congelado, 1 taza de leche vegetal y hielo al gusto. Licúa por 30 segundos y disfruta tu batido verde perfecto.'
            }
        ]
    },
    {
        slug: 'rutina-ejercicios-casa-30-minutos',
        title: 'Rutina de Ejercicios en Casa: 30 Minutos para Transformarte',
        category: 'Fitness',
        coverImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
        author: 'Tu Coach de Bienestar',
        publishedAt: '2024-12-05',
        excerpt: 'Una rutina completa de ejercicios que puedes hacer en casa sin equipamiento, perfecta para quemar grasa.',
        readTime: '6 min',
        content: [
            {
                type: 'paragraph',
                content: 'No necesitas un gimnasio para mantenerte en forma. Esta rutina de 30 minutos está diseñada para trabajar todo tu cuerpo usando solo tu peso corporal. Perfecta para hacer en casa, en el parque o donde prefieras.'
            },
            {
                type: 'heading',
                content: 'Calentamiento (5 minutos)',
                level: 2
            },
            {
                type: 'list',
                items: [
                    'Marcha en el lugar - 1 minuto',
                    'Círculos de brazos - 30 segundos cada dirección',
                    'Rotaciones de cadera - 1 minuto',
                    'Jumping jacks suaves - 2 minutos'
                ]
            },
            {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
                content: 'Calentamiento antes del ejercicio'
            },
            {
                type: 'heading',
                content: 'Circuito Principal (20 minutos)',
                level: 2
            },
            {
                type: 'paragraph',
                content: 'Realiza cada ejercicio durante 45 segundos con 15 segundos de descanso entre cada uno. Completa 3 rondas del circuito completo.'
            },
            {
                type: 'list',
                items: [
                    'Sentadillas',
                    'Flexiones (puedes hacerlas de rodillas)',
                    'Zancadas alternas',
                    'Plancha',
                    'Mountain climbers',
                    'Burpees modificados'
                ]
            },
            {
                type: 'heading',
                content: 'Nutrición Post-Entrenamiento',
                level: 2
            },
            {
                type: 'paragraph',
                content: 'Después de tu rutina, es fundamental nutrir tu cuerpo correctamente. Un batido proteico dentro de los 30 minutos posteriores al ejercicio maximiza la recuperación muscular.'
            },
            {
                type: 'product-widget',
                productId: '4dc14927-c8c7-4d0d-a6d4-d767d555c4be'
            },
            {
                type: 'heading',
                content: 'Enfriamiento (5 minutos)',
                level: 2
            },
            {
                type: 'paragraph',
                content: 'Termina con estiramientos suaves para cada grupo muscular. Mantén cada estiramiento por 20-30 segundos respirando profundamente.'
            }
        ]
    }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
    return blogPosts.find(post => post.slug === slug);
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
