// Utility to lock/unlock body scroll when modals are open
// Uses a counter to handle nested modals properly

let scrollLockCount = 0;
let scrollPosition = 0;

export function lockBodyScroll() {
  scrollLockCount++;
  if (scrollLockCount === 1) {
    // Save current scroll position
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Apply scroll lock
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    document.body.classList.add('modal-open');
  }
}

export function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    // Remove scroll lock
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.classList.remove('modal-open');
    
    // Restore scroll position
    window.scrollTo(0, scrollPosition);
  }
}

