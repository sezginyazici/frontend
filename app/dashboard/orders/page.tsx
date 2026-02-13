"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api, { getMediaURL } from "@/lib/api";
import {
    Package, Calendar, ChevronRight, Loader2,
    CreditCard, CheckCircle, Clock, ArrowRight
} from "lucide-react";

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Auth Kontrolü
    useEffect(() => {
        if (!authLoading && !user) router.push("/auth/login");
    }, [user, authLoading, router]);

    // Siparişleri Çekme
    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            try {
                // İlişkileri çekiyoruz:
                // Order -> Offer -> Request -> Product -> Base Image
                // Bu zincirleme populate (nested populate) yapısı Strapi v5 array syntax ile:
                const query = `/orders?filters[customer][id][$eq]=${user.id}&sort=createdAt:desc` +
                    `&populate[0]=offer` +
                    `&populate[1]=offer.request` +
                    `&populate[2]=offer.request.product` +
                    `&populate[3]=offer.request.product.base_image`;

                const { data } = await api.get(query);
                setOrders(data.data || []);
            } catch (error) {
                console.error("Siparişler çekilemedi:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
        );
    }

    // Ödeme Durumu Badge'i
    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Ödendi</span>;
            case 'pending':
                return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> Ödeme Bekleniyor</span>;
            default:
                return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Siparişlerim</h1>
                        <p className="text-gray-500 mt-1">Onaylanan teklifleriniz ve sipariş durumları.</p>
                    </div>
                    <Link href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1">
                        Dashboard'a Dön <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {orders.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {orders.map((order) => {
                                const attr = order.attributes || order;
                                const offer = attr.offer?.data?.attributes || attr.offer;
                                const request = offer?.request?.data?.attributes || offer?.request;
                                const product = request?.product?.data?.attributes || request?.product;
                                const productImg = product?.base_image?.data?.attributes || product?.base_image;

                                const imgUrl = getMediaURL(productImg?.url);

                                return (
                                    <div key={order.id} className="p-6 hover:bg-gray-50 transition group flex flex-col md:flex-row gap-6 items-center">

                                        {/* Resim */}
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                            {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <Package className="m-auto mt-6 text-gray-300" />}
                                        </div>

                                        {/* Bilgiler */}
                                        <div className="flex-1 w-full text-center md:text-left">
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    {attr.order_code || `ORD-${order.id}`}
                                                </span>
                                                {getPaymentBadge(attr.payment_status)}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">{product?.name || "Özel Sipariş"}</h3>
                                            <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-4 mt-1">
                                                <span><span className="font-bold">{request?.quantity || 0}</span> Adet</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(attr.createdAt).toLocaleDateString('tr-TR')}</span>
                                            </p>
                                        </div>

                                        {/* Fiyat ve Aksiyon */}
                                        <div className="text-center md:text-right min-w-[150px]">
                                            <p className="text-xs text-gray-500 mb-1">Toplam Tutar</p>
                                            <p className="text-2xl font-black text-gray-900 mb-3">₺{attr.total_amount}</p>

                                            {attr.payment_status === 'pending' ? (
                                                <Link href={`/dashboard/orders/${order.id}`} className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition shadow-lg shadow-blue-200 w-full">
                                                    <CreditCard size={16} /> Ödeme Yap
                                                </Link>
                                            ) : (
                                                <Link href={`/dashboard/orders/${order.id}`} className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-bold text-sm transition w-full">
                                                    Detaylar <ChevronRight size={16} />
                                                </Link>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 px-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <Package size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Henüz siparişiniz yok.</h3>
                            <p className="text-gray-500 mt-2">Teklifleri onayladığınızda siparişleriniz burada görünecek.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}