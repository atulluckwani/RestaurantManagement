# API Bruno Test Cases

This folder contains Bruno-compatible API tests for the RestaurantManagement app.

## Structure

- `Postive/` positive API scenarios.
- `Negative/` negative API scenarios.
- `environments/Local.bru` local environment variables.
- `bruno.json` Bruno collection metadata.

## Run From VS Code

1. Start the backend on port 3000.
2. Open Bruno extension in VS Code.
3. Open collection folder: `tests/API test cases`.
4. Select environment: `Local`.
5. Run `Postive` or `Negative` folder, or run all requests.

## Run From Bruno CLI

From workspace root:

```bash
bru run "tests/API test cases" --env Local
```