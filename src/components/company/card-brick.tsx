"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Card Brick do Mercado Pago genérico. Os campos (número, validade, CVV, nome)
 * são iframes hospedados pelo MP — o `nexus` só recebe o `token` gerado aqui no
 * browser, nunca o cartão em si. O consumidor decide o que fazer com o token
 * (`onToken`): salvar o cartão de comissão, criar a assinatura da plataforma, etc.
 */
export function CardBrick({
  publicKey,
  containerId,
  submitLabel = "Salvar cartão",
  onToken,
}: {
  publicKey: string;
  containerId: string;
  submitLabel?: string;
  onToken: (token: string) => Promise<unknown>;
}) {
  const [sdkReady, setSdkReady] = useState(
    typeof window !== "undefined" && !!window.MercadoPago
  );
  const [brickReady, setBrickReady] = useState(false);
  const controllerRef = useRef<MPBrickController | null>(null);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useEffect(() => {
    if (!sdkReady || !publicKey || !window.MercadoPago) return;
    let cancelled = false;

    const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
    mp.bricks()
      .create("cardPayment", containerId, {
        initialization: { amount: 1 },
        customization: {
          visual: { texts: { formSubmit: submitLabel } },
          paymentMethods: { maxInstallments: 1 },
        },
        callbacks: {
          onReady: () => {
            if (!cancelled) setBrickReady(true);
          },
          onError: (error) => {
            console.error("MP Brick error", error);
          },
          onSubmit: (formData) =>
            new Promise<void>((resolve, reject) => {
              onTokenRef
                .current(formData.token)
                .then(() => resolve())
                .catch((e) => reject(e));
            }),
        },
      })
      .then((controller) => {
        controllerRef.current = controller;
      })
      .catch((e) => console.error("MP Brick create failed", e));

    return () => {
      cancelled = true;
      controllerRef.current?.unmount();
      controllerRef.current = null;
    };
  }, [sdkReady, publicKey, containerId, submitLabel]);

  return (
    <>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() => toast.error("Falha ao carregar o SDK do Mercado Pago.")}
      />
      {!brickReady && <Skeleton className="h-64 w-full" />}
      <div id={containerId} />
    </>
  );
}
