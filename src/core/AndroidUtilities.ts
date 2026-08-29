/**
 * AndroidUtilities.ts - Android Display & Density Utilities
 * 
 * Replicated directly from DrKLO/Telegram Android:
 * org.telegram.messenger.AndroidUtilities.java
 */

export class AndroidUtilities {
  public static density: number = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  public static displaySize: { width: number; height: number } = {
    width: typeof window !== 'undefined' ? window.innerWidth : 1080,
    height: typeof window !== 'undefined' ? window.innerHeight : 1920,
  };

  /**
   * dp() converts density-independent pixels to physical pixels
   * Math.ceil(density * value)
   */
  public static dp(value: number): number {
    if (value === 0) return 0;
    return Math.ceil(AndroidUtilities.density * value);
  }

  /**
   * dp2() converts with standard rounding
   */
  public static dp2(value: number): number {
    if (value === 0) return 0;
    return Math.floor(AndroidUtilities.density * value);
  }

  /**
   * dpf2() converts with floating precision
   */
  public static dpf2(value: number): number {
    if (value === 0) return 0;
    return AndroidUtilities.density * value;
  }

  public static getMinTouchTargetSize(): number {
    return AndroidUtilities.dp(48); // 48dp Android standard touch target
  }

  public static getAvatarSize(type: 'small' | 'medium' | 'large' | 'profile'): number {
    switch (type) {
      case 'small': return AndroidUtilities.dp(32);
      case 'medium': return AndroidUtilities.dp(44);
      case 'large': return AndroidUtilities.dp(54);
      case 'profile': return AndroidUtilities.dp(96);
    }
  }

  public static getChatBubbleMaxWidth(containerWidth: number): number {
    // Replicates Telegram Android bubble width constraint (max 82% or 480dp)
    return Math.min(containerWidth * 0.82, AndroidUtilities.dp(520));
  }

  public static updateDensity() {
    if (typeof window !== 'undefined') {
      AndroidUtilities.density = window.devicePixelRatio || 1;
      AndroidUtilities.displaySize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => AndroidUtilities.updateDensity());
}
