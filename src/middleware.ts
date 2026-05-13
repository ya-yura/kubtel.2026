import { defineMiddleware } from "astro:middleware";
import { getLegacyBusinessRedirect } from "@lib/redirects/business-legacy";

export const onRequest = defineMiddleware((context, next) => {
  const target = getLegacyBusinessRedirect(context.url.pathname);

  if (!target) {
    return next();
  }

  const redirectUrl = new URL(target, context.url);
  redirectUrl.search = context.url.search;

  return context.redirect(redirectUrl.pathname + redirectUrl.search, 301);
});
