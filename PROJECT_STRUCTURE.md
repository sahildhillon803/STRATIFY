# STRATIFY Project Structure

Below is an overview of the STRATIFY repository's directory structure to help contributors navigate the project.

```text
strata-ai/
├── README.md               # Main project documentation
├── PROJECT_STRUCTURE.md    # This file
├── CONTRIBUTING.md         # Contribution guidelines
├── CODE_OF_CONDUCT.md      # Rules for participation
├── LICENSE                 # MIT License details
├── .gitignore              # Combined Git ignores for Python & Node
├── backend/                # FastAPI Python Backend
│   ├── .env.example        # Template for backend environment variables
│   ├── requirements.txt    # Python dependencies
│   ├── app/
│   │   ├── main.py         # Application entry point
│   │   ├── api/            # API endpoints & routers
│   │   ├── core/           # Core configurations, security, models
│   │   ├── db/             # Database connection logic (MongoDB)
│   │   ├── models/         # Pydantic models & db schemas
│   │   └── services/       # Business logic (AI calls, forecasting, etc.)
│   └── tests/              # Backend test suite
├── frontend/               # React & TypeScript Frontend (Planned/Current)
│   ├── package.json        # Node dependencies and scripts
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   ├── public/             # Static assets (images, fonts, favicons)
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Application views/routes
│       ├── hooks/          # Custom React hooks
│       ├── utils/          # Helper functions
│       ├── services/       # API client functions
│       ├── types/          # TypeScript definitions
│       └── App.tsx         # Main application component
└── scripts/                # Utility scripts for deployment & maintenance
```

## Key Areas
*   **Backend (`/backend`)**: Built with FastAPI. Contains models for user profiles and financial records, endpoints for AI interactions (Groq), and logic for the intelligent runway calculations.
*   **Frontend (`/frontend`)**: Built with React, TypeScript, and styled with Tailwind CSS. Houses the interactive User Interface, Dashboard, and Scenario Simulator components.
