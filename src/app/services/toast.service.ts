import { Injectable } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastInstance {
  el: HTMLElement;
  timeoutId?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts: ToastInstance[] = [];
  private container?: HTMLElement;

  private ensureBrowser(): boolean {
    return typeof document !== 'undefined' && !!document.body;
  }

  private ensureContainer() {
    if (this.container) return;

    const existing = document.getElementById('app-toast-container');
    if (existing) {
      this.container = existing as HTMLElement;
      return;
    }

    const c = document.createElement('div');
    c.id = 'app-toast-container';
    // container styles: top-right stacked column
    Object.assign(c.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: '2147483647', // max safe z-index
      pointerEvents: 'none' // allow clicks through by default; individual toasts can accept pointer events
    });
    document.body.appendChild(c);
    this.container = c;
  }

  warn(message: string) {
    this.show(message, 'warning');
  }
  info(message: string) {
    this.show(message, 'info');
  }
  succes(message: string) {
    this.show(message, 'success');
  }
  error(message: string) {
    this.show(message, 'error');
  }

  show(message: string, type: ToastType = 'info', duration = 5000) {
    if (!this.ensureBrowser()) {
      return;
    }

    this.ensureContainer();
    const toast = document.createElement('div');
    toast.className = 'app-toast-item';
    toast.innerText = message;
    // Allow clicks on toast (e.g., to close) but not on container.
    Object.assign(toast.style, {
      pointerEvents: 'auto',
      minWidth: '180px',
      maxWidth: '360px',
      padding: '10px 14px',
      borderRadius: '8px',
      color: '#fff',
      boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
      opacity: '0',
      transform: 'translateY(-8px)',
      transition: 'opacity .28s ease, transform .28s ease',
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      fontSize: '14px',
      display: 'inline-block'
    });

    const colorMap: Record<ToastType, string> = {
      success: '#198754',
      error: '#dc3545',
      info: '#0d6efd',
      warning: '#ffc107'
    };

    toast.style.background = colorMap[type] || colorMap.info;

    // Insert at top of container so newest is first
    this.container!.insertBefore(toast, this.container!.firstChild || null);

    // Force reflow then animate in
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    toast.offsetHeight;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    const instance: ToastInstance = { el: toast };
    this.toasts.push(instance);

    // Auto remove
    instance.timeoutId = window.setTimeout(() => this.hideInstance(instance), duration);

    // Click to dismiss immediately
    toast.addEventListener('click', () => {
      this.hideInstance(instance);
    });
    return instance;
  }

  private hideInstance(instance: ToastInstance) {
    if (!instance.el) return;
    // cancel timeout if still present
    if (instance.timeoutId) {
      clearTimeout(instance.timeoutId);
      instance.timeoutId = undefined;
    }

    const el = instance.el;
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';

    // remove after animation
    setTimeout(() => {
      try {
        el.remove();
      } catch {
        //nada
      }
      // remove from array
      this.toasts = this.toasts.filter(t => t !== instance);
      // if no toasts left remove container (optional)
      if (this.toasts.length === 0 && this.container) {
        // this.container = undefined;
      }
    }, 300);
  }

  hideAll() {
    [...this.toasts].forEach(i => this.hideInstance(i));
  }
}
