"use client";

/**
 * Loads Google Analytics 4, Google Tag Manager, and/or Google Ads.
 * Google Ads gtag is loaded whenever NEXT_PUBLIC_GOOGLE_ADS_ID is set (so it appears in page source for Diagnostics).
 * Enhanced conversions: enable in Google Ads (Goals → Settings); we send user_data via gtag('set','user_data',...) before conversion events.
 */
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export function Analytics() {
  const useGtag = (GA_ID || ADS_ID) && !GTM_ID;
  const gtagSrcId = GA_ID || ADS_ID || "";

  return (
    <>
      {/* Google Tag Manager (when used – add GA4/Ads inside GTM if you prefer) */}
      {GTM_ID && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="GTM"
            />
          </noscript>
        </>
      )}

      {/* Single gtag for GA4 + Google Ads when NOT using GTM */}
      {useGtag && gtagSrcId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagSrcId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${GA_ID ? `gtag('config', '${GA_ID}', { send_page_view: true });` : ""}
              ${ADS_ID ? `gtag('config', '${ADS_ID}');` : ""}
            `}
          </Script>
        </>
      )}

      {/* Google Ads tag: always inject when ADS_ID is set (e.g. if GTM is used but Ads not in GTM, or to guarantee tag in source for Diagnostics) */}
      {ADS_ID && !useGtag && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-ads-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ADS_ID}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
