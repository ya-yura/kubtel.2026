import { defineMiddleware } from "astro:middleware";
import { getLegacyBusinessRedirect } from "@lib/redirects/business-legacy";

export const onRequest = defineMiddleware((context, next) => {
  const target = getLegacyBusinessRedirect(context.url.pathname);

  if (!target) {
    return next();
  }

  const redirectUrl = new URL(target, context.url);
  const originalSearchParams = new URLSearchParams(context.url.search);

  originalSearchParams.forEach((value, key) => {
    if (!redirectUrl.searchParams.has(key)) {
      redirectUrl.searchParams.append(key, value);
    }
  });

  return context.redirect(`${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`, 301);
});
