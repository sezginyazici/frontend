"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import {
    Mail, Lock, User, ArrowRight, Loader2,
    Store, Briefcase, CheckCircle
} from "lucide-react";

// Suspense Boundary: Next.js build hatasını önler
export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
            <RegisterForm />
        </Suspense>
    );
}

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const [loading, setLoading] = useState(false);

    // Form State
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Hesap Türü: Strapi'deki 'type' enum değerleriyle BİREBİR AYNI olmalı
    const [accountType, setAccountType] = useState<'customer' | 'supplier'>('customer');

    // URL'den ?type=supplier gelirse onu seç
    useEffect(() => {
        const typeParam = searchParams.get("type");
        if (typeParam === 'supplier' || typeParam === 'customer') {
            setAccountType(typeParam);
        }
    }, [searchParams]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        setLoading(true);

        try {
            // 1. ADIM: KULLANICIYI OLUŞTUR (Standart Strapi Register)
            // Bu işlem için Public -> register izni açık olmalı.
            const registerRes = await api.post("/auth/local/register", {
                username,
                email,
                password,
            });

            const { user, jwt } = registerRes.data;

            if (user && jwt) {
                // 2. ADIM: FİRMA PROFİLİNİ OLUŞTUR
                // Bu işlem için Authenticated -> Company Profile -> create izni açık olmalı.
                // İlişkiyi 'user' ID'si göndererek kuruyoruz. 
                try {
                    const profileRes = await api.post("/company-profiles", {
                        data: {
                            type: accountType,
                            company_name: username,
                            user: user.id
                        }
                    }, {
                        headers: { Authorization: `Bearer ${jwt}` }
                    });


                    // 3. ADIM: OTOMATİK GİRİŞ YAP (Context'i güncellemek için)
                    const userWithProfile = {
                        ...user,
                        company_profile: {
                            type: accountType,
                            company_name: username,
                            ...profileRes.data.data[0] // Strapi'den dönen diğer alanlar
                        }
                    };

                    // ✅ 4. ADIM: AuthContext'e kaydet
                    login(jwt, userWithProfile);


                    toast.success("Hesabınız başarıyla oluşturuldu! Yönlendiriliyorsunuz...");

                    // Doğru panele yönlendir
                    setTimeout(() => {
                        if (accountType === 'supplier') {
                            router.push("/supplier/dashboard");
                        } else {
                            router.push("/dashboard");
                        }
                    }, 500);
                } catch (profileError: any) {
                    console.error("Profil oluşturma hatası:", profileError);
                    // Kullanıcı oluştu ama profil oluşamadıysa, kullanıcıyı silmek veya admin'e bildirmek gerekebilir.
                    // Şimdilik sadece hata gösteriyoruz.
                    toast.error("Kullanıcı oluştu ancak profil oluşturulamadı. Lütfen destekle iletişime geçin.");
                }
            }

        } catch (error: any) {
            console.error("Kayıt hatası:", error);
            // Strapi'den gelen hatayı yakala
            const errorMsg = error.response?.data?.error?.message || "Kayıt işlemi sırasında bir hata oluştu.";

            if (errorMsg.includes("Email or Username are already taken")) {
                toast.error("Bu e-posta veya kullanıcı adı zaten kullanılıyor.");
            } else {
                toast.error("Hata: " + errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white">

            {/* SOL TARAF: FORM ALANI */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 xl:p-24 overflow-y-auto">
                <div className="w-full max-w-md space-y-6">

                    {/* Başlık */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hesap Oluştur</h1>
                        <p className="text-gray-500 mt-2">Binlerce firma arasına katılmak için bilgilerinizi girin.</p>
                    </div>

                    {/* HESAP TÜRÜ SEÇİMİ */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setAccountType('customer')}
                            className={`p-4 rounded-2xl border-2 transition flex flex-col items-center gap-2 relative ${accountType === 'customer'
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-blue-300 text-gray-500'
                                }`}
                        >
                            <Briefcase size={24} />
                            <span className="font-bold text-sm">Müşteri</span>
                            {accountType === 'customer' && <CheckCircle size={16} className="absolute top-2 right-2 text-blue-600" />}
                        </button>

                        <button
                            type="button"
                            onClick={() => setAccountType('supplier')}
                            className={`p-4 rounded-2xl border-2 transition flex flex-col items-center gap-2 relative ${accountType === 'supplier'
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-gray-200 hover:border-orange-300 text-gray-500'
                                }`}
                        >
                            <Store size={24} />
                            <span className="font-bold text-sm">Tedarikçi</span>
                            {accountType === 'supplier' && <CheckCircle size={16} className="absolute top-2 right-2 text-orange-600" />}
                        </button>
                    </div>

                    {/* Kayıt Formu */}
                    <form onSubmit={handleRegister} className="space-y-4">

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Kullanıcı Adı / Firma Adı</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                    placeholder="Şirketinizin Adı"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">E-Posta Adresi</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                    placeholder="ornek@sirket.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                    placeholder="En az 6 karakter"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg ${accountType === 'supplier'
                                    ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
                                    : 'bg-gray-900 hover:bg-black shadow-gray-200'
                                    }`}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <>Hesap Oluştur <ArrowRight size={18} /></>}
                            </button>
                        </div>

                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Zaten hesabınız var mı? <Link href="/auth/login" className="font-bold text-blue-600 hover:underline">Giriş Yap</Link>
                    </p>
                </div>
            </div>

            {/* SAĞ TARAF: GÖRSEL / BRANDING */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center bg-gray-50">
                <div className="absolute inset-0 transition-opacity duration-700">
                    <img
                        src={accountType === 'supplier'
                            ? "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
                            : "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop"
                        }
                        className="w-full h-full object-cover"
                        alt="Register Background"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                </div>

                <div className="relative z-10 max-w-lg text-center px-12 text-white">
                    <h2 className="text-4xl font-black mb-6 leading-tight">
                        {accountType === 'supplier'
                            ? "Satışlarınızı Katlamaya Hazır Mısınız?"
                            : "Satın Alma Süreçlerinizi Hızlandırın."}
                    </h2>
                    <p className="text-lg opacity-90 leading-relaxed">
                        {accountType === 'supplier'
                            ? "Binlerce kurumsal firmanın taleplerine ulaşın, teklif verin ve işinizi büyütün."
                            : "İhtiyacınız olan ürünler için en iyi tedarikçilerden rekabetçi teklifler alın."}
                    </p>
                </div>
            </div>

        </div>
    );
}