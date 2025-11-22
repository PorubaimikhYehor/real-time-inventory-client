# Angular Project Structure

This project follows **Angular Best Practices** with a clear separation of concerns and scalable architecture.

## Directory Structure

```
src/app/
├── core/                           # Singleton services & app-wide functionality
│   ├── guards/                     # Route guards
│   │   └── auth.guard.ts           # Authentication & authorization guards
│   ├── interceptors/               # HTTP interceptors
│   │   └── auth.interceptor.ts     # JWT token interceptor
│   └── services/                   # Core business services
│       ├── auth.service.ts         # Authentication service
│       └── user-management.service.ts
│
├── features/                       # Feature modules (lazy-loadable)
│   ├── actions/                    # Material movement actions
│   │   ├── pages/                  # Smart/container components
│   │   │   └── actions.component.* # Main actions page
│   │   ├── components/             # Presentational components
│   │   │   └── move-materials/     # Move materials form
│   │   └── services/               # Feature-specific services
│   │       └── action.service.ts
│   │
│   ├── users/                      # User management
│   │   ├── pages/                  # User pages
│   │   │   └── users-list.component.*
│   │   └── components/             # User-specific components
│   │       └── create-user-dialog.component.*
│   │
│   ├── auth/                       # Authentication
│   │   └── pages/                  # Auth pages
│   │       ├── login.component.*
│   │       └── profile.component.*
│   │
│   ├── containers/                 # Container management
│   │   ├── pages/                  # Container pages
│   │   │   └── containers.ts       # Main containers page
│   │   ├── components/             # Container components
│   │   │   ├── container-list/
│   │   │   ├── container-details/
│   │   │   ├── container-form/
│   │   │   └── create-container-dialog/
│   │   └── services/               # Container services
│   │       └── container-service.ts
│   │
│   ├── lots/                       # Lot management
│   │   ├── pages/                  # Lot pages
│   │   │   └── lots.ts
│   │   ├── components/             # Lot components
│   │   │   ├── lot-list/
│   │   │   ├── lot-details/
│   │   │   └── lot-form/
│   │   └── services/               # Lot services
│   │       └── lot-service.ts
│   │
│   └── property-definitions/       # Property definitions
│       ├── pages/                  # Property pages
│       │   └── property-definitions.component.ts
│       ├── components/             # Property components
│       │   ├── property-definition-table/
│       │   └── property-definition-dialog/
│       └── services/               # Property services
│           └── property-definition.service.ts
│
├── layout/                         # Layout components
│   ├── sidebar/                    # Navigation sidebar
│   │   ├── sidebar.ts
│   │   └── sidebar.html
│   └── toolbar/                    # Top toolbar
│       ├── toolbar.ts
│       ├── toolbar.html
│       └── toolbar.css
│
├── shared/                         # Shared/reusable code
│   ├── components/                 # Reusable UI components
│   │   ├── button/                 # Shared button component
│   │   ├── form-input/             # Shared form input
│   │   ├── form-select/            # Shared form select
│   │   ├── view-switcher/          # View mode switcher
│   │   ├── http.service.ts         # HTTP utility service
│   │   └── notification.service.ts # Notification service
│   └── models/                     # Shared TypeScript interfaces/types
│       ├── auth.ts                 # Auth models
│       ├── container.ts            # Container models
│       └── lot.ts                  # Lot models
│
├── app.config.ts                   # Application configuration
├── app.routes.ts                   # Main routing configuration
├── app.ts                          # Root component
└── app.html                        # Root template
```

## Architecture Principles

### 1. Core Module
**Purpose**: Singleton services used throughout the application
- **Guards**: Route protection and authorization
- **Interceptors**: HTTP request/response handling
- **Services**: Authentication, user management, and other app-wide services

**Import**: `import { AuthService } from '@app/core/services/auth.service'`

### 2. Features Modules
**Purpose**: Feature-specific components, services, and logic
- Each feature is self-contained and potentially lazy-loadable
- **Pages**: Smart components (containers) that connect to services
- **Components**: Presentational/dumb components (reusable within feature)
- **Services**: Business logic specific to the feature

**Import**: `import { ContainerService } from '@app/features/containers/services/container-service'`

### 3. Layout Module
**Purpose**: Application shell components (header, sidebar, footer)
- Provides consistent UI structure across the app
- Contains navigation and user interface elements

**Import**: `import { Toolbar } from '@app/layout/toolbar/toolbar'`

### 4. Shared Module
**Purpose**: Reusable components, directives, pipes, and models
- **Components**: Generic UI components used across features
- **Models**: TypeScript interfaces and types

**Import**: `import { ButtonComponent } from '@app/shared/components/button/button.component'`

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

```typescript
// Core services (singleton)
import { AuthService } from '../../../core/services/auth.service';

// Feature services
import { ContainerService } from '../services/container-service';

// Shared components
import { ButtonComponent } from '../../../../shared/components/button/button.component';

// Models
import { Container } from '../../../shared/models/container';

// Layout
import { Toolbar } from '../../layout/toolbar/toolbar';
```

## Benefits of This Structure

1. **Scalability**: Easy to add new features without affecting existing code
2. **Maintainability**: Clear separation makes code easier to understand and modify
3. **Reusability**: Shared components and services prevent duplication
4. **Testability**: Isolated components are easier to unit test
5. **Lazy Loading**: Features can be lazy-loaded for better performance
6. **Team Collaboration**: Clear boundaries reduce merge conflicts

## Routing Organization

Routes are defined in `app.routes.ts` and organized by feature:

```typescript
// Feature-based routing
{ path: 'containers', children: [...] }
{ path: 'lots', children: [...] }
{ path: 'admin', children: [...] }
{ path: 'auth', children: [...] }
```

## Best Practices

1. **Keep core/ small**: Only essential, singleton services
2. **Feature independence**: Features should not directly import from each other
3. **Shared for common code**: Move reusable components to shared/
4. **Smart vs Dumb**: Pages are smart, components are dumb
5. **Models in shared**: Type definitions should be accessible to all features
6. **Consistent naming**: Use `.component.ts`, `.service.ts` suffixes
7. **Template files**: Separate HTML from TypeScript for better organization

## Migration Notes

Previous structure used `modules/` directory with mixed concerns. New structure provides:
- Clear separation between features, core, shared, and layout
- Better scalability for future features
- Improved code organization following Angular style guide
- Easier navigation and discovery of components
