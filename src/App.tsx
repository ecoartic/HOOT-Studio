import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Stepper from "./components/Stepper";
import AuthModal from "./components/AuthModal";
import AspectEnvironmentStep from "./components/AspectEnvironmentStep";
import StyleReferenceStep from "./components/StyleReferenceStep";
import SketchGenerationStep from "./components/SketchGenerationStep";
import BackgroundEditStep from "./components/BackgroundEditStep";
import ProductUploadStep from "./components/ProductUploadStep";
import FinalCompositeStep from "./components/FinalCompositeStep";

import { 
  generateBackgroundFromPrompt, 
  generateBackgroundFromReference 
} from "./services/ai/geminiService";
import { AlertCircle, X } from "lucide-react";

export default function App() {
  const [step, setStep] = useState(1);
  
  // Custom API tracking
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem("hoot_custom_api_key") || "";
  });
  const [showAuth, setShowAuth] = useState(false);
  const [apiStatus, setApiStatus] = useState<"ready" | "demo" | "error" | "quota">("demo");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Layout States
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [environment, setEnvironment] = useState("");
  const [customEnvironment, setCustomEnvironment] = useState("");
  const [cameraAngle, setCameraAngle] = useState("eye-level");
  const [sceneDetailPrompt, setSceneDetailPrompt] = useState("");

  // Styling States
  const [style, setStyle] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Variations Output states
  const [isGeneratingSketches, setIsGeneratingSketches] = useState(false);
  const [sketches, setSketches] = useState<string[]>([]);
  const [selectedSketch, setSelectedSketch] = useState<string | null>(null);

  // Product uploader states
  const [productImage, setProductImage] = useState<string | null>(null);

  // Local storage persistence for Custom API Key
  const handleSaveCustomKey = (key: string) => {
    setCustomApiKey(key);
    if (key.trim() === "") {
      localStorage.removeItem("hoot_custom_api_key");
    } else {
      localStorage.setItem("hoot_custom_api_key", key);
    }
  };

  // Perform lightweight API connectivity analysis on mount or key edits
  useEffect(() => {
    const checkState = async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (customApiKey.trim() !== "") {
          headers["x-api-key"] = customApiKey.trim();
        }

        const res = await fetch("/api/gemini/validate", {
          method: "POST",
          headers
        });

        if (res.ok) {
          setApiStatus("ready");
        } else {
          const body = await res.json().catch(() => ({}));
          const isQuota = body.error?.includes("RESOURCE_EXHAUSTED") || res.status === 429;
          setApiStatus(isQuota ? "quota" : "demo");
        }
      } catch {
        setApiStatus("error");
      }
    };
    checkState();
  }, [customApiKey]);

  // Centralized photography sketch variations production
  const handleGenerateVariations = async () => {
    setErrorBanner(null);
    setIsGeneratingSketches(true);
    setStep(3);

    const targetEnv = environment === "custom" ? customEnvironment : environment;
    const targetStyle = style === "custom" ? customStyle : style;

    // Direct and precise English description for camera perspectives to feed the AI generator
    let angleDetail = "standard eye-level view, straight horizontal perspective, standard professional photography";
    if (cameraAngle === "wide-angle") {
      angleDetail = "cinematic wide-angle view, deep perspective, wide scope photoshoot";
    } else if (cameraAngle === "low-angle") {
      angleDetail = "low-angle perspective, low horizon camera view close to the ground looking slightly upward";
    } else if (cameraAngle === "high-angle") {
      angleDetail = "high-angle perspective, tilted camera from top looking down at the empty parquet/floor surface";
    } else if (cameraAngle === "close-up") {
      angleDetail = "close-up macro view backdrop, focused environment plate with shallow depth of field blurred background";
    }

    // Embed the custom user scene prompt if specified
    const extraDetails = sceneDetailPrompt.trim() !== "" 
      ? `, with custom elements and layout specifics: "${sceneDetailPrompt}"` 
      : "";

    // Build base prompt with strong architectural and empty environment keywords
    const basePrompt = `A beautifully bare and unoccupied interior studio scene displaying only a clean, empty floor surface, decorated with ${targetEnv} backdrop elements without any central furniture, styled in photorealistic ${targetStyle} architecture style${extraDetails}. Photography composition: ${angleDetail}, empty blank mock-up space, professional product catalog studio softbox ambient lighting, highly refined static background, 8k resolution. Bare vacant space with absolutely no living creatures, no human presence, no persons, completely desolate inanimate room.`;

    const results: string[] = [];
    const maxSketches = 3;

    try {
      if (referenceImage) {
        // High quality reference image structure cloning with camera alignment
        const promptInstruction = `Create a completely empty professional product photography environment mimicking the camera perspective, horizon height, and empty architectural structure of this reference image. Build a completely empty, bare, unoccupied, desolate ${targetEnv} space in ${targetStyle} styling${extraDetails}. Camera placement is: ${angleDetail}. Ensure there are absolutely no people, no living beings, no humans, and the room is 100% vacant and bare.`;
        
        // Generate variations sequentially to avoid immediate 429 concurrency quota limits
        for (let i = 0; i < maxSketches; i++) {
          try {
            const sketch = await generateBackgroundFromReference(
              referenceImage, 
              `${promptInstruction} variation ${i + 1}`, 
              customApiKey
            );
            results.push(sketch);
            // Small pause between sequential requests to satisfy rate limiter
            if (i < maxSketches - 1) {
              await new Promise(resolve => setTimeout(resolve, 800));
            }
          } catch (err: any) {
            console.warn(`Variation ${i + 1} failed:`, err);
            // If we have at least one successfully generated sketch, we can let the user proceed
            if (results.length > 0 && (err?.code === "RESOURCE_EXHAUSTED" || err?.status === 429)) {
              break;
            }
            if (results.length === 0) {
              throw err;
            }
          }
        }
      } else {
        // High quality text-to-image Imagen generation sequentially to respect quota
        for (let i = 0; i < maxSketches; i++) {
          try {
            const sketch = await generateBackgroundFromPrompt(
              `${basePrompt}, variation-${i + 1}`, 
              aspectRatio, 
              customApiKey
            );
            results.push(sketch);
            if (i < maxSketches - 1) {
              await new Promise(resolve => setTimeout(resolve, 800));
            }
          } catch (err: any) {
            console.warn(`Variation ${i + 1} failed:`, err);
            if (results.length > 0 && (err?.code === "RESOURCE_EXHAUSTED" || err?.status === 429)) {
              break;
            }
            if (results.length === 0) {
              throw err;
            }
          }
        }
      }

      if (results.length === 0) {
        throw new Error("NO_IMAGE_RETURNED");
      }

      setSketches(results);
      setSelectedSketch(results[0]); // default select variation 1
    } catch (err: any) {
      console.error(err);
      setErrorBanner(err?.persianMessage || "فرآیند طراحی اتودها ناموفق بود. اتصال شبکه یا کلید API خود را بررسی نمایید.");
      setStep(2); // return to configuration
    } finally {
      setIsGeneratingSketches(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 overflow-hidden flex flex-col">
      
      {/* 1. Brand Top navigation panel */}
      <Header 
        onOpenAuth={() => setShowAuth(true)} 
        apiStatus={apiStatus} 
      />

      {/* 2. Step controller stepper map */}
      <Stepper currentStep={step} />

      {/* 3. Global Elegant RTL Persian toast notifications ribbon */}
      {errorBanner && (
        <div className="bg-rose-500/10 border-y border-rose-500/20 text-rose-400 py-3.5 px-6 shrink-0 flex items-center justify-between text-xs animate-slide-up">
          <div className="flex items-center gap-2.5 max-w-2xl">
            <AlertCircle size={18} className="shrink-0 animate-pulse" />
            <span className="font-semibold leading-relaxed">{errorBanner}</span>
          </div>
          <button 
            type="button"
            onClick={() => setErrorBanner(null)} 
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-900 transition-all"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* 4. API Override Settings Modal popup overlay */}
      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)}
          customApiKey={customApiKey}
          onSaveCustomApiKey={handleSaveCustomKey}
        />
      )}

      {/* 5. Flow screens router */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start">
        <div className="max-w-5xl w-full flex flex-col items-center">
          
          {step === 1 && (
            <AspectEnvironmentStep 
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              environment={environment}
              setEnvironment={setEnvironment}
              customEnvironment={customEnvironment}
              setCustomEnvironment={setCustomEnvironment}
              cameraAngle={cameraAngle}
              setCameraAngle={setCameraAngle}
              sceneDetailPrompt={sceneDetailPrompt}
              setSceneDetailPrompt={setSceneDetailPrompt}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StyleReferenceStep 
              style={style}
              setStyle={setStyle}
              customStyle={customStyle}
              setCustomStyle={setCustomStyle}
              referenceImage={referenceImage}
              setReferenceImage={setReferenceImage}
              onPrev={() => setStep(1)}
              onNext={handleGenerateVariations}
            />
          )}

          {step === 3 && (
            <SketchGenerationStep 
              isGeneratingSketches={isGeneratingSketches}
              sketches={sketches}
              selectedSketch={selectedSketch}
              setSelectedSketch={setSelectedSketch}
              onPrev={() => setStep(2)}
              onNext={() => setStep(4)}
              onRebuild={handleGenerateVariations}
            />
          )}

          {step === 4 && selectedSketch && (
            <BackgroundEditStep 
              selectedSketch={selectedSketch}
              onUpdateSketch={(updated) => setSelectedSketch(updated)}
              onPrev={() => setStep(3)}
              onNext={() => setStep(5)}
              customApiKey={customApiKey}
            />
          )}

          {step === 5 && (
            <ProductUploadStep 
              onUploadProduct={(imageUrl) => {
                setProductImage(imageUrl);
                setStep(6);
              }}
              onPrev={() => setStep(4)}
            />
          )}

          {step === 6 && selectedSketch && productImage && (
            <FinalCompositeStep 
              selectedSketch={selectedSketch}
              productImage={productImage}
              onPrev={() => setStep(5)}
              customApiKey={customApiKey}
            />
          )}

        </div>
      </main>
    </div>
  );
}
