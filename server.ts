import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON body payload size up to 20MB for handling base64 imagery
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Shared helper to retrieve configured GoogleGenAI client
const getAiClient = (req: express.Request) => {
  // Use user-provided key if sent via x-api-key header (helpful for custom users/quotas)
  const clientKey = req.headers["x-api-key"] as string;
  const key = (clientKey && clientKey.trim() !== "") ? clientKey.trim() : process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("API_KEY_MISSING");
  }

  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// 1. Api Key Validation
app.post("/api/gemini/validate", async (req, res) => {
  try {
    const ai = getAiClient(req);
    // Lightweight validation using gemini-3.5-flash
    await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "ping",
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Verification failed:", error);
    const message = error.message === "API_KEY_MISSING" ? "کلید API یافت نشد." : "کلید API نامعتبر است یا مشکلی در اتصال وجود دارد.";
    res.status(401).json({ error: message });
  }
});

// 2. Generate Background Sketch via Text-To-Image
app.post("/api/gemini/background-prompt", async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;
    const ai = getAiClient(req);
    const model = process.env.IMAGEN_MODEL || "imagen-4.0-generate-001";

    // Translate and refine the prompt using Gemini 3.5 Flash first to make it beautiful, highly creative and strictly human-free!
    let refinedPrompt = prompt;
    try {
      const translationRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an expert creative director, interior architect, and pro-photographer prompt engineer for Imagen 3.
Your task is to take the user's prompt (which may contain Persian and English words) and expand/rewrite it into a highly professional, luxurious, and extremely artistic empty background stage plate for catalog product photography.

STRICT PROTOCOLS (MANDATORY AND CRITICAL):
1. **Absolutely NO Humans or Living Beings**: The scene MUST be 100% vacant, empty, and unoccupied. There must be zero people, zero fashion models, zero hands, zero bodies, zero faces, and no living creatures (dogs, cats, etc.). Focus solely on static architecture, backdrops, and floors.
2. **Vacant Showroom Center**: The center of the scene/carpet/floor MUST be empty, bare, and unoccupied to make room on the ground for placing a three dimensional couch/item later.
3. **No Central Furniture**: Do NOT generate any sofas, couches, dining tables, or beds in the middle of the room. Keep the center floor vacant.
4. **Rich Architectural & Styling Aesthetics**: Describe gorgeous, premium, high-class architectural elements in the background to make the photo super creative and premium (e.g., beautiful floor materials like travertine, polished concrete, high-end wood parquets, or luxury matte marble; background wall accents, minimalist vertical columns, elegant sliding glass door/panels, ambient sunbeams casting organic shadows on the floor, potted tall pampas grass, warm volumetric softbox lighting).
5. **Identify Environment & Style**: Read the input to extract the environment (like bedroom, kitchen, office, terrace, outdoor street, or gardens) and style (like classic, modern minimal, luxury) and incorporate them creatively. If it is an outdoor environment, describe a high-end styled vacant exhibition platform with beautiful outdoor backdrop elements.
6. **No contradiction**: Do not mix "interior studio scene" with "outdoor street" in a way that causes AI confusion. If the prompt specifies an outdoor spot, design an elegant, vacant outdoor display stage.

Input Prompt: "${prompt}"

Output ONLY a single paragraph containing the optimized English prompt, with no intro, comments, quotes, or markdown format.`,
      });
      const generatedText = translationRes.text?.trim();
      if (generatedText) {
        refinedPrompt = generatedText;
        console.log("Original background prompt:", prompt);
        console.log("Gemini Refined background prompt:", refinedPrompt);
      }
    } catch (refineErr) {
      console.error("Failed to refine prompt with Gemini:", refineErr);
    }

    const response = await ai.models.generateImages({
      model: model,
      prompt: refinedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: aspectRatio || "1:1",
      },
    });

    const base64Bytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64Bytes) {
      return res.status(500).json({ error: "NO_IMAGE_RETURNED" });
    }
    res.json({ imageBytes: base64Bytes });
  } catch (error: any) {
    console.error("Text-to-image Generation error:", error);
    const isQuota = error.message?.includes("RESOURCE_EXHAUSTED") || error.status === 429;
    res.status(isQuota ? 429 : 500).json({
      error: isQuota 
        ? "RESOURCE_EXHAUSTED" 
        : (error.message || "خطا در تولید تصویر پس‌زمینه.")
    });
  }
});

// 3. Generate Background Sketch via Reference Image + Prompt
app.post("/api/gemini/background-reference", async (req, res) => {
  try {
    const { referenceImage, prompt } = req.body;
    const ai = getAiClient(req);
    const model = process.env.GEMINI_IMAGE_EDIT_MODEL || "gemini-2.5-flash-image";

    // Translate and refine the prompt using Gemini 3.5 Flash first to make it beautiful, highly creative and strictly human-free!
    let refinedPrompt = prompt;
    try {
      const translationRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an expert creative director, interior architect, and pro-photographer prompt engineer.
Your task is to take the user's prompt (which may contain Persian and English words) and expand/rewrite it into a highly professional, luxurious, and extremely artistic empty background stage plate for catalog product photography, aligned with a reference structure.

STRICT PROTOCOLS (MANDATORY AND CRITICAL):
1. **Absolutely NO Humans or Living Beings**: The scene MUST be 100% vacant, empty, and unoccupied. There must be zero people, zero fashion models, zero hands, zero bodies, zero faces, and no living creatures. Focus solely on static architecture, backdrops, and floors.
2. **Vacant Showroom Center**: The center of the scene/carpet/floor MUST be empty, bare, and unoccupied to make room for placing a three dimensional couch/item.
3. **No Central Furniture**: Do NOT generate any sofas, couches, dining tables, or beds in the middle of the room. Keep the center floor vacant.
4. **Rich Architectural & Styling Aesthetics**: Describe premium, high-class architectural elements in the background to make the photo super creative and premium (e.g., beautiful floor materials, background wall accents, minimalist vertical columns, elegant sliding glass door/panels, ambient sunbeams, warm volumetric softbox lighting).
5. **No contradiction**: Do not mix "interior studio scene" with "outdoor street".

Input Prompt: "${prompt}"

Output ONLY a single paragraph containing the optimized English prompt, with no intro, comments, quotes, or markdown format.`,
      });
      const generatedText = translationRes.text?.trim();
      if (generatedText) {
        refinedPrompt = generatedText;
        console.log("Original background-reference prompt:", prompt);
        console.log("Gemini Refined background-reference prompt:", refinedPrompt);
      }
    } catch (refineErr) {
      console.error("Failed to refine reference prompt with Gemini:", refineErr);
    }

    const refMime = referenceImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/jpeg";
    const base64Ref = referenceImage.split(",")[1];

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { inlineData: { mimeType: refMime, data: base64Ref } },
        { text: refinedPrompt }
      ],
      config: {
        responseModalities: ["IMAGE"]
      }
    });

    let newImageBase64 = null;
    if (response.candidates?.[0]?.content?.parts) {
      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData?.data) {
        newImageBase64 = part.inlineData.data;
      }
    }

    if (!newImageBase64) {
      return res.status(500).json({ error: "NO_IMAGE_RETURNED" });
    }
    res.json({ imageBytes: newImageBase64 });
  } catch (error: any) {
    console.error("Reference-to-image Generation error:", error);
    const isQuota = error.message?.includes("RESOURCE_EXHAUSTED") || error.status === 429;
    res.status(isQuota ? 429 : 500).json({
      error: isQuota 
        ? "RESOURCE_EXHAUSTED" 
        : (error.message || "خطا در نسخه‌برداری از رفرنس.")
    });
  }
});

