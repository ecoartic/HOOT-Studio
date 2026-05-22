import React, { useRef } from "react";
import { Palette, ImageIcon, ChevronLeft, ChevronRight, Upload } from "lucide-react";

interface StyleReferenceStepProps {
  style: string;
  setStyle: (val: string) => void;
  customStyle: string;
  setCustomStyle: (val: string) => void;
  referenceImage: string | null;
  setReferenceImage: (val: string | null) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function StyleReferenceStep({
  style,
  setStyle,
  customStyle,
  setCustomStyle,
  referenceImage,
  setReferenceImage,
  onPrev,
  onNext
}: StyleReferenceStepProps) {

  const referenceInputRef = useRef<HTMLInputElement>(null);

  const canContinue = style !== "" && (style !== "custom" || customStyle.trim() !== "");

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReferenceImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">استایل و چیدمان محیط</h2>
        <p className="text-slate-400 text-sm">پس‌زمینه عکاسی چیدمان و اتمسفر چه طولی، جنسیتی یا هنری داشته باشد؟</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: "modern", title: "مدرن و مینیمال" },
          { id: "classic", title: "کلاسیک و مجلل" },
          { id: "luxury", title: "لاکچری و نفیس" },
          { id: "custom", title: "استایل دلخواه شما" },
        ].map((s) => (
          <button 
            key={s.id}
            type="button"
            onClick={() => setStyle(s.id)}
            className={`p-5 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
              style === s.id 
                ? "border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.15)] scale-[1.02]" 
                : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center mb-1 border border-slate-850">
              <Palette size={18} />
            </div>
            <span className="font-bold text-xs">{s.title}</span>
          </button>
        ))}
      </div>

      {style === "custom" && (
        <div className="p-5 bg-slate-900 text-right rounded-xl border border-slate-800 animate-slide-up">
          <label className="block text-xs font-semibold text-slate-300 mb-2">توصیف استایل و بافت (مات، چوب گردو، نئون، صنعتی...):</label>
          <input 
            type="text" 
            value={customStyle}
            onChange={(e) => setCustomStyle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
            placeholder="مثال: دکوراسیون اسکاندیناوی با گیاهان سبز رونده و نور غیرمستقیم ملایم"
          />
        </div>
      )}

      <div className="border-t border-slate-800/85 pt-6">
        <h3 className="text-base font-bold text-white mb-1.5">تصویر الگوبرداری ساختاری (اختیاری)</h3>
        <p className="text-slate-400 text-xs mb-4">می‌توانید یک تصویر از اتاق یا فضایی که می‌پسندید آپلود کنید تا هوش مصنوعی استخوان‌بندی و چیدمان کادر را از آن کپی کند.</p>
        
        <input 
          type="file" 
          ref={referenceInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleRefUpload} 
        />
        
        <div 
          onClick={() => referenceInputRef.current?.click()}
          className="border-2 border-dashed border-slate-800 hover:border-amber-500/80 bg-slate-900/30 hover:bg-slate-900/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all gap-2"
        >
          {referenceImage ? (
            <div className="relative group">
              <img src={referenceImage} alt="Reference Structure" className="max-h-40 object-contain rounded-lg shadow-lg border border-slate-800" />
              <div className="absolute inset-x-0 bottom-0 bg-slate-950/70 p-1.5 text-center text-[10px] text-red-400 group-hover:block hidden rounded-b-lg">
                تغییر کادر الگو
              </div>
            </div>
          ) : (
            <>
              <Upload size={28} className="text-slate-500" />
              <span className="text-slate-400 text-xs font-semibold">انتخاب و آپلود کادر الگو</span>
              <span className="text-slate-600 text-[10px]">فرمت‌های رایج تصویری (مستقیم در مرورگر)</span>
            </>
          )}
        </div>
        
        {referenceImage && (
          <button 
            type="button"
            onClick={() => setReferenceImage(null)} 
            className="text-red-400 text-xs mt-2.5 hover:text-red-300 transition-colors flex items-center gap-1.5 mx-auto border border-red-500/20 px-3 py-1 bg-red-500/5 rounded-full"
          >
            ✕ حذف تصویر الگو
          </button>
        )}
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-900">
        <button 
          type="button"
          onClick={onPrev} 
          className="text-slate-400 hover:text-white px-6 py-2 rounded-xl transition-all text-xs font-semibold hover:bg-slate-900 flex items-center gap-1.5"
        >
          <ChevronRight size={16} />
          بازگشت به ابعاد و فضا
        </button>
        <button 
          type="button"
          onClick={onNext} 
          disabled={!canContinue}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          تولید کادرهای خالی آتلیه
          <ChevronLeft size={18} />
        </button>
      </div>
    </div>
  );
}
