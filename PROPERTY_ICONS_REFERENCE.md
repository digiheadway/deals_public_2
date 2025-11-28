# Property Type Icons Reference

This document provides a reference for the custom map icons used for different property types in the Deal Network application.

## Icon Design System

All property type icons now use **Lucide React** icon designs for consistency with the rest of the application. Each icon is displayed as a colored pin marker with the icon embedded inside a white circle.

## Icon Color Scheme & Lucide Icons

### Residential Properties (Blue/Purple Shades)
- **Residential Plot** - Purple (#8b5cf6) - Home icon (house outline)
- **Residential House** - Indigo (#6366f1) - Home icon (house with door)
- **Independent Floor** - Blue (#3b82f6) - Layers icon (stacked floors)
- **Flat/Apartment** - Sky Blue (#0ea5e9) - Building2 icon (apartment building)

### Commercial Properties (Green Shades)
- **Commercial Plot** - Emerald (#10b981) - LandPlot icon (briefcase/land)
- **Shop** - Green (#059669) - Store icon (storefront with awning)
- **Showroom** - Teal (#14b8a6) - Layers icon (display floors)
- **Commercial Builtup** - Light Green (#22c55e) - Building icon (office building with windows)

### SCO Properties (Orange Shades)
- **SCO Plot** - Orange (#f97316) - Shield icon with checkmark
- **SCO Builtup** - Dark Orange (#ea580c) - Shield icon with cross/plus

### Industrial Properties (Gray/Steel Shades)
- **Industrial Land** - Gray (#6b7280) - Factory icon (industrial building)
- **Factory** - Dark Gray (#4b5563) - Factory icon (manufacturing facility)
- **Warehouse** - Charcoal (#374151) - Warehouse icon (storage building)

### Agricultural Properties (Green/Brown Shades)
- **Agriculture Land** - Lime (#84cc16) - TreePine icon (agricultural/nature)
- **Farm House** - Olive Green (#65a30d) - Home icon (farmhouse)
- **Ploting Land** - Light Lime (#a3e635) - Grid2x2Check icon (land plots grid)

### Other Properties (Purple/Pink Shades)
- **Labour Quarter** - Purple (#a855f7) - Home with people icon
- **Other** - Dark Purple (#9333ea) - Info icon (circle with i)

## Special Icons

### Landmark Location
- **Color**: Blue (#2563eb)
- **Icon**: Globe/MapPin icon with reduced opacity (0.8)
- **Usage**: Used when a property only has landmark location (approximate location)

### User Location
- **Color**: Blue (#3b82f6) with white border
- **Icon**: Circular dot (Navigation icon style)
- **Usage**: Shows the current user's location on the map

## Marker Clustering

When multiple properties are close together, they automatically cluster into a single marker showing the count:
- **Small clusters** (1-10 properties): 40px blue circle
- **Medium clusters** (11-100 properties): 48px blue circle
- **Large clusters** (100+ properties): 56px blue circle

Clicking a cluster zooms in to reveal individual markers. At maximum zoom, markers "spiderfy" (spread out in a circle pattern) for easy selection.

## Implementation Details

- All property icons use **Lucide React** SVG paths for consistency
- Icons are 30x41 pixels with a pin/marker shape
- Each icon has a drop shadow for better visibility
- Icons have a white circle background with the property type icon inside
- The icon color matches the property category for easy visual grouping
- Landmark locations always use the landmark icon regardless of property type
- Clustering prevents icon overlap and improves map performance