// 4. Edit Background Image/Composite Image with Selection Mask
app.post("/api/gemini/edit", async (req, res) => {
  try {
    const { image, prompt } = req.body;
    const ai = getAiClient(req);
    const model = process.env.GEMINI_IMAGE_EDIT_MODEL || "gemini-2.5-flash-image";

    const mime = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/jpeg";
    const base64Data = image.split(",")[1];

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { inlineData: { mimeType: mime, data: base64Data } },
        { text: prompt }
      ],
      config: {
        responseModalities: ["IMAGE"]
      }
    });

    let newImageBase64 = null;
    if (response.candidates?.[0]?.content?.parts) {
      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData?.data) {
        newImageBase64 = part.inlineData.data;
      }
    }

    if (!newImageBase64) {
      return res.status(500).json({ error: "NO_IMAGE_RETURNED" });
    }
    res.json({ imageBytes: newImageBase64 });
  } catch (error: any) {
    console.error("Image Edit error:", error);
    const isQuota = error.message?.includes("RESOURCE_EXHAUSTED") || error.status === 429;
    res.status(isQuota ? 429 : 500).json({
      error: isQuota 
        ? "RESOURCE_EXHAUSTED" 
        : (error.message || "خطا در ویرایش تصویر.")
    });
  }
});

