# Product Images Upload Guide - R2

## Current Status ✅
- **Store is functional** with placeholder images
- **All products display properly** in the grid
- **Ready for real product images** when available

## R2 Bucket Configuration
- **Bucket URL:** `https://pub-7268d532bc454f39b3de3c39e3d5105b.r2.dev/`
- **Upload Path:** `products/`
- **Final URLs:** `https://pub-7268d532bc454f39b3de3c39e3d5105b.r2.dev/products/{filename}`

## Required Product Images (10 files)

### Window Films
1. **cybershade-irx-35.jpg** - Premium ceramic film, 35% VLT, clear appearance
2. **cybershade-irx-20.jpg** - Darker ceramic film, 20% VLT, darker tint

### Vehicle Kits
3. **tesla-model-y-kit.jpg** - Complete tinting kit for Tesla Model Y
4. **tesla-model-3-kit.jpg** - Complete tinting kit for Tesla Model 3

### DIY Kits
5. **diy-starter-kit.jpg** - Beginner kit with basic tools and film
6. **diy-professional-kit.jpg** - Advanced kit with premium materials

### Professional Tools
7. **squeegee-set.jpg** - Set of professional application squeegees
8. **heat-gun-pro.jpg** - Variable temperature heat gun

### Accessories
9. **slip-solution.jpg** - Installation solution spray bottle
10. **cutting-blades.jpg** - Precision replacement blade pack

## Image Specifications
- **Format:** JPG (best compatibility)
- **Dimensions:** 800x800px (square)
- **Quality:** 85% compression
- **File size:** < 100KB each
- **Background:** Clean, professional product shots

## Upload Commands
```bash
# Make sure you're in the directory with your product images

# Upload all at once (replace with your actual R2 credentials)
aws s3 cp . s3://your-bucket-name/products/ \
    --recursive \
    --exclude "*" \
    --include "*.jpg" \
    --endpoint-url https://your-account-id.r2.cloudflarestorage.com

# Or upload individually:
aws s3 cp cybershade-irx-35.jpg s3://your-bucket-name/products/ --endpoint-url https://your-account-id.r2.cloudflarestorage.com
aws s3 cp cybershade-irx-20.jpg s3://your-bucket-name/products/ --endpoint-url https://your-account-id.r2.cloudflarestorage.com
# ... (repeat for each file)
```

## After Upload: Update Products Data

Once images are uploaded, update `src/lib/products.ts` to replace placeholder URLs:

```typescript
// Replace this:
image: 'https://via.placeholder.com/400x400/2c3e50/ecf0f1?text=CyberShade+IRX+35%25',

// With this:
image: 'https://pub-7268d532bc454f39b3de3c39e3d5105b.r2.dev/products/cybershade-irx-35.jpg',
```

## Validation Checklist
- [ ] All 10 image files uploaded to R2
- [ ] URLs accessible in browser
- [ ] Products.ts updated with R2 URLs
- [ ] Store tested on mobile and desktop
- [ ] Images load properly in product grid
- [ ] Cart page displays product images correctly

## Future Enhancements
- **Cloudflare Images** integration for responsive variants
- **WebP/AVIF** format optimization
- **Multiple image sizes** (thumbnail, detail, zoom)
- **Image transforms** via URL parameters