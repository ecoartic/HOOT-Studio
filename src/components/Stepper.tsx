import React from "react";
import { 
  Home, 
  Palette, 
  Image as ImageIcon, 
  Edit3, 
  UploadCloud, 
  Wand2 
} from "lucide-react";

interface StepperProps {
  currentStep: number;
}

const steps = [
  { num: 1, title: "محیط و قالب", icon: Home },
  { num: 2, title: "استایل", icon: Palette },
  { num: 3, title: "انتخاب اتود", icon: ImageIcon },
  { num: 4, title: "ویرایش محیط", icon: Edit3 },
  { num: 5, title: "آپلود محصول", icon: UploadCloud },
  { num: 6, title: "تلفیق نهایی", icon: Wand2 }
];

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="bg-slate-900 py-4 px-4 md:px-8 border-b border-slate-800 shrink-0 overflow-x-auto select-none">
      <div className="min-w-[700px] max-w-5xl mx-auto flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-800 -z-10 transform -translate-y-1/2" />
        {steps.map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-slate-900 px-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              currentStep === s.num 
                ? "bg-amber-500 border-amber-500 text-slate-950 scale-110 shadow-[0_0_15px_rgba(234,179,8,0.4)]" 
                : currentStep > s.num
                  ? "bg-amber-500/20 border-amber-500/60 text-amber-500"
                  : "bg-slate-950 border-slate-700 text-slate-500"
            }`}>
              <s.icon size={18} />
            </div>
            <span className={`text-[11px] font-bold whitespace-nowrap transition-colors duration-300 ${
              currentStep >= s.num ? "text-amber-400" : "text-slate-500"
            }`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
