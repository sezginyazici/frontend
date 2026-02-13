"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api, { getMediaURL } from "@/lib/api";
import { toast, Toaster } from 'sonner';
import { useAuth } from "@/context/AuthContext";
import {
    ArrowLeft, Calendar, Download, FileImage,
    Package, Clock, CheckCircle,
    Banknote, ThumbsUp, Store, Loader2, FlaskConical, Truck, Copy
} from "lucide-react";

export default function RequestDetailPage() {
    const params = useParams();
    const id = params?.id;
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [request, setRequest] = useState<any>(null);
    const [existingSamples, setExistingSamples] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const formatTRY = (amount: number) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    useEffect(() => {
        if (!id || authLoading) return;
        if (!user) { router.push("/auth/login"); return; }

        const fetchRequest = async () => {
            try {
                // --- 400 HATASI KESİN ÇÖZÜMÜ ---
                // 1. '*' (wildcard) kullanmayı bıraktık, çünkü derinlemesine gitmeyi engelliyor.
                // 2. Her ilişkiyi manuel olarak 'true' veya '[populate]' ile açtık.
                // 3. 'offers' zincirini kesintisiz tanımladık.

                const query = `/requests?filters[id][$eq]=${id}&` +
                    // Basit ilişkileri aç
                    `populate[preview_image]=true&` +
                    `populate[customer_logo]=true&` +
                    `populate[owner_user]=true&` +

                    // Ürün ve resmini aç
                    `populate[product][populate]=base_image&` +

                    // KRİTİK ZİNCİR: Teklif -> Tedarikçi -> Profil -> Logo
                    // Burada 'populate[offers]=*' ASLA kullanılmamalıdır.
                    //`populate[offers][populate][supplier_user]=*&` +
                    `populate[offers][populate][supplier_user][populate][0]=*&` +
                    `populate[offers][populate][supplier_user][populate][company_profile][populate]=*`


                const { data } = await api.get(query);

                // Veri kontrolü
                const reqData = data.data && data.data.length > 0 ? data.data[0] : null;

                if (reqData) {
                    setRequest(reqData);
                } else {
                    console.warn("Talep verisi boş döndü.");
                    router.push("/dashboard");
                }

                // 2. BU ÜRÜN İÇİN BENİM İSTEDİĞİM NUMUNELERİ ÇEK
                // Product ID'sine göre filtreliyoruz.
                const productId = reqData.product?.id || reqData.attributes.product?.data?.id;
                if (productId) {
                    const sampleQuery = `/sample-requests?filters[customer][id][$eq]=${user.id}&filters[product][id][$eq]=${productId}&populate[supplier]=true`;
                    const sampleRes = await api.get(sampleQuery);
                    setExistingSamples(sampleRes.data.data || []);
                }
            } catch (error: any) {
                console.error("Detay hatası:", error);
                // Eğer hala hata alırsan console'da detayını gör
                if (error.response) {
                    console.error("Backend Hatası:", error.response.data);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [id, user, authLoading, router]);

    const handleRequestSample = async (offerId: number, supplierId: number, productId: number) => {
        if (!confirm("Bu tedarikçiden numune talep etmek istediğinize emin misiniz?")) return;

        setActionLoading(offerId);
        try {
            // Tablo yapına uygun payload
            await api.post("/sample-requests", {
                data: {
                    status: 'requested', // Enum
                    // type: 'standard', // Eğer Enum zorunluysa buraya bir değer girilmeli, değilse boş bırakılabilir.
                    product: productId,
                    supplier: supplierId,
                    customer: user?.id,
                }
            });
            toast.success("Numune talebiniz iletildi!");
            window.location.reload();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error?.message || "Hata oluştu";
            toast.error("Talep oluşturulamadı: " + msg);
        } finally {
            setActionLoading(null);
        }
    };

    // --- TEKLİF KABUL ETME ---
    const handleAcceptOffer = async (offerId: number) => {
        if (!confirm("Bu teklifi onaylamak istediğinize emin misiniz? Diğer teklifler reddedilecek.")) return;

        setActionLoading(offerId);
        try {
            await api.put(`/offers/${offerId}/accept`, {});
            toast("Teklif başarıyla onaylandı! Siparişiniz oluşturuldu, ödeme ekranına yönlendiriliyorsunuz.");
            //window.location.reload();
            router.push("/dashboard")
        } catch (error: any) {
            console.error("Onay hatası:", error);
            const msg = error.response?.data?.error?.message || "Bir hata oluştu.";
            toast("Hata: " + msg);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Yükleniyor...</div>;
    if (!request) return <div className="text-center py-20">Talep bulunamadı.</div>;

    const attr = request.attributes || request;
    const product = attr.product?.data?.attributes || attr.product;
    const offers = attr.offers?.data || attr.offers || [];

    console.log("offers", offers)

    // Görseller
    const previewImgData = attr.preview_image?.data || attr.preview_image;
    const previewUrl = getMediaURL(previewImgData?.attributes?.url || previewImgData?.url);
    const logoImgData = attr.customer_logo?.data || attr.customer_logo;
    const logoUrl = getMediaURL(logoImgData?.attributes?.url || logoImgData?.url);
    const productImgData = product?.base_image?.data || product?.base_image;
    const productUrl = getMediaURL(productImgData?.attributes?.url || productImgData?.url);

    // Status Badge Helper
    const getStatusBadge = (status: string) => {
        const s = status?.toLowerCase() || "open";
        switch (s) {
            case "open": return <span className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-yellow-100"><Clock size={16} /> Teklif Bekleniyor</span>;
            case "approved": return <span className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-green-100"><CheckCircle size={16} /> Sipariş Onaylandı</span>;
            case "offer_received": return <span className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-yellow-100"><Clock size={16} /> Teklif Topluyor</span>;

            case "completed": return <span className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg font-bold text-sm border border-green-100"><CheckCircle size={16} /> Sipariş Oluşturuldu</span>;
            default: return <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4">

                {/* Üst Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition text-gray-500">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900">Talep #{request.id || request.documentId?.slice(0, 8)}</h1>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <Calendar size={14} /> {new Date(attr.createdAt).toLocaleString("tr-TR", { dateStyle: 'long', timeStyle: 'short' })}
                            </p>
                        </div>
                    </div>
                    <div>{getStatusBadge(attr.status)}</div>
                </div>

                {/* --- TEKLİFLER ALANI --- */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Banknote className="text-blue-600" /> Gelen Teklifler ({offers.length})
                    </h2>

                    {offers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {offers.map((offer: any) => {
                                const offAttr = offer.attributes || offer;
                                const supplierUser = offAttr.supplier_user?.data?.attributes || offAttr.supplier_user;
                                const supplierId = offAttr.supplier_user?.data?.id || offAttr.supplier_user?.id;
                                const isWinner = offAttr.is_accepted;
                                const isClosed = attr.status?.toLowerCase() === 'completed';//attr.status === 'approved';
                                const cardOpacity = (isClosed && !isWinner) ? "opacity-50 grayscale" : "opacity-100";

                                // --- FİRMA PROFİLİ VERİLERİNİ ÇÖZÜMLEME ---
                                // 1. Company Profile Verisi
                                const profile = supplierUser?.company_profile?.data?.attributes || supplierUser?.company_profile;

                                // 2. Firma Adı (Yoksa kullanıcı adı, o da yoksa Tedarikçi)
                                const companyName = profile?.company_name || supplierUser?.username || "Tedarikçi";

                                // 3. Logo Verisi
                                const profileLogoData = profile?.company_logo?.data?.attributes || profile?.logo;
                                const supplierLogoUrl = getMediaURL(profileLogoData?.url);

                                // Bu tedarikçi için daha önce numune istemiş miyim?
                                const existingSample = existingSamples.find((s: any) =>
                                    s.supplier?.id === supplierId
                                );

                                return (
                                    <div key={offer.id} className={`bg-white rounded-2xl shadow-sm border-2 transition-all overflow-hidden flex flex-col ${isWinner ? 'border-green-500 ring-4 ring-green-50' : 'border-gray-100 hover:border-blue-300'} ${cardOpacity}`}>

                                        {/* Kart Başlığı */}
                                        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                {/* Logo Yuvası */}
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200 overflow-hidden relative shadow-sm">
                                                    {supplierLogoUrl ? (
                                                        <img
                                                            src={supplierLogoUrl}
                                                            alt={companyName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Store size={20} className="text-gray-400" />
                                                    )}
                                                </div>

                                                {/* İsim ve Süre */}
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{companyName}</h4>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Clock size={10} /> {offAttr.delivery_days} Günde Teslim
                                                    </span>
                                                </div>
                                            </div>
                                            {isWinner && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={12} /> Seçildi</span>}
                                        </div>

                                        {/* Fiyat Bilgisi */}
                                        <div className="p-6 flex-1">
                                            <div className="flex flex-col mb-4">
                                                <span className="text-sm text-gray-500">Birim Fiyat</span>
                                                <span className="text-xl font-bold text-gray-900">{formatTRY(offAttr.price_per_unit)}₺</span>
                                            </div>
                                            <div className="flex flex-col mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                <span className="text-xs text-blue-600 font-bold uppercase">Toplam Tutar</span>
                                                <span className="text-2xl font-black text-blue-900">{formatTRY(offAttr.total_price)}₺</span>
                                            </div>
                                            {offAttr.note && (
                                                <p className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3">
                                                    "{offAttr.note}"
                                                </p>
                                            )}
                                        </div>

                                        {/* NUMUNE DURUM BİLGİSİ */}
                                        {existingSample && (() => {
                                            // 1. Duruma göre tasarım ayarları (Renk, İkon, Metin)
                                            const getSampleUI = (status: string) => {
                                                switch (status) {
                                                    case 'requested':
                                                        return {
                                                            bg: 'bg-orange-50 border-orange-100',
                                                            text: 'text-orange-700',
                                                            label: 'Onay Bekliyor',
                                                            icon: <Clock size={16} />
                                                        };
                                                    case 'approved':
                                                        return {
                                                            bg: 'bg-blue-50 border-blue-100',
                                                            text: 'text-blue-700',
                                                            label: 'Hazırlanıyor',
                                                            icon: <Loader2 size={16} className="animate-spin" />
                                                        };
                                                    case 'shipped':
                                                        return {
                                                            bg: 'bg-purple-50 border-purple-100',
                                                            text: 'text-purple-700',
                                                            label: 'Kargolandı',
                                                            icon: <Truck size={16} />
                                                        };
                                                    case 'delivered':
                                                        return {
                                                            bg: 'bg-green-50 border-green-100',
                                                            text: 'text-green-700',
                                                            label: 'Teslim Edildi',
                                                            icon: <CheckCircle size={16} />
                                                        };
                                                    default:
                                                        return {
                                                            bg: 'bg-gray-50 border-gray-100',
                                                            text: 'text-gray-700',
                                                            label: status,
                                                            icon: <FlaskConical size={16} />
                                                        };
                                                }
                                            };

                                            const ui = getSampleUI(existingSample.status);

                                            return (
                                                <div className={`mx-5 mb-5 p-4 rounded-xl border ${ui.bg} flex flex-col gap-3 animate-in fade-in`}>

                                                    <div className="flex justify-between items-center">
                                                        <div className={`font-bold text-sm flex items-center gap-2 ${ui.text}`}>
                                                            Numune Talebi
                                                        </div>
                                                        <div className={`text-xs font-bold uppercase px-2 py-1 rounded-md bg-white/60 flex items-center gap-1.5 ${ui.text}`}>
                                                            {ui.icon}
                                                            {ui.label}
                                                        </div>
                                                    </div>

                                                    {existingSample.supplier_notes && (
                                                        <p className="text-xs text-gray-600 italic border-l-2 border-gray-300 pl-2">
                                                            "{existingSample.supplier_notes}"
                                                        </p>
                                                    )}

                                                    {existingSample.shipping_tracking_code && (
                                                        <div className="bg-white p-2.5 rounded-lg border border-gray-200 flex justify-between items-center group">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <Package size={14} className="text-gray-400 flex-shrink-0" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] text-gray-400 font-bold uppercase leading-none">Kargo Takip</span>
                                                                    <span className="text-xs font-mono font-bold text-gray-900 truncate">
                                                                        {existingSample.shipping_tracking_code}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Kopyala Butonu */}
                                                            <button
                                                                onClick={() => { navigator.clipboard.writeText(existingSample.shipping_tracking_code); alert("Kopyalandı!") }}
                                                                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-600 transition"
                                                                title="Kodu Kopyala"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {/* Aksiyon */}

                                        {!isClosed && (
                                            <div className="p-4 border-t border-gray-100 bg-gray-50 gap-4 flex flex-col">
                                                {!existingSample && !offer.is_accepted && (
                                                    <button
                                                        onClick={() => handleRequestSample(offer.id, supplierId, product.id)}
                                                        disabled={actionLoading === offer.id}
                                                        className="w-full py-3 border border-purple-200 bg-purple-50 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-100 transition flex items-center justify-center gap-2"
                                                    >
                                                        {actionLoading === offer.id ? <Loader2 className="animate-spin" size={16} /> : <FlaskConical size={16} />}
                                                        Numune İste
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleAcceptOffer(offer.id)}
                                                    disabled={actionLoading !== null}
                                                    className="w-full bg-gray-900 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {actionLoading === offer.id ? <Loader2 className="animate-spin" /> : <ThumbsUp size={18} />}
                                                    Teklifi Kabul Et
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock size={32} />
                            </div>
                            <h3 className="font-bold text-gray-900">Henüz Teklif Yok</h3>
                            <p className="text-gray-500 mt-2">Teklifler gelmeye başladığında burada listelenecek.</p>
                        </div>
                    )}
                </div>

                {/* Detaylar (Aynı) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* SOL KOLON: Görseller */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2"><FileImage size={18} className="text-blue-600" /> Tasarım Önizlemesi</h3>
                                {previewUrl && <a href={previewUrl} download target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1"><Download size={14} /> İndir</a>}
                            </div>
                            <div className="bg-gray-100 p-8 flex justify-center">
                                {previewUrl ? <img src={previewUrl} alt="Tasarım" className="max-h-[500px] object-contain shadow-lg rounded-lg bg-white" /> : <div className="text-gray-400 py-10">Tasarım yok.</div>}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-6">
                            <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center p-2 overflow-hidden">
                                {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" /> : <FileImage className="text-gray-300" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900">Yüklenen Logo</h4>
                                <p className="text-xs text-gray-500">Baskı orijinal dosyası.</p>
                            </div>
                            {logoUrl && <a href={logoUrl} download target="_blank" className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition flex items-center gap-2"><Download size={16} /> İndir</a>}
                        </div>
                    </div>

                    {/* SAĞ KOLON: Ürün Detayları */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">Ürün Bilgileri</h3>
                            <div className="flex gap-4 mb-6">
                                <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                                    {productUrl && <img src={productUrl} className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 leading-tight mb-1">{product?.name || "Ürün Adı Yok"}</h4>
                                    <p className="text-sm text-gray-500">{product?.category?.data?.attributes?.name || "Kategori"}</p>
                                </div>
                            </div>
                            <div className="space-y-3 border-t border-gray-100 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm flex items-center gap-2"><Package size={16} /> Toplam Adet</span>
                                    <span className="font-bold text-gray-900 text-lg">{attr.quantity}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 tracking-wider">Sipariş Notu</h3>
                            <p className="text-gray-700 text-sm italic bg-yellow-50 p-4 rounded-lg border border-yellow-100">"{attr.note || 'Müşteri notu bulunmuyor.'}"</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}