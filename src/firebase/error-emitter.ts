'use client';

class ErrorEmitter extends EventTarget {
  emit(event: string, detail: any) {
    this.dispatchEvent(new CustomEvent(event, { detail }));
  }
  on(event: string, callback: (detail: any) => void) {
    this.addEventListener(event, (e: any) => callback(e.detail));
  }
  off(event: string, callback: (detail: any) => void) {
    this.removeEventListener(event, (e: any) => callback(e.detail));
  }
}

export const errorEmitter = new ErrorEmitter();