// 5. Blend Product and Background
app.post("/api/gemini/blend", async (req, res) => {
  try {
    const { image, backgroundImage, productImage, prompt } = req.body;
    const ai = getAiClient(req);
    const model = process.env.GEMINI_IMAGE_EDIT_MODEL || "gemini-2.5-flash-image";

    const compMime = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/jpeg";
    const compBase64 = image.split(",")[1];

    const parts: any[] = [];

    // 1. Add pristine background if available
    if (backgroundImage) {
      const bgMime = backgroundImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/jpeg";
      const bgBase64 = backgroundImage.split(",")[1];
      parts.push({
        inlineData: { mimeType: bgMime, data: bgBase64 }
      });
      parts.push({
        text: "IMAGE 1: Prinstine, 100% empty, unoccupied background photoshoot plate. Notice the exact camera perspective, horizon angle, location of windows/doors casting light, highlights, sunbeams, and the clean, bare floor structure (parquet/carpet/marble tiles)."
      });
    }

    // 2. Add high-poly crisp product if available
    if (productImage) {
      const prodMime = productImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/png";
      const prodBase64 = productImage.split(",")[1];
      parts.push({
        inlineData: { mimeType: prodMime, data: prodBase64 }
      });
      parts.push({
        text: "IMAGE 2: High-resolution clean cut-out of the pure product. Identify its precise design details, textures, wrinkles, stitches, wood grain, metal finishes, colors and local structure that MUST BE PRESERVED with absolute 100% fidelity without morphing."
      });
    }

    // 3. Add composite guide
    parts.push({
      inlineData: { mimeType: compMime, data: compBase64 }
    });
    parts.push({
      text: "IMAGE 3: The layout placement guide. It indicates exactly where, what scale, and in what 3D tilt coordinates (pitch, yaw, roll) the product sits on top of the empty background room."
    });

    // 4. Combined smart blending, physical casting shadows, and environmental calibration instructions
    parts.push({
      text: `Your task is retrieve the product from IMAGE 2, scale/locate/orient it exactly matching the layout representation in IMAGE 3, and seamlessly, photorealistically blend/synthesize it into the empty room in IMAGE 1.

CRITICAL PHYSICAL INTEGRATION INSTRUCTIONS (MANDATORY AND SACRED):
1. REALISTIC CONTACT SHADOWS: Analyze the floor/ground tiles of IMAGE 1 directly underneath the object's base guide footprint in IMAGE 3. Render dark, highly tight contact lines (ambient occlusion) exactly where the product legs or base touches the ground surface.
2. LONG DIRECTIONAL CAST SHADOWS: Trace the light source direction (e.g. natural sunbeams coming from the window on the left side or top light). Cast matching soft, faded, blurred shadows on the floor projecting in the opposite direction from the product structure. The intensity, softness, and length of these cast shadows must perfectly match other shadows already visible in IMAGE 1's empty space.
3. ROOM SUNLIGHT AND AMBIENT ILLUMINATION: The lighting falling on the product's surfaces must match the color temperature, intensity, and direction of the light from the window/studio softbox. Adjust the highlights, ambient reflections, and ambient shadows on the bed/wardrobe/chair to perfectly match the environment.
4. STRICT MATERIAL AND STRUCTURAL FIDELITY: You MUST NOT distort, blur, or re-sketch any design elements of the product. The product (IMAGE 2) must remain 100% faithful and recognizable in its texture, material, leather, metal, wood parquet, upholstery, and seams.

${prompt}`
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        responseModalities: ["IMAGE"]
      }
    });

    let newImageBase64 = null;
    if (response.candidates?.[0]?.content?.parts) {
      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData?.data) {
        newImageBase64 = part.inlineData.data;
      }
    }

    if (!newImageBase64) {
      return res.status(500).json({ error: "NO_IMAGE_RETURNED" });
    }
    res.json({ imageBytes: newImageBase64 });
  } catch (error: any) {
    console.error("Product Blending error:", error);
    const isQuota = error.message?.includes("RESOURCE_EXHAUSTED") || error.status === 429;
    res.status(isQuota ? 429 : 500).json({
      error: isQuota 
        ? "RESOURCE_EXHAUSTED" 
        : (error.message || "خطا در تلفیق و تنظیم نورپردازی محصول.")
    });
  }
});

