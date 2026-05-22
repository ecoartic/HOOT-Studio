import React from "react";
import { Loader2, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw } from "lucide-react";

interface SketchGenerationStepProps {
  isGeneratingSketches: boolean;
  sketches: string[];
  selectedSketch: string | null;
  setSelectedSketch: (val: string | null) => void;
  onPrev: () => void;
  onNext: () => void;
  onRebuild: () => void;
}

export default function SketchGenerationStep({
  isGeneratingSketches,
  sketches,
  selectedSketch,
  setSelectedSketch,
  onPrev,
  onNext,
  onRebuild
}: SketchGenerationStepProps) {

  if (isGeneratingSketches) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[350px] animate-fade-in text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-amber-500">
            <Sparkles size={24} className="animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">هوش مصنوعی HOOT در حال ساخت آتلیه است...</h3>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          ۳ طرح پیش‌فرض با رعایت ابعاد کادر و الگوی چیدمان به صورت سفارشی عکاسی پایه ساخته می‌شوند. این فرآیند ممکن است چند لحظه زمان ببرد...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-sans">کادر بهینه عکاسی را انتخاب کنید</h2>
        <p className="text-slate-400 text-sm">یکی از ۳ طرح پیشنهادی مدل Imagen را جهت ادامه فرآیند و جای‌گذاری محصول انتخاب فرمایید.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sketches.map((imgUrl, idx) => (
          <div 
            key={idx} 
            onClick={() => setSelectedSketch(imgUrl)}
            className={`relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 border-4 bg-slate-900 flex items-center justify-center ${
              selectedSketch === imgUrl 
                ? "border-amber-500 scale-[1.02] shadow-[0_0_30px_rgba(234,179,8,0.25)]" 
                : "border-slate-800 hover:border-slate-600"
            }`}
          >
            <img src={imgUrl} alt={`Sketch Variation ${idx + 1}`} className="w-full object-contain max-h-60" />
            <div className={`absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center transition-opacity duration-300 ${
              selectedSketch === imgUrl ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}>
              <div className="bg-slate-900/95 text-amber-500 px-4 py-2 rounded-full font-bold text-xs border border-amber-500/30 backdrop-blur-sm flex items-center gap-1.5">
                {selectedSketch === imgUrl ? (
                  <>
                    <CheckCircle2 size={14} />
                    پیش‌طرح انتخاب شد
                  </>
                ) : (
                  "انتخاب کادر پیش‌طرح"
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between pt-6 border-t border-slate-900">
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={onPrev} 
            className="text-slate-400 hover:text-white px-5 py-2.5 rounded-xl transition-all text-xs font-semibold hover:bg-slate-900 flex items-center gap-1.5"
          >
            <ChevronRight size={16} />
            تغییر استایل
          </button>
          
          <button 
            type="button"
            onClick={onRebuild}
            className="text-amber-500/90 hover:text-amber-400 px-5 py-2.5 rounded-xl transition-all text-xs font-semibold hover:bg-amber-500/5 flex items-center gap-1.5 border border-amber-500/20"
          >
            <RotateCcw size={14} />
            طراحی مجدد (تصادفی دوباره)
          </button>
        </div>

        <button 
          type="button"
          onClick={onNext} 
          disabled={!selectedSketch}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          مرحله بعد: بهینه‌سازی کادر
          <ChevronLeft size={18} />
        </button>
      </div>
    </div>
  );
}
