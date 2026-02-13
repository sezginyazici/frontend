"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, LogOut, User as UserIcon, Menu, Store, ChevronRight } from "lucide-react";
import MegaMenu from "./MegaMenu";

export default function Navbar() {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    // Scroll efektini yakala
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b 
            ${scrolled
                    ? 'bg-white/80 backdrop-blur-md border-gray-200 h-16 py-0'
                    : 'bg-white border-transparent h-20 py-2'
                }`}
        >
            <div className="container mx-auto px-4 h-full flex items-center justify-between">

                {/* --- SOL TARA: LOGO VE MENÜ --- */}
                <div className="flex items-center gap-10">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className={`w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition ${scrolled ? 'scale-90' : ''}`}>
                            <ShoppingBag strokeWidth={2.5} size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tight text-gray-900 leading-none">Prometre</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">B2B Platform</span>
                        </div>
                    </Link>

                    {/* Masaüstü Mega Menü (Bölücü çizgi ile ayrıldı) */}
                    <div className="hidden lg:flex items-center gap-6 pl-8 border-l border-gray-200 h-8">
                        <MegaMenu />
                    </div>
                </div>

                {/* --- SAĞ TARAF: KULLANICI AKSİYONLARI --- */}
                <div className="flex items-center gap-4">

                    {user ? (
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">

                            {/* Kullanıcı Bilgi Kartı */}
                            <Link href={user.company_profile?.type == 'supplier' ? "/supplier/dashboard" : "/dashboard"} className="hidden md:flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 pr-4 pl-1 py-1 rounded-full transition group">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm text-gray-600 group-hover:text-blue-600 group-hover:scale-105 transition">
                                    {user.company_profile?.type === 'supplier' ? <Store size={16} /> : <UserIcon size={16} />}
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="text-xs font-bold text-gray-900">{user.username}</span>
                                    <span className="text-[10px] font-medium text-gray-500">
                                        {user.company_profile?.type === 'supplier' ? 'Tedarikçi Paneli' : 'Müşteri Hesabı'}
                                    </span>
                                </div>
                            </Link>

                            {/* Çıkış Butonu */}
                            {/* <button
                                onClick={logout}
                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                                title="Çıkış Yap"
                            >
                                <LogOut size={20} />
                            </button> */}
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/auth/login"
                                className="text-gray-600 hover:text-gray-900 font-bold text-sm px-4 py-2 transition"
                            >
                                Giriş Yap
                            </Link>
                            <Link
                                href="/auth/register"
                                className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 font-bold text-sm transition shadow-lg shadow-gray-200 flex items-center gap-2"
                            >
                                Hemen Başla <ChevronRight size={14} />
                            </Link>
                        </div>
                    )}

                    {/* Mobil Menü Tetikleyici */}
                    <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </header>
    );
}