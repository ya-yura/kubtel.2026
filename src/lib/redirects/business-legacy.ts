const legacyBusinessRedirects: Record<string, string> = {
  "/legal/": "/business/",
  "/legal/smallbusiness/inet/": "/business/internet/",
  "/legal/smallbusiness/tel/": "/business/telephony/",
  "/legal/smallbusiness/cctv/": "/business/cctv/",
  "/legal/smallbusiness/wifi/": "/business/wifi-auth/",
  "/legal/smallbusiness/datac/vserver/": "/business/vps/",
  "/legal/smallbusiness/datac/vdi/": "/business/vdi/",
  "/legal/smallbusiness/datac/colocation/": "/business/colocation/",
  "/legal/smallbusiness/datac/admission/": "/business/datacenter-access/",
  "/legal/operators/": "/business/operators/",
  "/legal/govsector/": "/business/government/"
};

export function getLegacyBusinessRedirect(pathname: string): string | null {
  return legacyBusinessRedirects[normalizeLegacyPathname(pathname)] ?? null;
}

function normalizeLegacyPathname(pathname: string): string {
  if (pathname.endsWith("/")) {
    return pathname;
  }

  return `${pathname}/`;
}
