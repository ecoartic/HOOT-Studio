import { parseError, APIErrorDetails } from "./apiErrors";

// Client-side helper to attach a custom API key header if the user has defined one in UI settings
const createHeaders = (customApiKey?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (customApiKey && customApiKey.trim() !== "") {
    headers["x-api-key"] = customApiKey.trim();
  }
  return headers;
};

// Generic POST helper that handles status parsing and error transformations
async function postAPI(endpoint: string, body: any, customApiKey?: string): Promise<any> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: createHeaders(customApiKey),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: response.statusText };
      }
      const message = errorData?.error || response.statusText;
      const status = response.status;
      throw { message, status };
    }

    return await response.json();
  } catch (err: any) {
    throw parseError(err);
  }
}

// 1. Validate custom api key
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const result = await postAPI("/api/gemini/validate", {}, apiKey);
    return !!result.success;
  } catch (err) {
    throw err;
  }
}

// 2. Generate blank photography background from prompt
export async function generateBackgroundFromPrompt(
  prompt: string, 
  aspectRatio: string, 
  customApiKey?: string
): Promise<string> {
  try {
    const result = await postAPI("/api/gemini/background-prompt", { prompt, aspectRatio }, customApiKey);
    if (!result.imageBytes) {
      throw { message: "NO_IMAGE_RETURNED" };
    }
    return `data:image/png;base64,${result.imageBytes}`;
  } catch (err) {
    throw err;
  }
}

// 3. Generate empty photography background copying structure from a source image
export async function generateBackgroundFromReference(
  referenceImage: string, 
  prompt: string, 
  customApiKey?: string
): Promise<string> {
  try {
    const result = await postAPI("/api/gemini/background-reference", { referenceImage, prompt }, customApiKey);
    if (!result.imageBytes) {
      throw { message: "NO_IMAGE_RETURNED" };
    }
    return `data:image/jpeg;base64,${result.imageBytes}`;
  } catch (err) {
    throw err;
  }
}

// 4. Repaint portions of background image with prompt & optional mask drawn on image
export async function editBackgroundImage(
  image: string, 
  prompt: string, 
  customApiKey?: string
): Promise<string> {
  try {
    const result = await postAPI("/api/gemini/edit", { image, prompt }, customApiKey);
    if (!result.imageBytes) {
      throw { message: "NO_IMAGE_RETURNED" };
    }
    return `data:image/jpeg;base64,${result.imageBytes}`;
  } catch (err) {
    throw err;
  }
}

// 5. Seamlessly blend a flattened layered product image onto background with shadow and illumination tuning
export async function blendProductWithScene(
  compositeImage: string, 
  backgroundImage: string,
  productImage: string,
  instruction: string,
  customApiKey?: string
): Promise<string> {
  try {
    const result = await postAPI("/api/gemini/blend", { 
      image: compositeImage, 
      backgroundImage,
      productImage,
      prompt: instruction 
    }, customApiKey);
    if (!result.imageBytes) {
      throw { message: "NO_IMAGE_RETURNED" };
    }
    return `data:image/jpeg;base64,${result.imageBytes}`;
  } catch (err) {
    throw err;
  }
}

// 6. Realistic 2x high-resolution upscaling (conserving texture/pattern details and geometry accuracy)
export async function upscaleImage(
  image: string, 
  prompt: string, 
  customApiKey?: string
): Promise<string> {
  try {
    const result = await postAPI("/api/gemini/upscale", { image, prompt }, customApiKey);
    if (!result.imageBytes) {
      throw { message: "NO_IMAGE_RETURNED" };
    }
    return `data:image/jpeg;base64,${result.imageBytes}`;
  } catch (err) {
    throw err;
  }
}

// 7. Advanced scene intelligence analysis
export async function analyzeScene(
  image: string,
  customApiKey?: string
): Promise<any> {
  try {
    return await postAPI("/api/gemini/analyze-scene", { image }, customApiKey);
  } catch (err) {
    console.error("Scene analysis failed:", err);
    return null;
  }
}

// 8. Topaz Premium Upscaling Client Service
export interface TopazUpscaleResponse {
  imageBytes?: string;
  downloadUrl?: string;
  status: string;
  engine: string;
  creditsUsed: number | null;
  estimatedResolution: string;
  reconstructionLog: string;
}

export async function upscaleImageWithTopaz(
  image: string,
  topazApiKey: string,
  customApiKey?: string
): Promise<TopazUpscaleResponse> {
  try {
    return await postAPI("/api/topaz/upscale", { image, topazApiKey }, customApiKey);
  } catch (err) {
    throw err;
  }
}

