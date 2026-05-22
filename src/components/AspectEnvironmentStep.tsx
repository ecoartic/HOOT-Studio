import React from "react";
import { 
  Monitor, 
  Square, 
  Smartphone, 
  Home, 
  Coffee, 
  Briefcase, 
  Sparkles, 
  ChevronLeft,
  Camera,
  Compass,
  Maximize2,
  Video,
  Layers,
  Info
} from "lucide-react";

interface AspectEnvironmentStepProps {
  aspectRatio: string;
  setAspectRatio: (val: string) => void;
  environment: string;
  setEnvironment: (val: string) => void;
  customEnvironment: string;
  setCustomEnvironment: (val: string) => void;
  cameraAngle: string;
  setCameraAngle: (val: string) => void;
  sceneDetailPrompt: string;
  setSceneDetailPrompt: (val: string) => void;
  onNext: () => void;
}

const cameraAngles = [
  { id: "eye-level", title: "هم‌تراز چشم (Eye-Level)", desc: "زاویه عکاسی روبرو، طبیعی و تراز" },
  { id: "wide-angle", title: "نمای عریض (Wide Angle)", desc: "لنز عمق‌دار مناسب فضاهای تبلیغاتی وسیع" },
  { id: "low-angle", title: "زاویه پایین (Low Angle)", desc: "نمای افکت حماسی یا مرتفع، نزدیک به کف" },
  { id: "high-angle", title: "زاویه بالا (High Angle)", desc: "دید پرنده رو به کف جهت بهینه‌سازی تراز کالا" },
  { id: "close-up", title: "تک کادر (Close-Up)", desc: "بک‌دراپ متمرکز و فکوس بالا با تاری پس‌زمینه" },
];

