CREATE CHANGEFEED INTO 'webhook-https://remix-interactive-demo.fly.dev/resources/crl-cdc-webhook?insecure_tls_skip_verify=true' AS
SELECT
  emoji,
  dropped_by,
  uaDeviceVendor,
  uaDeviceModel
FROM emoji_drops;