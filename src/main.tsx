import { createRoot } from "react-dom/client";
import App from "./App";
// Fonts are bundled (not loaded from Google) so the app and the offline file work without internet.
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/manrope/latin-800.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<App />);