export default function AspectEnvironmentStep({
  aspectRatio,
  setAspectRatio,
  environment,
  setEnvironment,
  customEnvironment,
  setCustomEnvironment,
  cameraAngle,
  setCameraAngle,
  sceneDetailPrompt,
  setSceneDetailPrompt,
  onNext
}: AspectEnvironmentStepProps) {

  const canContinue = environment !== "" && (environment !== "custom" || customEnvironment.trim() !== "");

  return (
    <div className="w-full space-y-10 animate-fade-in text-right">
      
      {/* 1. Selection of Image Proportion Layouts */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">ابعاد تصویر نهایی را انتخاب کنید</h2>
          <p className="text-slate-400 text-sm">ابعاد مناسب کادر عکاسی محصول خود را از موارد رایج زیر انتخاب نمایید.</p>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { id: "16:9", title: "افقی (16:9)", icon: Monitor, desc: "مناسب وبسایت و کاور" },
            { id: "1:1", title: "مربعی (1:1)", icon: Square, desc: "مناسب پست اینستاگرام" },
            { id: "9:16", title: "عمودی (9:16)", icon: Smartphone, desc: "مناسب استوری و ریلز" },
          ].map((ratio) => (
            <button 
              key={ratio.id}
              type="button"
              onClick={() => setAspectRatio(ratio.id)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                aspectRatio === ratio.id 
                  ? "border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(234,179,8,0.15)] scale-[1.02]" 
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
              }`}
            >
              <ratio.icon size={26} />
              <div className="text-center">
                <span className="font-bold block text-xs">{ratio.title}</span>
                <span className="text-[9px] opacity-75 mt-1 block leading-tight">{ratio.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-850" />

      {/* 2. Selection of Environments */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">محیط عکاسی را هدایت کنید</h2>
          <p className="text-slate-400 text-sm">محصول شما قرار است در کجای این فضا قرار داده شود؟</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: "bedroom", title: "اتاق خواب مدرن", icon: Home },
            { id: "kitchen", title: "آشپزخانه یا سالن غذاخوری", icon: Coffee },
            { id: "office", title: "محیط کار و اداری زنده", icon: Briefcase },
            { id: "custom", title: "محیط تبلیغاتی دلخواه", icon: Sparkles },
          ].map((env) => (
            <button 
              key={env.id}
              type="button"
              onClick={() => setEnvironment(env.id)}
              className={`p-5 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                environment === env.id 
                  ? "border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.15)] scale-[1.02]" 
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
              }`}
            >
              <env.icon size={28} />
              <span className="font-bold text-xs">{env.title}</span>
            </button>
          ))}
        </div>

        {environment === "custom" && (
          <div className="mt-4 p-5 bg-slate-900 text-right rounded-xl border border-slate-800 animate-slide-up">
            <label className="block text-xs font-semibold text-slate-300 mb-2">محیط اختصاصی یا سورئال خود را به زبان ساده بیان کنید:</label>
            <input 
              type="text" 
              value={customEnvironment}
              onChange={(e) => setCustomEnvironment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
              placeholder="مثال: تراس مدرن رو به دریای مدیترانه هنگام غروب آفتاب"
            />
          </div>
        )}
      </div>

      <hr className="border-slate-850" />

      {/* 3. New Advanced Camera Angle Configuration Box */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Camera className="text-amber-500" size={22} />
            تنظیم پرسپکتیو و زاویه دید دوربین
          </h2>
          <p className="text-slate-400 text-sm">زاویه دوربین محیط را تعیین کنید تا با خط افق محصول شما کاملاً همخوانی داشته باشد.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {cameraAngles.map((angle) => (
            <button
              key={angle.id}
              type="button"
              onClick={() => setCameraAngle(angle.id)}
              className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center text-center gap-1.5 transition-all duration-250 ${
                cameraAngle === angle.id
                  ? "border-amber-500 bg-amber-500/5 text-amber-400 font-semibold"
                  : "border-slate-850 bg-slate-900/30 text-slate-400 hover:border-slate-800 hover:bg-slate-900/60"
              }`}
            >
              <Video size={18} className={cameraAngle === angle.id ? "text-amber-500 animate-pulse" : "text-slate-500"} />
              <span className="text-xs font-bold leading-tight block">{angle.title}</span>
              <span className="text-[9px] opacity-75 leading-normal max-w-[120px]">{angle.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-850" />

      {/* 4. New Advanced Scene Detailing Text Area */}
      <div className="max-w-4xl mx-auto bg-slate-900/50 p-5 rounded-2xl border border-slate-850 space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
          <Sparkles size={16} className="text-amber-500" />
          <span>توضیحات تکمیلی یا جزئیات مبل/محصول در این صحنه (پرامپت دلخواه) :</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          می‌توانید هر نوع متریال، زاویه بازتاب نور، رنگ دیوار، یا وسایل تزئینی دیگر را توصیف کنید تا هوش مصنوعی آن را کاملا شخصی‌سازی کند.
        </p>
        <textarea
          value={sceneDetailPrompt}
          onChange={(e) => setSceneDetailPrompt(e.target.value)}
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 text-xs leading-relaxed resize-none"
          placeholder="مثال: دکور بتنی خلوت با نور موضعی، سایه طبیعی شاخ و برگ روی دیوار خاکستری، کف سیمان صیقلی، محیط عاری از مبل و انسان باشد..."
        />
        <div className="flex items-start gap-1.5 text-xs text-amber-300/80 bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/20 leading-relaxed">
          <Info size={14} className="shrink-0 mt-0.5" />
          <span>سیستم به طور خودکار فیلتر‌های بهینه‌سازی کادر عاری از شخص (No Humans/Vacant Plate) را اعمال خواهد نمود تا هیچ‌گونه کاراکتر یا المان بیرونی با صحنه تداخل نداشته باشد.</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4 border-t border-slate-900">
        <button 
          type="button"
          onClick={onNext} 
          disabled={!canContinue}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed group"
        >
          مرحله بعد: انتخاب استایل کادر
          <ChevronLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
