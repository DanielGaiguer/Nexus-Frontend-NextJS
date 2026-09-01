/**
 * Tipagem mínima do SDK v2 do Mercado Pago (carregado via <Script> de
 * sdk.mercadopago.com/js/v2). Só o que o cadastro de cartão usa: o Brick de
 * cartão (`cardPayment`), que tokeniza o cartão no browser e devolve o `token`.
 */

interface MPBrickController {
  unmount: () => void;
}

interface MPCardPaymentFormData {
  token: string;
  payment_method_id?: string;
  issuer_id?: string;
  [key: string]: unknown;
}

interface MPBricksBuilder {
  create: (
    brick: "cardPayment",
    containerId: string,
    settings: {
      initialization: { amount: number };
      customization?: Record<string, unknown>;
      callbacks: {
        onReady?: () => void;
        onError?: (error: unknown) => void;
        onSubmit: (formData: MPCardPaymentFormData) => Promise<void>;
      };
    }
  ) => Promise<MPBrickController>;
}

interface MPInstance {
  bricks: () => MPBricksBuilder;
}

interface MercadoPagoConstructor {
  new (publicKey: string, options?: { locale?: string }): MPInstance;
}

interface Window {
  MercadoPago?: MercadoPagoConstructor;
}
