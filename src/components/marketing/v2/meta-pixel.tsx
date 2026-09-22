import Script from "next/script";
import { metaPixelId } from "@/lib/site";

// Meta Pixel opcional con el snippet oficial. Sin NEXT_PUBLIC_META_PIXEL_ID (o con un valor que no
// sea un ID numérico) no se renderiza nada: cero requests a facebook.net. La variable se lee en el
// build (la landing es estática): cambiarla en Vercel exige redesplegar.
export function MetaPixel() {
  const id = metaPixelId();
  if (!id) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`}
    </Script>
  );
}
