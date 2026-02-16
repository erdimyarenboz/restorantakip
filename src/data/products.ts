import type { Product } from '../types';

// SVG placeholder images for restaurant menu items
const createMenuImage = (emoji: string, color: string): string => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect width="300" height="300" fill="${color}"/>
    <text x="50%" y="50%" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

// Restaurant menu items
export const products: Product[] = [
    // İçecekler
    {
        id: 'm1',
        name: 'Çay',
        description: 'Geleneksel demleme çay',
        price: 15,
        category: 'İçecek',
        portion: '1 Bardak',
        image: createMenuImage('☕', '#D97706'),
    },
    {
        id: 'm2',
        name: 'Türk Kahvesi',
        description: 'Orta şekerli, köpüklü',
        price: 25,
        category: 'İçecek',
        portion: '1 Fincan',
        image: createMenuImage('☕', '#92400E'),
    },
    {
        id: 'm3',
        name: 'Filtre Kahve',
        description: 'Taze çekilmiş kahve çekirdekleri',
        price: 30,
        category: 'İçecek',
        portion: '1 Fincan',
        image: createMenuImage('☕', '#78350F'),
    },
    {
        id: 'm4',
        name: 'Kola',
        description: 'Soğuk, cam şişe',
        price: 20,
        category: 'İçecek',
        portion: '330ml',
        image: createMenuImage('🥤', '#DC2626'),
    },
    {
        id: 'm5',
        name: 'Ayran',
        description: 'Ev yapımı, soğuk',
        price: 12,
        category: 'İçecek',
        portion: '1 Bardak',
        image: createMenuImage('🥛', '#E0F2FE'),
    },
    {
        id: 'm6',
        name: 'Su',
        description: 'Doğal kaynak suyu',
        price: 8,
        category: 'İçecek',
        portion: '500ml',
        image: createMenuImage('💧', '#3B82F6'),
    },

    // Ana Yemekler
    {
        id: 'm7',
        name: 'Izgara Köfte',
        description: 'Dana kıyma, közde pişirilmiş, garnitür ile',
        price: 180,
        category: 'Ana Yemek',
        portion: '6 Adet',
        image: createMenuImage('🍖', '#B91C1C'),
    },
    {
        id: 'm8',
        name: 'Tavuk Şiş',
        description: 'Marine edilmiş tavuk göğsü, közde',
        price: 160,
        category: 'Ana Yemek',
        portion: '1 Porsiyon',
        image: createMenuImage('🍗', '#F59E0B'),
    },
    {
        id: 'm9',
        name: 'Adana Kebap',
        description: 'Acılı kıyma, şiş kebap, lavaş ekmek',
        price: 200,
        category: 'Ana Yemek',
        portion: '1 Porsiyon',
        image: createMenuImage('🌯', '#DC2626'),
    },
    {
        id: 'm10',
        name: 'Karışık Pide',
        description: 'Kaşarlı, sucuklu, yumurtalı',
        price: 120,
        category: 'Ana Yemek',
        portion: '1 Adet',
        image: createMenuImage('🥙', '#F59E0B'),
    },
    {
        id: 'm11',
        name: 'Lahmacun',
        description: 'İnce hamur, kıymalı, bol maydanozlu',
        price: 40,
        category: 'Ana Yemek',
        portion: '1 Adet',
        image: createMenuImage('🍕', '#EF4444'),
    },
    {
        id: 'm12',
        name: 'İskender',
        description: 'Döner, tereyağ, yoğurt, domates sosu',
        price: 190,
        category: 'Ana Yemek',
        portion: '1 Porsiyon',
        image: createMenuImage('🍛', '#B91C1C'),
    },

    // Tatlılar
    {
        id: 'm13',
        name: 'Baklava',
        description: 'Antep fıstıklı, taze yapım',
        price: 80,
        category: 'Tatlı',
        portion: '4 Dilim',
        image: createMenuImage('🍰', '#F59E0B'),
    },
    {
        id: 'm14',
        name: 'Künefe',
        description: 'Tel kadayıf, peynir, fıstık',
        price: 90,
        category: 'Tatlı',
        portion: '1 Porsiyon',
        image: createMenuImage('🧇', '#FBBF24'),
    },
    {
        id: 'm15',
        name: 'Sütlaç',
        description: 'Fırınlanmış, geleneksel tarif',
        price: 50,
        category: 'Tatlı',
        portion: '1 Kase',
        image: createMenuImage('🍮', '#FEF3C7'),
    },
    {
        id: 'm16',
        name: 'Kazandibi',
        description: 'Tavuk göğsü, tavada kavrulmuş',
        price: 55,
        category: 'Tatlı',
        portion: '1 Porsiyon',
        image: createMenuImage('🍰', '#92400E'),
    },

    // Aperatifler
    {
        id: 'm17',
        name: 'Humus',
        description: 'Nohut ezmesi, zeytinyağlı',
        price: 45,
        category: 'Aperatif',
        portion: '1 Kase',
        image: createMenuImage('🥗', '#FDE68A'),
    },
    {
        id: 'm18',
        name: 'Haydari',
        description: 'Süzme yoğurt, sarımsak, dereotu',
        price: 40,
        category: 'Aperatif',
        portion: '1 Kase',
        image: createMenuImage('🥣', '#DBEAFE'),
    },
    {
        id: 'm19',
        name: 'Sigara Böreği',
        description: 'Peynirli, kıtır kıtır',
        price: 60,
        category: 'Aperatif',
        portion: '6 Adet',
        image: createMenuImage('🥟', '#FDE047'),
    },
    {
        id: 'm20',
        name: 'Çıtır Soğan Halkası',
        description: 'Paneli, soslu',
        price: 50,
        category: 'Aperatif',
        portion: '1 Porsiyon',
        image: createMenuImage('🍤', '#FBBF24'),
    },

    // Salatalar
    {
        id: 'm21',
        name: 'Çoban Salata',
        description: 'Domates, salatalık, biber, soğan',
        price: 35,
        category: 'Salata',
        portion: '1 Porsiyon',
        image: createMenuImage('🥗', '#10B981'),
    },
    {
        id: 'm22',
        name: 'Mevsim Salata',
        description: 'Taze yeşillikler, mevsim sebzeleri',
        price: 40,
        category: 'Salata',
        portion: '1 Porsiyon',
        image: createMenuImage('🥗', '#22C55E'),
    },
    {
        id: 'm23',
        name: 'Akdeniz Salata',
        description: 'Marul, nar, ceviz, beyaz peynir',
        price: 55,
        category: 'Salata',
        portion: '1 Porsiyon',
        image: createMenuImage('🥗', '#16A34A'),
    },
];
