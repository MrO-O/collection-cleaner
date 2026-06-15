# Startup

Windows users can double-click `start-dev.cmd` from the project root.

The script:

- changes into the project directory
- checks that `npm` is available
- runs `npm install` if `node_modules` is missing
- starts Vite at `http://127.0.0.1:5173/`
- opens the local URL in the default browser

Keep the command window open while using the app. Close it to stop the dev server.
