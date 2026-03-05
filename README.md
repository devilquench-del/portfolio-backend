# 👑 Professional Portfolio Website

A modern, responsive portfolio website with an integrated admin panel for managing content dynamically.

## 📁 Project Structure

```
PORTFOLIO/
├── index.html                 # Main homepage
├── skills.html               # Skills page (synced with admin)
├── projects.html             # Projects page (synced with admin)
├── contact.html              # Contact page
├── about.html                # About page
├── admin.html                # Admin panel (requires login)
├── style.css                 # Main stylesheet
├── script.js                 # Main scripts
├── admin-style.css           # Admin panel stylesheet
├── admin-script.js           # Admin panel scripts
├── assets/                   # Images and media
│   └── me.jpg               # Profile image
└── README.md                # Documentation
```

## 🎨 Features

### 📱 Main Website
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Modern Animations** - Smooth fade-in, slide-in, and zoom effects
- **Dynamic Content** - All content syncs with admin panel
- **Smooth Scrolling** - Elegant navigation between sections
- **Professional Theme** - Golden accents on dark background

### 📊 Admin Panel
- **Secure Login** - Authentication with credentials
- **Dashboard** - Overview of all content and activity
- **Skill Management** - Add/edit/delete skills
- **Project Management** - Manage projects with descriptions and technologies
- **Contact Settings** - Update contact information
- **Activity Log** - Track all changes made
- **Data Persistence** - Uses localStorage for data storage

### 📄 Pages

1. **index.html** - Homepage with hero section, skills preview, projects preview
2. **skills.html** - Full skills page with animated cards
3. **projects.html** - Detailed projects page with hover effects
4. **contact.html** - Contact information and message form
5. **about.html** - About page with bio and stats
6. **admin.html** - Admin control panel for managing all content

## 🔐 Admin Credentials

- **Username:** `admin`
- **Password:** `1234`

## 🚀 How to Use

### For Users
1. Open `index.html` in a web browser
2. Navigate through different pages using the navbar
3. Click on skills and projects to view details
4. Use the contact page to send messages

### For Admin
1. Click the "Admin" button in the navbar
2. Log in with `admin` / `1234`
3. Use the dashboard to:
   - Add new skills
   - Create projects
   - Update contact information
   - View activity log
   - Manage settings

## 💾 Data Storage

- All data is stored in **browser's localStorage**
- Data persists across browser sessions
- Messages sent through contact form are saved
- Admin can reset all data from settings

## 📱 Responsive Design

The portfolio is fully responsive with breakpoints for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🎨 Color Scheme

- **Primary Dark:** `#0a0a0a` (Background)
- **Card Dark:** `#111` / `#0f0f0f` (Content)
- **Gold Accent:** `#d4af37` (Primary color)
- **Light Gold:** `#f5d572` (Hover state)
- **Text:** `#ffffff` (Primary), `#ccc` (Secondary)

## ⚡ Animations

- **slideInDown** - Header text slides from top
- **slideInUp** - Buttons and content slide from bottom
- **fadeIn/fadeInUp** - Smooth fade effects
- **zoomIn** - Image zoom on load
- **float** - Floating decorative circles
- **Hover Effects** - Interactive button and card animations

## 🔧 Customization

### Adding Skills
1. Go to Admin Panel
2. Navigate to Skills section
3. Enter skill name and click "Add Skill"

### Creating Projects
1. Go to Admin Panel
2. Navigate to Projects section
3. Fill in title, description, and technologies
4. Click "Add Project"

### Updating Contact Info
1. Go to Admin Panel
2. Navigate to Contact Info section
3. Update email and phone
4. Changes appear immediately on contact page

## 📧 Contact Features

- **Email Display** - Automatically linked with mailto
- **Phone Display** - Clickable tel links
- **Contact Form** - Visitors can send messages
- **Message Storage** - All messages saved to localStorage

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - DOM manipulation and storage
- **LocalStorage API** - Data persistence
- **Google Fonts** - Montserrat font family
- **Responsive Design** - Mobile-first approach

## 📊 Activity Tracking

The admin panel tracks:
- Admin login/logout
- Skills added/deleted
- Projects added/deleted
- Contact information updates
- Theme changes
- Settings modifications

## 🔒 Security Notes

- This is a frontend-only solution
- Admin credentials are hardcoded (for demo purposes)
- For production, implement backend authentication
- Use secure APIs for storing sensitive data
- Never commit real credentials to version control

## 🚀 Deployment

To deploy this portfolio:

1. **Static Hosting (Recommended)**
   - Netlify
   - Vercel
   - GitHub Pages
   - Firebase Hosting

2. **Upload all files** to your hosting platform
3. Set `index.html` as the default entry point
4. Ensure all asset paths are correct

## 📝 Notes

- Profile image should be placed in `assets/me.jpg`
- Admin panel uses localStorage (no backend needed)
- All changes are client-side only
- Clear browser storage to reset everything
- Mobile menu collapses on small screens

## 🎯 Future Enhancements

- Backend authentication system
- Database integration
- Email notifications
- Blog section
- Portfolio filters
- Dark/Light theme toggle
- Multi-language support
- SEO optimization

---

**Created with ❤️ | © 2025 Manoj's Portfolio**
