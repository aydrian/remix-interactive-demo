CREATE CHANGEFEED INTO 'webhook-https://localhost:3000/resources/emoji-drop?insecure_tls_skip_verify=true' AS
SELECT
  emoji,
  dropped_by "droppedBy",
  ua_device_vendor "uaDeviceVendor",
  ua_device_model "uaDeviceModel"
FROM emoji_drops;