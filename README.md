# XenoPulse

XenoPulse is an internal AI-native campaign intelligence platform and dashboard. It provides real-time analytics, variant testing capabilities, and automated debriefs for marketing campaigns. The application is built with a focus on a highly polished, premium dark mode aesthetic utilizing the Xeno brand guidelines.

## Architecture and Technologies

The application is built on a modern React stack utilizing the following core technologies:

*   **Framework**: Next.js 15 (App Router)
*   **Backend & Database**: Convex (Real-time backend-as-a-service)
*   **Styling**: Tailwind CSS v4
*   **Typography**: Outfit (Google Fonts)
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Toast Notifications**: Sonner

## Core Features

### Authentication Flow
A sleek, monochromatic login screen featuring a custom-animated authentication spinner. It utilizes Framer Motion for elegant entry transitions and simulates a secure employee authentication flow before redirecting to the main intelligence dashboard.

### Campaign Intelligence Dashboard
The core interface provides a comprehensive view of ongoing and past campaigns.
*   **Variant Testing**: Visualizes A/B/n testing results with animated progress bars indicating conversion rates and open rates.
*   **Automated Debriefs**: Integrates a "Generate Debrief" feature that processes campaign variants and outputs a statistical summary of the best performing strategies.
*   **Winner Highlighting**: Automatically calculates and visually isolates the winning variant in a test based on maximum conversion metrics.

### Global Navigation
*   **Command Menu (Cmd+K)**: A fully keyboard-accessible global search interface. It allows rapid navigation between the Dashboard, Customers, Segments, and Campaigns pages.
*   **Sidebar Interface**: A persistent navigation sidebar featuring the XenoPulse branding, workspace switcher, and active route highlighting using the primary brand gradients.

## Project Structure

*   `src/app/` - Next.js App Router pages and layouts.
    *   `(dashboard)/` - Route group containing all authenticated dashboard interfaces.
    *   `page.tsx` - The initial authentication screen.
*   `src/components/` - Reusable React components.
    *   `Sidebar.tsx` - The main navigation sidebar.
    *   `CommandMenu.tsx` - The Cmd+K global search implementation.
    *   `ConvexClientProvider.tsx` - The Convex database context provider.
*   `convex/` - Backend logic and database schemas.
    *   `schema.ts` - Defines the data models for campaigns, variants, and statistics.
    *   `campaigns.ts` - Database queries and mutations.

## Setup and Installation

1.  **Install Dependencies**
    Execute the following command to install all required Node modules:
    ```bash
    npm install
    ```

2.  **Initialize Convex**
    Start the Convex development server. This will provision your cloud database and provide you with the necessary environment variables:
    ```bash
    npx convex dev
    ```

3.  **Start Development Server**
    Run the Next.js local development server:
    ```bash
    npm run dev
    ```

4.  **Access the Application**
    Open your browser and navigate to `http://localhost:3000`.

## Design System

The application adheres to a strict dark mode design system (`#050505` background) accented by Xeno's signature deep purple (`#6633cc`) and violet (`#a78bfa`) gradients. The typography is exclusively driven by the `Outfit` font family to maintain a geometric, premium appearance across all headers and data visualizations. All interactive elements feature subtle CSS transitions or Framer Motion animations to provide immediate visual feedback.
