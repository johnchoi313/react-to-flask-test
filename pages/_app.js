import '../styles/globals.css'
import UnityWebPage from "./UnityWebProject"

function MyApp({ Component, pageProps }) {
  return <div><Component {...pageProps} />      <UnityWebPage />
  </div>
}

export default MyApp
