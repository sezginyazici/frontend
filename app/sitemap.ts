import { MetadataRoute } from 'next';
import api from '@/lib/api';

export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://www.prometre.com";

    try {
        const [productsRes, categoriesRes] = await Promise.all([
            api.get('/products?fields[0]=slug&fields[1]=updatedAt&pagination[limit]=100'),
            api.get('/categories?fields[0]=slug&fields[1]=updatedAt')
        ]);

        const products = productsRes.data.data || [];
        const categories = categoriesRes.data.data || [];
        //console.log(`Sitemap: ${products.length} ürün, ${categories.length} kategori çekildi.`);

        const productEntries = products.map((product: any) => {
            const item = product.attributes || product;
            if (!item.slug) return null;
            return {
                url: `${baseUrl}/products/${item.slug}`,
                lastModified: new Date(item.updatedAt || new Date()),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            };
        }).filter(Boolean);

        const categoryEntries = categories.map((category: any) => {
            const item = category.attributes || category;
            if (!item.slug) return null;
            return {
                url: `${baseUrl}/category/${item.slug}`,
                lastModified: new Date(item.updatedAt || new Date()),
                changeFrequency: 'daily' as const,
                priority: 0.9,
            };
        }).filter(Boolean);

        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            },
            ...categoryEntries,
            ...productEntries as any[],
        ];
    } catch (error) {
        console.error("Sitemap Hatası:", error);
        return [{ url: baseUrl, lastModified: new Date() }];
    }
}