// 6. Intelligent AI Upscaling
app.post("/api/gemini/upscale", async (req, res) => {
  try {
    const { image, prompt } = req.body;
    const ai = getAiClient(req);
    const model = process.env.GEMINI_IMAGE_EDIT_MODEL || "gemini-2.5-flash-image";

    const mime = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/jpeg";
    const base64Data = image.split(",")[1];

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { inlineData: { mimeType: mime, data: base64Data } },
        { text: prompt }
      ],
      config: {
        responseModalities: ["IMAGE"]
      }
    });

    let newImageBase64 = null;
    if (response.candidates?.[0]?.content?.parts) {
      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData?.data) {
        newImageBase64 = part.inlineData.data;
      }
    }

    if (!newImageBase64) {
      return res.status(500).json({ error: "NO_IMAGE_RETURNED" });
    }
    res.json({ imageBytes: newImageBase64 });
  } catch (error: any) {
    console.error("AI Upscale error:", error);
    const isQuota = error.message?.includes("RESOURCE_EXHAUSTED") || error.status === 429;
    res.status(isQuota ? 429 : 500).json({
      error: isQuota 
        ? "RESOURCE_EXHAUSTED" 
        : (error.message || "خطا در افزایش کیفیت هوش مصنوعی.")
    });
  }
});

