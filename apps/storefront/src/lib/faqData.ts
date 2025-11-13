export interface FAQ {
  id: string
  question: string
  answer: string
  category: 'installation' | 'products' | 'shipping' | 'warranty' | 'legal' | 'general'
  tags: string[]
}

export const faqData: FAQ[] = [
  // Installation FAQs
  {
    id: 'install-difficulty',
    question: 'How difficult is it to install window tint myself?',
    answer: 'Our DIY kits are designed for beginners! With our precision pre-cut films and foolproof installation tools, most customers complete their front windows in under an hour. We provide detailed video guides and step-by-step instructions. If you can apply a screen protector to your phone, you can install our tint.',
    category: 'installation',
    tags: ['difficulty', 'beginner', 'diy', 'time', 'tools']
  },
  {
    id: 'install-tools',
    question: 'What tools do I need for installation?',
    answer: 'Everything you need comes in the kit! Each CyberShade IRX™ kit includes: precision pre-cut tint film, application solution, squeegee tool, microfiber cloths, detailed instructions, and access to our video installation guide. No additional tools required.',
    category: 'installation',
    tags: ['tools', 'kit contents', 'what included', 'squeegee', 'solution']
  },
  {
    id: 'install-bubbles',
    question: 'What if I get bubbles during installation?',
    answer: 'Small bubbles are normal and will disappear within 24-48 hours as the tint cures. For larger bubbles, gently lift the tint and reapply with more solution. Our installation guide shows you exactly how to avoid and fix bubbles. If you have persistent issues, contact our support team.',
    category: 'installation',
    tags: ['bubbles', 'troubleshooting', 'curing', 'problems']
  },
  {
    id: 'install-mistakes',
    question: 'What if I make a mistake during installation?',
    answer: 'Don\'t worry! Our tint is repositionable for the first 10 minutes after application. If you need to start over completely, contact us within 48 hours and we\'ll send a replacement film at no charge. We want you to get perfect results.',
    category: 'installation',
    tags: ['mistakes', 'repositionable', 'replacement', 'redo', 'support']
  },

  // Product FAQs
  {
    id: 'product-vlt',
    question: 'What VLT (darkness level) should I choose?',
    answer: 'We recommend 35% VLT for most customers - it provides excellent heat rejection while maintaining good visibility and legal compliance in most states. 15% is darker with more privacy, and 5% is our darkest option. Check your local laws before ordering darker tints.',
    category: 'products',
    tags: ['vlt', 'darkness', 'legal', 'states', '35%', '15%', '5%', 'laws']
  },
  {
    id: 'product-ceramic',
    question: 'What makes ceramic tint better?',
    answer: 'Our CyberShade IRX™ ceramic tint blocks up to 99% of infrared heat while allowing maximum visibility. Unlike dyed films, ceramic won\'t fade, bubble, or interfere with electronics. It provides superior heat rejection, UV protection, and maintains its appearance for life.',
    category: 'products',
    tags: ['ceramic', 'heat rejection', 'ir', 'uv', 'electronics', 'fade', 'bubble']
  },
  {
    id: 'product-compatibility',
    question: 'Will this fit my vehicle?',
    answer: 'Our Tesla Model Y kits are precision-cut for 2020+ Model Y vehicles. We have specific patterns for front windows only (rear windows come factory tinted). If you have a different vehicle, contact us - we\'re expanding our kit offerings and may have a solution for your car.',
    category: 'products',
    tags: ['compatibility', 'tesla', 'model y', 'fit', 'vehicle', 'precision cut']
  },

  // Shipping FAQs  
  {
    id: 'shipping-time',
    question: 'How long does shipping take?',
    answer: 'Orders ship within 1-2 business days. Standard shipping takes 3-5 business days, while expedited shipping arrives in 1-2 business days. We provide tracking information via email once your order ships.',
    category: 'shipping',
    tags: ['shipping time', 'delivery', 'tracking', 'expedited', 'business days']
  },
  {
    id: 'shipping-cost',
    question: 'How much does shipping cost?',
    answer: 'Free standard shipping on all orders over $75. Orders under $75 have a $9.99 shipping fee. Expedited shipping is available for $19.99. International shipping rates vary by location.',
    category: 'shipping',
    tags: ['shipping cost', 'free shipping', 'expedited', 'international']
  },

  // Warranty FAQs
  {
    id: 'warranty-coverage',
    question: 'What does the lifetime warranty cover?',
    answer: 'Our lifetime warranty covers defects in materials and workmanship, including bubbling, peeling, fading, and cracking. The warranty applies to the original purchaser and vehicle. Normal wear, damage from accidents, or improper installation are not covered.',
    category: 'warranty',
    tags: ['lifetime warranty', 'coverage', 'bubbling', 'peeling', 'fading', 'defects']
  },
  {
    id: 'warranty-claim',
    question: 'How do I file a warranty claim?',
    answer: 'Visit our warranty claims page, upload photos of the issue, and provide your order information. We typically respond within 24 hours and will send replacement film if your claim is approved. Most warranty issues are resolved quickly and at no cost to you.',
    category: 'warranty',
    tags: ['warranty claim', 'photos', 'replacement', 'approved', '24 hours']
  },

  // Legal FAQs
  {
    id: 'legal-laws',
    question: 'Is window tint legal?',
    answer: 'Tint laws vary by state and country. In most US states, 35% VLT on front windows is legal, but some states have different requirements. We recommend checking your local laws before installation. Our website has a tint law guide for reference.',
    category: 'legal',
    tags: ['legal', 'laws', 'state', 'country', '35%', 'front windows', 'local laws']
  },
  {
    id: 'legal-police',
    question: 'What happens if police stop me for tint?',
    answer: 'If your tint meets local legal requirements, you should have no issues. We recommend keeping your receipt and warranty information in your vehicle as proof of compliant tint. If you receive a citation, the burden is on you to verify legal compliance in your jurisdiction.',
    category: 'legal',
    tags: ['police', 'citation', 'legal compliance', 'receipt', 'proof', 'jurisdiction']
  },

  // General FAQs
  {
    id: 'general-return',
    question: 'Can I return my kit if I\'m not satisfied?',
    answer: 'Yes! We offer a 30-day satisfaction guarantee. If you\'re not completely happy with your kit, return it in original condition for a full refund. Shipping costs are non-refundable unless the return is due to our error.',
    category: 'general',
    tags: ['return', '30-day', 'satisfaction guarantee', 'refund', 'original condition']
  },
  {
    id: 'general-support',
    question: 'How can I get help during installation?',
    answer: 'We provide multiple support options: detailed video guides, step-by-step written instructions, email support (response within 2 hours), and phone support during business hours. Our team has helped thousands of customers achieve perfect results.',
    category: 'general',
    tags: ['support', 'help', 'video guides', 'email', 'phone', 'instructions']
  }
]