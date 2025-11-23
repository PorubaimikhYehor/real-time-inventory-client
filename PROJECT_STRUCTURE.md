# Angular Project Structure

This project follows **Angular Best Practices** with feature-based architecture, lazy loading, and clean code principles.

## Directory Structure

```
src/app/
├── core/                           # Singleton services & app-wide functionality
│   ├── guards/                     # Route guards (auth, permissions)
│   ├── interceptors/               # HTTP interceptors (JWT, errors)
│   ├── services/                   # Core services (auth, http, notifications)
│   └── index.ts                    # Barrel file for exports
│
├── features/                       # Feature modules (lazy-loaded)
│   ├── actions/                    # Material movement actions
│   ├── auth/                       # Authentication (login, profile)
│   ├── containers/                 # Container management
│   ├── lots/                       # Lot management
│   ├── property-definitions/       # Property definitions
│   ├── users/                      # User management
│   └── [feature]/
│       ├── pages/                  # Smart components (route targets)
│       ├── components/             # Presentational components (reusable)
│       ├── services/               # Feature-specific services
│       └── index.ts                # Barrel file for exports
│
├── layout/                         # Application shell components
│   ├── sidebar/                    # Navigation sidebar
│   ├── toolbar/                    # Top toolbar
│   └── index.ts                    # Barrel file for exports
│
├── shared/                         # Shared/reusable code
│   ├── components/                 # Reusable UI components
│   │   ├── button/
│   │   ├── form-input/
│   │   ├── form-select/
│   │   └── view-switcher/
│   ├── models/                     # TypeScript interfaces/types
│   │   ├── auth.ts
│   │   ├── container.ts
│   │   └── lot.ts
│   └── index.ts                    # Barrel file for exports
│
├── app.config.ts                   # Application configuration
├── app.routes.ts                   # Routing (lazy loading configured)
├── app.ts                          # Root component
└── app.html                        # Root template
```

## Architecture Principles

### 1. Core Module
**Purpose**: Singleton services used throughout the application
- **Guards**: Route protection and authorization
- **Interceptors**: HTTP request/response handling
- **Services**: Authentication, notifications, and other app-wide services

**Import**: `import { AuthService } from '@app/core/services/auth.service'`

### 2. Features Modules
**Purpose**: Feature-specific components, services, and logic
- Each feature is lazy-loaded for optimal performance (43 separate chunks)
- **Pages**: Smart components (containers) that connect to services
- **Components**: Presentational/dumb components (reusable within feature)
- **Services**: Business logic specific to the feature
- **Barrel Files**: Each feature exports public API via `index.ts`

**Import**: `import { ContainerService } from '@app/features/containers'`

### 3. Layout Module
**Purpose**: Application shell components (toolbar, sidebar)
- Provides consistent UI structure across the app
- Contains navigation and user interface elements

**Import**: `import { Toolbar } from '@app/layout/toolbar/toolbar'`

### 4. Shared Module
**Purpose**: Reusable components and models
- **Components**: Generic UI components used across features (buttons, forms)
- **Models**: TypeScript interfaces and types

**Import**: `import { ButtonComponent } from '@app/shared/components/button/button.component'`

### 5. Performance Optimizations
- **Lazy Loading**: All features use `loadComponent()` for code splitting
- **Bundle Size**: 699 KB initial (down from 1.20 MB - 41.7% reduction)
- **Gzipped Size**: 168 KB (down from 235 KB - 28.5% reduction)
- **Chunks**: 43 separate chunks for optimal caching and loading
- **Budgets**: 500 KB warning, 1 MB error threshold configured

## Component Organization

### Pages (Smart Components)
- Connect to services
- Handle business logic
- Manage state
- Located in `features/*/pages/`
- Example: `containers.ts`, `actions.component.ts`

### Components (Presentational)
- Receive data via `@Input()`
- Emit events via `@Output()`
- No direct service injection (when possible)
- Located in `features/*/components/` or `shared/components/`
- Example: `container-list`, `form-input`

## Import Path Patterns

Using TypeScript path aliases for clean, maintainable imports:

```typescript
// Core services (singleton)
import { AuthService } from '@app/core/services/auth.service';
import { HttpService } from '@app/core/services/http.service';
import { NotificationService } from '@app/core/services/notification.service';

// Core guards & interceptors
import { authGuard } from '@app/core/guards/auth.guard';
import { authInterceptor } from '@app/core/interceptors/auth.interceptor';

// Feature services (with barrel files)
import { ContainerService } from '@app/features/containers';
import { LotService } from '@app/features/lots';
import { ActionService } from '@app/features/actions';

// Feature components (with barrel files)
import { ContainerListComponent, ContainerDetailsComponent } from '@app/features/containers';

// Shared components
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { FormInputComponent } from '@app/shared/components/form-input/form-input.component';

// Models
import { Container } from '@app/shared/models/container';
import { Lot } from '@app/shared/models/lot';

// Layout
import { Toolbar } from '@app/layout/toolbar/toolbar';
import { Sidebar } from '@app/layout/sidebar/sidebar';
```

**Configuration**: Path aliases are defined in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@app/core/*": ["app/core/*"],
      "@app/features/*": ["app/features/*"],
      "@app/shared/*": ["app/shared/*"],
      "@app/layout/*": ["app/layout/*"]
    }
  }
}
```

## Benefits of This Structure

1. **Performance**: Lazy loading reduces initial bundle size by 41.7% (699 KB vs 1.20 MB)
2. **Scalability**: Easy to add new features without affecting existing code
3. **Maintainability**: Clean imports with path aliases, no relative path complexity
4. **Reusability**: Barrel files provide clean public APIs for each module
5. **Testability**: Isolated components are easier to unit test
6. **Code Splitting**: 43 separate chunks for optimal caching and parallel loading
7. **Team Collaboration**: Clear module boundaries reduce merge conflicts
8. **Developer Experience**: Autocomplete works better with path aliases

## Routing Organization

Routes defined in `app.routes.ts` use lazy loading for all features:

```typescript
// All routes use loadComponent() for code splitting
{ path: 'containers', loadComponent: () => import('@app/features/containers').then(m => m.ContainersPage) }
{ path: 'lots', loadComponent: () => import('@app/features/lots').then(m => m.LotsPage) }
{ path: 'actions', loadComponent: () => import('@app/features/actions').then(m => m.ActionsPage) }
{ path: 'admin/users', loadComponent: () => import('@app/features/users').then(m => m.UsersListComponent) }
```

**Impact**: Creates 43 separate chunks, each loaded on-demand when user navigates to that route.

## Best Practices

1. **Keep core/ small**: Only essential, singleton services (auth, http, notifications)
2. **Feature independence**: Features should not directly import from each other
3. **Shared for common code**: Move truly reusable components to shared/
4. **Smart vs Dumb**: Pages are smart, components are dumb (presentational)
5. **Models in shared**: Type definitions accessible to all features via `@app/shared/models`
6. **Barrel files**: Export public API via `index.ts` in each module
7. **Path aliases**: Always use `@app/*` imports instead of relative paths
8. **Lazy loading**: Use `loadComponent()` for all routes to enable code splitting
9. **Consistent naming**: Use `.component.ts`, `.service.ts` suffixes
10. **Template files**: Separate HTML from TypeScript for better organization


## Migration Notes

Previous structure used `modules/` directory with mixed concerns. New structure provides:
- Clear separation between features, core, shared, and layout
- Better scalability for future features
- Improved code organization following Angular style guide
- Easier navigation and discovery of components