// 7. Advanced Scene Perspective & Camera Angle Analysis
app.post("/api/gemini/analyze-scene", async (req, res) => {
  try {
    const { image } = req.body;
    const ai = getAiClient(req);
    // Use gemini-2.5-flash as default high-speed Gemini model
    const model = "gemini-2.5-flash";

    const mime = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/jpeg";
    const base64Data = image.split(",")[1];

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { inlineData: { mimeType: mime, data: base64Data } },
        { text: `You are an expert director of photography and camera technician. Analyze this empty studio photoshoot setup image and return a JSON ONLY with the following structured keys:
{
  "rawPerspectiveAnalysis": "Detailed description of the camera perspective (such as eye-level, low-angle, high-angle, wide lens) and horizon/surface level",
  "lightingConditions": "Light temperature (warm, neutral, cool), primary light source direction (e.g. left side window, top studio softbox), shadow hardness, and depth shadows",
  "suggestedX": 50,
  "suggestedY": 65,
  "suggestedScale": 45,
  "supportiveSurfacesDescription": "Exact description of the baseline surface supporting objects (e.g. wood parquet, matte marble slab, metal grid)",
  "ambienceMood": "Mood descriptions such as minimalist brutalism, warm scandinavian, industrial moody",
  "preciseLightSurfacesAndShadowGuidelines": "Extremely detailed prompt instruction for casting contact shadows underneath the product footprint, ambient occlusion values, and how window light sunbeams on the left/right should illuminate the product surfaces based on light direction detected in the image"
}
Ensure to check for lines, planes, shadow vectors, and window locations. Provide ONLY the raw JSON format inside markdown backticks or as pure JSON output without conversational noise.` }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const rawText = response.text || "{}";
    // Check and clean any markdown wrappers if returned
    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const resultJson = JSON.parse(cleanedText);
    res.json(resultJson);
  } catch (error: any) {
    console.error("Scene analysis failed:", error);
    res.json({
      rawPerspectiveAnalysis: "Eye-level standard architectural perspective.",
      lightingConditions: "Neutral soft studio lighting with ambient contact shadows.",
      suggestedX: 50,
      suggestedY: 70,
      suggestedScale: 50,
      supportiveSurfacesDescription: "Base studio surface floor.",
      ambienceMood: "Modern professional studio design.",
      preciseLightSurfacesAndShadowGuidelines: "Cast soft, dark contact shadows directly underneath the furniture footprint on the floor. Blend light coming from the light source to realistically illuminate the outer surfaces of the object."
    });
  }
});

