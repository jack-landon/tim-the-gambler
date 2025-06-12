import { chromium } from "@playwright/test";
type PolymarketOrderSlipProperties = {
  title: string;
  imageUrl: string;
  betAmount: string;
  toWinAmount: string;
  avgPrice: string;
  outcome: string;
};

function polymarketOrderSlipHtml({
  title,
  imageUrl,
  betAmount,
  toWinAmount,
  avgPrice,
  outcome,
}: PolymarketOrderSlipProperties) {
  return `
    <div class="relative flex items-center justify-center">
    <img src="https://polymarket.com/images/share-card-background-combined.png" class="absolute inset-0" />
    <div class="z-10 mt-180px">
        <div class="flex flex-col items-center">
        <div class="w-85percent">
            <div class="rounded-xl bg-white p-8">
            <div class="mb-8 flex items-center">
                <img
                src=${imageUrl}
                class="mr-12 h-30 w-30 rounded-lg object-cover"
                />
                <p class="text-5xl font-semibold leading-relaxed">${title}</p>
            </div>
            <div class="mb-2 flex items-center justify-between">
                <div class="">
                    <p class="rounded ${
                      ["down", "no"].includes(outcome.toLowerCase())
                        ? "bg-red-100 text-red-400"
                        : "bg-green-100 text-green-500"
                    } px-3 py-3 text-5xl font-semibold">${outcome}</p>
                </div>
                <div class="">
                    <p class="text-gray-500 text-5xl">Avg ${avgPrice}</p>
                </div>
            </div>

            <div class="flex items-center">
                <svg width="100%" height="2" viewBox="0 0 600 2" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="-8.74228e-08" y1="1.00006" x2="1129" y2="0.999962" stroke="#BDBDBD" stroke-width="2" stroke-dasharray="24 16"></line></svg>
                <img src="https://polymarket.com/images/share-card-polymarket-gray-logo.png" class="mx-3 h-30 w-30" />
                <svg width="100%" height="2" viewBox="0 0 600 2" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="-8.74228e-08" y1="1.00006" x2="1129" y2="0.999962" stroke="#BDBDBD" stroke-width="2" stroke-dasharray="24 16"></line></svg>
            </div>

            <div class="mt-3 flex items-center justify-between">
                <div class="">
                <p class="mb-4 text-4xl text-gray-500">Bet</p>
                <p class="text-5xl font-semibold">${betAmount}</p>
                </div>
                <div class="">
                <p class="mb-4 text-right text-4xl text-gray-500">To win</p>
                <p class="text-5xl font-semibold text-green-500">${toWinAmount}</p>
                </div>
            </div>
            </div>
            <img src="https://polymarket.com/images/share-card-ticket-cut.png" class="-mt-2 bg-transparent" />
        </div>
        </div>
    </div>
    </div>
    `;
}

