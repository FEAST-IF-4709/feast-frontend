import { toast } from 'sonner';

// Module-level singleton — same reference on every render, safe to use in effect deps
const stableToast = {
  success: (msg) => toast.success(msg),
  error:   (msg) => toast.error(msg),
  info:    (msg) => toast.info(msg),
  warning: (msg) => toast.warning(msg),
  loading: (msg) => toast.loading(msg),
  dismiss: (id)  => toast.dismiss(id),
};

export function useToast() {
  return stableToast;
}
