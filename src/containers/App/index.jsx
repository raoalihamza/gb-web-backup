import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import { PersistGate } from "redux-persist/integration/react";
import TranslationProvider from "../../shared/providers/TranslationProvider";

import withAnalytics from "./Analytics";
import Router from "./Router";
import persistor, { store } from "../../redux/store";
import ScrollToTop from "./ScrollToTop";
import { config as i18nextConfig } from "../../translations";
import AuthProvider from "../../shared/providers/AuthProvider";

i18next.init(i18nextConfig);

function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <BrowserRouter basename="/">
          <I18nextProvider i18n={i18next}>
            <ScrollToTop>
              <TranslationProvider>
                <AuthProvider>
                  <Router />
                </AuthProvider>
              </TranslationProvider>
            </ScrollToTop>
          </I18nextProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default withAnalytics(App);
