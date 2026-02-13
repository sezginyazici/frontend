"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, ArrowRight, LayoutGrid, MoreHorizontal } from "lucide-react";
import { getCategoriesTree, Category } from "@/lib/get-categories";

// UX ÇÖZÜMÜ 1: İsim Kısaltıcı Fonksiyon
const formatCategoryName = (name: string) => {
    return name
        .replace(/ Ürünleri/g, "") // "Tekstil Ürünleri" -> "Tekstil"
        .replace(/ Malzemeleri/g, "") // "Ofis Malzemeleri" -> "Ofis"
        .replace(/ Grubu/g, "") // "Mutfak Grubu" -> "Mutfak"
        .replace(/ ve /g, " & "); // "Şapka ve Bere" -> "Şapka & Bere"
};

export default function MegaMenu() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | string | null>(null);

    useEffect(() => {
        const fetchCats = async () => {
            const data = await getCategoriesTree();
            if (Array.isArray(data)) {
                setCategories(data);
            }
        };
        fetchCats();
    }, []);

    // UX ÇÖZÜMÜ 2: İlk 5'i göster, gerisini "Diğer"e at
    const VISIBLE_COUNT = 4;
    const visibleCategories = categories.slice(0, VISIBLE_COUNT);
    const hiddenCategories = categories.slice(VISIBLE_COUNT);

    return (
        <nav className="hidden lg:flex items-center gap-1 h-full">

            {/* --- GÖRÜNÜR KATEGORİLER --- */}
            {visibleCategories.map((category) => {
                if (!category) return null;
                const shortName = formatCategoryName(category.name); // Kısa ismi al
                const hasChildren = category.children && category.children.length > 0;

                return (
                    <div
                        key={category.id}
                        className="group h-full flex items-center"
                        onMouseEnter={() => setActiveCategory(category.id)}
                        onMouseLeave={() => setActiveCategory(null)}
                    >
                        <Link
                            href={`/category/${category.slug}`}
                            className={`flex items-center gap-1 px-3 py-2 text-sm font-bold transition-all rounded-md whitespace-nowrap
                ${activeCategory === category.id
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                }`}
                        >
                            {shortName}
                        </Link>

                        {/* MEGA MENU İÇERİĞİ (Aynı yapı) */}
                        {hasChildren && (
                            <MegaMenuDropdown category={category} shortName={shortName} />
                        )}
                    </div>
                );
            })}

            {/* --- "DİĞER" MENÜSÜ --- */}
            {hiddenCategories.length > 0 && (
                <div
                    // DÜZELTME BURADA: 'relative' sınıfı eklendi.
                    // Artık dropdown ekranın sağına değil, bu butonun hizasına göre açılacak.
                    className="relative group h-full flex items-center"
                    onMouseEnter={() => setActiveCategory("more")}
                    onMouseLeave={() => setActiveCategory(null)}
                >
                    <button
                        className={`flex items-center gap-1 px-3 py-2 text-sm font-bold transition-all rounded-md
                    ${activeCategory === "more"
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                    >
                        Diğer <MoreHorizontal size={16} />
                    </button>

                    {/* DİĞER DROPDOWN */}
                    {/* right-0: Menünün sağ kenarını butonun sağ kenarıyla hizalar (Sola doğru açılır) */}
                    <div className="absolute right-0 top-full w-64 bg-white border border-gray-100 shadow-xl rounded-b-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2">
                        {hiddenCategories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.slug}`}
                                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                            >
                                {formatCategoryName(cat.name)}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}

// Alt Bileşen: Mega Menu İçeriği (Kod tekrarını önlemek için ayrıldı)
function MegaMenuDropdown({ category, shortName }: { category: Category, shortName: string }) {
    return (
        <div className="absolute left-0 top-full w-full bg-white border-t border-gray-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50 min-h-[350px]">
            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">

                    {/* LİNKLER */}
                    <div className="flex-1 grid grid-cols-4 gap-y-8 gap-x-6 content-start">
                        {category.children!.map((subCategory) => (
                            <div key={subCategory.id} className="flex flex-col gap-2">
                                <Link
                                    href={`/category/${subCategory.slug}`}
                                    className="flex items-center gap-2 text-base font-bold text-gray-900 hover:text-blue-600 transition border-b border-gray-100 pb-2"
                                >
                                    <LayoutGrid size={16} className="text-gray-400" />
                                    {formatCategoryName(subCategory.name)}
                                </Link>

                                {subCategory.children && subCategory.children.length > 0 && (
                                    <ul className="space-y-1.5">
                                        {subCategory.children.map((childProduct) => (
                                            <li key={childProduct.id}>
                                                <Link
                                                    href={`/category/${childProduct.slug}`}
                                                    className="text-sm text-gray-500 hover:text-blue-600 hover:translate-x-1 transition-all inline-block"
                                                >
                                                    {childProduct.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* SAĞ GÖRSEL KART */}
                    <div className="w-72 flex-shrink-0">
                        <div className="relative h-full w-full rounded-2xl overflow-hidden bg-gray-900 group/card shadow-lg">
                            <img
                                src={`https://source.unsplash.com/random/400x600?${category.slug}`}
                                alt={category.name}
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/card:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                                <h4 className="text-2xl font-bold mb-2">{shortName}</h4>
                                <p className="text-xs text-gray-300 mb-4 line-clamp-3">
                                    En çok tercih edilen {shortName.toLowerCase()} modelleri.
                                </p>
                                <Link href={`/category/${category.slug}`} className="w-full bg-white text-black text-center py-3 rounded-lg font-bold text-sm hover:bg-blue-50 transition">
                                    Koleksiyonu Gör
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}