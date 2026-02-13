"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api, { getMediaURL } from "@/lib/api";
import {
    Plus, Package, Clock, ChevronRight, Store, UserIcon,
    LogOut, ArrowRight, Truck, Loader2, CheckCircle, Copy, AlertCircle
} from "lucide-react";

export default function Dashboard() {
    const { user, logout, loading: authLoading } = useAuth();
    const router = useRouter();

    const [requests, setRequests] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Auth Kontrolü
    useEffect(() => {
        const token = localStorage.getItem('token'); // Token var mı kontrol et

        // Eğer yükleme bitti, kullanıcı yok VE token da yoksa -> Login'e at
        if (!authLoading && !user && !token) {
            router.push("/auth/login");
        }
    }, [user, authLoading, router]);

    // Veri Çekme
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // 1. TALEPLERİMİ ÇEK
                const reqQuery = `/requests?filters[owner_user][id][$eq]=${user.id}&populate[product][populate]=base_image&populate[offers]=count&sort=createdAt:desc`;
                const reqRes = await api.get(reqQuery);
                setRequests(reqRes.data.data || []);

                // 2. SİPARİŞLERİMİ ÇEK (GÜNCELLENMİŞ DERİN SORGU)
                // Amaç: Ürün resmini ve Tedarikçi Logosunu/Adını aynı anda almak.
                // Zincir: Order -> Offer -> Supplier -> Profile -> Logo

                const orderQuery = ///`/orders?populate=*`;
                    `/orders?populate=*&populate[supplier][populate][0]=*&` +
                    `populate[supplier][populate][company_profile][populate]=*`

                // const orderQuery = `/orders?filters[customer][id][$eq]=${user.id}&sort=createdAt:desc&` +
                //     // Ürün Resmine Ulaş
                //     `populate[offer][populate][request][populate][product][populate]=base_image&` +
                //     // Tedarikçi Profiline Ulaş
                //     `populate[offer][populate][supplier_user][populate][company_profile][populate]=company_logo`;

                const orderRes = await api.get(orderQuery);

                if (orderRes.data.data.length > 0) {
                    // İlk siparişin özelliklerini (field names) yazdır
                    console.log("Alan İsimleri:", Object.keys(orderRes.data.data[0].attributes || orderRes.data.data[0]));
                }
                console.log("----------------------------");


                setOrders(orderRes.data.data || []);

            } catch (error) {
                console.error("Veri çekme hatası:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);


    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
        );
    }
    // Kargo Durum Helper'ı
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'delivered': return { color: 'bg-green-100 text-green-700', text: 'Teslim Edildi', icon: <CheckCircle size={14} /> };
            case 'shipped': return { color: 'bg-blue-100 text-blue-700', text: 'Kargoda', icon: <Truck size={14} /> };
            default: return { color: 'bg-yellow-100 text-yellow-700', text: 'Hazırlanıyor', icon: <Package size={14} /> };
        }
    };

    const getStatusBadge = (status: string) => {
        const s = status?.toLowerCase() || "open";
        switch (s) {
            case "open": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700"><Clock size={14} /> Tedarikçi Bekleniyor</span>;
            case "offer_received": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><Package size={14} /> Teklif Hazır</span>;
            case "approved": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={14} /> Sipariş Onaylandı</span>;
            case "rejected": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle size={14} /> İptal Edildi</span>;
            case "completed": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={14} /> Tamamlandı</span>;

            default: return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{status}</span>;
        }
    };

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'paid': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Ödendi</span>;
            case 'pending': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> Ödeme Bekleniyor</span>;
            default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Hesap Paneli</h1>
                        <p className="text-gray-500 mt-1">Hoş geldin, <span className="font-semibold text-gray-800">{user?.username}</span></p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* <Link
                            href="/supplier/dashboard"
                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-3 rounded-xl font-bold transition flex items-center gap-2"
                        >
                            <Store size={18} />
                            Tedarikçi Paneli
                        </Link> */}

                        {/* <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-200 flex items-center gap-2">
                            Yeni Talep Oluştur <ArrowRight size={18} />
                        </Link> */}

                        <Link
                            href="/dashboard/settings" // Burayı /dashboard yerine /dashboard/settings yaptık
                            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"
                            title="Ayarlar"
                        >
                            <UserIcon size={20} className="text-gray-700" />
                        </Link>

                        <button onClick={logout} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* İstatistik Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Toplam Talep</p>
                            <p className="text-2xl font-black text-gray-900">{requests.length}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* SOL KOLON: SİPARİŞLERİM (GÜNCELLENDİ) */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Truck className="text-blue-600" /> Siparişlerim
                        </h2>

                        <div className="space-y-6">
                            {orders.length > 0 ? orders.map((order: any) => {
                                const attr = order.attributes || order;
                                const offer = attr.offer?.data?.attributes || attr.offer;
                                const request = offer?.request?.data?.attributes || offer?.request;
                                const product = request?.product?.data?.attributes || request?.product;
                                const imgUrl = getMediaURL(product?.base_image?.data?.attributes?.url);

                                // Tedarikçi Bilgileri
                                const supplierUser = attr?.supplier?.data?.attributes || attr?.supplier;
                                const profile = supplierUser?.company_profile?.data?.attributes || supplierUser?.company_profile;
                                const companyName = profile?.company_name || supplierUser?.username || "Tedarikçi";
                                const logoUrl = getMediaURL(profile?.company_logo?.data?.attributes?.url || profile?.company_logo?.url);

                                const statusInfo = getStatusInfo(attr.shipping_status);

                                return (
                                    <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition group">

                                        {/* Üst Kısım: Ürün ve Durum */}
                                        <div className="flex gap-5 mb-5">
                                            <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <Package className="m-auto mt-8 text-gray-300" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{product?.name}</h3>
                                                        <p className="text-sm text-gray-500 mt-1">Sipariş No: #{attr.order_code?.slice(-8) || order.id}</p>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${statusInfo.color}`}>
                                                        {statusInfo.icon} {statusInfo.text}
                                                    </span>
                                                </div>

                                                {/* Tedarikçi Bilgisi */}
                                                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg w-fit">
                                                    <div className="w-6 h-6 bg-white rounded-full overflow-hidden border border-gray-200">
                                                        {logoUrl ? <img src={logoUrl} className="w-full h-full object-cover" /> : <Store size={14} className="m-auto mt-1 text-gray-400" />}
                                                    </div>
                                                    <span className="font-bold text-gray-900">{companyName}</span>
                                                    <span className="text-gray-400">•</span>
                                                    <span>{attr.total_amount} ₺</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-between items-end aligns-end flex-1 gap-5">
                                            {/* Alt Kısım: Kargo Takip (Varsa Göster) */}
                                            {attr.shipping_status === 'shipped' && attr.shipping_tracking_code && (
                                                <div className="border-t border-gray-100 pt-4 flex items-center gap-4 animate-in fade-in sm:w-[50%]">
                                                    <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-3 flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                                                                <Truck size={18} />
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-blue-600 font-bold uppercase block">Kargo Takip Kodu</span>
                                                                <span className="font-mono font-bold text-gray-900 text-lg tracking-wide">{attr.shipping_tracking_code}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => { navigator.clipboard.writeText(attr.shipping_tracking_code); toast("Kopyalandı!") }}
                                                            className="text-gray-400 hover:text-blue-600 transition"
                                                            title="Kodu Kopyala"
                                                        >
                                                            <Copy size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Butonlar */}
                                            {attr.payment_status === 'pending' ? (
                                                <Link href={`/dashboard/orders/${order.id}`} className="block w-full sm:w-[50%] text-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm transition shadow-md shadow-blue-100 ml-auto">
                                                    Ödeme Yap
                                                </Link>
                                            ) : (
                                                <Link href={`/dashboard/orders/${order.id}`} className="block w-full sm:w-[50%] text-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg font-bold text-sm transition ml-auto">
                                                    Sipariş Detayı
                                                </Link>
                                            )}
                                            {attr.shipping_status === 'delivered' && (
                                                <div className="mt-4 w-half">
                                                    <button className="w-full py-3 border-2 border-gray-900 rounded-xl font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition">
                                                        Siparişi Onayla & Değerlendir
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                                    <p className="text-gray-500">Henüz aktif bir siparişiniz bulunmuyor.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SAĞ KOLON: TALEPLERİM (MEVCUT YAPI) */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock className="text-orange-500" /> Açık Taleplerim
                        </h2>

                        <div className="space-y-4">
                            {requests.map((req: any) => {
                                const r = req.attributes || req;
                                const product = r.product?.data?.attributes || r.product;
                                const imgUrl = getMediaURL(product?.base_image?.data?.attributes?.url);
                                const offerCount = r.offers?.data?.attributes?.count || r.offers?.count || r.offers?.length || 0;

                                return (
                                    <Link href={`/dashboard/requests/${req.id}`} key={req.id} className="block group">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 group-hover:border-blue-400 transition flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <Package className="m-auto mt-4 text-gray-300" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{product?.name} - {r.quantity} Adet</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-md">
                                                        {offerCount} Teklif
                                                    </span>
                                                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="text-gray-300 group-hover:text-blue-500" />
                                        </div>
                                    </Link>
                                );
                            })}

                            {requests.length === 0 && (
                                <div className="text-center text-gray-400 py-10 bg-white rounded-2xl border border-dashed">
                                    Talep yok.
                                </div>
                            )}

                            <Link href="/" className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition font-bold text-sm mt-4">
                                <Plus size={16} /> Yeni Talep Oluştur
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}