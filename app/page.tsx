"use client";

import Link from "next/link";
import {
  ArrowRight, Zap, ShieldCheck, TrendingUp,
  Search, FileText, CheckCircle,
  PenTool, Shirt, Coffee, Smartphone, Award
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">

      {/* --- HERO SECTION: NET VE ÇARPICI --- */}
      <div className="relative pt-[5vh] pb-24 lg:pt-[5vh] lg:pb-[5vh] overflow-hidden bg-gradient-to-b from-orange-50/50 to-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Sol Taraf: Mesaj ve CTA */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">

              <div className="inline-flex items-center gap-2 bg-white border border-orange-200 text-orange-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
                </span>
                Kurumsal Satın Almanın Yeni Yolu
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
                Firmanız İçin <br />
                <span className="text-orange-600 underline decoration-4 decoration-orange-200 underline-offset-4">Logolu Ürünleri</span> <br />
                Kolayca Yaptırın.
              </h1>

              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                Tişörtten kaleme, defterden teknolojik ürünlere kadar tüm promosyon ihtiyaçlarınız için talep oluşturun. Binlerce tedarikçiden <strong>en iyi fiyatı ve baskı kalitesini</strong> tek platformda bulun.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <Link href="/auth/register" className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white rounded-2xl font-bold text-lg hover:bg-orange-700 transition shadow-xl shadow-orange-200 flex items-center justify-center gap-2 transform hover:-translate-y-1">
                  Ücretsiz Teklif Alın <ArrowRight size={20} />
                </Link>
                <Link href="#nasil-calisir" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition flex items-center justify-center">
                  Nasıl Çalışır?
                </Link>
              </div>

              {/* Güven Sinyalleri */}
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-semibold text-gray-500">
                <span className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Onaylı Tedarikçiler</span>
                <span className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Güvenli Ödeme</span>
              </div>

            </div>

            {/* Sağ Taraf: Görsel Temsil (Dinamik Kartlar) */}
            <div className="w-full lg:w-1/2 relative">
              {/* Dekoratif Arkaplan */}
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-red-400 rounded-full blur-[120px] opacity-20 animate-pulse"></div>

              <div className="relative grid grid-cols-2 gap-4">
                {/* Kart 1: Tişört */}
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 transform rotate-[-2deg] hover:rotate-0 transition duration-500 hover:scale-105 z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      <Shirt size={24} strokeWidth={2.5} />
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">5 Teklif Geldi</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Logo Baskılı Personel Tişörtü</h3>
                  <p className="text-sm text-gray-500 mb-4">500 Adet • Lacivert • %100 Pamuk</p>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-orange-500 rounded-full"></div>
                  </div>
                </div>

                {/* Kart 2: Defter (Sağ Üst, hafif yukarıda) */}
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 transform translate-y-8 rotate-[2deg] hover:rotate-0 transition duration-500 hover:scale-105">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <PenTool size={24} strokeWidth={2.5} />
                    </div>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">İnceleniyor</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Kurumsal Ajanda & Kalem Seti</h3>
                  <p className="text-sm text-gray-500 mb-4">1000 Adet • Deri Kapak</p>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">+8</div>
                  </div>
                </div>

                {/* Kart 3: Termos (Alt, geniş) */}
                <div className="col-span-2 bg-white p-5 rounded-3xl shadow-xl border border-gray-100 transform -rotate-[1deg] hover:rotate-0 transition duration-500 hover:scale-105 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                      <Coffee size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Çelik Termos Kupa</h3>
                      <p className="text-sm text-gray-500">Lazer Baskılı • 250 Adet</p>
                    </div>
                  </div>
                  <button className="bg-black text-white px-5 py-2 rounded-xl text-sm font-bold">Teklif Ver</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- KATEGORİLER / NE ALABİLİRSİNİZ? --- */}
      <div className="py-12 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400 font-bold text-sm uppercase tracking-widest mb-8">Neler Yaptırabilirsiniz?</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition duration-500">
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <Shirt size={32} className="group-hover:text-orange-600 transition" />
              <span className="font-bold text-gray-900">Tekstil</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <PenTool size={32} className="group-hover:text-orange-600 transition" />
              <span className="font-bold text-gray-900">Kırtasiye</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <Smartphone size={32} className="group-hover:text-orange-600 transition" />
              <span className="font-bold text-gray-900">Teknoloji</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <Coffee size={32} className="group-hover:text-orange-600 transition" />
              <span className="font-bold text-gray-900">Mutfak & Ev</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <Award size={32} className="group-hover:text-orange-600 transition" />
              <span className="font-bold text-gray-900">VIP Setler</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- NASIL ÇALIŞIR? (3 ADIM) --- */}
      <div id="nasil-calisir" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Süreç Çok Basit.</h2>
            <p className="text-gray-500 text-lg">Telefon trafiği ve excel dosyalarıyla uğraşmayın. Dijital satın almanın keyfini çıkarın.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Adım 1 */}
            <div className="relative p-8 rounded-3xl bg-orange-50 border border-orange-100">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-orange-200">1</div>
              <div className="mt-4">
                <Search className="text-orange-600 mb-4" size={32} strokeWidth={2.5} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Talebini Oluştur</h3>
                <p className="text-gray-600">İhtiyacın olan ürünü, rengi, adedi ve logo dosyanı sisteme yükle. Pazar yerine gönder.</p>
              </div>
            </div>

            {/* Adım 2 */}
            <div className="relative p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-100">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg">2</div>
              <div className="mt-4">
                <FileText className="text-gray-900 mb-4" size={32} strokeWidth={2.5} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Teklifleri Topla</h3>
                <p className="text-gray-600">Onlarca onaylı tedarikçiden fiyat ve teslim süresi teklifleri gelsin. Karşılaştır.</p>
              </div>
            </div>

            {/* Adım 3 */}
            <div className="relative p-8 rounded-3xl bg-green-50 border border-green-100">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-green-200">3</div>
              <div className="mt-4">
                <Zap className="text-green-600 mb-4" size={32} strokeWidth={2.5} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Onayla & Başlat</h3>
                <p className="text-gray-600">En uygun teklifi seç, işi başlat. Üretim ve kargo sürecini panelden canlı takip et.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEDEN BİZ? (Grid) --- */}
      <div className="py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-1 rounded-full border border-gray-700 bg-gray-800 text-xs font-bold uppercase tracking-wider mb-6">Neden Prometre?</div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">İşinizi Şansa Değil, <br /> Profesyonellere Bırakın.</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Promosyon siparişlerinde yaşanan renk uyuşmazlığı, geciken teslimatlar ve sürpriz maliyetleri ortadan kaldırıyoruz.
              </p>

              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Maliyet Tasarrufu</h4>
                    <p className="text-gray-400">Tedarikçileri yarıştırarak %35'e varan fiyat avantajı yakalayın.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Güvenli Operasyon</h4>
                    <p className="text-gray-400">Ürün elinize istediğiniz gibi ulaşana kadar ödemeniz güvende.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white/10 p-8 rounded-3xl border border-white/10 backdrop-blur-sm relative">
              {/* Dekoratif Rakamlar */}
              <div className="grid grid-cols-2 gap-8 text-center">
                <div className="p-6 bg-white/5 rounded-2xl">
                  <div className="text-4xl font-black text-orange-500 mb-2">2.5M+</div>
                  <div className="text-xs font-bold text-gray-300 uppercase">Üretilen Ürün</div>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl">
                  <div className="text-4xl font-black text-white mb-2">500+</div>
                  <div className="text-xs font-bold text-gray-300 uppercase">Onaylı Tedarikçi</div>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl">
                  <div className="text-4xl font-black text-green-500 mb-2">24s</div>
                  <div className="text-xs font-bold text-gray-300 uppercase">Ort. Teklif Süresi</div>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl">
                  <div className="text-4xl font-black text-white mb-2">%99</div>
                  <div className="text-xs font-bold text-gray-300 uppercase">Müşteri Memnuniyeti</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CTA / FOOTER --- */}

      {/* --- GELİŞMİŞ CTA: ROL SEÇİMİ --- */}
      <div className="bg-white pt-10 pb-20">
        <div className="container mx-auto px-4">

          <div className="bg-gray-900 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            {/* Arkaplan Efektleri */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]"></div>
              <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Prometre Ekosistemine Katılın.</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">İster kurumsal ihtiyaçlarınız için alım yapın, ister üretim gücünüzle satış yapın. Sizin için doğru olanı seçin.</p>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

              {/* KART 1: MÜŞTERİ (ALICI) */}
              <div className="group relative bg-white/5 border border-white/10 hover:border-white/20 rounded-3xl p-8 transition duration-300 hover:bg-white/10 flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition shadow-lg">
                    <Zap size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Kurumsal Müşteriyim</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Promosyon ürünleri, iş kıyafetleri veya kurumsal hediyeler arıyorum. Teklif toplayıp maliyet düşürmek istiyorum.
                  </p>
                </div>
                <div className="mt-auto">
                  <Link
                    href="/auth/register?type=customer"
                    className="block w-full py-4 bg-white text-gray-900 rounded-xl font-bold text-center hover:bg-gray-100 transition"
                  >
                    Ücretsiz Talep Oluştur
                  </Link>
                </div>
              </div>

              {/* KART 2: TEDARİKÇİ (SATICI) - ÖNE ÇIKARILMIŞ */}
              <div className="group relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 transition duration-300 transform hover:-translate-y-1 shadow-2xl shadow-orange-900/50 flex flex-col h-full">
                <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition duration-700"></div>

                <div className="mb-6 relative">
                  <div className="w-14 h-14 bg-white text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                    <TrendingUp size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tedarikçiyim / Üreticiyim</h3>
                  <p className="text-orange-100 text-sm leading-relaxed">
                    Üretim kapasitem var. Kurumsal firmalardan gelen taleplere teklif verip satış hacmimi büyütmek istiyorum.
                  </p>
                </div>
                <div className="mt-auto relative">
                  <Link
                    href="/auth/register?type=supplier"
                    className="block w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-center hover:bg-black transition border border-gray-800"
                  >
                    Tedarikçi Başvurusu Yap
                  </Link>
                  <p className="text-[10px] text-orange-100 text-center mt-3 opacity-80">*Komisyonsuz başlangıç fırsatı</p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Linkleri */}
          <div className="mt-20 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 font-medium pt-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center text-white font-bold text-xs">P</div>
              &copy; 2024 Prometre.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-900 transition">Gizlilik Politikası</a>
              <a href="#" className="hover:text-gray-900 transition">Kullanım Şartları</a>
              <a href="#" className="hover:text-gray-900 transition">İletişim</a>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}