// CRA resolves `src/index.js` before `src/index.jsx` as the webpack entry.
// This shim keeps the app bootstrap in index.jsx while satisfying the entry lookup.
import "./index.jsx";
