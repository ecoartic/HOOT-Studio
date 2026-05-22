import React, { useState } from "react";
import { KeyRound, Loader2, CheckCircle, Info } from "lucide-react";
import { validateApiKey } from "../services/ai/geminiService";

interface AuthModalProps {
  onClose: () => void;
  customApiKey: string;
  onSaveCustomApiKey: (key: string) => void;
}

export default function AuthModal({ onClose, customApiKey, onSaveCustomApiKey }: AuthModalProps) {
  const [inputKey, setInputKey] = useState(customApiKey);
  const [errorMsg, setErrorMsg] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSave = async () => {
    setErrorMsg("");
    setIsValidating(true);
    setIsSuccess(false);

    try {
      const trimmedKey = inputKey.trim();
      if (trimmedKey === "") {
        onSaveCustomApiKey("");
        setIsSuccess(true);
        setTimeout(() => onClose(), 1000);
        return;
      }

      // Live verification of the custom key
      const isValid = await validateApiKey(trimmedKey);
      if (isValid) {
        onSaveCustomApiKey(trimmedKey);
        setIsSuccess(true);
        setTimeout(() => onClose(), 1000);
      } else {
        setErrorMsg("کلید API نامعتبر است. لطفاً ساختار کلید خود را بررسی کنید.");
      }
    } catch (err: any) {
      setErrorMsg(err?.persianMessage || "تنظیم ناموفق بود. اتصال شبکه یا کلید خود را بررسی نمایید.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
          <KeyRound className="text-amber-500" size={22} />
          مدیریت اتصال و کلیدهای هوش مصنوعی
        </h3>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-lg text-xs leading-relaxed mb-4">
            {errorMsg}
          </div>
        )}

        {isSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 mb-4">
            <CheckCircle size={16} />
            کلید API با موفقیت تایید و ذخیره شد.
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-xl flex items-start gap-3 text-xs leading-relaxed text-slate-400">
            <Info className="text-amber-500 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="font-semibold text-slate-200 mb-1">اتصال ابری پیش‌فرض ایمن:</p>
              سرور ابری استودیو به صورت پیش‌فرض به سرویس ابری متصل است. اطلاعات و کلیدهای شما کاملا محرمانه بوده و در فرانت‌اند افشا نمی‌شوند. در صورت تمایل به تغییر یا مواجه شدن با محدودیت سهمیه (Quota Exhausted) می‌توانید کلید اختصاصی خود را در زیر اعمال کنید.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">کلید API شخصی (Google Gemini API Key)</label>
            <input 
              type="text" 
              value={inputKey}
              onChange={(e) => { setInputKey(e.target.value); setErrorMsg(""); }}
              className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm font-mono tracking-wider text-left"
              placeholder="AIzaSy..."
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 border-t border-slate-800/80 pt-4 justify-end">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 text-sm rounded-xl transition-all"
          >
            بستن
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={isValidating}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 disabled:opacity-50"
          >
            {isValidating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                در حال بررسی...
              </>
            ) : "ذخیره و فعال‌سازی"}
          </button>
        </div>
      </div>
    </div>
  );
}
