"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api, { getMediaURL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast, Toaster } from 'sonner';
import {
    ArrowLeft, Package, Truck, User, MapPin,
    CheckCircle, AlertCircle, Save, Loader2, Copy
} from "lucide-react";

export default function ManageOrderPage() {
    const params = useParams();
    const id = params?.id;
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [status, setStatus] = useState("preparing");
    const [trackingCode, setTrackingCode] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!id || authLoading) return;
        if (!user) { router.push("/auth/login"); return; }

        const fetchOrder = async () => {
            try {
                // SİPARİŞ DETAYINI ÇEK (Deep Populate)
                // Order -> Customer
                // Order -> Offer -> Request -> Product -> Image
                const query = `/orders?filters[id][$eq]=${id}` +
                    `&populate[customer]=true` +
                    `&populate[offer][populate][request][populate][product][populate]=base_image`;

                const { data } = await api.get(query);
                const orderData = data.data && data.data.length > 0 ? data.data[0] : null;

                if (orderData) {
                    setOrder(orderData);
                    // Mevcut değerleri forma doldur
                    setStatus(orderData.attributes?.shipping_status || "preparing");
                    setTrackingCode(orderData.attributes?.shipping_tracking_code || "");
                } else {
                    toast("Sipariş bulunamadı");
                    router.push("/supplier/dashboard");
                }
            } catch (error) {
                console.error("Sipariş çekme hatası:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, user, authLoading, router]);

    // GÜNCELLEME FONKSİYONU
    const handleUpdate = async () => {
        setUpdating(true);
        try {
            // Strapi v5 update (documentId veya id)
            const orderId = order.documentId || order.id;

            await api.put(`/orders/${orderId}`, {
                data: {
                    shipping_status: status,
                    shipping_tracking_code: trackingCode
                }
            });

            toast("Sipariş durumu güncellendi!");
        } catch (error: any) {
            console.error("Güncelleme hatası:", error);
            const msg = error.response?.data?.error?.message || "Hata oluştu.";
            toast("Hata: " + msg);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
    if (!order) return null;

    const attr = order.attributes || order;
    const customer = attr.customer?.data?.attributes || attr.customer;
    const offer = attr.offer?.data?.attributes || attr.offer;
    const request = offer?.request?.data?.attributes || offer?.request;
    const product = request?.product?.data?.attributes || request?.product;
    const imgUrl = getMediaURL(product?.base_image?.data?.attributes?.url);

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/supplier/dashboard" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition text-gray-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                            Sipariş Yönetimi
                            <span className="text-sm font-normal text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                                #{attr.order_code?.slice(-8) || order.id}
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SOL KOLON: SİPARİŞ VE MÜŞTERİ BİLGİLERİ */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Ürün Kartı */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex gap-6">
                            <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <Package className="m-auto mt-8 text-gray-300" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{product?.name}</h3>
                                <p className="text-gray-500 text-sm mb-2">{request?.quantity} Adet Üretilecek</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg">
                                    <CheckCircle size={14} /> Ödeme Onaylandı
                                </div>
                            </div>
                        </div>

                        {/* Müşteri Bilgileri */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="text-purple-600" /> Müşteri Bilgileri
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-xs text-gray-500 uppercase font-bold">İsim Soyisim</span>
                                    <div className="font-bold text-gray-900 text-lg">{customer?.username}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-xs text-gray-500 uppercase font-bold">İletişim / Email</span>
                                    <div className="font-bold text-gray-900 text-lg truncate">{customer?.email}</div>
                                </div>
                                <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1">
                                        <MapPin size={12} /> Teslimat Adresi
                                    </span>
                                    {/* Not: User tablosunda address alanı varsa buraya customer.address yazılmalı */}
                                    <div className="font-medium text-gray-700 mt-1">
                                        {customer?.address || "Müşteri adres bilgisi girilmemiş."}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sipariş Notu */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-2">Teklif Notunuz</h3>
                            <p className="text-gray-600 italic">"{offer?.note || 'Not yok'}"</p>
                        </div>
                    </div>

                    {/* SAĞ KOLON: AKSİYON ALANI (KARGO GİRİŞİ) */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Truck className="text-black" /> Durum Güncelle
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Sipariş Durumu</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none bg-white"
                                    >
                                        <option value="preparing">Hazırlanıyor (Üretimde)</option>
                                        <option value="shipped">Kargoya Verildi</option>
                                        <option value="delivered">Teslim Edildi</option>
                                    </select>
                                </div>

                                {status === 'shipped' && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Kargo Takip Kodu</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={trackingCode}
                                                onChange={(e) => setTrackingCode(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pl-10"
                                                placeholder="Örn: 123456789"
                                            />
                                            <Package size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <AlertCircle size={12} /> Bu kod müşteriye iletilecektir.
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={handleUpdate}
                                    disabled={updating}
                                    className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {updating ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                    Değişiklikleri Kaydet
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                            <h4 className="font-bold text-blue-800 text-sm mb-2">Tedarikçi Bilgisi</h4>
                            <p className="text-sm text-blue-600">
                                Lütfen ürünü kargoya verdikten sonra durumu "Kargoya Verildi" olarak güncellemeyi ve takip kodunu girmeyi unutmayın. Ödeme hakedişiniz teslimat sonrası onaylanacaktır.
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}