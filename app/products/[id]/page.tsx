import { Metadata } from "next";
import api, { getMediaURL } from "@/lib/api";
import ProductDetailClient from "@/components/product/ProductDetailClient";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const { data } = await api.get(`/products?filters[slug][$eq]=${id}&populate=*`);
        const product = data.data[0];

        if (!product) return { title: "Ürün Bulunamadı" };

        const attr = product.attributes || product;
        return {
            title: `${attr.name} | Prometre`,
            description: attr.description || `${attr.name} ürünümüzü inceleyin ve teklif alın.`,
            openGraph: {
                title: attr.name,
                images: [getMediaURL(attr.base_image?.url || "")],
            },
            alternates: {
                canonical: `https://prometre.com/products/${id}`,
            },
        };
    } catch (error) {
        return { title: "Ürün Detayı" };
    }
}

export default async function Page({ params }: Props) {
    const { id } = await params;

    // Veriyi server-side'da bir kez çekelim
    const { data } = await api.get(`/products?filters[slug][$eq]=${id}&populate=*`);
    const product = data.data[0];

    if (!product) return <div>Ürün bulunamadı.</div>;

    const attr = product.attributes || product;

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://prometre.com" },
            { "@type": "ListItem", "position": 2, "name": "Ürünler", "item": "https://prometre.com/products" },
            { "@type": "ListItem", "position": 3, "name": attr.name, "item": `https://prometre.com/products/${id}` }
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
            <ProductDetailClient initialProduct={product} id={id} />
        </>
    );
}