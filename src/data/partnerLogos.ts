import bcpLogo from "../assets/partner_logos/LogoBCP1.png";
import interbankLogo from "../assets/partner_logos/Logo-Interbank.avif";
import scotiaLogo from "../assets/partner_logos/EmpresasParticipantes_Scotiabank.webp";
import pagoEfectivoLogo from "../assets/partner_logos/logo-pagoefectivo-compress.png";

export const partnerLogos = [
  { src: bcpLogo, alt: "BCP" },
  { src: interbankLogo, alt: "Interbank" },
  { src: scotiaLogo, alt: "Scotiabank" },
  { src: pagoEfectivoLogo, alt: "PagoEfectivo" },
] as const;
