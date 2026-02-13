"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import { ArrowRight, LayoutGrid, ChevronLeft } from "lucide-react";

// Veri Tipleri
interface CategoryData {
    id: number;
    name: string;
    slug: string;
    children?: any[]; // Alt kategoriler
    parent?: {        // Üst Kategori (Yeni eklendi)
        name: string;
        slug: string;
        children?: any[]; // Kardeş kategoriler
    };
}

interface ProductData {
    id: number;
    attributes: any;
}

export default function CategoryDetailClient({ initialCat, id }: { initialCat: any, id?: string }) {

    const params = useParams();
    const slug = params?.slug as string;

    const [products, setProducts] = useState<ProductData[]>([]);
    const [categoryInfo, setCategoryInfo] = useState<CategoryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const catQuery = `/categories?filters[slug][$eq]=${slug}&populate[children][fields][0]=name&populate[children][fields][1]=slug&populate[parent][populate][children][fields][0]=name&populate[parent][populate][children][fields][1]=slug`;

                const catRes = await api.get(catQuery);
                const catData = catRes.data.data && catRes.data.data.length > 0 ? catRes.data.data[0] : null;

                if (!catData) {
                    setLoading(false);
                    return;
                }

                const attributes = catData.attributes || catData;
                const childrenData = Array.isArray(attributes.children) ? attributes.children : attributes.attributes?.children?.data || [];

                let parentData = null;
                if (attributes.parent && attributes.parent.data) {
                    const pAttrs = attributes.parent.data.attributes;
                    parentData = {
                        name: pAttrs.name,
                        slug: pAttrs.slug,
                        children: pAttrs.children?.data || []
                    };
                } else if (attributes.parent && !attributes.parent.data) {
                    parentData = attributes.parent;
                }

                setCategoryInfo({
                    id: catData.id,
                    name: attributes.name,
                    slug: attributes.slug,
                    children: childrenData,
                    parent: parentData
                });

                const targetSlugs = [slug];

                childrenData.forEach((child: any) => {
                    const childSlug = child.slug || child.attributes?.slug;
                    if (childSlug) targetSlugs.push(childSlug);
                });

                const filterQuery = targetSlugs.map((s, i) => `filters[category][slug][$in][${i}]=${s}`).join('&');
                const prodQuery = `/products?${filterQuery}&populate=*`;

                const prodRes = await api.get(prodQuery);
                setProducts(prodRes.data.data || []);

            } catch (error) {
                console.error("Veri çekme hatası:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    let sidebarTitle = "Kategoriler";
    let sidebarLinks: any[] = [];
    let showParentLink = false; // "Giyim'e Dön" linki gösterelim mi?

    if (categoryInfo) {
        if (categoryInfo.children && categoryInfo.children.length > 0) {
            sidebarTitle = "Alt Kategoriler";
            sidebarLinks = categoryInfo.children;
        } else if (categoryInfo.parent && categoryInfo.parent.children) {
            sidebarTitle = `${categoryInfo.parent.name}`;
            sidebarLinks = categoryInfo.parent.children;
            showParentLink = true;
        }
    }

    if (loading) return <div className="container mx-auto px-4 py-20">Yükleniyor...</div>;
    if (!categoryInfo) return <div className="container mx-auto px-4 py-20">Bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">

                <div className="mb-8 pb-4 border-b border-gray-200">
                    <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                        <Link href="/" className="hover:text-blue-600">Anasayfa</Link>
                        <span className="text-gray-300">/</span>
                        {categoryInfo.parent && (
                            <>
                                <Link href={`/category/${categoryInfo.parent.slug}`} className="hover:text-blue-600">
                                    {categoryInfo.parent.name}
                                </Link>
                                <span className="text-gray-300">/</span>
                            </>
                        )}
                        <span className="font-semibold text-gray-900">{categoryInfo.name}</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900">{categoryInfo.name}</h1>
                    <p className="text-gray-500 mt-2 text-sm">{products.length} ürün listeleniyor</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* SOL MENÜ (Sidebar) */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 sticky top-24">

                            {/* Üst Kategoriye Dön Linki */}
                            {showParentLink && categoryInfo.parent && (
                                <Link
                                    href={`/category/${categoryInfo.parent.slug}`}
                                    className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-blue-600 mb-4 transition"
                                >
                                    <ChevronLeft size={14} />
                                    {categoryInfo.parent.name} Tümünü Gör
                                </Link>
                            )}

                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <LayoutGrid size={18} />
                                {sidebarTitle}
                            </h3>

                            {sidebarLinks.length > 0 ? (
                                <ul className="space-y-1">
                                    {sidebarLinks.map((link: any) => {
                                        const linkName = link.name || link.attributes?.name;
                                        const linkSlug = link.slug || link.attributes?.slug;
                                        // Şu anki sayfadaysak aktif class ekle
                                        const isActive = linkSlug === categoryInfo.slug;

                                        return (
                                            <li key={link.id || link.documentId}>
                                                <Link
                                                    href={`/category/${linkSlug}`}
                                                    className={`block text-sm px-3 py-2 rounded-lg transition flex justify-between items-center
                            ${isActive
                                                            ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-200"
                                                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                                        }`}
                                                >
                                                    {linkName}
                                                    {isActive && <ChevronLeft size={14} className="rotate-180" />}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Kategori bulunamadı.</p>
                            )}
                        </div>
                    </aside>

                    <main className="flex-1">
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} data={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <LayoutGrid size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Bu kategoride ürün yok.</h3>
                                <p className="text-gray-500 mt-2 mb-6">Şimdilik bu kategoriye ürün eklenmemiş.</p>
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </div>
    );
}