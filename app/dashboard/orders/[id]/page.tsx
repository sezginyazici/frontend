"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api, { getMediaURL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast, Toaster } from 'sonner';
import {
    ArrowLeft, Package, CheckCircle, CreditCard,
    ShieldCheck, Calendar, Truck, Loader2, Download
} from "lucide-react";

export default function OrderPaymentPage() {
    const params = useParams();
    const id = params?.id;
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

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

        const fetchOrder = async () => {
            try {
                // Derinlemesine veri çekme:
                // Order -> Offer -> Request -> Product & Preview Image
                const query = `/orders?filters[id][$eq]=${id}` +
                    `&populate[0]=offer` +
                    `&populate[1]=offer.request` +
                    `&populate[2]=offer.request.product` +
                    `&populate[3]=offer.request.product.base_image` +
                    `&populate[4]=offer.request.preview_image`;

                const { data } = await api.get(query);
                const orderData = data.data && data.data.length > 0 ? data.data[0] : null;

                if (orderData) setOrder(orderData);
                else router.push("/dashboard");
            } catch (error) {
                console.error("Sipariş hatası:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, user, authLoading, router]);

    // Ödeme Simülasyonu
    const handlePayment = async () => {
        if (!confirm("Kartınızdan çekim yapılacak. Onaylıyor musunuz?")) return;

        setPaymentProcessing(true);
        try {
            // Ödeme işlemi burada yapılır (Stripe/Iyzico vb.)
            // Biz şimdilik veritabanında statüyü güncelliyoruz.

            // Strapi v5 için documentId, v4 için id
            const orderId = order.documentId || order.id;

            await api.put(`/orders/${orderId}`, {
                data: {
                    payment_status: 'paid'
                }
            });

            // State'i güncelle
            setOrder((prev: any) => ({
                ...prev,
                attributes: { ...prev.attributes, payment_status: 'paid' }
            }));

            toast("Ödeme başarıyla alındı! Siparişiniz üretime hazırlanıyor.");

        } catch (error) {
            console.error("Ödeme hatası:", error);
            toast("Ödeme sırasında bir hata oluştu.");
        } finally {
            setPaymentProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Yükleniyor...</div>;
    if (!order) return null;

    const attr = order.attributes || order;
    const offer = attr.offer?.data?.attributes || attr.offer;
    const request = offer?.request?.data?.attributes || offer?.request;
    const product = request?.product?.data?.attributes || request?.product;
    const productImg = product?.base_image?.data?.attributes || product?.base_image;
    const previewImg = request?.preview_image?.data?.attributes || request?.preview_image;

    const imgUrl = getMediaURL(previewImg?.url || productImg?.url);
    const isPaid = attr.payment_status === 'paid';

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-4xl">

                <div className="mb-6">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-bold">
                        <ArrowLeft size={16} /> Dashboard'a Dön
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SOL TARAF: SİPARİŞ ÖZETİ */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Başlık Kartı */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-2xl font-extrabold text-gray-900">Sipariş #{attr.order_code || order.id}</h1>
                                    <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                                        <Calendar size={14} /> {new Date(attr.createdAt).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                                {isPaid ? (
                                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                                        <CheckCircle size={18} /> Ödeme Tamamlandı
                                    </span>
                                ) : (
                                    <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                                        <CreditCard size={18} /> Ödeme Bekleniyor
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-4 border-t border-gray-100 pt-6">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                    {imgUrl && <img src={imgUrl} className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{product?.name}</h3>
                                    <p className="text-gray-500">{product?.category?.data?.attributes?.name || "Kategori"}</p>
                                    <div className="mt-2 flex items-center gap-4 text-sm">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">Adet: {request?.quantity}</span>
                                        {offer?.delivery_days && (
                                            <span className="flex items-center gap-1 text-blue-600"><Truck size={14} /> {offer.delivery_days} Günde Teslim</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tasarım Dosyası */}
                        {previewImg?.url && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Package size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Onaylanan Tasarım</h4>
                                        <p className="text-xs text-gray-500">Üretime girecek görsel.</p>
                                    </div>
                                </div>
                                <a href={getMediaURL(previewImg.url)} download target="_blank" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                                    <Download size={16} /> İndir
                                </a>
                            </div>
                        )}

                    </div>

                    {/* SAĞ TARAF: ÖDEME KARTI */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden sticky top-6">
                            <div className="p-6 bg-gray-50 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900">Ödeme Özeti</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Ara Toplam</span>
                                    <span>{formatTRY(attr.total_amount)}₺</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>KDV (%20)</span>
                                    <span>{formatTRY(attr.total_amount * 0.20)}₺</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 my-4"></div>
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-sm text-gray-900">Toplam Tutar</span>
                                    <span className="text-xl font-black text-blue-600">
                                        {formatTRY(attr.total_amount * 1.20)}₺
                                    </span>
                                </div>

                                {!isPaid ? (
                                    <button
                                        onClick={handlePayment}
                                        disabled={paymentProcessing}
                                        className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-xl transition mt-4 flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {paymentProcessing ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                                        Güvenli Ödeme Yap
                                    </button>
                                ) : (
                                    <div className="mt-4 bg-green-50 text-green-700 p-4 rounded-xl text-center font-bold border border-green-100">
                                        Ödemeniz alındı. Teşekkürler!
                                    </div>
                                )}

                                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
                                    <ShieldCheck size={14} /> 256-bit SSL Güvenli Ödeme
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}