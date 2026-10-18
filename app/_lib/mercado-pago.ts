import { createHmac, timingSafeEqual } from 'node:crypto'

const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com'

interface CreatePixPaymentParams {
  bookingId: string
  serviceName: string
  amount: number
  expiresAt: Date
  payerEmail: string
}

interface MercadoPagoPixPayment {
  id: string
  status: string
  qrCode: string
  qrCodeBase64: string
  ticketUrl: string | null
}

interface MercadoPagoPayment {
  id: string
  status: string
  transaction_amount: number
  currency_id: string
  external_reference: string | null
  date_approved: string | null
}

const getAccessToken = () => {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error(
      'Configure MERCADO_PAGO_ACCESS_TOKEN no ambiente do servidor.'
    )
  }

  return accessToken
}

const getAppUrl = () => {
  const appUrl = process.env.APP_URL
  if (!appUrl) {
    throw new Error('Configure APP_URL no ambiente do servidor.')
  }

  try {
    const parsedUrl = new URL(appUrl)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error()
    }

    return parsedUrl.origin
  } catch {
    throw new Error('APP_URL deve ser uma URL válida.')
  }
}

const getResponseObject = async (response: Response) => {
  const body: unknown = await response.json()
  if (typeof body !== 'object' || body === null) {
    throw new Error('Resposta inválida recebida do Mercado Pago.')
  }

  return body as Record<string, unknown>
}

export const createMercadoPagoPixPayment = async ({
  bookingId,
  serviceName,
  amount,
  expiresAt,
  payerEmail,
}: CreatePixPaymentParams): Promise<MercadoPagoPixPayment> => {
  const appUrl = getAppUrl()
  const response = await fetch(`${MERCADO_PAGO_API_URL}/v1/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': bookingId,
    },
    body: JSON.stringify({
      transaction_amount: amount,
      description: serviceName,
      payment_method_id: 'pix',
      payer: { email: payerEmail },
      external_reference: bookingId,
      date_of_expiration: expiresAt.toISOString(),
      notification_url: `${appUrl}/api/mercadopago/webhook`,
    }),
  })
  const body = await getResponseObject(response)

  if (!response.ok) {
    const message =
      typeof body.message === 'string'
        ? body.message
        : 'Não foi possível criar o pagamento no Mercado Pago.'
    throw new Error(message)
  }

  if (
    (typeof body.id !== 'string' && typeof body.id !== 'number') ||
    typeof body.status !== 'string' ||
    typeof body.point_of_interaction !== 'object' ||
    body.point_of_interaction === null
  ) {
    throw new Error('O Mercado Pago retornou dados Pix inválidos.')
  }

  const pointOfInteraction = body.point_of_interaction
  if (
    typeof pointOfInteraction !== 'object' ||
    pointOfInteraction === null ||
    !('transaction_data' in pointOfInteraction) ||
    typeof pointOfInteraction.transaction_data !== 'object' ||
    pointOfInteraction.transaction_data === null
  ) {
    throw new Error('O Mercado Pago não retornou os dados do QR Pix.')
  }

  const transactionData = pointOfInteraction.transaction_data
  if (
    !('qr_code' in transactionData) ||
    !('qr_code_base64' in transactionData)
  ) {
    throw new Error('O Mercado Pago não retornou os dados do QR Pix.')
  }

  if (
    typeof transactionData.qr_code !== 'string' ||
    typeof transactionData.qr_code_base64 !== 'string'
  ) {
    throw new Error('O Mercado Pago não retornou o QR Pix.')
  }

  return {
    id: String(body.id),
    status: body.status,
    qrCode: transactionData.qr_code,
    qrCodeBase64: transactionData.qr_code_base64,
    ticketUrl:
      'ticket_url' in transactionData &&
      typeof transactionData.ticket_url === 'string'
        ? transactionData.ticket_url
        : null,
  }
}

export const getMercadoPagoPayment = async (
  paymentId: string
): Promise<MercadoPagoPayment> => {
  const response = await fetch(
    `${MERCADO_PAGO_API_URL}/v1/payments/${encodeURIComponent(paymentId)}`,
    { headers: { Authorization: `Bearer ${getAccessToken()}` } }
  )
  const body = await getResponseObject(response)

  if (!response.ok) {
    const message =
      typeof body.message === 'string'
        ? body.message
        : 'Não foi possível consultar o pagamento no Mercado Pago.'
    throw new Error(message)
  }

  if (
    (typeof body.id !== 'string' && typeof body.id !== 'number') ||
    typeof body.status !== 'string' ||
    typeof body.transaction_amount !== 'number' ||
    typeof body.currency_id !== 'string' ||
    (typeof body.external_reference !== 'string' &&
      body.external_reference !== null) ||
    (typeof body.date_approved !== 'string' && body.date_approved !== null)
  ) {
    throw new Error('O Mercado Pago retornou dados de pagamento inválidos.')
  }

  return {
    id: String(body.id),
    status: body.status,
    transaction_amount: body.transaction_amount,
    currency_id: body.currency_id,
    external_reference: body.external_reference,
    date_approved: body.date_approved,
  }
}

export const refundMercadoPagoPayment = async ({
  paymentId,
  bookingId,
}: {
  paymentId: string
  bookingId: string
}) => {
  const response = await fetch(
    `${MERCADO_PAGO_API_URL}/v1/payments/${encodeURIComponent(paymentId)}/refunds`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': bookingId,
      },
      body: JSON.stringify({}),
    }
  )

  if (!response.ok) {
    const body = await getResponseObject(response)
    const message =
      typeof body.message === 'string'
        ? body.message
        : 'Não foi possível solicitar o reembolso no Mercado Pago.'
    throw new Error(message)
  }
}

export const isValidMercadoPagoWebhookSignature = ({
  paymentId,
  requestId,
  signature,
}: {
  paymentId: string
  requestId: string
  signature: string
}) => {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
  if (!secret) {
    throw new Error(
      'Configure MERCADO_PAGO_WEBHOOK_SECRET no ambiente do servidor.'
    )
  }

  const signatureParts = Object.fromEntries(
    signature.split(',').map((part) => {
      const [key, value] = part.trim().split('=')
      return [key, value]
    })
  )
  const timestamp = signatureParts.ts
  const receivedSignature = signatureParts.v1
  if (
    !timestamp ||
    !receivedSignature ||
    !/^[\da-f]{64}$/i.test(receivedSignature)
  ) {
    return false
  }

  const manifest = `id:${paymentId.toLowerCase()};request-id:${requestId};ts:${timestamp};`
  const expectedSignature = createHmac('sha256', secret)
    .update(manifest)
    .digest()
  const actualSignature = Buffer.from(receivedSignature, 'hex')

  return (
    actualSignature.length === expectedSignature.length &&
    timingSafeEqual(actualSignature, expectedSignature)
  )
}
