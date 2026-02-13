"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api, { getMediaURL } from "@/lib/api";
import { toast } from "sonner";
import {
    User, Building, Save, Loader2, Camera,
    Lock, MapPin, Mail, Phone
} from "lucide-react";

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");

    // Profil ID'si (Update için lazım)
    const [profileId, setProfileId] = useState<number | null>(null);

    // Resim State
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    useEffect(() => {
        if (!user && !authLoading) router.push("/auth/login");
        if (!user) return;

        const fetchProfile = async () => {
            try {
                // Kullanıcının profilini çek (user -> company_profile)
                //const res = await api.get(`/users/me?populate[company_profile][populate]=company_logo`);
                //   `/orders?populate=*&populate[supplier][populate][0]=*&` +
                //     `populate[supplier][populate][company_profile][populate]=*`
                const res = await api.get(
                    `/users/me?populate[company_profile][populate]=*`);

                const userData = res.data;

                console.log("userData", userData)

                setUsername(userData.username);
                setEmail(userData.email);

                // Firma Profili Verileri
                if (userData.company_profile) {
                    const profile = userData.company_profile;
                    setProfileId(profile.documentId);
                    setCompanyName(profile.company_name || "");
                    setAddress(profile.address || ""); // Strapi'de address alanı yoksa eklemen gerekebilir
                    setPhone(profile.phone || "");     // Strapi'de phone alanı yoksa eklemen gerekebilir

                    // Logo varsa göster
                    if (profile.logo) {
                        setLogoPreview(getMediaURL(profile.logo.url));
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error("Profil bilgileri yüklenemedi.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, authLoading, router]);

    // Resim Seçme İşlemi
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file)); // Önizleme oluştur
        }
    };

    // Kaydetme İşlemi
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let uploadedLogoId = null;

            // 1. Eğer yeni resim seçildiyse önce onu yükle
            if (logoFile) {
                const formData = new FormData();
                formData.append("files", logoFile);

                const uploadRes = await api.post("/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                uploadedLogoId = uploadRes.data[0].id;
            }

            // 2. Firma Profilini Güncelle
            if (profileId) {
                const updateData: any = {
                    company_name: companyName,
                    address: address, // Strapi modelinde yoksa hata verebilir, kontrol et
                    phone: phone      // Strapi modelinde yoksa hata verebilir
                };

                // Eğer logo yüklendiyse ilişkiyi güncelle
                if (uploadedLogoId) {
                    updateData.logo = uploadedLogoId;
                }

                await api.put(`/company-profiles/${profileId}`, {
                    data: updateData
                });

                toast.success("Profil başarıyla güncellendi!");
                // Sayfayı yenileyerek taze veriyi çek (veya context'i güncelle)
                //window.location.reload();
            } else {
                toast.error("Firma profili bulunamadı. Yönetici ile iletişime geçin.");
            }

        } catch (error) {
            console.error(error);
            toast.error("Kaydederken bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-4xl">

                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Ayarlar</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SOL MENÜ (Sekmeler) - Şimdilik dekoratif */}
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-blue-600 shadow-sm flex items-center gap-3">
                            <Building size={18} /> Firma Bilgileri
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-transparent text-gray-500 hover:bg-white hover:text-gray-900 rounded-xl font-medium transition flex items-center gap-3">
                            <User size={18} /> Kişisel Bilgiler
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-transparent text-gray-500 hover:bg-white hover:text-gray-900 rounded-xl font-medium transition flex items-center gap-3">
                            <Lock size={18} /> Şifre & Güvenlik
                        </button>
                    </div>

                    {/* SAĞ: FORM ALANI */}
                    <div className="lg:col-span-2 space-y-6">

                        <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">

                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Firma Profili</h2>

                            {/* LOGO YÜKLEME */}
                            <div className="mb-8 flex items-center gap-6">
                                <div className="w-24 h-24 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                                    {logoPreview ? (
                                        <img src={logoPreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building className="text-gray-300" size={32} />
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                        <Camera className="text-white" size={24} />
                                    </div>

                                    {/* Gizli Input */}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Firma Logosu</h3>
                                    <p className="text-sm text-gray-500 mb-2">JPG, PNG veya WEBP. Max 2MB.</p>
                                    <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition">
                                        Değiştir
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Firma Adı</label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefon</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+90 555 ..."
                                                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Firma Adresi</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <textarea
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            rows={3}
                                            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4 text-sm">Hesap Bilgileri (Salt Okunur)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 opacity-70">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kullanıcı Adı</label>
                                            <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl flex items-center gap-2 text-sm">
                                                <User size={16} /> {username}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-Posta</label>
                                            <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl flex items-center gap-2 text-sm">
                                                <Mail size={16} /> {email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    Değişiklikleri Kaydet
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
}