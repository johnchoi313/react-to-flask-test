import "../styles/globals.css";

import UnityWebPage from "./UnityWebProject";

function MyApp({ Component, pageProps }) {
  // return <div><Component {...pageProps} />      <UnityWebPage />
  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
