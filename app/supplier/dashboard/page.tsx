"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api, { getMediaURL } from "@/lib/api";
import { toast, Toaster } from 'sonner';
import {
    Package, Clock, LayoutGrid, UserIcon, Briefcase, CheckCircle,
    Truck, FlaskConical, PlayCircle, LogOut
} from "lucide-react";

export default function SupplierDashboard() {
    const { user, logout, loading: authLoading } = useAuth();
    const router = useRouter();

    const [openRequests, setOpenRequests] = useState<any[]>([]);
    const [myOffers, setMyOffers] = useState<any[]>([]);
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [sampleRequests, setSampleRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [offeredRequestIds, setOfferedRequestIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        const token = localStorage.getItem('token'); // Token var mı kontrol et

        // Eğer yükleme bitti, kullanıcı yok VE token da yoksa -> Login'e at
        if (!authLoading && !user && !token) {
            router.push("/auth/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {

                // 1. AÇIK TALEPLERİ ÇEK (Marketplace)
                // Status 'open' veya 'offer_received' olanlar. Kendi taleplerimiz hariç.
                const reqQuery = `/requests?filters[status][$in][0]=open&filters[status][$in][1]=offer_received&filters[owner_user][id][$ne]=${user.id}&populate[product][populate]=base_image&sort=createdAt:desc`;
                const token = localStorage.getItem("token");
                if (token) {
                    api.defaults.headers.Authorization = `Bearer ${token}`;
                }
                const reqRes = await api.get(reqQuery);

                setOpenRequests(reqRes.data.data || []);

                // 2. VERDİĞİM TEKLİFLER
                const offerQuery = `/offers?filters[supplier_user][id][$eq]=${user.id}&populate[request][populate][product][populate]=base_image&sort=createdAt:desc`;
                const offerRes = await api.get(offerQuery);
                setMyOffers(offerRes.data.data || []);
                const offersData = offerRes.data.data;
                // Teklif verdiğim talep ID'lerini kaydet
                const ids = new Set<number>(offersData.map((o: any) => o.request?.id).filter(Boolean));
                setOfferedRequestIds(ids);

                // 3. AKTİF SİPARİŞLER (YENİ EKLENEN KISIM)
                // Tedarikçisi ben olduğum siparişleri çek.
                // İlişki zinciri: Order -> Offer -> Request -> Product
                const orderQuery = `/orders?filters[supplier][id][$eq]=${user.id}` +
                    `&sort=createdAt:desc` +
                    `&populate[customer]=true` + // Müşteriyi gör
                    `&populate[offer][populate][request][populate][product][populate]=base_image`; // Ürünü gör

                const orderRes = await api.get(orderQuery);
                setActiveOrders(orderRes.data.data || []);

                const sampleQuery = `/sample-requests?filters[supplier][id][$eq]=${user.id}&populate[product]=true&populate[customer]=true&sort=createdAt:desc`;
                const sampleRes = await api.get(sampleQuery);
                setSampleRequests(sampleRes.data.data || []);

            } catch (error) {
                console.error("Veri hatası:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const updateSampleStatus = async (id: number, status: string, trackingCode: string = "") => {
        try {
            await api.put(`/sample-requests/${id}`, {
                data: {
                    status: status,
                    shipping_tracking_code: trackingCode,
                    // Eğer preparing ise not ekleyebiliriz
                    supplier_notes: status === 'approved' ? "Numuneniz üretim sırasına alındı." : "Kargoya verildi."
                }
            });
            toast.success("Durum güncellendi!");
            window.location.reload();
        } catch (error) {
            toast.error("Güncelleme başarısız.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

    // Sipariş Durumu Rengi
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'shipped': return 'bg-blue-100 text-blue-700';
            default: return 'bg-yellow-100 text-yellow-700'; // preparing
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'delivered': return 'Teslim Edildi';
            case 'shipped': return 'Kargoda';
            default: return 'Hazırlanıyor';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Tedarikçi Paneli</h1>
                        <p className="text-gray-500">Hoş geldin, {user?.username} (Firma Hesabı)</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/dashboard/settings" // Burayı /dashboard yerine /dashboard/settings yaptık
                            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"
                            title="Ayarlar"
                        >
                            <UserIcon size={20} className="text-gray-700" />
                        </Link>

                        {/* <Link href="/dashboard" className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                            Müşteri Paneline Dön
                        </Link> */}

                        <button onClick={logout} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* --- 1. BÖLÜM: AKTİF SİPARİŞLER (EN ÖNEMLİ KISIM) --- */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Package className="text-purple-600" /> Aktif Siparişler & Üretim
                    </h2>

                    {activeOrders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {activeOrders.map((order) => {
                                const attr = order.attributes || order;
                                const offer = attr.offer?.data?.attributes || attr.offer;
                                const request = offer?.request?.data?.attributes || offer?.request;
                                const product = request?.product?.data?.attributes || request?.product;
                                const customer = attr.customer?.data?.attributes || attr.customer;
                                const imgUrl = getMediaURL(product?.base_image?.data?.attributes?.url);

                                return (
                                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                                                        {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <Package className="m-auto mt-3 text-gray-300" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 line-clamp-1">{product?.name || "Ürün"}</h3>
                                                        <p className="text-xs text-gray-500">Sipariş No: #{attr.order_code?.slice(-6) || order.id}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(attr.shipping_status)}`}>
                                                    {getStatusText(attr.shipping_status)}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <div className="flex justify-between">
                                                    <span>Müşteri:</span>
                                                    <span className="font-bold text-gray-900">{customer?.username || "Bilinmiyor"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Adet:</span>
                                                    <span className="font-bold text-gray-900">{request?.quantity || 1}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Tutar:</span>
                                                    <span className="font-bold text-green-600">₺{attr.total_amount}</span>
                                                </div>
                                            </div>

                                            <Link href={`/supplier/orders/${order.id}`} className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition flex items-center justify-center gap-2">
                                                <Truck size={16} /> Siparişi Yönet
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                            <div className="w-16 h-16 bg-purple-50 text-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package size={32} />
                            </div>
                            <h3 className="font-bold text-gray-900">Henüz siparişin yok</h3>
                            <p className="text-gray-500 mt-2">Verdiğin teklifler onaylandığında siparişlerin burada görünecek.</p>
                        </div>
                    )}
                </div>

                {/* --- NUMUNE İSTEKLERİ (TABLO YAPISINA GÖRE REVİZE EDİLDİ) --- */}
                {sampleRequests.length > 0 && (
                    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FlaskConical className="text-pink-600" /> Numune İstekleri ({sampleRequests.length})
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sampleRequests.map((req: any) => {
                                const r = req.attributes || req;
                                const reqId = req.documentId || req.id;
                                const product = r.product?.data?.attributes || r.product;
                                const customer = r.customer?.data?.attributes || r.customer;
                                const imgUrl = getMediaURL(product?.base_image?.url);

                                // Statüye göre UI kontrolü
                                const isPending = r.status === 'requested';
                                const isPreparing = r.status === 'approved';
                                const isShipped = r.status === 'shipped';

                                return (
                                    <div key={req.id} className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100 flex flex-col gap-4 relative overflow-hidden">

                                        {/* Statü Badge */}
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-pink-50 text-pink-700 text-xs font-bold rounded-bl-xl">
                                            {r.status === 'requested' && 'Onay Bekliyor'}
                                            {r.status === 'approved' && 'Hazırlanıyor'}
                                            {r.status === 'shipped' && 'Kargolandı'}
                                            {r.status === 'delivered' && 'Teslim Edildi'}
                                        </div>

                                        <div className="flex gap-4 mt-2">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <Package className="m-auto mt-4 text-gray-300" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 line-clamp-1">{product?.name || "Ürün"}</h3>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <UserIcon size={12} /> {customer?.username}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Aksiyon Alanı: Akışa Göre Değişir */}
                                        <div className="mt-auto border-t border-gray-100 pt-3">

                                            {/* Durum 1: Yeni İstek -> Hazırlamaya Başla */}
                                            {isPending && (
                                                <div className="flex flex-col gap-2">
                                                    <p className="text-xs text-gray-500 mb-1">Müşteri numune bekliyor. Gönderimi onaylıyor musunuz?</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => updateSampleStatus(reqId, 'rejected')}
                                                            className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50"
                                                        >
                                                            Reddet
                                                        </button>
                                                        <button
                                                            onClick={() => updateSampleStatus(reqId, 'approved')}
                                                            className="flex-1 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold hover:bg-pink-700 flex items-center justify-center gap-1"
                                                        >
                                                            <PlayCircle size={14} /> Onayla & Hazırla
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Durum 2: Hazırlanıyor -> Kargola */}
                                            {isPreparing && (
                                                <div className="flex gap-2 flex-col">
                                                    <p className="text-xs text-blue-600 font-bold mb-1">Üretim/Hazırlık Aşamasında</p>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Kargo Takip Kodu"
                                                            id={`tracking-${req.id}`}
                                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-pink-500"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const code = (document.getElementById(`tracking-${req.id}`) as HTMLInputElement).value;
                                                                if (!code) return alert("Kargo kodu giriniz.");
                                                                updateSampleStatus(reqId, 'shipped', code);
                                                            }}
                                                            className="bg-black text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-gray-800"
                                                        >
                                                            Kargola
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Durum 3: Kargolandı */}
                                            {isShipped && (
                                                <div className="bg-gray-50 p-2 rounded text-center">
                                                    <p className="text-xs text-gray-500">Takip No:</p>
                                                    <p className="text-sm font-mono font-bold text-gray-900">{r.shipping_tracking_code}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* --- 2. BÖLÜM: PAZAR YERİ VE TEKLİFLER (Mevcut Yapı) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SOL: PAZAR YERİ */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <LayoutGrid className="text-blue-600" /> Pazar Yeri (Açık Talepler)
                        </h2>

                        <div className="space-y-4">
                            {openRequests.length > 0 ? openRequests.map((req) => {
                                const attr = req.attributes || req;
                                const product = attr.product?.data?.attributes || attr.product;
                                const imgUrl = getMediaURL(product?.base_image?.data?.attributes?.url);

                                // KONTROL: Daha önce teklif vermiş miyim?
                                const isOffered = offeredRequestIds.has(req.id);

                                return (
                                    <div key={req.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition flex gap-5 items-center group ${isOffered ? 'border-gray-100 opacity-60' : 'border-gray-200 hover:border-blue-400'}`}>
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <Package className="m-auto mt-6 text-gray-300" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg">{product?.name}</h3>
                                            <p className="text-sm text-gray-500">{attr.quantity} Adet • {new Date(attr.createdAt).toLocaleDateString('tr-TR')}</p>
                                        </div>

                                        {isOffered ? (
                                            <span className="bg-gray-100 text-gray-500 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1 cursor-not-allowed">
                                                <CheckCircle size={16} /> Teklif Verildi
                                            </span>
                                        ) : (
                                            <Link href={`/supplier/requests/${req.id}`} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
                                                Teklif Ver
                                            </Link>
                                        )}
                                    </div>
                                )
                            }) : (
                                <div className="text-center py-10 bg-white rounded-2xl border border-dashed">
                                    <p className="text-gray-500">Şu an açık talep bulunmuyor.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SAĞ: TEKLİFLERİM - GÜNCELLENMİŞ TASARIM */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Briefcase className="text-green-600" /> Verdiğim Teklifler
                        </h2>

                        <div className="space-y-4">
                            {myOffers.length > 0 ? myOffers.map((offer) => {
                                const attr = offer.attributes || offer;
                                const req = attr.request?.data?.attributes || attr.request;
                                const product = req?.product?.data?.attributes || req?.product;
                                const imgUrl = getMediaURL(product?.base_image?.data?.attributes?.url);
                                const isAccepted = attr.is_accepted;

                                return (
                                    <div key={offer.id} className="group bg-white p-3 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-300 transition flex gap-3 items-center">

                                        {/* Minik Ürün Görseli */}
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                            {imgUrl ? (
                                                <img src={imgUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={product?.name} />
                                            ) : (
                                                <Briefcase className="m-auto mt-3 text-gray-300" size={20} />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-sm text-gray-900 truncate pr-2">{product?.name || "İsimsiz Ürün"}</h4>

                                                {/* Durum Badge'i */}
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 flex-shrink-0 ${isAccepted
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-orange-100 text-orange-700"
                                                    }`}>
                                                    {isAccepted ? <CheckCircle size={10} strokeWidth={3} /> : <Clock size={10} strokeWidth={3} />}
                                                    {isAccepted ? "Onaylandı" : "Bekliyor"}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-gray-500 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                                                    {attr.price_per_unit} ₺ <span className="text-[10px] opacity-70">/adet</span>
                                                </span>
                                                <span className="text-sm font-black text-gray-900">
                                                    ₺{attr.total_price?.toLocaleString('tr-TR')}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                )
                            }) : (
                                <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center">
                                    <Briefcase className="mx-auto text-gray-300 mb-2" size={24} />
                                    <p className="text-sm text-gray-500 font-medium">Henüz bir teklif vermediniz.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}