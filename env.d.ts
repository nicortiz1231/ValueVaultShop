/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  /**
   * Project-specific environment variables, on top of the ones Hydrogen
   * declares itself.
   */
  interface Env {
    /**
     * Where the /pages/contact form posts its messages, as JSON.
     *
     * TODO(steven): point this at a real inbox service (Shopify Forms,
     * Formspree, Web3Forms, or a small Worker) before launch. Unset, the form
     * falls back to opening the shopper's mail client — which works, but adds
     * a step and loses anyone without a configured mail app.
     */
    CONTACT_FORM_ENDPOINT?: string;
  }
}
