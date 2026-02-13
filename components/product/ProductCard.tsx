"use client";

import Link from "next/link";
import { getMediaURL } from "@/lib/api";
import { ShoppingBag, ArrowRight } from "lucide-react";

interface ProductCardProps {
    data: any; // Strapi'den gelen esnek veri yapısı
}

export default function ProductCard({ data }: ProductCardProps) {
    // Strapi v4 (attributes içinde) ve v5 (direkt root'ta) veri yapısını destekleyen güvenli erişim
    const attributes = data.attributes || data;
    const { name, base_price, base_image, category, id } = attributes;

    // Ürün ID'sini al (Link için) - data.id veya attributes.id olabilir
    const productId = data.id || id;
    const productSlug = data.slug || data.id;

    // Resim URL'ini güvenli alma
    // v5'te resimler bazen direkt obje olarak gelebilir, v4'te data.attributes içindedir.
    const imgData = base_image?.data || base_image;
    const imgUrl = imgData?.attributes?.url || imgData?.url;

    const finalImageUrl = getMediaURL(imgUrl || "");

    // Kategori ismini alma
    const categoryName = category?.data?.attributes?.name || category?.name || "Genel";

    return (
        <Link href={`/products/${productSlug}`} className="group h-full">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 h-full flex flex-col">

                {/* Resim Alanı */}
                <div className="relative h-64 bg-white border-b border-gray-50 overflow-hidden">
                    {finalImageUrl ? (
                        <img
                            src={finalImageUrl}
                            alt={name}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                            <ShoppingBag size={40} strokeWidth={1.5} />
                            <span className="text-xs mt-2 font-medium">Görsel Yok</span>
                        </div>
                    )}

                    {/* Hover'da çıkan "İncele" butonu */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2">
                            Ürünü İncele <ArrowRight size={14} />
                        </span>
                    </div>
                </div>

                {/* Bilgi Alanı */}
                <div className="p-5 flex flex-col flex-1">
                    {/* Kategori Etiketi */}
                    <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 w-fit px-2 py-1 rounded-md mb-2">
                        {categoryName}
                    </span>

                    {/* Ürün Başlığı */}
                    <h3 className="text-gray-900 font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {name}
                    </h3>

                    {/* Fiyat ve Alt Kısım */}
                    {/* <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-medium">Başlangıç Fiyatı</span>
                            <span className="text-xl font-extrabold text-gray-900">
                                ₺{base_price}
                            </span>
                        </div> 
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                            Stokta Var
                        </span>
                    </div> */}
                </div>
            </div>
        </Link>
    );
}