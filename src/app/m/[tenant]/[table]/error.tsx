"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CartaNotice } from "@/components/carta/unavailable";
import { unavailableCopy } from "@/lib/i18n/dictionaries";

// La base no respondió al cargar la carta (S12): un aviso con reintento, nunca el texto del error.
export default function MenuError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const { es, en } = unavailableCopy;
  // El error vino del servidor: sin `router.refresh()` el reintento repite el mismo resultado.
  const retry = () =>
    start(() => {
      router.refresh();
      reset();
    });

  return (
    <CartaNotice icon="x" title={[es.loadTitle, en.loadTitle]} body={[es.loadBody, en.loadBody]}>
      <Button onClick={retry} pending={pending} pendingText={`${es.retry}…`}>
        {es.retry} <span lang="en" className="opacity-80">· {en.retry}</span>
      </Button>
    </CartaNotice>
  );
}
