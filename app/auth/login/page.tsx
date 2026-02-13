

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callback");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);


        try {
            const { data } = await api.post("/auth/local", {
                identifier: email,
                password: password,
            });

            const jwt = data.jwt;
            const userId = data.user.id;

            api.defaults.headers.Authorization = `Bearer ${jwt}`;

            const profileRes = await api.get(`/company-profiles?filters[user][id][$eq]=${userId}&populate=*`);

            const userData = {
                ...data.user,
                company_profile: profileRes ? profileRes.data.data[0] : null
            };
            login(jwt, userData);

            toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
        } catch (err: any) {
            console.error("Login Detaylı Hata:", err);
            // Hata mesajını daha anlaşılır yapalım
            const errorMessage = err.response?.data?.error?.message || "Giriş başarısız.";
            //setError(errorMessage);
            toast.error(errorMessage);

            delete api.defaults.headers.Authorization;
        } finally {
            setLoading(false);
        }
    };

    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen w-full flex">

            {/* SOL TARA: FORM ALANI */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-white">
                <div className="w-full max-w-md space-y-8">

                    {/* Başlık */}
                    <div className="text-center lg:text-left">
                        <div className="inline-block p-3 bg-blue-50 rounded-2xl mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Tekrar Hoş Geldin</h1>
                        <p className="text-gray-500 mt-2">Hesabınıza giriş yaparak operasyonlarınızı yönetin.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 mt-8">

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">E-Posta Adresi</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition font-medium text-gray-900"
                                    placeholder="ornek@sirket.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-gray-700">Şifre</label>
                                <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Şifremi unuttum?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition font-medium text-gray-900"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Giriş Yap <ArrowRight size={18} /></>}
                        </button>

                    </form>

                    <p className="text-center text-sm text-gray-500 mt-8">
                        Hesabınız yok mu? <Link href={`/auth/register?callback=${encodeURIComponent(currentPath)}`} className="font-bold text-blue-600 hover:underline">Hemen Kayıt Olun</Link>
                    </p>
                </div>
            </div>

            {/* SAĞ TARAF: GÖRSEL / BRANDING */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center">
                {/* Arka Plan Görseli */}
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=2070&auto=format&fit=crop"
                        className="w-full h-full object-cover"
                        alt="Background"
                    />
                </div>

                {/* Üzerindeki Yazı */}
                <div className="relative z-10 max-w-lg text-center px-12">
                    <h2 className="text-5xl font-black text-white mb-6 leading-tight">Tedarik Zincirini Yönetmenin En Güçlü Yolu.</h2>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        Binlerce tedarikçi ve müşteri tek bir platformda buluşuyor. Teklifleri yönetin, siparişleri takip edin ve işinizi büyütün.
                    </p>
                </div>

                {/* Dekoratif Efektler */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-50"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-40"></div>
            </div>

        </div>
    );
}