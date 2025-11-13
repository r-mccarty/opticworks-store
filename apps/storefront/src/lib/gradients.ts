/**
 * Utility functions for generating gradient placeholders
 * Replaces unreliable Unsplash images with consistent gradients
 */

export const gradients = {
  // Product gradients
  primary: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Orange gradient
  secondary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue gradient
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Green gradient
  purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', // Purple gradient
  indigo: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', // Indigo gradient
  emerald: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Emerald gradient
  rose: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', // Rose gradient
  gray: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', // Gray gradient
  
  // Tesla/automotive themed gradients
  tesla: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', // Dark automotive
  chrome: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)', // Chrome/metallic
  glass: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', // Glass blue
}

/**
 * Generate a data URL for a gradient background
 * @param color1 - Start color (hex without #)
 * @param color2 - End color (hex without #)
 * @param width - Image width (default: 400)
 * @param height - Image height (default: 400)
 * @returns Data URL string
 */
export function generateGradientDataUrl(
  color1: string = 'f59e0b', 
  color2: string = 'd97706',
  width: number = 400, 
  height: number = 400
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `.trim()
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Generate a CSS background style for gradients
 * @param gradientKey - Key from gradients object
 * @returns CSS background string
 */
export function getGradientBackground(gradientKey: keyof typeof gradients): string {
  return `background: ${gradients[gradientKey]};`
}

/**
 * Product-specific gradient data URLs for consistency
 */
export const productImages = {
  'cybershade-irx-35': generateGradientDataUrl('f59e0b', 'd97706'), // Orange
  'cybershade-irx-20': generateGradientDataUrl('3b82f6', '1d4ed8'), // Blue  
  'cybershade-irx-tesla-model-y': generateGradientDataUrl('1f2937', '111827'), // Dark
  'pro-squeegee': generateGradientDataUrl('e5e7eb', '9ca3af'), // Chrome
  'installation-gel': generateGradientDataUrl('60a5fa', '3b82f6'), // Glass blue
  'heat-gun': generateGradientDataUrl('8b5cf6', '7c3aed'), // Purple
  'cutting-knife': generateGradientDataUrl('6366f1', '4f46e5'), // Indigo
  'microfiber-cloth': generateGradientDataUrl('10b981', '047857'), // Emerald
  'spray-bottle': generateGradientDataUrl('f43f5e', 'e11d48'), // Rose
  'application-cards': generateGradientDataUrl('6b7280', '4b5563'), // Gray
  'edge-sealing-pen': generateGradientDataUrl('10b981', '059669'), // Green
} as const

/**
 * Generate consistent gradient image URL for product ID
 * @param productId - Product identifier
 * @returns Data URL string
 */
export function getProductImage(productId: string): string {
  return productImages[productId as keyof typeof productImages] || generateGradientDataUrl()
}