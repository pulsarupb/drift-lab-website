# Drift Lab Website

Official website for Drift Lab - Autonomous Vehicles Research Laboratory at CAMPUS Research Institute, Politehnica University of Bucharest.

**Live Site:** [https://driftlab.ro](https://driftlab.ro)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Adding/Modifying Members](#addingmodifying-members)
- [How the Code Works](#how-the-code-works)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [SEO & Performance](#seo--performance)
- [Key Features Explained](#key-features-explained)
- [Configuration Files](#configuration-files)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Features

- **Interactive Galaxy Animation**: Procedurally generated spiral galaxy using Three.js with realistic physics-based motion
- **Responsive Design**: Fully responsive layout optimized for mobile, tablet, and desktop devices
- **SEO Optimized**: Comprehensive meta tags, Open Graph, Twitter Cards, and structured data (JSON-LD)
- **Performance Optimized**: Image optimization, lazy loading, font optimization, and resource hints
- **Member Management**: Easy-to-update JSON-based member directory with photo support
- **Team Showcase**: Display of multiple research teams with custom styling
- **Modern UI**: Glassmorphism effects, smooth animations, and gradient accents

## Tech Stack

- **Framework**: [Astro](https://astro.build) 5.16.4 - Static site generator with component islands
- **3D Graphics**: [Three.js](https://threejs.org/) 0.182.0 - WebGL-based galaxy animation
- **Language**: TypeScript - Type-safe development
- **Styling**: CSS with CSS Variables - Component-scoped styles
- **Deployment**: GitHub Pages via GitHub Actions
- **CI/CD**: GitHub Actions with version tag triggers

## Project Structure

```
drift-lab-website/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── public/
│   ├── CNAME                   # Custom domain configuration
│   ├── robots.txt              # SEO robots file
│   ├── images/                 # Static images (logos, member photos)
│   └── *.png, *.svg            # Public assets
├── src/
│   ├── components/
│   │   ├── Footer.astro        # Site footer component
│   │   ├── GalaxySystem.ts     # Three.js galaxy animation system
│   │   ├── Header.astro        # Navigation header
│   │   ├── Hero.astro          # Landing section with galaxy
│   │   ├── MembersSection.astro # Member directory display
│   │   └── TeamsSection.astro  # Teams showcase
│   ├── data/
│   │   └── members.json        # Member data (JSON)
│   ├── layouts/
│   │   └── Layout.astro        # Base layout with SEO
│   ├── pages/
│   │   ├── index.astro         # Homepage
│   │   └── contact.astro       # Contact page
│   └── styles/
│       └── global.css          # Global styles and CSS variables
├── astro.config.mjs            # Astro configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

### Directory Explanations

- **`src/components/`**: Reusable Astro components for different sections
- **`src/data/`**: JSON data files (members, teams, etc.)
- **`src/layouts/`**: Base page layouts with shared HTML structure
- **`src/pages/`**: Route pages (each `.astro` file becomes a route)
- **`src/styles/`**: Global CSS and design tokens
- **`public/`**: Static assets served as-is (images, fonts, etc.)

## Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Comes with Node.js (or use yarn/pnpm)
- **Git**: For version control

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/drift-lab-website.git
   cd drift-lab-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify installation**:
   ```bash
   npm run dev
   ```
   The development server should start at `http://localhost:4321`

## Development

### Development Server

Start the local development server with hot reload:

```bash
npm run dev
```

The site will be available at `http://localhost:4321`. Changes to files will automatically reload in the browser.

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the site for production (outputs to `dist/`)
- `npm run preview` - Preview the production build locally
- `npm run astro` - Run Astro CLI commands

### Development Workflow

1. Make changes to source files in `src/`
2. The dev server automatically rebuilds and refreshes
3. Test changes in the browser
4. Commit changes to git
5. Push to repository
6. Create version tag to trigger deployment

## Adding/Modifying Members

Members are managed through a simple JSON file located at `src/data/members.json`.

### Member Data Structure

Each member entry follows this structure:

```json
{
  "name": "Full Name",
  "shortDesc": "Brief description or bio",
  "team": "Team Name",
  "role": "Role or responsibilities",
  "photoLink": "filename.jpg",
  "isSupervisor": false
}
```

### Field Descriptions

- **`name`** (required): Full name of the member
- **`shortDesc`** (required): Brief biography or description. Supports multi-line text with `\n`
- **`team`** (required): Team name(s). Can be comma-separated for multiple teams (e.g., "PULSAR, TechTrax")
  - Valid team names: `PULSAR`, `Pulsar`, `TechTrax`, `Bosch Future Mobility`, `NXP Cup`
- **`role`** (required): Role or responsibilities (e.g., "Software", "Hardware Electronics, Embedded Software")
- **`photoLink`** (optional): Filename of the member's photo
  - If empty string `""`, the system generates a filename from the member's name
  - If provided, should be just the filename (e.g., `"petrea-costel-valentin.jpg"`)
  - Photos should be placed in `public/images/members/`
- **`isSupervisor`** (required): Boolean indicating if member is a supervisor
  - `true`: Member appears in "Laboratory Supervisors" section
  - `false`: Member appears in "Team Members" section

### Adding a New Member

1. **Add photo** (optional):
   - Place the photo in `public/images/members/`
   - Recommended filename format: `firstname-lastname.jpg` (lowercase, hyphens)
   - Supported formats: JPG, PNG, WebP
   - Recommended size: 300x300px or square aspect ratio

2. **Edit `src/data/members.json`**:
   ```json
   {
     "name": "John Doe",
     "shortDesc": "Computer Science student passionate about autonomous systems.",
     "team": "TechTrax",
     "role": "Software",
     "photoLink": "john-doe.jpg",
     "isSupervisor": false
   }
   ```

3. **Save the file** - The dev server will automatically reload

### Modifying an Existing Member

Simply edit the corresponding entry in `src/data/members.json`. Changes will appear immediately in development.

### Photo Handling Logic

The system handles photos with the following logic:

1. **If `photoLink` is empty** (`""`):
   - Generates filename from member name: `john-doe.jpg`
   - Looks for: `public/images/members/john-doe.jpg`

2. **If `photoLink` is a filename** (e.g., `"photo.jpg"`):
   - Uses the filename directly
   - Looks for: `public/images/members/photo.jpg`

3. **If `photoLink` is a URL** (starts with `http`):
   - Generates filename from member name (same as empty case)
   - Note: URLs are not directly supported; download and save locally

### Example Member Entry

```json
{
  "name": "Petrea Costel Valentin",
  "shortDesc": "3rd Year Mechatronics & Robotics Student. Embedded Systems, CAD, Big fan of troubleshooting and fixing broken tech.",
  "team": "Pulsar",
  "role": "Hardware Mechanical",
  "photoLink": "petrea-costel-valentin.jpg",
  "isSupervisor": false
}
```

## How the Code Works

### Architecture Overview

This site uses **Astro**, a modern static site generator that combines the best of static and dynamic rendering. Astro components are written in `.astro` files, which combine HTML, CSS, and JavaScript/TypeScript in a single file.

### Component-Based Architecture

The site follows a component-based architecture:

```
Layout.astro (Base Layout)
├── Header.astro (Navigation)
├── Hero.astro (Landing Section)
│   └── GalaxySystem.ts (Three.js Animation)
├── TeamsSection.astro (Teams Display)
├── MembersSection.astro (Members Display)
└── Footer.astro (Footer)
```

### Data Flow

```
members.json → MembersSection.astro → index.astro → Layout.astro → HTML Output
```

1. **Data Layer**: `src/data/members.json` stores member information
2. **Component Layer**: `MembersSection.astro` reads and processes the JSON
3. **Page Layer**: `index.astro` imports and renders components
4. **Layout Layer**: `Layout.astro` wraps pages with common HTML structure
5. **Output**: Astro generates static HTML files

### Key Components Explained

#### Layout.astro
- Base HTML structure with `<head>` and `<body>`
- SEO meta tags (Open Graph, Twitter Cards, canonical URLs)
- Structured data (JSON-LD schemas)
- Resource hints (preconnect, dns-prefetch)
- Global CSS import

#### Header.astro
- Fixed navigation bar
- Smooth scroll navigation for anchor links
- Mobile-responsive hamburger menu
- Logo and navigation links

#### Hero.astro
- Landing section with hero text
- Integrates `GalaxySystem.ts` for background animation
- Call-to-action buttons
- Partner logos display

#### GalaxySystem.ts
- Three.js-based procedural galaxy generator
- Creates realistic spiral galaxy with physics-based motion
- Performance optimizations:
  - Device-specific particle counts (mobile: 30%, tablet: 60%, desktop: 100%)
  - Visibility API pauses animation when tab is hidden
  - Responsive camera positioning
  - Optimized rendering settings

#### TeamsSection.astro
- Displays research teams in a grid layout
- Team data defined inline in the component
- Custom color accents per team
- Responsive card design

#### MembersSection.astro
- Reads `members.json` and filters by `isSupervisor`
- Renders supervisors and regular members separately
- Interactive member cards with modal popup
- Image path resolution logic
- Responsive grid layout

### Styling Architecture

- **CSS Variables**: Defined in `src/styles/global.css` for consistent theming
- **Component Styles**: Scoped styles in each `.astro` component
- **Responsive Design**: Uses `clamp()` for fluid typography and spacing
- **Design System**: Color tokens, spacing scale, border radius values

### Three.js Integration

The galaxy animation is integrated as follows:

1. **Component**: `Hero.astro` includes a `<canvas>` element
2. **Script**: Client-side script imports `GalaxySystem.ts`
3. **Initialization**: Creates `GalaxySystem` instance on page load
4. **Cleanup**: Properly destroys instance on page unload

The animation runs entirely client-side and doesn't require server-side rendering.

## Building for Production

### Build Command

```bash
npm run build
```

This command:
1. Compiles all Astro components to static HTML
2. Processes and optimizes images
3. Bundles JavaScript and CSS
4. Generates sitemap.xml
5. Outputs everything to `dist/` directory

### Build Output

The `dist/` directory contains:
- Static HTML files
- Optimized CSS and JavaScript bundles
- Processed images
- `sitemap-index.xml` and `sitemap-0.xml`
- `CNAME` file (for custom domain)

### Build Optimizations

- **CSS**: Inline critical stylesheets automatically
- **JavaScript**: Minified and bundled
- **Images**: Optimized and compressed
- **HTML**: Minified output
- **Assets**: Hashed filenames for cache busting

### Preview Production Build

Before deploying, preview the production build locally:

```bash
npm run build
npm run preview
```

This serves the `dist/` directory locally so you can verify everything works correctly.

## Deployment

### Deployment Method

The site is deployed to **GitHub Pages** using **GitHub Actions**. Deployment is triggered automatically when a version tag is pushed to the repository.

### Deployment Workflow

1. **Create version tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub Actions triggers**:
   - Workflow runs on tag push matching `v*.*.*` pattern
   - Builds the site using Node.js 20
   - Deploys to GitHub Pages

3. **Site goes live**:
   - Available at `https://driftlab.ro` (after DNS propagation)
   - Usually takes 2-5 minutes after workflow completes

### Version Tagging Strategy

Use semantic versioning:
- **Major** (`v1.0.0`): Breaking changes or major updates
- **Minor** (`v1.1.0`): New features, backward compatible
- **Patch** (`v1.0.1`): Bug fixes, small improvements

Example workflow:
```bash
# Make changes and commit
git add .
git commit -m "Add new team member"
git push origin main

# Create and push version tag
git tag v1.0.1
git push origin v1.0.1
```

### GitHub Pages Configuration

1. Go to repository **Settings** → **Pages**
2. **Source**: Select "GitHub Actions"
3. **Custom domain**: Enter `driftlab.ro`
4. **Enforce HTTPS**: Enable (recommended)

### Custom Domain Setup

The `public/CNAME` file contains `driftlab.ro` and is automatically deployed.

**DNS Configuration** (at your domain registrar):

**Option A: A Records** (for root domain):
```
@ → 185.199.108.153
@ → 185.199.109.153
@ → 185.199.110.153
@ → 185.199.111.153
```

**Option B: CNAME** (if supported):
```
@ → yourusername.github.io
```

**For www subdomain**:
```
www → yourusername.github.io (CNAME)
```

Wait for DNS propagation (5 minutes to 48 hours), then verify at `https://driftlab.ro`.

### GitHub Actions Workflow

The workflow file (`.github/workflows/deploy.yml`) handles:

- **Trigger**: Version tags (`v*.*.*`)
- **Build**: Installs dependencies, builds site
- **Deploy**: Uploads to GitHub Pages
- **Permissions**: Configured for GitHub Pages deployment

## SEO & Performance

### SEO Features

- **Meta Tags**: Title, description, keywords, author
- **Open Graph**: Facebook/LinkedIn sharing optimization
- **Twitter Cards**: Twitter sharing optimization
- **Structured Data**: JSON-LD schemas for:
  - Organization
  - WebSite
  - ResearchProject
  - ContactPage
  - LocalBusiness
- **Sitemap**: Automatically generated XML sitemap
- **Robots.txt**: Search engine crawler instructions
- **Canonical URLs**: Prevents duplicate content issues

### Performance Optimizations

- **Image Optimization**: Width/height attributes, lazy loading
- **Font Optimization**: Preconnect hints, `display=swap`
- **Resource Hints**: Preload critical resources, dns-prefetch
- **Code Splitting**: Automatic code splitting by Astro
- **Minification**: CSS and JavaScript minified in production
- **Three.js Optimization**: Device-specific rendering, visibility API

### Core Web Vitals

The site is optimized for:
- **LCP** (Largest Contentful Paint): Optimized images and fonts
- **FID** (First Input Delay): Minimal JavaScript blocking
- **CLS** (Cumulative Layout Shift): Proper image dimensions

## Key Features Explained

### Three.js Galaxy Animation

The galaxy animation (`GalaxySystem.ts`) creates a procedurally generated spiral galaxy:

**How it works**:
1. Generates particles in a logarithmic spiral pattern
2. Applies realistic density distribution (more particles near center)
3. Implements differential rotation (inner particles orbit faster)
4. Adds velocity dispersion for realism
5. Uses additive blending for starlight accumulation

**Performance Optimizations**:
- **Device Detection**: Reduces particle count on mobile (30%) and tablet (60%)
- **Visibility API**: Pauses animation when browser tab is hidden
- **Pixel Ratio**: Limits pixel ratio based on device
- **Camera Optimization**: Adjusts FOV and position per device

**Technical Details**:
- Uses Three.js Sprites for efficient rendering
- Implements realistic orbital mechanics
- Creates 4 spiral arms with configurable parameters
- Color gradient from center (bright blue) to edges (darker blue)

### Responsive Design

- **Mobile-First**: Designed for mobile, enhanced for larger screens
- **Fluid Typography**: Uses `clamp()` for responsive text sizes
- **Flexible Layouts**: CSS Grid and Flexbox for adaptive layouts
- **Touch-Friendly**: Large tap targets, smooth scrolling

### Image Optimization

- **Lazy Loading**: Images load as user scrolls
- **Proper Dimensions**: Width/height attributes prevent layout shift
- **Optimized Formats**: Supports WebP/AVIF (via Astro Image component)
- **Responsive Images**: Different sizes for different viewports

## Configuration Files

### astro.config.mjs

Main Astro configuration:
- **site**: Production URL (`https://driftlab.ro`)
- **integrations**: Sitemap generation
- **server**: Development server settings
- **build**: Build optimizations

### package.json

Dependencies and scripts:
- **dependencies**: Astro, Three.js, sitemap integration
- **devDependencies**: TypeScript types
- **scripts**: Development and build commands

### tsconfig.json

TypeScript configuration:
- Extends Astro's strict TypeScript config
- Includes all `.astro` files
- Excludes `dist/` directory

### .github/workflows/deploy.yml

GitHub Actions workflow:
- Triggers on version tags
- Builds and deploys to GitHub Pages
- Configured with proper permissions

## Troubleshooting

### Development Server Won't Start

**Issue**: Port 4321 already in use

**Solution**:
```bash
# Kill process on port 4321 (Windows)
netstat -ano | findstr :4321
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

### Build Fails

**Issue**: Build errors or missing dependencies

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (should be 20+)
node --version
```

### Images Not Showing

**Issue**: Member photos not displaying

**Solution**:
1. Verify photo exists in `public/images/members/`
2. Check filename matches `photoLink` in JSON (case-sensitive)
3. Ensure file extension is correct (.jpg, .png, etc.)
4. Check browser console for 404 errors

### Galaxy Animation Not Working

**Issue**: Three.js animation doesn't appear

**Solution**:
1. Check browser console for errors
2. Verify WebGL is supported (most modern browsers)
3. Check if JavaScript is enabled
4. Try disabling browser extensions
5. Verify Three.js is installed: `npm list three`

### Deployment Fails

**Issue**: GitHub Actions workflow fails

**Solution**:
1. Check workflow logs in GitHub Actions tab
2. Verify Node.js version in workflow matches local
3. Ensure all dependencies are in `package.json`
4. Check for syntax errors in code
5. Verify GitHub Pages is enabled in repository settings

### Custom Domain Not Working

**Issue**: Site doesn't load at driftlab.ro

**Solution**:
1. Verify DNS records are correct (use `dig driftlab.ro` or `nslookup driftlab.ro`)
2. Check CNAME file exists in `public/CNAME`
3. Wait for DNS propagation (can take up to 48 hours)
4. Verify domain is configured in GitHub Pages settings
5. Check SSL certificate status in GitHub Pages settings

## Contributing

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test locally**:
   ```bash
   npm run dev
   npm run build
   ```
5. **Commit your changes**:
   ```bash
   git commit -m "Add: description of changes"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Style Guidelines

- **TypeScript**: Use TypeScript for type safety
- **Formatting**: Follow existing code style
- **Components**: Keep components focused and reusable
- **Comments**: Add comments for complex logic
- **Naming**: Use descriptive variable and function names

### Pull Request Process

1. Ensure your code builds successfully (`npm run build`)
2. Test all functionality locally
3. Update documentation if needed
4. Create a clear PR description
5. Wait for review and feedback

## License

This project is proprietary and belongs to Drift Lab, CAMPUS Research Institute, Politehnica University of Bucharest.

## Credits

- **Framework**: Built with [Astro](https://astro.build)
- **3D Graphics**: Powered by [Three.js](https://threejs.org/)
- **Deployment**: Hosted on GitHub Pages
- **Design**: Custom design by Drift Lab team

---

For questions or issues, please open an issue on GitHub or contact the lab administrators.
