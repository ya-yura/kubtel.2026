const legacyBusinessRedirects: Record<string, string> = {
  "/legal/": "/business/",
  "/legal/smallbusiness/inet/": "/business/request/?service=internet",
  "/legal/smallbusiness/tel/": "/business/?calculator=telephony#business-calculators",
  "/legal/smallbusiness/cctv/": "/business/?calculator=cctv#business-calculators",
  "/legal/smallbusiness/wifi/": "/business/?calculator=wifi-auth#business-calculators",
  "/legal/smallbusiness/datac/vserver/": "/business/?calculator=vps#business-calculators",
  "/legal/smallbusiness/datac/vdi/": "/business/?calculator=vdi#business-calculators",
  "/legal/smallbusiness/datac/colocation/": "/business/?calculator=colocation#business-calculators",
  "/legal/smallbusiness/datac/admission/": "/business/request/?service=datacenter-access",
  "/legal/operators/": "/business/operators/",
  "/legal/govsector/": "/business/government/",
  "/business/internet/": "/business/request/?service=internet",
  "/business/static-ip/": "/business/request/?service=static-ip",
  "/business/telephony/": "/business/?calculator=telephony#business-calculators",
  "/business/cctv/": "/business/?calculator=cctv#business-calculators",
  "/business/wifi-auth/": "/business/?calculator=wifi-auth#business-calculators",
  "/business/vps/": "/business/?calculator=vps#business-calculators",
  "/business/vdi/": "/business/?calculator=vdi#business-calculators",
  "/business/colocation/": "/business/?calculator=colocation#business-calculators",
  "/business/datacenter-access/": "/business/request/?service=datacenter-access"
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
