import React, { useState, useRef, useEffect } from "react";
import { 
  Brush, 
  Eraser, 
  Sparkles, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  Loader2 
} from "lucide-react";
import { editBackgroundImage } from "../services/ai/geminiService";

interface BackgroundEditStepProps {
  selectedSketch: string;
  onUpdateSketch: (newSketch: string) => void;
  onNext: () => void;
  onPrev: () => void;
  customApiKey?: string;
}

export default function BackgroundEditStep({
  selectedSketch,
  onUpdateSketch,
  onNext,
  onPrev,
  customApiKey
}: BackgroundEditStepProps) {

  const [bgEditPrompt, setBgEditPrompt] = useState("");
  const [isEditingBg, setIsEditingBg] = useState(false);
  
  // Brush masking states
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasMask, setHasMask] = useState(false);
  
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Synchronize mask canvas resolution with image dims
  useEffect(() => {
    if (selectedSketch && maskCanvasRef.current) {
      const img = new window.Image();
      img.onload = () => {
        if (maskCanvasRef.current) {
          maskCanvasRef.current.width = img.width;
          maskCanvasRef.current.height = img.height;
          const ctx = maskCanvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, img.width, img.height);
          }
          setHasMask(false);
        }
      };
      img.src = selectedSketch;
    }
  }, [selectedSketch]);

  const getCoordinates = (e: any) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: any) => {
    if (!isDrawingMode) return;
    if (e.touches && e.cancelable) e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing || !isDrawingMode) return;
    if (e.touches && e.cancelable) e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(0, 149, 255, 0.55)"; // Clean translucent blue masking ink
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setHasMask(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasMask(false);
  };

  const handleEditBg = async () => {
    if (!bgEditPrompt.trim()) return;
    setIsEditingBg(true);

    try {
      let finalComposedBase64 = selectedSketch;

      // If mask is actively drawn, compose overlay directly with selected sketch 
      if (hasMask && maskCanvasRef.current) {
        const compositeCanvas = document.createElement("canvas");
        compositeCanvas.width = maskCanvasRef.current.width;
        compositeCanvas.height = maskCanvasRef.current.height;
        const ctx = compositeCanvas.getContext("2d");
        
        if (ctx) {
          const img = new window.Image();
          img.src = selectedSketch;
          await new Promise((r) => (img.onload = r));
          ctx.drawImage(img, 0, 0);
          ctx.drawImage(maskCanvasRef.current, 0, 0);
          finalComposedBase64 = compositeCanvas.toDataURL("image/jpeg", 0.95);
        }
      }

      // Generate the refined background through server endpoint
      const promptInstruction = hasMask 
        ? `You are an expert retoucher. The user has highlighted a specific area of this image with a semi-transparent blue mask. Your STRICT task is to ONLY modify/repaint the highlighted area based on this instruction: "${bgEditPrompt}". DO NOT change any part of the image that is not covered by the blue mask. Remove the blue mask in the final output and seamlessly blend results.`
        : `Modify this product photography background room image with the following change: "${bgEditPrompt}". Maintain perspective, shadows, lighting, and photorealism.`;

      const result = await editBackgroundImage(finalComposedBase64, promptInstruction, customApiKey);
      onUpdateSketch(result);
      setBgEditPrompt("");
      clearMask();
      setIsDrawingMode(false);
    } catch (err: any) {
      alert(err?.persianMessage || "ویرایش با ناموفقیت مواجه شد. لطفاً متن پرامپت را تغییر داده و مجدداً ارسال کنید.");
    } finally {
      setIsEditingBg(false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 animate-fade-in text-right">
      
      {/* 1. Control Parameters Panel */}
      <div className="w-full lg:w-1/3 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col h-fit">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Brush className="text-amber-500" size={20} />
          ویرایش و پرداخت اختصاصی محیط
        </h3>
        <p className="text-slate-400 text-xs mb-4">آزادانه بخش‌هایی از کادر پایه را روتوش کنید، اشیاء زائد را حذف کنید یا اِلمانی نو بیفزایید.</p>
        
        <div className="bg-blue-950/25 border border-blue-500/20 rounded-xl p-4 flex gap-3 mb-5 text-right">
          <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-blue-200/80 leading-relaxed">
            <strong>نحوه روتوش هوشمند:</strong> قلم لایت‌برش را فعال کنید، سپس روی فضا (مثلا روی میز یا گوشه دیوار) نقاشی کنید و در کادر پایین بنویسید چه تغییری در آن محدوده حاصل شود.
          </p>
        </div>

        {/* Brush Toggle Configuration inside step */}
        <div className="mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">فعال‌سازی قلم ماسک</span>
            <button 
              type="button"
              onClick={() => setIsDrawingMode(!isDrawingMode)}
              className={`w-11 h-5.5 rounded-full transition-colors relative ${isDrawingMode ? "bg-amber-500" : "bg-slate-800"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${isDrawingMode ? "left-1" : "left-6"}`} />
            </button>
          </div>
          
          {isDrawingMode && (
            <div className="pt-2 border-t border-slate-850 flex flex-col gap-3 animate-fade-in">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 flex justify-between">
                  <span>ضخامت نوک قلم</span>
                  <span className="text-amber-500 font-bold font-mono">{brushSize}px</span>
                </span>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(Number(e.target.value))} 
                  className="w-full accent-amber-500" 
                />
              </div>
              {hasMask && (
                <button 
                  type="button"
                  onClick={clearMask} 
                  className="w-full text-center bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 py-1.5 rounded-lg text-xs leading-none font-semibold transition-all"
                >
                  پاک کردن کادر روتوش
                </button>
              )}
            </div>
          )}
        </div>

        {/* Repaint Text Directions */}
        <div className="space-y-1 mb-5">
          <label className="block text-xs font-bold text-slate-300">تغییرات مورد نظر شما چیست؟</label>
          <textarea 
            value={bgEditPrompt}
            onChange={(e) => setBgEditPrompt(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-700/60 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none text-xs leading-relaxed"
            placeholder="مثال: گلدان روی شلف را حذف کن و به جای آن یک آباژور مدرن مینیمال قرار بده..."
          />
        </div>

        {/* Action Button */}
        <button 
          type="button"
          onClick={handleEditBg}
          disabled={isEditingBg || !bgEditPrompt.trim()}
          className="w-full bg-slate-800 hover:bg-slate-700 hover:text-white border-2 border-slate-700/60 text-slate-200 mt-2 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
        >
          {isEditingBg ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              در حال پرداخت قلم...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              اعمال ویرایش بر پس‌زمینه
            </>
          )}
        </button>

        <div className="mt-6 border-t border-slate-850 pt-4 flex flex-col gap-2.5">
          <button 
            type="button"
            onClick={onNext}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/5 hover:-translate-y-0.5"
          >
            تایید کادر نهایی و ورود به آپلود محصول
            <ChevronLeft size={16} />
          </button>
          
          <button 
            type="button"
            onClick={onPrev} 
            className="w-full text-center text-slate-500 hover:text-slate-300 text-xs py-2 transition-all font-semibold"
          >
            بازگشت به انتخاب کادر
          </button>
        </div>
      </div>

      {/* 2. Photo Canvas Render Layer */}
      <div className="w-full lg:w-2/3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center relative min-h-[400px] overflow-hidden p-3 shadow-inner">
        {isEditingBg && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-amber-500 mb-3" size={32} />
            <p className="text-amber-500 text-xs font-bold leading-none animate-pulse">شبیه‌سازی و پرداخت اتمسفر کادر...</p>
          </div>
        )}
        
        <div className="relative inline-block max-w-full max-h-[500px] rounded-lg overflow-hidden shadow-2xl border border-slate-800">
          <img 
            ref={imageRef}
            src={selectedSketch} 
            alt="Photography Background Studio" 
            className="block max-w-full max-h-[500px] object-contain pointer-events-none" 
          />
          <canvas
            ref={maskCanvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            className={`absolute inset-0 w-full h-full touch-none ${isDrawingMode ? "cursor-crosshair z-10" : "pointer-events-none"}`}
          />
        </div>
      </div>

    </div>
  );
}
