# GitHub Pages Setup Guide

This repository is configured to automatically deploy documentation from the `docs/` folder to GitHub Pages.

## Initial Setup

To enable GitHub Pages for this repository, follow these steps:

### 1. Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/MaslowCNC/Maslow_4
2. Click on **Settings** (at the top of the repository)
3. In the left sidebar, click on **Pages** (under "Code and automation")
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
5. Save the settings

### 2. Verify Deployment

Once enabled, the site will automatically deploy when:
- Changes are pushed to the `Maslow-Main` branch in the `docs/` folder
- The workflow is manually triggered from the Actions tab

The documentation site will be available at:
**https://maslowcnc.github.io/Maslow_4/**

### 3. Monitor Deployment

- Go to the **Actions** tab in your repository
- Look for the "Deploy Documentation to GitHub Pages" workflow
- Click on a workflow run to see the deployment progress and logs

## What Gets Deployed

The GitHub Pages site includes:

- **Main Documentation Index**: Landing page with organized links to all documentation
- **Assembly Guides**: Step-by-step assembly instructions with images
- **User Guide**: Complete guide to using the Maslow 4
- **Reference Materials**: Libraries for bits, frames, materials, routers, and software
- **Interactive Calibration Simulator**: Full HTML/JS simulation tool
- **Contributing Guide**: Instructions for editing the documentation

## File Structure

```
docs/
├── _config.yml                    # Jekyll configuration
├── index.md                       # Main landing page
├── BitLibrary.md                  # Reference materials
├── FrameLibrary.md
├── MaterialsLibrary.md
├── RouterAndSpindleLibrary.md
├── SoftwareLibrary.md
├── MaslowCNC_Wisdom_Manual.md
├── HowToEditThisWiki.md
├── assembling-the-arms-4-1/       # Assembly guides
├── assembling-the-router-4-1/
├── assembling-the-sled-4-1/
├── assembly-background-4-1/
├── putting-it-all-together-4-1/
├── user-guide/
└── calibration-simulation/        # Interactive simulator
    ├── index.html                 # Main simulator interface
    ├── README.md                  # Simulator documentation
    ├── QUICKSTART.md              # Quick start guide
    └── *.js                       # Simulator JavaScript files
```

## Customization

### Theme

The site uses the Cayman theme. To change it, edit `docs/_config.yml`:

```yaml
theme: jekyll-theme-cayman
remote_theme: pages-themes/cayman@v0.2.0
```

Available themes: https://pages.github.com/themes/

### Site Configuration

Edit `docs/_config.yml` to customize:
- Site title and description
- Base URL
- Theme
- Plugins
- Markdown settings

### Adding New Pages

1. Create a new `.md` file in the appropriate location within `docs/`
2. Add a link to it in `docs/index.md` or the relevant section
3. Commit and push - the site will automatically rebuild

## Troubleshooting

### Site Not Deploying

1. Check that GitHub Pages is enabled in repository settings
2. Verify the workflow ran successfully in the Actions tab
3. Ensure the source is set to "GitHub Actions" (not "Deploy from a branch")

### Pages Not Showing Up

1. Check that markdown files have proper front matter (optional with our config)
2. Verify links use relative paths
3. Check browser console for 404 errors

### Simulator Not Working

1. Ensure all `.js` files are in the `calibration-simulation/` folder
2. Verify `index.html` is present and loads correctly
3. Check browser console for JavaScript errors

## Manual Deployment

To manually trigger a deployment:

1. Go to the **Actions** tab
2. Click on "Deploy Documentation to GitHub Pages"
3. Click "Run workflow"
4. Select the `Maslow-Main` branch
5. Click "Run workflow"

## Support

For issues with the documentation site:
- Open an issue: https://github.com/MaslowCNC/Maslow_4/issues
- Visit the forums: https://forums.maslowcnc.com/
