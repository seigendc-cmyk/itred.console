# SCI Control Centre

The **SCI Control Centre** is the centralized operations and licensing suite for the **seiGEN** ecosystem. It provides administrative controls, licensing gateways, commercial forecasts, and agent workflows.

---

## Architecture and Core Design

### 1. Prototype Mode
- The application currently runs in **Prototype / Local Demo Mode** as configured in the Platform workspace.
- **LocalStorage Data Persistence**: All resources (vendors registry, POS terminals licenses, workflow queue entries, audit logs, RPN agents, and notifications) persist inside the browser's `localStorage`.
- **No Active Firebase Integration**: Ready schematics are blueprinted but disabled. All database operations are mocked using local transactional triggers.

### 2. Workspace Shell Layout
- **Far-Left Workspace Rail**: Links to Home, Vendor Operations, Licensing Centre, Commercial, Internal Administration, RPN Operations, Finance, and Platform.
- **Secondary Sidebar Menu**: Filters links dynamically based on active staff session clearances.
- **Top Command Bar**: Displays active workspace context, environment mode watermark, notifications center, active operator desks, and login lock triggers.

### 3. Staff Access & Roles
- Operator login bypasses external OAuth providers by using a mock Google Authentication form.
- Selecting a staff member and active desk resolves permissions dynamically. Blocked roles or inactive desks are denied access, routing to the **Access Restricted Panel**.

---

## Developer Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Production Bundling Verification
```bash
npm run build
```

---

## Git Workflow Guidelines
- Ensure `npm run build` compiles with zero errors before pushing commits.
- Segment features into logically structured workspace components:
  - `src/components/PlansPricingView.tsx` (Licensing Centre)
  - `src/components/RPNManagementView.tsx` (RPN Operations)
  - `src/components/FinanceView.tsx` (Finance Control)
  - `src/components/PlatformWorkspaceView.tsx` (Platform Console)
