# Theme Guide

This guide explains how to use and customize the application's color scheme.

## Overview

The application uses a centralized theme system located in `lib/theme.js`. This allows for easy customization of colors across the entire application from a single location.

## Theme Structure

The theme configuration is organized as follows:

### Primary Colors
- `primary`: Main application colors (Blue)
- `secondary`: Secondary application colors (Purple)

### Entity-Specific Colors
Each entity type has its own color scheme:
- `customer`: Blue theme
- `vehicle`: Green theme  
- `technician`: Orange theme
- `service`: Red theme
- `component`: Purple theme
- `company`: Gray theme
- `report`: Cyan theme

### Status Colors
- `pending`: Yellow theme
- `in_progress`: Blue theme
- `completed`: Green theme
- `cancelled`: Red theme

### Stock Status Colors
- `inStock`: Green theme
- `lowStock`: Yellow theme
- `outOfStock`: Red theme

## Usage

### Importing the Theme

```javascript
import { theme, themeHelpers } from '../../lib/theme'
```

### Using Form Fields

```javascript
// Input field with entity-specific focus colors
<input
  type="text"
  className={themeHelpers.form.input('customer')}
/>

// Select field
<select className={themeHelpers.form.select('technician')}>
</select>

// Textarea
<textarea className={themeHelpers.form.textarea('service')}>
</textarea>
```

### Using Buttons

```javascript
// Primary button with entity-specific colors
<button className={`${themeHelpers.button.primary('customer')} additional-classes`}>
  Save
</button>

// Secondary button
<button className={`${themeHelpers.button.secondary('technician')} additional-classes`}>
  Cancel
</button>

// Outline button
<button className={`${themeHelpers.button.outline} additional-classes`}>
  Back
</button>
```

### Using Status Colors

```javascript
// Get status colors
const statusColors = themeHelpers.getStatusColor('completed')
// Returns: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }

// Usage
<div className={`${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
  Status: Completed
</div>
```

### Using Stock Status Colors

```javascript
// Get stock colors based on count and reorder level
const stockColors = themeHelpers.getStockColor(currentStock, reorderLevel)

// Usage
<div className={`${stockColors.bg} ${stockColors.text} ${stockColors.border}`}>
  Stock: {currentStock}
</div>
```

## Customization

### Changing Entity Colors

To change the color scheme for a specific entity, modify the corresponding entry in `lib/theme.js`:

```javascript
entities: {
  customer: {
    main: 'blue-600',    // Change to 'green-600' for green
    light: 'blue-500',
    dark: 'blue-700',
    text: 'white'
  },
  // ... other entities
}
```

### Adding New Entity Types

1. Add the new entity to the `entities` object:
```javascript
newEntity: {
  main: 'indigo-600',
  light: 'indigo-500', 
  dark: 'indigo-700',
  text: 'white'
}
```

2. Use it in your components:
```javascript
className={themeHelpers.form.input('newEntity')}
```

### Changing the Overall Color Scheme

To change the entire application's color scheme:

1. Update the primary colors:
```javascript
primary: {
  main: 'green-600',    // Change from blue to green
  light: 'green-500',
  dark: 'green-700',
  text: 'white'
}
```

2. Update entity colors to match the new scheme.

## Available Tailwind Colors

The theme uses Tailwind CSS color classes. Common options include:

- Blue: `blue-500`, `blue-600`, `blue-700`
- Green: `green-500`, `green-600`, `green-700`  
- Red: `red-500`, `red-600`, `red-700`
- Orange: `orange-500`, `orange-600`, `orange-700`
- Purple: `purple-500`, `purple-600`, `purple-700`
- Gray: `gray-500`, `gray-600`, `gray-700`
- Cyan: `cyan-500`, `cyan-600`, `cyan-700`
- Indigo: `indigo-500`, `indigo-600`, `indigo-700`

## Best Practices

1. **Always use theme helpers** instead of hard-coded color classes
2. **Pass the correct entity type** to get appropriate colors
3. **Test color changes** in both light and dark modes if supported
4. **Consider accessibility** when choosing color combinations
5. **Update documentation** when adding new entity types

## Example: Complete Form with Theme

```javascript
import { themeHelpers } from '../../lib/theme'

export default function CustomerEditForm() {
  return (
    <form>
      {/* Name input with customer theme */}
      <input
        type="text"
        className={themeHelpers.form.input('customer')}
        placeholder="Customer name"
      />
      
      {/* Company select */}
      <select className={themeHelpers.form.select('customer')}>
        <option>Select company</option>
      </select>
      
      {/* Action buttons */}
      <div className="flex space-x-3">
        <button 
          type="button"
          className={`px-4 py-2 rounded ${themeHelpers.button.outline}`}
        >
          Cancel
        </button>
        <button 
          type="submit"
          className={`px-4 py-2 rounded ${themeHelpers.button.primary('customer')}`}
        >
          Save Customer
        </button>
      </div>
    </form>
  )
}
```

This theme system makes it easy to maintain consistent branding and quickly update the application's appearance across all components.
