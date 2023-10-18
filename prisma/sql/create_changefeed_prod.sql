CREATE CHANGEFEED INTO 'webhook-https://remix-interactive-demo.fly.dev/resources/emoji-drop?insecure_tls_skip_verify=true' AS
SELECT
  emoji,
  dropped_by "droppedBy",
  ua_device_vendor "uaDeviceVendor",
  ua_device_model "uaDeviceModel"
FROM emoji_drops;