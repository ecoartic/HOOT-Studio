import React, { useRef, useState } from "react";
import { UploadCloud, ChevronRight, Info } from "lucide-react";

interface ProductUploadStepProps {
  onUploadProduct: (dataUrl: string) => void;
  onPrev: () => void;
}

export default function ProductUploadStep({ onUploadProduct, onPrev }: ProductUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileProcess = (file: File) => {
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        alert("حداکثر حجم مجاز تصویر محصول ۱۲ مگابایت است.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUploadProduct(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  return (
    <div className="w-full max-w-2xl space-y-6 animate-fade-in text-right">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">عکس محصول خود را بارگذاری کنید</h2>
        <p className="text-slate-400 text-sm">تخت مبل، میز، کادو، کمد یا اکسسوار مورد نظر خود را در این بخش قرار دهید.</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex gap-3 text-right">
        <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-amber-200/80 leading-relaxed">
          <strong className="text-amber-400 block mb-1">نکته طلایی برای افزایش دقت سایه‌اندازی:</strong>
          برای تلفیق صددرصد واقع‌گرایانه، پیشنهاد می‌شود عکس‌های آپلودی محصول شما دارای <strong>زمینه سفید یکدست پرنور</strong> و یا به صورت <strong>PNG ترانسپرنت دوربری شده</strong> باشند.
        </div>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
          isDragging 
            ? "border-amber-500 bg-amber-500/5 scale-[1.01]" 
            : "border-slate-800 bg-slate-900/40 hover:border-amber-500/60 hover:bg-slate-900/60"
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleUploadChange}
        />
        <div className="bg-slate-950 p-4 rounded-full text-amber-500 mb-4 group-hover:scale-110 transition-transform border border-slate-850">
          <UploadCloud size={36} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2 text-center">کلیک کنید یا عکس محصول را اینجا رها کنید</h3>
        <p className="text-slate-500 text-xs">پشتیبانی از JPG, PNG و WebP (حداکثر ۱۲ مگابایت)</p>
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-900">
        <button 
          type="button"
          onClick={onPrev} 
          className="text-slate-400 hover:text-white px-6 py-2.5 rounded-xl transition-all text-sm font-semibold hover:bg-slate-900 flex items-center gap-1.5"
        >
          <ChevronRight size={16} />
          بازگشت به ویرایش پس‌زمینه
        </button>
      </div>
    </div>
  );
}