function polymarketOrderSlipCss() {
  return `
    /*! tailwindcss v4.1.8 | MIT License | https://tailwindcss.com */
    @layer properties;
    @layer theme, base, components, utilities;
    @layer theme {
      :root, :host {
        --font-sans: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
        'Noto Color Emoji';
        --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
        monospace;
        --color-red-100: oklch(93.6% 0.032 17.717);
        --color-red-400: oklch(70.4% 0.191 22.216);
        --color-green-100: oklch(96.2% 0.044 156.743);
        --color-green-500: oklch(72.3% 0.219 149.579);
        --color-gray-500: oklch(55.1% 0.027 264.364);
        --color-white: #fff;
        --spacing: 0.25rem;
        --text-lg: 1.125rem;
        --text-lg--line-height: calc(1.75 / 1.125);
        --text-xl: 1.25rem;
        --text-xl--line-height: calc(1.75 / 1.25);
        --text-2xl: 1.5rem;
        --text-2xl--line-height: calc(1.75 / 1.5);
        --text-3xl: 1.875rem;
        --text-3xl--line-height: calc(1.75 / 1.875);
        --text-4xl: 2.25rem;
        --text-4xl--line-height: calc(1.75 / 2.25);
        --text-5xl: 3rem;
        --text-5xl--line-height: calc(1.75 / 3);
        --text-6xl: 3.75rem;
        --text-6xl--line-height: calc(1.75 / 3.75);
        --text-7xl: 4.5rem;
        --text-7xl--line-height: calc(1.75 / 4.5);
        --font-weight-semibold: 600;
        --leading-relaxed: 1.5;
        --leading-loose: 2;
        --radius-sm: 0.25rem;
        --radius-lg: 0.5rem;
        --radius-2xl: 1rem;
        --default-font-family: var(--font-sans);
        --default-mono-font-family: var(--font-mono);
      }
    }
    @layer base {
      *, ::after, ::before, ::backdrop, ::file-selector-button {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: 0 solid;
      }
      html, :host {
        line-height: 1.5;
        -webkit-text-size-adjust: 100%;
        tab-size: 4;
        font-family: var(--default-font-family, ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji');
        font-feature-settings: var(--default-font-feature-settings, normal);
        font-variation-settings: var(--default-font-variation-settings, normal);
        -webkit-tap-highlight-color: transparent;
      }
      hr {
        height: 0;
        color: inherit;
        border-top-width: 1px;
      }
      abbr:where([title]) {
        -webkit-text-decoration: underline dotted;
        text-decoration: underline dotted;
      }
      h1, h2, h3, h4, h5, h6 {
        font-size: inherit;
        font-weight: inherit;
      }
      a {
        color: inherit;
        -webkit-text-decoration: inherit;
        text-decoration: inherit;
      }
      b, strong {
        font-weight: bolder;
      }
      code, kbd, samp, pre {
        font-family: var(--default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace);
        font-feature-settings: var(--default-mono-font-feature-settings, normal);
        font-variation-settings: var(--default-mono-font-variation-settings, normal);
        font-size: 1em;
      }
      small {
        font-size: 80%;
      }
      sub, sup {
        font-size: 75%;
        line-height: 0;
        position: relative;
        vertical-align: baseline;
      }
      sub {
        bottom: -0.25em;
      }
      sup {
        top: -0.5em;
      }
      table {
        text-indent: 0;
        border-color: inherit;
        border-collapse: collapse;
      }
      :-moz-focusring {
        outline: auto;
      }
      progress {
        vertical-align: baseline;
      }
      summary {
        display: list-item;
      }
      ol, ul, menu {
        list-style: none;
      }
      img, svg, video, canvas, audio, iframe, embed, object {
        display: block;
        vertical-align: middle;
      }
      img, video {
        max-width: 100%;
        height: auto;
      }
      button, input, select, optgroup, textarea, ::file-selector-button {
        font: inherit;
        font-feature-settings: inherit;
        font-variation-settings: inherit;
        letter-spacing: inherit;
        color: inherit;
        border-radius: 0;
        background-color: transparent;
        opacity: 1;
      }
      :where(select:is([multiple], [size])) optgroup {
        font-weight: bolder;
      }
      :where(select:is([multiple], [size])) optgroup option {
        padding-inline-start: 20px;
      }
      ::file-selector-button {
        margin-inline-end: 4px;
      }
      ::placeholder {
        opacity: 1;
      }
      @supports (not (-webkit-appearance: -apple-pay-button)) or (contain-intrinsic-size: 1px) {
        ::placeholder {
          color: currentcolor;
          @supports (color: color-mix(in lab, red, red)) {
            color: color-mix(in oklab, currentcolor 50%, transparent);
          }
        }
      }
      textarea {
        resize: vertical;
      }
      ::-webkit-search-decoration {
        -webkit-appearance: none;
      }
      ::-webkit-date-and-time-value {
        min-height: 1lh;
        text-align: inherit;
      }
      ::-webkit-datetime-edit {
        display: inline-flex;
      }
      ::-webkit-datetime-edit-fields-wrapper {
        padding: 0;
      }
      ::-webkit-datetime-edit, ::-webkit-datetime-edit-year-field, ::-webkit-datetime-edit-month-field, ::-webkit-datetime-edit-day-field, ::-webkit-datetime-edit-hour-field, ::-webkit-datetime-edit-minute-field, ::-webkit-datetime-edit-second-field, ::-webkit-datetime-edit-millisecond-field, ::-webkit-datetime-edit-meridiem-field {
        padding-block: 0;
      }
      :-moz-ui-invalid {
        box-shadow: none;
      }
      button, input:where([type='button'], [type='reset'], [type='submit']), ::file-selector-button {
        appearance: button;
      }
      ::-webkit-inner-spin-button, ::-webkit-outer-spin-button {
        height: auto;
      }
      [hidden]:where(:not([hidden='until-found'])) {
        display: none!important;
      }
    }
    @layer utilities {
      .absolute {
        position: absolute;
      }
      .relative {
        position: relative;
      }
      .inset-0 {
        inset: calc(var(--spacing) * 0);
      }
      .z-10 {
        z-index: 10;
      }
      .mx-3 {
        margin-inline: calc(var(--spacing) * 3);
      }
      .-mt-2 {
        margin-top: calc(var(--spacing) * -2);
      }
      .mt-3 {
        margin-top: calc(var(--spacing) * 3);
      }
      .mt-4 {
        margin-top: calc(var(--spacing) * 4);
      }
      .mt-180px {
        margin-top: 180px;
      }
      .mt-200px {
        margin-top: 200px;
      }
      .mt-210px {
        margin-top: 210px;
      }
      .mr-4 {
        margin-right: calc(var(--spacing) * 4);
      }
      .mr-8 {
        margin-right: calc(var(--spacing) * 8);
      }
      .mr-12 {
        margin-right: calc(var(--spacing) * 12);
      }
      .-mb-1 {
        margin-bottom: calc(var(--spacing) * -1);
      }
      .mb-1 {
        margin-bottom: calc(var(--spacing) * 1);
      }
      .mb-2 {
        margin-bottom: calc(var(--spacing) * 2);
      }
      .mb-3 {
        margin-bottom: calc(var(--spacing) * 3);
      }
      .mb-4 {
        margin-bottom: calc(var(--spacing) * 4);
      }
      .mb-6 {
        margin-bottom: calc(var(--spacing) * 6);
      }
      .mb-8 {
        margin-bottom: calc(var(--spacing) * 8);
      }
      .mb-10 {
        margin-bottom: calc(var(--spacing) * 10);
      }
      .mb-12 {
        margin-bottom: calc(var(--spacing) * 12);
      }
      .mb-18 {
        margin-bottom: calc(var(--spacing) * 18);
      }
      .mb-24 {
        margin-bottom: calc(var(--spacing) * 24);
      }
      .flex {
        display: flex;
      }
      .h-10 {
        height: calc(var(--spacing) * 10);
      }
      .h-20 {
        height: calc(var(--spacing) * 20);
      }
      .h-30 {
        height: calc(var(--spacing) * 30);
      }
      .h-40 {
        height: calc(var(--spacing) * 40);
      }
      .h-50 {
        height: calc(var(--spacing) * 50);
      }
      .h-490px {
        height: 490px;
      }
      .w-10 {
        width: calc(var(--spacing) * 10);
      }
      .w-20 {
        width: calc(var(--spacing) * 20);
      }
      .w-30 {
        width: calc(var(--spacing) * 30);
      }
      .w-40 {
        width: calc(var(--spacing) * 40);
      }
      .w-50 {
        width: calc(var(--spacing) * 50);
      }
      .w-85percent {
        width: 85%;
      }
      .flex-col {
        flex-direction: column;
      }
      .items-center {
        align-items: center;
      }
      .justify-between {
        justify-content: space-between;
      }
      .justify-center {
        justify-content: center;
      }
      .rounded {
        border-radius: 0.25rem;
      }
      .rounded-lg {
        border-radius: 0.5rem;
      }
      .rounded-xl {
        border-radius: 0.75rem;
      }
      .rounded-2xl {
        border-radius: 1rem;
      }
      .rounded-sm {
        border-radius: var(--radius-sm);
      }
      .bg-green-100 {
        background-color: var(--color-green-100);
      }
      .bg-red-100 {
        background-color: var(--color-red-100);
      }
      .bg-transparent {
        background-color: transparent;
      }
      .bg-white {
        background-color: var(--color-white);
      }
      .p-6 {
        padding: calc(var(--spacing) * 6);
      }
      .p-8 {
        padding: calc(var(--spacing) * 8);
      }
      .p-10 {
        padding: calc(var(--spacing) * 10);
      }
      .px-3 {
        padding-inline: calc(var(--spacing) * 3);
      }
      .py-1 {
        padding-block: calc(var(--spacing) * 1);
      }
      .py-2 {
        padding-block: calc(var(--spacing) * 2);
      }
      .py-3 {
        padding-block: calc(var(--spacing) * 3);
      }
      .text-right {
        text-align: right;
      }
      .text-lg {
        font-size: var(--text-lg);
        line-height: var(--tw-leading, var(--text-lg--line-height));
      }
      .text-xl {
        font-size: var(--text-xl);
        line-height: var(--tw-leading, var(--text-xl--line-height));
      }
      .text-2xl {
        font-size: var(--text-2xl);
        line-height: var(--tw-leading, var(--text-2xl--line-height));
      }
      .text-3xl {
        font-size: var(--text-3xl);
        line-height: var(--tw-leading, var(--text-3xl--line-height));
      }
      .text-4xl {
          font-size: var(--text-4xl);
          line-height: var(--tw-leading, var(--text-4xl--line-height));
      }
      .text-5xl {
          font-size: var(--text-5xl);
          line-height: var(--tw-leading, var(--text-5xl--line-height));
      }
      .text-6xl {
          font-size: var(--text-6xl);
          line-height: var(--tw-leading, var(--text-6xl--line-height));
      }
      .font-semibold {
        --tw-font-weight: var(--font-weight-semibold);
        font-weight: var(--font-weight-semibold);
      }
      .leading-relaxed {
        --tw-leading: var(--leading-relaxed);
        line-height: var(--leading-relaxed);
      }
      .leading-loose {
        --tw-leading: var(--leading-loose);
        line-height: var(--leading-loose);
      }
      .text-gray-500 {
        color: var(--color-gray-500);
      }
      .text-green-400 {
        color: var(--color-green-400);
      }
      .text-green-500 {
        color: var(--color-green-500);
      }
      .text-red-400 {
        color: var(--color-red-400);
      }
      .object-cover {
        object-fit: cover;
      }
    }
    @property --tw-font-weight {
      syntax: "*";
      inherits: false;
    }
    @layer properties {
      @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))) {
        *, ::before, ::after, ::backdrop {
          --tw-font-weight: initial;
        }
      }
    }
    `;
}

export async function generatePolymarketBetImage(
  orderProps: PolymarketOrderSlipProperties
) {
  console.log("Generating Polymarket order slip image...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(polymarketOrderSlipHtml(orderProps));
  await page.addStyleTag({ content: polymarketOrderSlipCss() });

  await page.waitForLoadState("networkidle");
  const image = await page.screenshot({ path: "output.png" });
  await browser.close();

  console.log("Finished generating Polymarket order slip image.");

  return image;
}
