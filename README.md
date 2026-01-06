# Agristack Admin Dashboard

A modern, mobile-responsive admin application for managing agricultural data, farmer registrations, seed inspections, and mobile outreach programs (Gyan Vahan).

![Agristack Mobile](/public/logo.png) <!-- Replace with actual screenshot path if available -->

## 🚀 Features

- **Dynamic Dashboard**: Real-time statistics on farmer registrations, inspections, and mobile outreach.
- **Farmer Registry**: Comprehensive management of farmer data with Aadhaar, bank, and land details.
- **Seed Inspections**: Digital inspection forms with photo evidence upload and status tracking (Pass/Fail).
- **Gyan Vahan (Mobile Outreach)**: Track village visits, awareness programs, and inspector activity.
- **Global Search**: Powerful cross-entity search bar in the header to find records instantly by name, ID, or location.
- **Record Management**: Full Create, Read, Update (Edit), and Delete (CRUD) support for all primary modules.
- **Data Export**: Export reports to PDF and Excel formats with date-range filters.
- **Mobile First**: Fully responsive design optimized for smartphones, tablets, and desktops.
- **Secure Auth**: Role-based access control (Admin/Staff) powered by Supabase Auth.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion (Animations)
- **Icons**: Lucide React
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Tables**: TanStack Table (for complex data views)

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-github-repo-url>
   cd agristack-admin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Running Locally

```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

---

## 📤 Pushing to GitHub

To save your changes and push them to your GitHub repository, follow these steps:

1. **Check changed files**:
   ```bash
   git status
   ```

2. **Stage your changes**:
   ```bash
   git add .
   ```

3. **Commit your changes**:
   ```bash
   git commit -m "feat: your descriptive message"
   ```

4. **Push to the main branch**:
   ```bash
   git push origin main
   ```

> [!TIP]
> Always run `npm run build` before pushing to ensure there are no TypeScript or build errors in your code.

---

## 📄 License

This project is licensed under the MIT License.