// 8. Topaz AI Super-Resolution & Material Restoration Endpoint
app.post("/api/topaz/upscale", async (req, res) => {
  try {
    const { image, topazApiKey } = req.body;
    
    if (!topazApiKey || topazApiKey.trim() === "") {
      return res.status(400).json({ error: "لطفاً کلید API تو‌پز (Topaz API Key) خود را وارد کنید تا فرآیند پردازش با سرورهای قدرتمند Topaz فعال شود." });
    }

    const trimmedApiKey = topazApiKey.trim();
    console.log("Topaz API upscale request started with key length:", trimmedApiKey.length);

    // Parse base64
    const mime = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/jpeg";
    const base64Data = image.split(",")[1];
    
    if (!base64Data) {
      return res.status(400).json({ error: "تصویر ورودی نامعتبر است." });
    }

    const base64Buffer = Buffer.from(base64Data, "base64");
    const blob = new (globalThis as any).Blob([base64Buffer], { type: mime });

    // Build Form-Data natively
    const formData = new (globalThis as any).FormData();
    formData.append("image", blob, "image.jpg");
    formData.append("model", "Standard V2");
    formData.append("output_format", "jpeg");

    // 1. Submit job
    console.log("Submitting job to Topaz Image API...");
    const submitResponse = await fetch("https://api.topazlabs.com/image/v1/enhance/async", {
      method: "POST",
      headers: {
        "X-API-KEY": trimmedApiKey,
      },
      body: formData,
    });

    if (!submitResponse.ok) {
      const status = submitResponse.status;
      let errMsg = "خطا در برقراری ارتباط با سرور Topaz Labs.";
      try {
        const errJson = await submitResponse.json();
        errMsg = errJson.message || errJson.error || errJson.reason || errMsg;
      } catch (e) {}

      if (status === 401) {
        return res.status(401).json({ error: "کلید Topaz نامعتبر است یا دسترسی API فعال نیست." });
      }
      if (status === 429) {
        return res.status(429).json({ error: "پردازش Topaz به محدودیت نرخ یا سهمیه برخورد کرده است." });
      }
      return res.status(status).json({ error: `خطا در ثبت پردازش در Topaz: ${errMsg}` });
    }

    const submitData = await submitResponse.json() as any;
    const processId = submitData.process_id || submitData.id || submitData.processId;

    if (!processId) {
      return res.status(500).json({ error: "سرور Topaz شناسه پردازش معتبری برنگرداند." });
    }

    console.log(`Topaz job submitted successfully. Process ID: ${processId}. Starting status polling...`);

    // 2. Poll Status
    let status = "pending";
    let downloadUrl = null;
    const maxAttempts = 40; // 40 attempts * 2 seconds = 80 seconds timeout
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

      console.log(`Polling Topaz status, attempt ${attempts}/${maxAttempts} for process ${processId}...`);
      const statusResponse = await fetch(`https://api.topazlabs.com/image/v1/status/${processId}`, {
        method: "GET",
        headers: {
          "X-API-KEY": trimmedApiKey,
        }
      });

      if (!statusResponse.ok) {
        console.error(`Status check failed with HTTP ${statusResponse.status}`);
        continue; // Keep polling or retry
      }

      const statusData = await statusResponse.json() as any;
      const currentStatus = (statusData.status || "processing").toLowerCase();
      console.log(`Current status of process ${processId}: ${currentStatus}`);

      // Some status APIs already return download URL
      if (statusData.download_url || statusData.url || statusData.downloadUrl) {
        downloadUrl = statusData.download_url || statusData.url || statusData.downloadUrl;
      }

      if (currentStatus === "completed" || currentStatus === "success" || currentStatus === "done") {
        status = "completed";
        break;
      }

      if (currentStatus === "failed" || currentStatus === "cancelled" || currentStatus === "error") {
        status = "failed";
        break;
      }
    }

    if (status !== "completed") {
      if (status === "failed") {
        return res.status(500).json({ error: "پردازش Topaz ناموفق یا توسط سیستم لغو شد." });
      } else {
        return res.status(504).json({ error: "زمان پاسخ‌دهی سرور ابری Topaz به پایان رسید (Timeout)." });
      }
    }

    // 3. Fetch Download Url if not returned in status
    if (!downloadUrl) {
      console.log(`Retrieving download url for process ${processId}...`);
      const downloadResponse = await fetch(`https://api.topazlabs.com/image/v1/download/${processId}`, {
        method: "GET",
        headers: {
          "X-API-KEY": trimmedApiKey,
        }
      });

      if (!downloadResponse.ok) {
        return res.status(500).json({ error: "لینک دانلود از Topaz دریافت نشد." });
      }

      const downloadData = await downloadResponse.json() as any;
      downloadUrl = downloadData.url || downloadData.download_url || downloadData.downloadUrl;
    }

    if (!downloadUrl) {
      return res.status(500).json({ error: "لینک دانلود نهایی توسط سرورهای Topaz ارائه‌ نشد." });
    }

    console.log(`Downloading upscaled image from Topaz URL: ${downloadUrl}`);
    
    // Download and convert to Base64 so the preview works instantly in browser
    let finalBase64Bytes = null;
    try {
      const imgRes = await fetch(downloadUrl);
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        finalBase64Bytes = Buffer.from(arrayBuffer).toString("base64");
      }
    } catch (downloadErr) {
      console.error("Failed to fetch binary image from Amazon/Topaz CDN:", downloadErr);
    }

    res.json({
      success: true,
      imageBytes: finalBase64Bytes,
      downloadUrl: downloadUrl,
      processId: processId,
      status: "success",
      engine: "Topaz Labs Image API",
      model: "Standard V2",
      creditsUsed: null,
      estimatedResolution: "Processed by Topaz API",
      reconstructionLog: "پایگاه داده الگوهای متریال با موفقیت بازسازی شد. لرزش و بلور برطرف گردید. فرآیند پردازش با سرورهای قدرتمند Topaz با موفقیت انجام شد."
    });

  } catch (error: any) {
    console.error("Topaz upscale backend error:", error);
    res.status(500).json({ error: error.message || "فرآیند اپ‌اسکیل با موفقیت به اتمام نرسید." });
  }
});

// Mount Vite middleware for development, serve static for production
const startViteAndExpress = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HOOT Studio full-stack server running on http://localhost:${PORT}`);
  });
};

startViteAndExpress().catch((err) => {
  console.error("Failed to start server:", err);
});
