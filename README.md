# Shaamys Lounge Salon — Premium Salon Website

A modern, SEO-optimized, accessible website for **Shaamys Lounge Salon** — Davangere's leading luxury unisex salon for hair, skin & bridal makeup.

## ✨ Features

- **7 Pages**: Home, Hair Services, Skin Treatments, Bridal Packages, Full Menu & Prices, Gallery, About, Blog, Booking
- **Design System**: Editorial luxury direction (Fraunces + IBM Plex Sans, warm cream ground, terracotta accent)
- **SEO-Ready**: JSON-LD schema (LocalBusiness, Service, OfferCatalog, FAQPage, Review, ImageGallery, Article, Blog), meta tags, sitemap.xml, robots.txt
- **Performance**: Critical CSS inlined, WebP images with JPEG fallback, lazy loading, font-display:swap
- **Accessibility**: Skip link, ARIA labels, focus-visible, WCAG AA contrast, prefers-reduced-motion
- **Interactive**: Service selector with live price preview, lightbox gallery, AJAX booking form
- **Responsive**: Mobile-first, fluid typography (clamp()), CSS Grid/Flexbox

## 🎨 Design System

| Token | Value |
|-------|-------|
| **Display Font** | Fraunces (900) |
| **Body Font** | IBM Plex Sans (400/600) |
| **Ground** | `#FDF8F3` |
| **Ink** | `#1A1A1A` |
| **Accent** | `#C85C3E` (terracotta) |
| **Gold** | `#B8860B` |

## 📁 Project Structure

```
shaamys-lounge/
├── index.html           # Home page
├── about.html           # About / story / team
├── book.html            # Interactive booking
├── menu.html            # Full price list + FAQ
├── blog.html            # Blog starter (3 posts)
├── gallery.html         # Lightbox gallery
├── 404.html             # Friendly 404
├── services/
│   ├── hair.html
│   ├── skin.html
│   └── bridal.html
├── css/
│   └── main.css         # Design tokens + all styles
├── js/
│   └── main.js          # Service selector, lightbox, forms
├── images/
│   ├── hero-roopa.jpg
│   ├── roopa-portrait.jpg
│   └── gallery-1.jpg
├── sitemap.xml
├── robots.txt
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Pages deploy
└── .gitignore
```

## 🚀 Deploy

### OpenBot (current)
Live at: `https://shaamys-lounge-salon-davangere-leading-luxury-y9kj3a7xnr.openbot.site`

### GitHub Pages (recommended for custom domain)

1. Create repo `shammy-site` on GitHub
2. Push:
   ```bash
   git remote add origin https://github.com/<your-username>/shammy-site.git
   git branch -M main
   git push -u origin main
   ```
2. Settings → Pages → Source: **GitHub Actions**
3. Site lives at `https://<username>.github.io/shammy-site/`

## 🔧 Local Development

```bash
# Serve locally (any static server)
npx serve .
# or
python3 -m http.server 8000
```

## 📝 Customization

- **Colors**: Edit CSS custom properties in `css/main.css` (`:root`)
- **Content**: Edit HTML files directly
- **Images**: Replace files in `images/` (keep same names)
- **Schema**: Each page has inline JSON-LD — update as needed

## 📄 License

MIT — free to use, modify, and deploy.

---

Built with design-taste-frontend + seo-audit skills • Deployed via OpenBot & GitHub Pages