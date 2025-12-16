/**
 * Site configuration for Club Vitalife
 * Centralized configuration for SEO, contact info and site-wide settings
 */

export const siteConfig = {
    // Site identity
    name: 'Club Vitalife',
    distributorLabel: 'Distribuidor Independiente Herbalife',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://clubvitalife.com',

    // WhatsApp contact number (format: country code + number, no spaces or special chars)
    whatsappNumber: '525512345678',

    // Business info
    businessName: 'Club Vitalife',
    location: 'Ixtaczoquitlán, Veracruz',
    coverage: 'México',

    // Coach info
    coachTitle: 'Tu Coach Personal',

    // SEO defaults
    defaultDescription: 'Productos premium de nutrición Herbalife. Batidos, tés, suplementos y más para tu bienestar integral. Asesoría personalizada de un distribuidor independiente.',

    // Social media / OpenGraph defaults
    ogImage: '/og-image.jpg',
};

export type SiteConfig = typeof siteConfig;
