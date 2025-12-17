# Besorah Yeshua Bible Planner

A free, open-source Bible reading planner with Ethiopian calendar support and customizable reading plans.

## Features

- 📅 **Dual Calendar Support**: Switch between Gregorian and Ethiopian calendars
- 📖 **Reading Plans**: 90-day New Testament plan and custom schedules
- ✅ **Progress Tracking**: Mark readings complete and track your journey
- 💾 **Local Storage**: Your data stays private in your browser
- 📱 **Mobile Responsive**: Works on all devices
- 🎨 **Clean Design**: Distraction-free reading experience

## Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/besorah-yeshua-bible-planner.git
cd besorah-yeshua-bible-planner
```

2. Serve locally (any method works):
```bash
# Using Python
python -m http.server 8080 -d public

# Using Node.js
npx live-server public --port=8080

# Or just open public/index.html in your browser
```

3. Open `http://localhost:8080` in your browser

## Deployment to Netlify (Free Tier)

### Method 1: GitHub Integration (Recommended)

1. **Create GitHub Repository**:
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it `besorah-yeshua-bible-planner`
   - Keep it public (required for free tier)

2. **Push Your Code**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/besorah-yeshua-bible-planner.git
git push -u origin main
```

3. **Deploy on Netlify**:
   - Go to [Netlify](https://www.netlify.com)
   - Sign up with GitHub (free)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Netlify will auto-detect settings from `netlify.toml`
   - Click "Deploy site"
   - Your site will be live at `https://random-name.netlify.app`

4. **Custom Domain (Optional)**:
   - In Netlify dashboard, go to Site settings → Domain management
   - Click "Add custom domain"
   - Follow instructions to update DNS

### Method 2: Drag and Drop

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag your `public` folder to the upload area
3. Your site is instantly live!

### Method 3: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd besorah-yeshua-bible-planner
netlify deploy --prod --dir=public
```

## Project Structure

```
besorah-yeshua-bible-planner/
├── public/                 # All static files (deployed)
│   ├── index.html         # Landing page
│   ├── planner.html       # Bible planner app
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── data/              # Reading plans (JSON)
│   └── assets/            # Images, fonts
├── netlify.toml           # Netlify configuration
├── package.json           # Project metadata
└── README.md              # This file
```

## Configuration

### Reading Plans

Edit or add new reading plans in `public/data/reading-plans/`:
- `nt90.json` - 90-day New Testament plan
- `ethiopian-calendar.json` - Ethiopian calendar readings

### Styling

Main styles in `public/css/main.css` - uses CSS variables for easy customization:
```css
:root {
    --primary-color: #2563eb;
    --primary-hover: #1d4ed8;
    /* ... more variables */
}
```

## Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- Mobile browsers: ✅ iOS Safari, Chrome Android

## Storage

All data is stored locally using `localStorage`:
- Reading progress
- Study notes
- User preferences
- Streak tracking

**No backend or database required!**

## Free Tier Limits

- **Netlify Free Tier**:
  - 100GB bandwidth/month
  - 300 build minutes/month
  - Automatic HTTPS
  - Deploy previews
  - Forms (100 submissions/month)

- **GitHub Free Tier**:
  - Unlimited public repositories
  - 500MB storage per repository
  - GitHub Pages (if needed)

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects.

## Support

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/besorah-yeshua-bible-planner/issues)
- 📖 Docs: [Wiki](https://github.com/yourusername/besorah-yeshua-bible-planner/wiki)

## Roadmap

- [ ] Complete 90-day NT reading plan
- [ ] Full Ethiopian calendar integration
- [ ] Multiple reading plans (1-year, chronological, etc.)
- [ ] Export progress as PDF
- [ ] Share progress on social media
- [ ] Dark mode
- [ ] Offline PWA support
- [ ] Multi-language support

## Credits

Built with ❤️ for the global body of Christ.

---

**Note**: Replace `yourusername` with your actual GitHub username throughout this project.