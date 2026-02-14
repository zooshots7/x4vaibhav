;; x402Metrics Provider Registry Contract
;; Tracks API providers and their payment statistics on Stacks blockchain

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-PROVIDER-EXISTS (err u101))
(define-constant ERR-PROVIDER-NOT-FOUND (err u102))
(define-constant ERR-INVALID-AMOUNT (err u103))

;; Contract owner
(define-data-var contract-owner principal tx-sender)

;; Provider counter
(define-data-var provider-counter uint u0)

;; Provider registry
(define-map providers
  { provider-id: uint }
  {
    address: principal,
    name: (string-ascii 64),
    endpoint-count: uint,
    total-revenue: uint,
    payment-count: uint,
    created-at: uint,
    active: bool
  }
)

;; Provider lookup by address
(define-map provider-addresses
  { address: principal }
  { provider-id: uint }
)

;; Payment events
(define-map payment-events
  { event-id: uint }
  {
    provider-id: uint,
    payer: principal,
    amount: uint,
    endpoint: (string-ascii 128),
    timestamp: uint,
    tx-hash: (string-ascii 66)
  }
)

(define-data-var event-counter uint u0)

;; Register a new provider
(define-public (register-provider (name (string-ascii 64)) (endpoint-count uint))
  (let
    (
      (new-id (+ (var-get provider-counter) u1))
      (existing (map-get? provider-addresses { address: tx-sender }))
    )
    (asserts! (is-none existing) ERR-PROVIDER-EXISTS)
    
    (map-set providers
      { provider-id: new-id }
      {
        address: tx-sender,
        name: name,
        endpoint-count: endpoint-count,
        total-revenue: u0,
        payment-count: u0,
        created-at: block-height,
        active: true
      }
    )
    
    (map-set provider-addresses
      { address: tx-sender }
      { provider-id: new-id }
    )
    
    (var-set provider-counter new-id)
    (ok new-id)
  )
)

;; Record a payment (only contract owner can call)
(define-public (record-payment 
  (provider-id uint) 
  (payer principal) 
  (amount uint) 
  (endpoint (string-ascii 128))
  (tx-hash (string-ascii 66))
)
  (let
    (
      (provider (unwrap! (map-get? providers { provider-id: provider-id }) ERR-PROVIDER-NOT-FOUND))
      (new-event-id (+ (var-get event-counter) u1))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; Update provider stats
    (map-set providers
      { provider-id: provider-id }
      (merge provider {
        total-revenue: (+ (get total-revenue provider) amount),
        payment-count: (+ (get payment-count provider) u1)
      })
    )
    
    ;; Record payment event
    (map-set payment-events
      { event-id: new-event-id }
      {
        provider-id: provider-id,
        payer: payer,
        amount: amount,
        endpoint: endpoint,
        timestamp: block-height,
        tx-hash: tx-hash
      }
    )
    
    (var-set event-counter new-event-id)
    (ok new-event-id)
  )
)

;; Get provider by ID
(define-read-only (get-provider (provider-id uint))
  (map-get? providers { provider-id: provider-id })
)

;; Get provider by address
(define-read-only (get-provider-by-address (address principal))
  (match (map-get? provider-addresses { address: address })
    lookup (map-get? providers { provider-id: (get provider-id lookup) })
    none
  )
)

;; Get payment event
(define-read-only (get-payment-event (event-id uint))
  (map-get? payment-events { event-id: event-id })
)

;; Get total providers
(define-read-only (get-provider-count)
  (ok (var-get provider-counter))
)

;; Get total payment events
(define-read-only (get-event-count)
  (ok (var-get event-counter))
)

;; Update provider status (owner only)
(define-public (set-provider-active (provider-id uint) (active bool))
  (let
    (
      (provider (unwrap! (map-get? providers { provider-id: provider-id }) ERR-PROVIDER-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    
    (map-set providers
      { provider-id: provider-id }
      (merge provider { active: active })
    )
    (ok true)
  )
)
