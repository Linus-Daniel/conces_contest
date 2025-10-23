# Maintenance Context Usage Guide

The Maintenance Context provides a centralized way to control maintenance mode across your voting application.

## Features

- ✅ Global maintenance mode toggle
- ✅ Customizable maintenance messages
- ✅ Persistent settings (localStorage)
- ✅ Multiple implementation patterns
- ✅ Admin control interface
- ✅ Real-time updates across components

## Setup

The MaintenanceProvider is already configured in both the main app and admin layouts:

```tsx
// In layouts
<MaintenanceProvider>
  {children}
</MaintenanceProvider>
```

## Usage Patterns

### 1. Full Page Replacement (Recommended for voting pages)

```tsx
import { useMaintenance, MaintenancePage } from '@/context/MaintenanceContext';

function VotingPage() {
  const { isMaintenanceMode } = useMaintenance();
  
  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }
  
  return (
    <div>
      {/* Your voting page content */}
    </div>
  );
}
```

### 2. Higher-Order Component (HOC)

```tsx
import { withMaintenanceCheck } from '@/context/MaintenanceContext';

// Full replacement
const MyComponent = withMaintenanceCheck(() => (
  <div>My component content</div>
));

// Banner only
const MyComponentWithBanner = withMaintenanceCheck(() => (
  <div>My component content</div>
), true);
```

### 3. Banner Component

```tsx
import { MaintenanceBanner } from '@/context/MaintenanceContext';

function MyPage() {
  return (
    <div>
      <MaintenanceBanner />
      {/* Rest of your content */}
    </div>
  );
}
```

### 4. Manual Control

```tsx
import { useMaintenance } from '@/context/MaintenanceContext';

function MyComponent() {
  const { 
    isMaintenanceMode, 
    maintenanceMessage,
    setMaintenanceMode,
    setMaintenanceMessage,
    toggleMaintenanceMode 
  } = useMaintenance();
  
  if (isMaintenanceMode) {
    return <div>{maintenanceMessage}</div>;
  }
  
  return <div>Normal content</div>;
}
```

## Admin Control

Access the maintenance control panel at `/admin/maintenance`:

- Toggle maintenance mode on/off
- Customize maintenance messages
- Use preset message templates
- Real-time preview

## API Reference

### `useMaintenance()` Hook

Returns an object with:

```tsx
{
  isMaintenanceMode: boolean;           // Current maintenance state
  maintenanceMessage: string;           // Current maintenance message
  setMaintenanceMode: (enabled: boolean) => void;    // Set maintenance state
  setMaintenanceMessage: (message: string) => void;  // Update message
  toggleMaintenanceMode: () => void;    // Toggle state
}
```

### Components

- `<MaintenanceProvider>` - Context provider (already configured)
- `<MaintenancePage />` - Full-page maintenance view
- `<MaintenanceBanner />` - Top banner notification
- `withMaintenanceCheck(Component, bannerOnly?)` - HOC wrapper

### Props

#### `withMaintenanceCheck(Component, showBannerOnly?)`

- `Component`: React component to wrap
- `showBannerOnly`: boolean - if true, shows banner but doesn't replace component

## Current Implementation

The maintenance context is currently used in:

- ✅ `/voting` - Main voting page
- ✅ `/voting/candidate/[id]` - Individual candidate pages
- ✅ Admin dashboard with control panel

## Best Practices

1. **Use full replacement for critical pages** (voting, submission forms)
2. **Use banners for informational pages** that can still be accessed
3. **Customize messages** to inform users about expected downtime
4. **Test thoroughly** before enabling in production
5. **Keep messages clear and helpful** with expected return time

## Persistence

Settings are automatically saved to localStorage:
- `voting_maintenance_mode` - boolean state
- `voting_maintenance_message` - custom message

Settings persist across browser sessions and page reloads.

## Development

For testing different maintenance states during development, you can:

1. Use the admin panel at `/admin/maintenance`
2. Toggle via browser console:
   ```javascript
   // Enable maintenance mode
   localStorage.setItem('voting_maintenance_mode', 'true');
   
   // Disable maintenance mode  
   localStorage.setItem('voting_maintenance_mode', 'false');
   
   // Custom message
   localStorage.setItem('voting_maintenance_message', 'Custom message here');
   ```

## Example Messages

Here are some effective maintenance messages:

- "Voting is temporarily unavailable while we perform system updates. Please check back in a few minutes."
- "We are currently experiencing technical difficulties. Our team is working to resolve this quickly."
- "Scheduled maintenance in progress. Voting will resume at 3:00 PM."
- "System upgrade in progress. Thank you for your patience."