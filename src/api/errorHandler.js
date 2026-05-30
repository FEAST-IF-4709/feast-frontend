// ============================================
// FEAST Centralized Error Handler
// ============================================
import { clearTokens } from "./auth";

/**
 * Handle API errors centrally.
 * @param {import("axios").AxiosError} error
 * @param {object} options
 * @param {function} [options.showError] — display error toast/notification
 * @param {function} [options.setFormErrors] — set field-level validation errors
 * @param {function} [options.onUnauthorized] — custom handler for 401
 */
export function handleApiError(error, { showError, setFormErrors, onUnauthorized } = {}) {
  const notify = showError || ((msg) => console.error("[API Error]", msg));

  if (!error.response) {
    // Network error or server down
    notify("Tidak dapat terhubung ke server. Periksa koneksi internet kamu.");
    return;
  }

  const { status, data } = error.response;
  const code = data?.code;
  const requestId = data?.request_id;

  if (requestId) {
    console.error(`[API Error] request_id: ${requestId}`, data);
  }

  switch (status) {
    case 400:
      // Validation errors — set per-field errors if handler provided
      if (data.errors && setFormErrors) {
        const fieldErrors = {};
        data.errors.forEach(({ field, detail }) => {
          fieldErrors[field] = detail;
        });
        setFormErrors(fieldErrors);
      } else {
        notify(data.message || "Input tidak valid. Periksa kembali data kamu.");
      }
      break;

    case 401:
      if (code === "TOKEN_BLACKLISTED") {
        notify("Sesi telah berakhir. Silakan login ulang.");
        clearTokens();
        onUnauthorized?.();
      }
      // Token expired is handled by the interceptor in client.js
      break;

    case 403:
      notify("Kamu tidak memiliki akses untuk aksi ini.");
      break;

    case 404:
      notify("Data tidak ditemukan.");
      break;

    case 409:
      if (code === "STATE_TRANSITION_INVALID") {
        notify("Perubahan status tidak valid dari kondisi saat ini.");
      } else if (code === "PAYMENT_ALREADY_SETTLED") {
        notify("Order ini sudah dibayar.");
      } else {
        notify(data.message || "Konflik data. Coba refresh halaman.");
      }
      break;

    case 429:
      notify("Terlalu banyak request. Tunggu beberapa saat.");
      break;

    case 502:
      notify("Gagal terhubung ke payment gateway. Coba lagi nanti.");
      break;

    default:
      notify(data.message || "Terjadi kesalahan. Coba lagi atau hubungi support.");
  }
}

export default handleApiError;
