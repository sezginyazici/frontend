"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api, { getMediaURL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Package, Calendar, Send, Calculator } from "lucide-react";
import { toast, Toaster } from 'sonner';
export default function GiveOfferPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [pricePerUnit, setPricePerUnit] = useState<string>("");
    const [deliveryDays, setDeliveryDays] = useState<string>("");
    const [note, setNote] = useState("");
    const formatTRY = (amount: number) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 2,
        }).format(amount);
    };
    useEffect(() => {
        if (!user) return;
        const fetchReq = async () => {
            try {
                // HATA BURADAYDI: /requests/${id} -> documentId bekler.
                // ÇÖZÜM: filters[id][$eq]=${id} -> Sayısal ID ile arama yapar.

                const query = `/requests?filters[id][$eq]=${id}&populate[product][populate]=base_image&populate=preview_image`;
                const { data } = await api.get(query);

                // Filtreleme sonucu 'Dizi' (Array) döner, biz ilkini alırız.
                const reqData = data.data && data.data.length > 0 ? data.data[0] : null;

                if (reqData) {
                    setRequest(reqData);
                } else {
                    console.log("Talep bulunamadı (ID eşleşmedi)");
                }

            } catch (e) {
                console.error("Talep çekme hatası:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchReq();
    }, [id, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pricePerUnit || !deliveryDays) return toast("Lütfen alanları doldurun.");

        setSubmitting(true);
        try {
            const unitPrice = parseFloat(pricePerUnit);
            const qty = request.attributes?.quantity || 1;
            const total = (parseFloat(pricePerUnit) * attr.quantity).toFixed(2); // unitPrice * qty;

            // 1. Teklifi Oluştur
            await api.post("/offers", {
                data: {
                    price_per_unit: unitPrice,
                    total_price: total,
                    delivery_days: parseInt(deliveryDays),
                    note: note,
                    request: id,
                    supplier_user: user?.id,
                    is_accepted: false
                }
            });

            // 2. Talebin Statüsünü Güncelle (Opsiyonel: İlk teklifse 'offer_received' yap)
            if (request.status != 'closed' || request.status != 'completed') {
                await api.put(`/requests/${request.documentId || request.id}`, {
                    data: { status: 'offer_received' }
                });
            }

            toast("Teklifiniz başarıyla gönderildi!");
            router.push("/supplier/dashboard");

        } catch (error) {
            console.error("Teklif hatası:", error);
            toast("Teklif gönderilemedi.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Yükleniyor...</div>;
    if (!request) return <div>Talep bulunamadı.</div>;

    const attr = request.attributes || request;
    const product = attr.product?.data?.attributes || attr.product;
    const imgUrl = getMediaURL(attr?.preview_image?.url);

    // Hesaplama Önizleme
    const calculatedTotal = pricePerUnit ? formatTRY(parseFloat(pricePerUnit) * attr.quantity) : "0.00";

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-4xl">

                <Link href="/supplier/dashboard" className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900">
                    <ArrowLeft size={18} /> Listeye Dön
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* SOL: TALEP DETAYI */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-6 border border-gray-100">
                            {imgUrl && <img src={imgUrl} className="w-full h-full object-cover" />}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product?.name}</h1>
                        <div className="flex gap-4 text-sm text-gray-600 mb-4">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold">{attr.quantity} Adet</span>
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(attr.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800 italic">
                            "{attr.note || 'Müşteri notu yok.'}"
                        </div>
                    </div>

                    {/* SAĞ: TEKLİF FORMU */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 h-fit">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calculator className="text-blue-600" /> Teklif Ver
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Birim Fiyat (₺)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                                    placeholder="Örn: 15.50"
                                    value={pricePerUnit}
                                    onChange={e => setPricePerUnit(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Teslim Süresi (Gün)</label>
                                <input
                                    type="number"
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Örn: 7"
                                    value={deliveryDays}
                                    onChange={e => setDeliveryDays(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tedarikçi Notu</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                    placeholder="Kargo dahil, baskı hariç vb..."
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                />
                            </div>

                            {/* HESAPLAMA KARTI */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Toplam Tutar:</span>
                                <span className="text-2xl font-black text-gray-900">{calculatedTotal}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? "Gönderiliyor..." : <><Send size={18} /> Teklifi Gönder</>}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}