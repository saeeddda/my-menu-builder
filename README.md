# 🎯 Menu Builder - Nested Drag & Drop Menu Creator

A powerful, RTL-supported menu builder with nested drag-drop functionality using Sortable.js. Perfect for Persian/Farsi websites.

## ✨ Features

- ✅ **Nested Menus**: Create unlimited hierarchical menu structures
- ✅ **Drag & Drop**: Intuitive drag-drop interface with Sortable.js
- ✅ **Max Depth Control**: Limit menu depth (default: 3 levels)
- ✅ **RTL Support**: Full right-to-left layout for Persian/Arabic
- ✅ **Auto-Level Detection**: Automatic `data-level` attribute updates
- ✅ **JSON Export**: Export menu structure as JSON
- ✅ **Visual Feedback**: Color-coded levels and notifications
- ✅ **Responsive Design**: Works on desktop and mobile

## 📦 Installation

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `sortablejs` - Drag & drop library
- `sass` - SCSS compiler
- `vite` - Development server (optional)

### Step 2: Compile SCSS to CSS

```bash
# One-time compilation
npm run sass:build

# Watch mode (auto-compile on changes)
npm run sass:watch
```

### Step 3: Run Development Server (Optional)

```bash
npm run dev
```

Or simply open `index.html` in your browser.

## 🚀 Usage

### Basic HTML Setup

```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Your HTML structure here -->
    
    <script type="module">
        import { initMenuBuilder } from './menu-builder.js';
        
        document.addEventListener('DOMContentLoaded', () => {
            initMenuBuilder();
        });
    </script>
</body>
</html>
```

### JavaScript API

```javascript
import menuBuilder from './menu-builder.js';

// Initialize menu builder
menuBuilder.initMenuBuilder();

// Delete menu item by ID
menuBuilder.deleteMenuItem(5);

// Export menu as JSON file
menuBuilder.exportMenu();
```

## 🎨 Customization

### Change Maximum Depth

Edit `menu-builder.js`:

```javascript
const MAX_DEPTH = 5; // Change from default 3 to 5 levels
```

### Customize Colors

Edit `styles.scss` variables:

```scss
$primary-color: #667eea;    // Primary color
$success-color: #28a745;    // Success color
$warning-color: #ffc107;    // Warning color
$danger-color: #dc3545;     // Danger color
```

### Level Colors

Each menu level has a different border color:

```scss
.menu-item[data-level="0"] { border-right: 4px solid #667eea; } // Blue
.menu-item[data-level="1"] { border-right: 4px solid #28a745; } // Green
.menu-item[data-level="2"] { border-right: 4px solid #ffc107; } // Yellow
.menu-item[data-level="3"] { border-right: 4px solid #ff5722; } // Orange
```

## 📂 File Structure

```
menu-builder/
├── index.html              # Main HTML file
├── styles.scss             # SCSS source (edit this)
├── styles.css              # Compiled CSS (generated)
├── menu-builder.js         # Main JavaScript module
├── package.json            # NPM configuration
└── README.md              # This file
```

## 🔧 How It Works

### 1. Data Structure

Menu items are stored as nested objects:

```javascript
[
  {
    title: "Home",
    url: "/home",
    icon: "fas fa-home",
    children: [
      {
        title: "About",
        url: "/about",
        icon: "fas fa-info",
        children: []
      }
    ]
  }
]
```

### 2. Sortable.js Configuration

```javascript
new Sortable(element, {
  group: 'nested',           // Allow inter-list dragging
  animation: 150,            // Animation duration
  fallbackOnBody: true,      // Required for nested
  swapThreshold: 0.65,       // Recommended for nested
  invertSwap: true,          // Better drag behavior
  handle: '.drag-handle',    // Drag only from handle
  onMove: checkDepthLimit,   // Validate before move
  onEnd: updateStructure     // Sync data after move
});
```

### 3. Depth Limitation

The `onMove` callback prevents moving items if the total depth would exceed `MAX_DEPTH`:

```javascript
onMove: function(evt) {
  const targetDepth = calculateDepth(evt.to);
  const itemDepth = getMaxDepthOfItem(evt.dragged);
  
  if (targetDepth + itemDepth > MAX_DEPTH) {
    showNotification('Max depth exceeded!', 'error');
    return false; // Prevent move
  }
  
  return true; // Allow move
}
```

### 4. Level Tracking

After each drag-drop, `updateAllLevels()` recalculates all `data-level` attributes:

```javascript
function updateAllLevels() {
  const menuList = document.getElementById('menuList');
  
  function updateLevel(element, level) {
    Array.from(element.children).forEach(item => {
      item.setAttribute('data-level', level);
      
      const nested = item.querySelector('.nested-sortable');
      if (nested) {
        updateLevel(nested, level + 1);
      }
    });
  }
  
  updateLevel(menuList, 0);
}
```

## 🎯 Common Tasks

### Add New Menu Item

1. Select parent menu (or leave empty for root level)
2. Enter title and URL
3. Optionally add Font Awesome icon class
4. Click "افزودن به منو" (Add to Menu)

### Reorder Items

- Drag items up/down to change order
- Drag items left (into another item) to make them children
- Drag items right (out of a nested list) to promote them

### Delete Item

Click the red trash icon (🗑️) next to any menu item.

### Export JSON

Click "دریافت JSON" (Get JSON) to download the menu structure as `menu-structure.json`.

## 🌐 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Touch-enabled

## 📝 Notes

### RTL (Right-to-Left) Support

The entire interface is designed for RTL languages:
- `direction: rtl` on root element
- Right-aligned text and controls
- Margins/paddings adjusted for RTL
- Drag handles on the left side

### Sortable.js Nested Requirements

For proper nested functionality, these settings are critical:

```javascript
fallbackOnBody: true    // MUST be true for nested
swapThreshold: 0.65    // < 1.0 recommended
invertSwap: true       // Better UX
```

### Empty Nested Lists

All menu items have an empty `<ul class="nested-sortable empty-nested">` by default. This allows dropping items even into menus that have no children yet.

## 🐛 Troubleshooting

### Drag-drop not working
- Ensure Sortable.js is properly imported
- Check that `initMenuBuilder()` is called after DOM loads
- Verify `.drag-handle` exists on each item

### Depth limit not enforced
- Check `MAX_DEPTH` constant value
- Ensure `onMove` callback is properly defined
- Verify `getMaxDepthOfItem()` calculates correctly

### Styles not applied
- Compile SCSS: `npm run sass:build`
- Check that `styles.css` exists
- Clear browser cache

### JSON export empty
- Ensure menu items have been added
- Check browser console for errors
- Verify `menuData` array is populated

## 📄 License

MIT License - Feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📧 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Made with ❤️ for Persian developers**