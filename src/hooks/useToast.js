import { toast } from 'sonner';

export function useToast() {
  return {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast.info(msg),
    warning: (msg) => toast.warning(msg),
    loading: (msg) => toast.loading(msg),
    dismiss: (id) => toast.dismiss(id),
  };
}
