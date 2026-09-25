import type { Metadata } from "next";
import { pageSocial } from "@/lib/seo";
import { LegalPage, type LegalSection } from "@/components/marketing/v2/legal-page";
import { SITE, isPixelEnabled, whatsappDisplay } from "@/lib/site";
import { isTurnstileEnabled } from "@/lib/turnstile";
import { isContactFormEnabled } from "@/lib/contact";

const DESCRIPTION =
  "Qué datos recoge DataFud por el formulario, WhatsApp y el uso del servicio, para qué los usamos, con quién los compartimos y cómo ejercer tus derechos según la Ley 8968 de Costa Rica.";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: "/privacidad" },
  description: DESCRIPTION,
  ...pageSocial("/privacidad", "Política de privacidad · DataFud", DESCRIPTION),
};

// El píxel de Meta solo se menciona como activo si la variable existe en el build.
const pixel = isPixelEnabled();
const turnstile = isTurnstileEnabled();
const contactForm = isContactFormEnabled();

const sections: LegalSection[] = [
  {
    title: "Responsable",
    paragraphs: [
      `El responsable de tus datos es ${SITE.legalResponsible}, con domicilio en ${SITE.country}. Para cualquier consulta sobre privacidad escribinos por WhatsApp al ${whatsappDisplay()}.`,
    ],
  },
  {
    title: "Qué datos recogemos",
    paragraphs: ["Solo los necesarios para responderte y prestarte el servicio:"],
    bullets: [
      "Formulario de contacto de datafud.com (cuando está disponible): tu nombre, el nombre de tu local, un WhatsApp o teléfono, el tipo de negocio y, si lo escribís, un mensaje.",
      "WhatsApp: cuando nos escribís vemos tu número, tu nombre de perfil y la conversación. WhatsApp es un servicio de Meta Platforms con su propia política de privacidad.",
      "Correo electrónico: tu dirección y lo que nos escribas.",
      "Datos del servicio: si sos cliente, el contenido de tu carta (menú, fotos, logo), tu configuración y, en los planes con pedidos, los pedidos de tu local. Los comensales piden sin crear cuenta y no les pedimos datos personales.",
      "Métricas de la web: usamos Vercel Web Analytics, que cuenta visitas y clics (por ejemplo, cuántas veces se toca el botón de WhatsApp) de forma agregada, sin cookies y sin identificarte.",
      pixel
        ? "Píxel de Meta: usamos el píxel de Meta para medir nuestras campañas en Facebook e Instagram. Registra visitas y contactos desde esta página y usa cookies de Meta. Podés bloquearlo desde la configuración de tu navegador o de tu cuenta de Meta."
        : "Píxel de Meta: hoy no lo usamos. Si lo activamos para medir campañas en Facebook e Instagram, lo vas a ver explicado en esta sección.",
      "Enlaces con parámetros de campaña (utm): si llegás desde uno, guardamos en tu navegador, solo durante la visita, de qué campaña venís para contarla en las métricas.",
    ],
  },
  {
    title: "Para qué los usamos",
    paragraphs: ["Usamos los datos para:"],
    bullets: [
      "Responder tu consulta y prepararte una propuesta.",
      "Prestar el servicio contratado: montar tu carta, producir y entregar tu hardware, darte soporte y gestionar los pagos.",
      "Mejorar la página y el producto a partir de métricas agregadas.",
      "Cumplir obligaciones legales, contables y tributarias.",
    ],
  },
  {
    title: "Base legal",
    paragraphs: [
      `Tratamos tus datos con tu consentimiento (cuando nos escribís o enviás el formulario), para ejecutar el contrato (cuando sos cliente) y para cumplir obligaciones legales, conforme a la Ley N.º 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales de ${SITE.country} y su reglamento.`,
    ],
  },
  {
    title: "Con quién los compartimos",
    paragraphs: ["No vendemos ni alquilamos tus datos. Solo los procesan, para prestar el servicio, estos proveedores:"],
    bullets: [
      "Vercel Inc. (Estados Unidos): aloja datafud.com y procesa las métricas agregadas.",
      ...(contactForm ? ["Resend, Inc. (Estados Unidos): envía por correo los mensajes del formulario de contacto."] : []),
      ...(turnstile ? ["Cloudflare, Inc. (Estados Unidos): verifica con Turnstile que el formulario lo envía una persona y no un programa automático."] : []),
      pixel
        ? "Meta Platforms: WhatsApp, el canal que elegís para escribirnos, y el píxel de medición de campañas."
        : "Meta Platforms (WhatsApp): el canal de mensajería que elegís vos para escribirnos.",
      "Cuando se active el sistema completo para tu local, te decimos por escrito qué proveedor de base de datos guarda tu carta y tus pedidos, y en qué región.",
    ],
  },
  {
    title: "Cuánto tiempo los guardamos",
    paragraphs: [
      "Los datos de contacto de quien no llega a ser cliente se guardan mientras sigan siendo útiles para responderle, y los borramos antes si nos lo pedís. Los de clientes, mientras dure la relación y, después, el tiempo que exijan las obligaciones legales y contables.",
      "Si dejás de ser cliente, te entregamos tu carta en un archivo y luego borramos tus datos de nuestros sistemas activos.",
    ],
  },
  {
    title: "Tus derechos",
    paragraphs: [
      `Podés pedirnos en cualquier momento acceder a tus datos, corregirlos (rectificación) o borrarlos (supresión), además de oponerte a un uso concreto o retirar tu consentimiento. Escribinos por WhatsApp al ${whatsappDisplay()} y te respondemos dentro del plazo que fija la ley. También podés acudir a la Agencia de Protección de Datos de los Habitantes (PRODHAB).`,
    ],
  },
  {
    title: "Seguridad",
    paragraphs: [
      "Protegemos tus datos con medidas razonables: comunicaciones cifradas (HTTPS), acceso restringido y proveedores con estándares de seguridad reconocidos. Ningún sistema es infalible; si ocurriera un incidente que afecte tus datos, te lo comunicamos.",
    ],
  },
  {
    title: "Menores de edad",
    paragraphs: [
      "El servicio está dirigido a negocios. No recogemos a sabiendas datos de menores de edad; si creés que un menor nos envió información, avisanos y la borramos.",
    ],
  },
  {
    title: "Cambios a esta política",
    paragraphs: [
      "Si cambiamos esta política, publicamos la nueva versión en esta página con su fecha y, si el cambio es relevante para clientes activos, lo avisamos por WhatsApp.",
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Política de privacidad"
      intro="Recogemos pocos datos y los usamos para una sola cosa: atenderte. Acá te explicamos cuáles son, por qué los pedimos y cómo podés controlarlos."
      sections={sections}
      sibling={{ href: "/terminos", label: "Términos del servicio" }}
    />
  );
}
