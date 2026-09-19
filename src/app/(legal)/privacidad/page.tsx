import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/v2/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad — DataFud",
  description:
    "Qué datos recoge DataFud a través del formulario de contacto, WhatsApp y el uso del servicio, para qué los usamos, con quién los compartimos y cómo ejercer tus derechos.",
};

const sections: LegalSection[] = [
  {
    title: "Responsable del tratamiento",
    paragraphs: [
      `El responsable de tus datos es ${SITE.legalName} [REVISAR: razón social completa], [REVISAR: cédula jurídica o física], con domicilio en [REVISAR: domicilio], ${SITE.country}. Para cualquier consulta sobre privacidad escribinos a ${SITE.email}.`,
    ],
  },
  {
    title: "Qué datos recogemos y cómo",
    paragraphs: ["Recogemos únicamente los datos necesarios para responderte y prestar el servicio:"],
    bullets: [
      "Formulario de contacto de datafud.com: tu nombre, el nombre de tu local, un WhatsApp o teléfono, el tipo de negocio y, si lo escribís, un mensaje.",
      "WhatsApp: cuando nos escribís, vemos tu número, tu nombre de perfil y el contenido de la conversación. WhatsApp es un servicio de Meta Platforms y tiene su propia política de privacidad.",
      "Correo electrónico: tu dirección y lo que nos escribas.",
      "Datos del servicio: si sos cliente, el contenido de tu carta (menú, fotos, logo), tu configuración y, en los planes con pedidos, los pedidos que se registren en tu local. Los comensales piden sin crear cuenta y no les pedimos datos personales.",
      "Métricas de uso de la web: usamos herramientas de analítica agregada que no identifican a la persona (por ejemplo, cuántas visitas recibe la página o cuántas veces se toca el botón de WhatsApp) y no colocamos cookies de seguimiento publicitario.",
    ],
  },
  {
    title: "Para qué usamos tus datos",
    paragraphs: ["Usamos los datos para:"],
    bullets: [
      "Responder tu consulta y prepararte una propuesta.",
      "Prestar el servicio contratado: montar tu carta, producir tu hardware, dar soporte y gestionar los cobros.",
      "Mejorar la página y el producto a partir de métricas agregadas.",
      "Cumplir obligaciones legales, contables y fiscales.",
    ],
  },
  {
    title: "Base legal",
    paragraphs: [
      `Tratamos tus datos con base en tu consentimiento (cuando nos escribís o enviás el formulario), en la ejecución del contrato (cuando sos cliente) y en nuestras obligaciones legales, conforme a la Ley N.º 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales de ${SITE.country} y su reglamento [REVISAR: confirmar con asesoría legal el registro de bases de datos ante PRODHAB, si aplica].`,
    ],
  },
  {
    title: "Con quién compartimos los datos",
    paragraphs: ["No vendemos ni alquilamos tus datos. Los comparten con nosotros, solo para prestar el servicio, estos proveedores:"],
    bullets: [
      "Vercel Inc. (Estados Unidos): aloja datafud.com y procesa las métricas agregadas de uso.",
      "Resend, Inc. (Estados Unidos): envía por correo los mensajes del formulario de contacto.",
      "Meta Platforms (WhatsApp): canal de mensajería que elegís vos para contactarnos.",
      "Cuando el sistema completo esté activo para tu local, el proveedor de base de datos que usemos para almacenar tu carta y tus pedidos [REVISAR: nombre del proveedor y región al activarlo].",
    ],
  },
  {
    title: "Cuánto tiempo los conservamos",
    paragraphs: [
      "Los datos de contacto de personas que no llegan a ser clientes se conservan hasta [REVISAR: 12] meses desde el último contacto. Los datos de clientes se conservan mientras dure la relación y, después, el tiempo que exijan las obligaciones legales y contables.",
      "Si dejás de ser cliente, te entregamos tu carta y tus datos en un archivo y luego los eliminamos de nuestros sistemas activos.",
    ],
  },
  {
    title: "Tus derechos",
    paragraphs: [
      `Podés pedirnos en cualquier momento acceso a tus datos, corregirlos, eliminarlos, oponerte a un uso concreto o retirar tu consentimiento. Escribinos a ${SITE.email} o por WhatsApp y te respondemos en un plazo máximo de [REVISAR: 10] días hábiles. También podés presentar una queja ante la Agencia de Protección de Datos de los Habitantes (PRODHAB).`,
    ],
  },
  {
    title: "Seguridad",
    paragraphs: [
      "Protegemos tus datos con medidas razonables: comunicaciones cifradas (HTTPS), acceso restringido a la información y proveedores con estándares de seguridad reconocidos. Ningún sistema es infalible; si ocurriera un incidente que afecte tus datos, te lo comunicaríamos.",
    ],
  },
  {
    title: "Menores de edad",
    paragraphs: [
      "Nuestros servicios están dirigidos a negocios. No recogemos a sabiendas datos de menores de edad; si creés que un menor nos envió información, avisanos y la eliminaremos.",
    ],
  },
  {
    title: "Cambios a esta política",
    paragraphs: [
      "Si cambiamos esta política, publicaremos la nueva versión en esta página con su fecha de actualización y, si el cambio es relevante para clientes activos, lo avisaremos por WhatsApp o correo.",
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
