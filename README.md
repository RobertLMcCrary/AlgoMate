# Project Structure

## Pages
Located in `src/app/`:

### Main Pages
- `src/app/page.js` - Home page with features and quick access
- `/pricing` - Pricing page with Free and Pro plan options
- `/problems` - Problems list page with interactive filters
- `/problems/[id]` - Dynamic problem page for coding challenges

### Components
Located in various page files:
- `FeatureCard` - Displays features with icon and description
- `QuickAccessCard` - Clickable card with title and description
- `StatCard` - Displays statistics with title, value, and description
- `PricingCard` - Shows pricing plan details

## API Endpoints
Located in `src/app/api/`:

### Code Execution
- `POST /api/submit`
  - Handles code submission and testing
  - Uses Judge0 API for code execution
  - Supports JavaScript and Python
  - Rate limited, requires RAPIDAPI_KEY

### AI Assistant
- `POST /api/chat`
  - Provides AI assistance using Hugging Face's model
  - Requires HUGGINGFACE_API_KEY
  - Max duration: 30 seconds
  - Force dynamic routing enabled

## Path Configuration
The `jsconfig.json` shows that source files are aliased with `@/`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
