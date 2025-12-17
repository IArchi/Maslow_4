# Alternating Image Layout for GitHub Pages

This directory contains custom styling and scripts that enhance the visual presentation of documentation pages on GitHub Pages.

## Overview

The alternating image layout system automatically arranges images and their adjacent text content in a visually appealing side-by-side format, similar to the layout used on [maslowcnc.com/user-guide](https://www.maslowcnc.com/user-guide).

## How It Works

### Automatic Layout

When a documentation page loads, JavaScript automatically:

1. **Detects images** in the content
2. **Groups images with their following text** (paragraphs, lists, etc.)
3. **Wraps them in styled sections** with alternating positions:
   - First image: **Left** side with text on the right
   - Second image: **Right** side with text on the left
   - Third image: **Left** side with text on the right
   - And so on...

### Files Involved

#### `/docs/assets/css/style.scss`
Custom SCSS file that extends the Cayman theme with alternating layout styles:
- Floats images left or right based on their position
- Sets appropriate margins and spacing
- Ensures proper text wrapping around images
- Includes responsive design for mobile devices

#### `/docs/assets/js/alternating-layout.js`
JavaScript that performs the automatic layout transformation:
- Runs when the page loads
- Identifies images and their related text content
- Creates wrapper divs with appropriate classes (`image-left` or `image-right`)
- Preserves all original content while reorganizing for better visual flow

#### `/docs/_layouts/default.html`
Custom Jekyll layout that:
- Extends the default Cayman theme layout
- Includes the alternating-layout.js script
- Applies to all documentation pages automatically

## Features

### Responsive Design
On smaller screens (mobile devices), the layout automatically switches to a single-column format where images stack vertically above their text content.

### Automatic Grouping
The script intelligently groups content:
- Each image is paired with paragraphs that immediately follow it
- The grouping stops at the next heading or image
- This ensures logical content sections

### No Manual Editing Required
Existing markdown files work automatically without any changes. Simply write your documentation with images as you normally would:

```markdown
## Section Title

Some introductory text.

![Image description](path/to/image.png)

Text that describes or follows the image.

More related paragraphs.

## Next Section

Another image will alternate to the opposite side.

![Another image](path/to/another-image.png)

More descriptive text.
```

## Benefits

1. **Better Visual Flow**: Images alternate sides, creating a more engaging reading experience
2. **Efficient Use of Space**: Text and images share horizontal space instead of stacking vertically
3. **Consistent Styling**: All pages automatically receive the same professional layout
4. **Mobile-Friendly**: Automatically adapts to smaller screens
5. **Easy Maintenance**: No manual HTML or CSS required in markdown files

## Customization

### Adjusting Image Width

Edit `/docs/assets/css/style.scss` to change image width:

```scss
.image-section.image-left img {
  max-width: 48%;  /* Change this value */
}
```

### Changing Spacing

Modify margins in the CSS:

```scss
.image-section.image-left img {
  margin-right: 2rem;  /* Space between image and text */
}
```

### Disabling for Specific Pages

To disable the alternating layout for a specific page, add this to the page's front matter:

```yaml
---
layout: simple  # Use a different layout
---
```

Then create a `/docs/_layouts/simple.html` layout without the alternating-layout.js script.

## Browser Compatibility

The alternating layout works in all modern browsers:
- Chrome/Edge (2015+)
- Firefox (2015+)
- Safari (2015+)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing

To test the layout locally:

1. Install Jekyll: `gem install jekyll bundler`
2. Navigate to the docs directory: `cd docs`
3. Run Jekyll locally: `bundle exec jekyll serve`
4. Open browser to: `http://localhost:4000/Maslow_4/`

## Troubleshooting

### Images Not Alternating

- Check browser console for JavaScript errors
- Ensure `/docs/assets/js/alternating-layout.js` is loaded
- Verify that images are direct children of `.main-content` or wrapped in `<p>` tags

### Layout Issues on Mobile

- Check responsive CSS breakpoint in `style.scss` (currently 768px)
- Test on actual mobile devices, not just browser emulation

### Images Too Large/Small

- Adjust `max-width` in the CSS file
- Check if images have inline `width` attributes that override CSS

## Support

For issues or questions about the alternating layout system:
- Open an issue: https://github.com/MaslowCNC/Maslow_4/issues
- Visit forums: https://forums.maslowcnc.com/
