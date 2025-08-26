# OpticWorks E-commerce Website

This repository contains the source code for the OpticWorks e-commerce website. Built with Next.js, Tailwind CSS, and Tremor, this project serves as the online storefront for OpticWorks' line of professional-grade, DIY window tinting solutions.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [pnpm](https://pnpm.io/installation) (recommended package manager)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install dependencies:**
    We recommend using `pnpm` for faster and more reliable dependency management.
    ```bash
    pnpm install
    ```
    Alternatively, you can use `npm` or `yarn`:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    pnpm run dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

Here is a high-level overview of the key directories and files in this project:

-   `src/app/`: Contains the core application logic, including pages and layouts, following the Next.js App Router structure.
-   `src/components/`: Home to all the reusable React components used throughout the application.
-   `src/lib/`: Includes shared utilities, data sources (like product information), and API handlers.
-   `public/`: Stores static assets like images, fonts, and icons that are served directly.
-   `tailwind.config.js`: Configuration file for Tailwind CSS.
-   `next.config.ts`: Configuration file for Next.js.

## Available Scripts

In the `package.json` file, you will find several scripts for running common tasks:

-   `pnpm run dev`: Starts the development server with hot-reloading.
-   `pnpm run build`: Creates a production-ready build of the application.
-   `pnpm run start`: Starts the production server (requires a build to be created first).
-   `pnpm run lint`: Lints the codebase for potential errors and style issues using ESLint.

## Technology Stack

This project is built with a modern, component-based architecture:

-   **Framework:** [Next.js](https://nextjs.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [Tremor](https://tremor.so/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)

