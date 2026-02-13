"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api, { getMediaURL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, CheckCircle, ShieldCheck, Truck, AlertCircle, Loader2, Layers, Box } from "lucide-react";
import { MockupEditorHandle } from "@/components/mockup/MockupEditor";
import { toast, Toaster } from 'sonner';
const MockupEditor = dynamic(() => import("@/components/mockup/MockupEditor"), {
    ssr: false,
    loading: () => <div className="w-full h-[500px] bg-gray-100 animate-pulse rounded-xl"></div>,
});

export default function ProductDetailClient({ initialProduct, id }: { initialProduct: any, id?: string }) {
    const params = useParams();
    //const id = params?.id;
    const router = useRouter();
    const { user } = useAuth();

    // Refs & State
    const editorRef = useRef<MockupEditorHandle>(null);
    const [product, setProduct] = useState<any>(initialProduct);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [totalQuantity, setTotalQuantity] = useState(100);
    const [note, setNote] = useState("");

    // YENİ: Kullanıcının yüklediği ham logo dosyasını tutuyoruz
    const [userLogoFile, setUserLogoFile] = useState<File | null>(null);

    // Sadece Tekstil İçin Kullanılan State
    const [sizes, setSizes] = useState({ S: 20, M: 40, L: 20, XL: 20, XXL: 0 });

    useEffect(() => {
        if (!id) return;
        const fetchProduct = async () => {
            try {
                // Strapi v5'te documentId'yi de çekmek önemlidir
                const { data } = await api.get(`/products?filters[slug][$eq]=${id}&populate=*`);
                if (data.data && data.data.length > 0) {
                    setProduct(data.data[0]);
                } else {
                    setProduct(null);
                }
            } catch (error) {
                console.error("Hata:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleSizeChange = (size: keyof typeof sizes, value: string) => {
        const val = parseInt(value) || 0;
        const newSizes = { ...sizes, [size]: val };
        setSizes(newSizes);
        const newTotal = Object.values(newSizes).reduce((a, b) => a + b, 0);
        setTotalQuantity(newTotal);
    };

    const handleQuantityChange = (value: string) => {
        const val = parseInt(value) || 0;
        setTotalQuantity(val);
    };

    // Helper: Base64 to Blob
    const dataURLtoBlob = (dataurl: string) => {
        const arr = dataurl.split(',');
        // @ts-ignore
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    // Helper: Dosya Yükleme (Reusable Function)
    const uploadFileToStrapi = async (fileBlob: Blob | File, fileName: string) => {
        const formData = new FormData();
        formData.append('files', fileBlob, fileName);

        const res = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data[0].id; // Yüklenen dosyanın ID'sini döner
    };

    const handleRequestQuote = async () => {
        if (!user) {
            toast("Teklif almak için lütfen önce giriş yapınız.");
            const currentPath = window.location.pathname;
            router.push(`/auth/login?callback=${encodeURIComponent(currentPath)}`);
            return;
        }

        if (!userLogoFile) {
            toast("Lütfen tasarım alanına bir logo yükleyiniz.");
            return;
        }

        setSubmitting(true);
        try {
            // 1. Tasarım Görüntüsünü (Preview) Editörden Al
            const designBase64 = editorRef.current?.getDesign();
            if (!designBase64) {
                throw new Error("Tasarım oluşturulamadı.");
            }

            // --- UPLOAD AŞAMASI --- //

            // A) Customer Logo Yükleme (Kullanıcının seçtiği orijinal dosya)
            // Not: Dosya ismini temizliyoruz veya timestamp ekliyoruz
            const logoId = await uploadFileToStrapi(userLogoFile, `logo_${user.id}_${Date.now()}_${userLogoFile.name}`);

            // B) Preview Image Yükleme (Canvas çıktısı)
            const previewBlob = dataURLtoBlob(designBase64);
            const previewId = await uploadFileToStrapi(previewBlob, `preview_${user.id}_${product.id}_${Date.now()}.png`);


            // --- REQUEST OLUŞTURMA AŞAMASI --- //

            const attributes = product.attributes || product;
            const productType = attributes.product_type || 'standard';

            // Strapi v5 İlişki Mantığı:
            // İlişki kurarken numeric ID genelde çalışır ama v5'te documentId daha güvenlidir.
            // Elimizdeki veriye göre en güvenli yöntemi seçiyoruz.
            const productId = product.documentId || product.id;
            const userId = user.documentId || user.id;

            const requestPayload = {
                data: {
                    // İlişkiler
                    product: productId,
                    owner_user: userId,

                    // Dosyalar
                    customer_logo: logoId,   // Orijinal dosya ID
                    preview_image: previewId, // Tasarım çıktısı ID

                    // Veriler
                    quantity: totalQuantity,
                    //status: 'open',
                    target_delivery_date: null,

                    // Ekstra alanlar (Strapi'de oluşturduysan)
                    note: note,
                    details: productType === 'clothing' ? sizes : null,
                    publishedAt: new Date(),
                }
            };

            console.log("Gönderilen Payload:", requestPayload); // Hata ayıklama için

            await api.post('/requests', requestPayload);

            toast("Teklif talebiniz başarıyla oluşturuldu!");
            router.push("/dashboard");

        } catch (error: any) {
            console.error("Sipariş hatası:", error.response?.data || error);
            const errorMsg = error.response?.data?.error?.message || error.message || "Bilinmeyen hata";
            toast("Bir hata oluştu: " + errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20">Yükleniyor...</div>;
    if (!product) return <div className="text-center py-20">Ürün bulunamadı.</div>;

    const attributes = product.attributes || product;
    const { name, base_price, base_image, overlay_texture, category, product_type } = attributes;
    const currentType = product_type || 'standard';

    const findImageUrl = (imgObj: any) => {
        if (!imgObj) return null;
        if (imgObj.url) return imgObj.url;
        const data = imgObj.data || imgObj;
        if (Array.isArray(data) && data.length > 0) return data[0].url || data[0].attributes?.url;
        return data.attributes?.url || data.url;
    };

    const baseImageUrl = getMediaURL(findImageUrl(base_image));
    const overlayImageUrl = getMediaURL(findImageUrl(overlay_texture)) || baseImageUrl;
    const categoryName = category?.data?.attributes?.name || "Kategori";

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* ... Breadcrumb ve Header aynı ... */}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

                        {/* SOL TARAF */}
                        <div className="lg:col-span-7 bg-gray-100 p-8 border-r border-gray-200 flex flex-col items-center justify-center">
                            {baseImageUrl ? (
                                <div className="w-full max-w-[550px]">
                                    <MockupEditor
                                        ref={editorRef}
                                        baseImage={baseImageUrl}
                                        overlayImage={overlayImageUrl}
                                        printArea={{ x: 250, y: 220, w: 150, h: 200 }}
                                        // YENİ: Logo değiştiğinde dosyayı state'e atıyoruz
                                        onLogoChange={(file) => setUserLogoFile(file)}
                                    />
                                    {/* ... Uyarı metni aynı ... */}
                                </div>
                            ) : (
                                <div className="text-red-500">Görsel eksik</div>
                            )}
                        </div>

                        {/* SAĞ TARAF: FORM */}
                        <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col h-full overflow-y-auto max-h-[90vh]">
                            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{name}</h1>
                            {/* <p className="text-3xl font-bold text-blue-600 mb-6">₺{base_price} <span className="text-sm text-gray-400 font-normal">/ adet</span></p> */}


                            {/* --- FORM ALANLARI (Beden veya Adet seçimi aynı kodlar) --- */}
                            {currentType === 'clothing' ? (
                                <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                                        <Layers size={16} className="text-blue-600" /> Beden Dağılımı
                                    </label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {Object.keys(sizes).map((size) => (
                                            <div key={size} className="flex flex-col items-center">
                                                <span className="text-xs font-bold text-gray-500 mb-1">{size}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={sizes[size as keyof typeof sizes]}
                                                    onChange={(e) => handleSizeChange(size as keyof typeof sizes, e.target.value)}
                                                    className="w-full text-center border border-gray-300 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Otomatik Toplam:</span>
                                        <span className="font-bold text-gray-900 text-lg">{totalQuantity} Adet</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                                        <Box size={16} className="text-blue-600" /> Sipariş Adedi
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            min="1"
                                            value={totalQuantity}
                                            onChange={(e) => handleQuantityChange(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Min. sipariş adedi: 50</p>
                                </div>
                            )}

                            {/* Not Alanı */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-900 mb-2">Sipariş Notu</label>
                                <textarea
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Baskı rengi, teslimat tarihi vb. özel isteklerinizi buraya yazabilirsiniz..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                ></textarea>
                            </div>

                            {/* ... Özellikler Alanı Aynı ... */}

                            <div className="mt-auto pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleRequestQuote}
                                    disabled={submitting}
                                    className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition shadow-xl shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" /> İşleniyor...
                                        </>
                                    ) : "Tasarımı Kaydet & Teklif Al"}
                                </button>
                                <p className="text-xs text-center text-gray-400 mt-3">Ödeme alınmaz. Talebiniz tedarikçilere iletilir.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function generateMetadata({ params }: { params: { id: string } }) {
    // const params = useParams();
    // const id = params?.id;
    const getProductData = async () => {
        try {
            // Strapi v5'te documentId'yi de çekmek önemlidir
            const { data } = await api.get(`/products?filters[slug][$eq]=${params.id}&populate=*`);
            if (data.data && data.data.length > 0) {
                return data.data[0]
            } else {
                return null
            }
        } catch (error) {
            console.error("Hata:", error);
        } finally {
        }
    };

    const product = await getProductData();

    return {
        title: `${product.name} | Marka Adınız`,
        description: product.description || "Ürün hakkında kısa açıklama...",
        openGraph: {
            title: product.name,
            description: product.description,
            images: [{ url: product.image_url }],
        },
    };
}