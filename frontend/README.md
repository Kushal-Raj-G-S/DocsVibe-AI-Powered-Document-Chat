# PDFGenius - AI-Powered PDF Reader SaaS

A visually stunning, animation-rich PDF reader SaaS landing page and authentication system built with Next.js 15, featuring cutting-edge UI/UX.

## 🚀 Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4** + Tailwind Animate
- **Framer Motion** for advanced animations
- **Shadcn/ui** for base components
- **React Hook Form + Zod** for validation
- **NextAuth.js v5** (UI ready)
- **Lucide React** for icons

## ✨ Features

### Landing Page (/)
- **Hero Section**
  - Full viewport animated gradient mesh background
  - Floating 3D-effect cards with parallax
  - Animated headline with gradient text
  - Glowing CTA buttons with hover morph effects
  - Mouse-follow gradient spotlight effect
  - Scroll indicator with pulse animation

- **Features Section**
  - Bento grid layout with hover tilt effects
  - Glassmorphism cards with backdrop blur
  - Icon animations on scroll into view
  - Staggered entrance animations

- **Background Effects**
  - Animated gradient mesh (shifting colors)
  - Floating particles with different speeds
  - Grid pattern with fade-in lines
  - Noise texture overlay for depth

### Authentication Pages

#### Login (/login)
- Split-screen design with showcase panel
- Frosted glass auth card with animated gradient border
- Floating labels that animate on focus
- Border glow animation on input focus
- Show/hide password with smooth icon morph
- Loading state with spinner animation
- Error messages with slide down bounce

#### Signup (/signup)
- All login features plus:
- Password strength meter with color transitions
- Real-time password requirements validation
- Animated checkmarks for met requirements
- Checkbox with bounce + fill animation
- Terms acceptance with smooth interaction

### Dashboard (/dashboard)
- Stats cards with hover animations
- Recent documents list with smooth transitions
- Quick actions with glowing buttons
- Responsive navigation with glassmorphism

## 🎨 Visual Effects

- Mouse-follow spotlight
- Floating particles
- Animated gradient mesh
- Grid pattern overlay
- Noise texture
- Glassmorphism (frosted glass)
- Gradient text effects
- Cursor trail
- Smooth page transitions
- Loading states with shimmer

## 📦 Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Pages

- `/` - Landing page with hero and features
- `/login` - Login page with animations
- `/signup` - Signup page with password strength meter
- `/dashboard` - Dashboard placeholder (post-auth)

## 🎨 Color Scheme

- **Base:** Deep dark (#0a0a0f to #1a1a2e)
- **Primary:** Vibrant purple/blue gradient (#6366f1 to #8b5cf6)
- **Accent:** Pink/orange gradient (#ec4899 to #f97316)

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login page
│   ├── signup/page.tsx       # Signup page
│   ├── dashboard/page.tsx    # Dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   ├── animated-gradient-mesh.tsx
│   ├── floating-particles.tsx
│   ├── grid-pattern.tsx
│   ├── mouse-follow-spotlight.tsx
│   └── cursor-trail.tsx
├── lib/
│   └── utils.ts              # Utility functions
└── package.json
```

## 🎭 Animation Highlights

- **Spring physics** for natural movement
- **Staggered animations** for cascade effects
- **Parallax scrolling** for depth
- **Magnetic buttons** that pull towards cursor
- **Text reveal** on scroll with gradient mask
- **Liquid/blob morphing** shapes
- **Shimmer effects** on buttons and cards
- **Skeleton screens** for loading states

## 🔧 Customization

### Colors
Edit `app/globals.css` to customize the color scheme:
- CSS variables for light/dark themes
- Gradient definitions
- Animation keyframes

### Animations
Adjust animation timing in components:
- Framer Motion variants
- Tailwind animation classes
- Custom keyframes

## 📱 Responsive Design

- **Mobile:** Stacked layout, simplified animations
- **Tablet:** Adjusted split ratios
- **Desktop:** Full split-screen with all effects

## 🚀 Performance

- Lazy loading for heavy animations
- GPU-accelerated CSS transforms
- `useReducedMotion` hook for accessibility
- Optimized component rendering

## 🎉 Inspiration

Designed with inspiration from:
- Linear.app (smooth animations)
- Vercel.com (gradient effects)
- Stripe.com (micro-interactions)
- Framer.com (motion design)
- Resend.com (modern aesthetic)

## 📝 Notes

- This is a **UI/UX focused** implementation
- Backend integration is not included (placeholder functions)
- Forms validate but don't submit to a real API
- Perfect for showcasing design and animation skills

## 🛠️ Development

Built with love using the latest web technologies to create a premium SaaS experience. Every interaction is polished and intentional, making it feel like a $99/month product.

---

**Made with ❤️ and lots of animations**
