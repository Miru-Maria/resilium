import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <ScrollViewStyleReset />
        {/* Feather icon font — explicitly loaded for web rendering path */}
        <style>{`
          @font-face {
            font-family: "Feather";
            src: url("https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.2.0/Fonts/Feather.ttf") format("truetype");
            font-display: block;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
