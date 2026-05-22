export interface APIErrorDetails {
  code: string;
  persianMessage: string;
  isFatal: boolean;
}

export const API_ERRORS: Record<string, APIErrorDetails> = {
  RESOURCE_EXHAUSTED: {
    code: "RESOURCE_EXHAUSTED",
    persianMessage: "سهمیه تولید تصویر Gemini محدود شده یا به پایان رسیده است. کمی بعد دوباره تلاش کنید یا کلید/API دیگری وارد کنید.",
    isFatal: false
  },
  INVALID_API_KEY: {
    code: "INVALID_API_KEY",
    persianMessage: "خطای اعتبارسنجی: کلید API نامعتبر است یا ثبت نشده است. لطفاً کلید معتبری وارد کنید.",
    isFatal: true
  },
  PERMISSION_DENIED: {
    code: "PERMISSION_DENIED",
    persianMessage: "دسترسی غیر مجاز (403): کلید شما دسترسی لازم به این مدل را ندارد.",
    isFatal: true
  },
  MODEL_NOT_AVAILABLE: {
    code: "MODEL_NOT_AVAILABLE",
    persianMessage: "مدل آوا یا تصویر انتخاب شده (404) در این منطقه یا با این کلید در دسترس نیست.",
    isFatal: true
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    persianMessage: "خطا در برقراری ارتباط با شبکه. لطفاً اتصال اینترنت خود را بررسی نمایید.",
    isFatal: false
  },
  NO_IMAGE_RETURNED: {
    code: "NO_IMAGE_RETURNED",
    persianMessage: "هوش مصنوعی پاسخی برنگرداند. لطفاً مجدداً پرامپت خود را تغییر داده و ارسال کنید.",
    isFatal: false
  },
  UNKNOWN: {
    code: "UNKNOWN",
    persianMessage: "یک خطای غیرمنتظره رخ داد. لطفا سیستم را مجددا بررسی کرده یا دوباره تلاش فرمایید.",
    isFatal: false
  }
};

export function parseError(err: any): APIErrorDetails {
  const message = (err?.message || String(err)).toUpperCase();
  const status = err?.status;

  if (message.includes("RESOURCE_EXHAUSTED") || status === 429) {
    return API_ERRORS.RESOURCE_EXHAUSTED;
  }
  if (message.includes("INVALID_API_KEY") || message.includes("API_KEY_INVALID") || status === 401) {
    return API_ERRORS.INVALID_API_KEY;
  }
  if (message.includes("PERMISSION_DENIED") || status === 403) {
    return API_ERRORS.PERMISSION_DENIED;
  }
  if (message.includes("MODEL_NOT_FOUND") || message.includes("NOT_FOUND") || status === 404) {
    return API_ERRORS.MODEL_NOT_AVAILABLE;
  }
  if (message.includes("FETCH") || message.includes("NETWORK") || message.includes("TIMEOUT")) {
    return API_ERRORS.NETWORK_ERROR;
  }
  if (message.includes("NO_IMAGE_RETURNED")) {
    return API_ERRORS.NO_IMAGE_RETURNED;
  }

  return API_ERRORS.UNKNOWN;
}
