import 'tailwindcss/tailwind.css';
import './styles.css';
import { Web3Provider } from 'lib/web3';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Head from 'next/head';
import NProgress from 'nprogress';
import Router from "next/router";
import canUseDom from 'can-use-dom';
import favicon from 'lib/assets/favicon.png';

dayjs.extend(localizedFormat);

function App({ Component, pageProps }) {
  return (
    <Web3Provider>
      <Head>
        <title>justArt Market</title>

        <link rel="icon" type="image/png" href={favicon.src} />
      </Head>
      <Component {...pageProps} />
      <ToastContainer />
    </Web3Provider>
  )
}

export default App;

if (canUseDom) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start();
  });

  Router.events.on('routeChangeComplete', () => {
    NProgress.done();
  });

  Router.events.on('routeChangeError', () => {
    NProgress.done();
  });
}