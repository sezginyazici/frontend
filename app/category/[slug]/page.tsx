import { Metadata } from "next";
import api, { getMediaURL } from "@/lib/api";
import CategoryDetailClient from "@/components/category/CategoryDetailClient";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const { data } = await api.get(`/categories?filters[slug][$eq]=${slug}&populate[children][fields][0]=name&populate[children][fields][1]=slug&populate[parent][populate][children][fields][0]=name&populate[parent][populate][children][fields][1]=slug`);
        const product = data.data[0];

        if (!product) return { title: "Ürün Bulunamadı" };

        const attr = product.attributes || product;
        return {
            title: `${attr.name} Modelleri ve Fiyatları | Prometre`,
            description: attr.description || `${attr.name} kategorisini inceleyin ve ürünlerden teklif alın.`,
            openGraph: {
                title: attr.name,
                images: [getMediaURL(attr.base_image?.url || "")],
            },
            alternates: {
                canonical: `https://prometre.com/category/${slug}`,
            },
        };
    } catch (error) {
        return { title: "Kategori Detayı" };
    }
}

export default async function Page({ params }: Props) {
    const { slug } = await params;

    // Veriyi server-side'da bir kez çekelim
    const { data } = await api.get(`/categories?filters[slug][$eq]=${slug}&populate[children][fields][0]=name&populate[children][fields][1]=slug&populate[parent][populate][children][fields][0]=name&populate[parent][populate][children][fields][1]=slug`);
    const product = data.data[0];

    if (!product) return <div>Ürün bulunamadı.</div>;

    const attr = product.attributes || product;

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://prometre.com" },
            { "@type": "ListItem", "position": 2, "name": "Ürünler", "item": "https://prometre.com/category" },
            { "@type": "ListItem", "position": 3, "name": attr.name, "item": `https://prometre.com/category/${slug}` }
        ]
    };

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": attr.name,
        "image": getMediaURL(attr.base_image?.url || ""),
        "description": attr.description,
        "offers": {
            "@type": "Offer",
            "price": attr.base_price || "0",
            "priceCurrency": "TRY",
            "availability": "https://schema.org/InStock",
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <CategoryDetailClient initialProduct={product} id={slug} />
        </>
    );
}