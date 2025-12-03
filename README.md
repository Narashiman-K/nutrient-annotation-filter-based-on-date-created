# Nutrient Web SDK - Date-Based Annotation Filtering

A React application demonstrating advanced annotation filtering capabilities using Nutrient Web SDK (formerly PSPDFKit). This project showcases how to implement custom date-based filtering for PDF annotations with a real-time dropdown interface.

## 🎯 Project Description

This application extends the Nutrient Web SDK with a powerful date-based annotation filtering system. Users can:

- **Create annotations** with automatic date tagging
- **Filter annotations** by creation date using a custom toolbar dropdown
- **Test with custom dates** to simulate different creation scenarios
- **View all annotations** or filter by specific dates in real-time

The implementation demonstrates best practices for:
- Custom toolbar integration
- Annotation customData management
- Event-driven architecture
- Real-time UI updates

## ✨ Features

- 📅 **Automatic Date Tagging**: Every annotation is tagged with a creation date
- 🔍 **Smart Filtering**: Show/hide annotations based on selected date
- 🎨 **Custom Toolbar**: Seamlessly integrated dropdown in the Nutrient toolbar
- ⚡ **Real-time Updates**: Dropdown dynamically updates as annotations are created/deleted
- 📄 **Multi-page Support**: Works across all pages in the PDF document
- 🧪 **Testing Mode**: Prompt-based date entry for testing different scenarios

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- A valid Nutrient Web SDK license key

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Narashiman-K/nutrient-annotation-filter-based-on-date-created.git
   cd nutrient-annotation-filter-based-on-date-created
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure license key**

   Create a `.env` file in the root directory:
   ```env
   VITE_lkey=YOUR_NUTRIENT_LICENSE_KEY
   ```

   > **Note**: Don't have a license key? Contact Nutrient sales at [sales@nutrient.io](mailto:sales@nutrient.io) for a trial or commercial license.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to the URL shown in the terminal (typically `http://localhost:5173`)

That's it! Your application is now up and running. 🎉

## 📁 Folder Structure

```
nutrient-vite-cdn-general-thronics-annotation-filter-date/
├── public/                          # Static assets
│   └── example.pdf                  # Sample PDF document
├── src/                            # Source code
│   ├── components/                 # React components
│   │   └── pdf-viewer-component.jsx  # Main PDF viewer component with filtering
│   ├── App.jsx                     # Root application component
│   ├── App.css                     # Application styles
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Global styles
├── .env                            # Environment variables (create this)
├── biome.json                      # Biome configuration for code quality
├── index.html                      # HTML template
├── package.json                    # Project dependencies and scripts
├── vite.config.js                  # Vite configuration
└── README.md                       # This file
```

## 🔧 Code Explanation

### Core Component: `pdf-viewer-component.jsx`

The main component implements the following architecture:

#### 1. **State Management**
```javascript
const containerRef = useRef(null);        // DOM container for Nutrient Viewer
const instanceRef = useRef(null);         // Nutrient Viewer instance
const availableDatesRef = useRef(new Set()); // Collection of unique dates
```

#### 2. **Date Collection**
The `collectAvailableDates()` function scans all pages and extracts unique dates from annotation `customData`:

```javascript
const collectAvailableDates = async (instanceObj) => {
  // Iterates through all pages
  // Extracts dates from annotation.customData.createdDate
  // Returns a Set of unique dates
};
```

#### 3. **Custom Toolbar Item**
The `createDateFilterDropdown()` function creates a native HTML `<select>` element integrated into the Nutrient toolbar:

```javascript
const createDateFilterDropdown = (dates) => {
  // Creates styled dropdown element
  // Populates with dates
  // Attaches event listeners for filtering
  // Returns custom toolbar item configuration
};
```

#### 4. **Annotation Filtering**
The `filterAnnotationsByDate()` function controls annotation visibility using the `hidden` property:

```javascript
const filterAnnotationsByDate = async (instanceObj, dateFilter) => {
  // If "all": Show all annotations (hidden = false)
  // If specific date: Show matching, hide non-matching
  // Uses annotation.set("hidden", true/false)
};
```

#### 5. **Event Listeners**

The application responds to annotation lifecycle events:

- **annotations.create**: Automatically adds date to new annotations
- **annotations.update**: Logs updates for debugging
- **annotations.delete**: Refreshes dropdown to remove obsolete dates

### Key Implementation Details

#### Annotation CustomData Structure
```javascript
{
  customData: {
    createdDate: "2025-12-03",           // YYYY-MM-DD format
    timestamp: "2025-12-03T10:30:00.000Z" // Full ISO timestamp
  }
}
```

#### Visibility Control
Uses the Nutrient `hidden` property per official documentation:
- `hidden: false` → Annotation is visible
- `hidden: true` → Annotation is hidden (not deleted)

#### Async Handling
Uses `for...of` loops instead of `forEach` for proper async/await behavior:
```javascript
for (const annotation of annotations.toArray()) {
  await instanceObj.update(...);
}
```

## 📸 Demo

https://github.com/user-attachments/assets/c0ccc16e-13d8-49e6-9661-ee1683b0277f


## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run format` | Format code with Biome |
| `npm run lint` | Lint code with Biome |
| `npm run check` | Run Biome check and auto-fix issues |

## 🏗️ Production Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Preview the build** (optional)
   ```bash
   npm run preview
   ```

3. **Deploy the `dist/` folder** to your hosting service (Vercel, Netlify, etc.)

### Production Considerations

- **Remove console.log statements** or use a proper logging library
- **Replace `window.prompt()`** with a custom date picker UI component
- **Add error boundaries** for better error handling
- **Implement authentication** if dealing with sensitive documents
- **Configure CORS** appropriately for PDF loading

## 📚 Technologies Used

- **React 19.1.0** - UI framework
- **Vite 6.3.5** - Build tool and dev server
- **Nutrient Web SDK** - PDF viewing and annotation
- **Biome 2.3.2** - Code formatter and linter

## 🐛 Troubleshooting

### Common Issues

**Issue: License key error**
- Ensure your `.env` file contains a valid `VITE_lkey`
- Restart the dev server after adding the key

**Issue: PDF not loading**
- Check that the PDF path is correct in `App.jsx`
- Ensure the PDF file exists in the `public/` folder

**Issue: Dropdown not appearing**
- Check browser console for errors
- Ensure Nutrient SDK is loaded (`window.NutrientViewer` exists)
- Verify annotations have been created

**Issue: Filtering not working**
- Open browser console to see filtering logs
- Verify annotations have `customData.createdDate` property
- Check for JavaScript errors in console

## 🤝 Support

If you encounter any issues or need assistance:

- **Nutrient Support**: [https://support.nutrient.io/hc/en-us/requests/new](https://support.nutrient.io/hc/en-us/requests/new)
- **Sales Inquiries**: [sales@nutrient.io](mailto:sales@nutrient.io)
- **Documentation**: [https://www.nutrient.io/guides/web/](https://www.nutrient.io/guides/web/)

## 📄 License

This project is provided as-is for demonstration purposes. The Nutrient Web SDK requires a separate commercial license.

To obtain a license:
- **Email**: [sales@nutrient.io](mailto:sales@nutrient.io)
- **Website**: [https://www.nutrient.io/](https://www.nutrient.io/)

## 👨‍💻 Author

**Narashiman**

- LinkedIn: [https://www.linkedin.com/in/narashimank/](https://www.linkedin.com/in/narashimank/)

## 🙏 Acknowledgments

- Nutrient Team for the excellent Web SDK and documentation
- React team for the powerful UI framework
- Vite team for the blazing-fast build tool

---

