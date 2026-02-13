"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as fabric from 'fabric';
import { Upload, RefreshCw } from 'lucide-react';

// Parent'ın erişebileceği fonksiyonları tanımlıyoruz
export interface MockupEditorHandle {
    getDesign: () => string | null; // Base64 dönecek
}

interface MockupEditorProps {
    baseImage: string;
    overlayImage: string;
    printArea?: { x: number; y: number; w: number; h: number };
    onLogoChange?: (file: File) => void; // <--- YENİ: Logoyu yukarı taşıyacak fonksiyon
}

const MockupEditor = forwardRef<MockupEditorHandle, MockupEditorProps>(({ baseImage, overlayImage, printArea, onLogoChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

    // Parent bileşene "getDesign" fonksiyonunu açıyoruz
    useImperativeHandle(ref, () => ({
        getDesign: () => {
            if (!canvas) return null;
            // Çıktı alırken yüksek kalite (multiplier: 2) alıyoruz
            return canvas.toDataURL({ format: 'png', multiplier: 2 });
        }
    }));

    // 1. Canvas Başlatma
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvasInstance = new fabric.Canvas(canvasRef.current, {
            width: 500,
            height: 600,
            backgroundColor: '#f3f4f6',
            preserveObjectStacking: true
        });

        setCanvas(canvasInstance);

        return () => {
            canvasInstance.dispose();
            setCanvas(null);
        };
    }, []);

    // 2. Base Image (Tişört) Yükleme
    useEffect(() => {
        // @ts-ignore
        if (!canvas || !canvas.contextContainer) return;

        const loadBaseLayer = async () => {
            try {
                canvas.clear();
                canvas.setBackgroundColor('#f3f4f6', canvas.renderAll.bind(canvas));

                const img = await fabric.Image.fromURL(baseImage, { crossOrigin: 'anonymous' });

                const scale = canvas.width / img.width!;
                img.scale(scale);

                if (img.height! * scale > canvas.height) {
                    img.scaleToHeight(canvas.height);
                }

                img.set({
                    selectable: false,
                    evented: false,
                    erasable: false,
                    originX: 'center',
                    originY: 'center',
                    left: canvas.width / 2,
                    top: canvas.height / 2
                });

                canvas.add(img);
                canvas.sendObjectToBack(img);
                canvas.requestRenderAll();

            } catch (error) {
                console.warn("Base image yüklenemedi:", error);
            }
        };

        loadBaseLayer();
    }, [canvas, baseImage]);

    // Logo Yükleme
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // @ts-ignore
        if (!canvas || !canvas.contextContainer || !e.target.files?.[0]) return;

        const file = e.target.files[0];

        if (onLogoChange) {
            onLogoChange(file);
        }

        const reader = new FileReader();

        reader.onload = async (f) => {
            const data = f.target?.result as string;

            try {
                const logo = await fabric.Image.fromURL(data);

                // Logoyu makul boyuta getir
                logo.scaleToWidth(canvas.width * 0.3);

                logo.set({
                    left: printArea ? printArea.x : 250,
                    top: printArea ? printArea.y : 200,
                    cornerColor: '#3b82f6',
                    cornerStyle: 'circle',
                    transparentCorners: false,
                    borderColor: '#3b82f6',
                    cornerSize: 12
                });

                canvas.add(logo);
                canvas.setActiveObject(logo);
                await addOverlayLayer();

            } catch (err) {
                console.error("Logo yükleme hatası:", err);
            }
        };
        reader.readAsDataURL(file);
    };

    const addOverlayLayer = async () => {
        // @ts-ignore
        if (!canvas || !canvas.contextContainer) return;

        try {
            canvas.getObjects().forEach((obj) => {
                // @ts-ignore 
                if (obj.isOverlay) {
                    canvas.remove(obj);
                }
            });

            const img = await fabric.Image.fromURL(overlayImage, { crossOrigin: 'anonymous' });

            const scale = canvas.width / img.width!;
            img.scale(scale);

            if (img.height! * scale > canvas.height) {
                img.scaleToHeight(canvas.height);
            }

            img.set({
                selectable: false,
                evented: false,
                globalCompositeOperation: 'multiply',
                opacity: 0.9,
                originX: 'center',
                originY: 'center',
                left: canvas.width / 2,
                top: canvas.height / 2,
                // @ts-ignore 
                isOverlay: true
            });

            canvas.add(img);
            canvas.bringObjectToFront(img);
            canvas.requestRenderAll();
        } catch (err) {
            console.error("Overlay hatası:", err);
        }
    };

    const clearDesign = () => {
        if (!canvas) return;
        // Sadece logoları temizle (Base ve Overlay hariç)
        canvas.getObjects().forEach((obj) => {
            // @ts-ignore
            if (obj.selectable) canvas.remove(obj);
        });
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Canvas Wrapper */}
            <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-inner w-full">
                <canvas ref={canvasRef} className="mx-auto" />
            </div>

            {/* Kontroller */}
            <div className="flex gap-3 w-full">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl cursor-pointer hover:bg-gray-50 transition active:scale-95 shadow-sm">
                    <Upload size={18} />
                    Logo Yükle
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>

                <button
                    onClick={clearDesign}
                    className="px-4 py-3 bg-white border border-gray-300 text-red-500 rounded-xl hover:bg-red-50 transition"
                    title="Tasarımı Temizle"
                >
                    <RefreshCw size={18} />
                </button>
            </div>
        </div>
    );
});

MockupEditor.displayName = "MockupEditor";
export default MockupEditor;