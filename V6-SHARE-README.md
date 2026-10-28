# V6.0.1 分享整合測試版（未定稿）

- 只上傳至 `poker-ledger-v6-test` 測試 Repository，不得覆蓋 V5.0.1 正式版。
- 主頁的牌局列表按「建立分享網址」，建立後按「查看分享網址」複製給玩家。
- 玩家透過 `viewer.html?token=...` 唯讀查看，15 秒輪詢，亦可手動更新。
- 每次本機儲存後延遲 1 秒嘗試同步；離線時本機記帳仍可使用，但同步不保證成功，需恢復網路後再修改或重新整理以觸發同步。
- 每個分享的 admin_token 僅保存在建立者裝置 localStorage，絕對不要傳給玩家；清除網站資料或更換手機可能失去管理權。
- 目前只測試單一管理裝置，409 版本衝突會停止覆寫；尚未完成離線佇列、跨裝置管理者接手及完整安全驗收。
- 資料格式以 `ledger_data.session` 封裝單場牌局，必須確認 Edge Function 對資料格式無額外限制。
- 分享連結屬持有即可讀取的秘密，請勿公開張貼。


## V6.0.2 JWT authentication fix
Before uploading to GitHub, edit `config.js` and replace `PASTE_LEGACY_ANON_PUBLIC_JWT_HERE` with the full **Legacy anon / public JWT** from Supabase Dashboard > Project Settings > API Keys > Legacy anon, service_role API keys. This JWT is designed to be public, but **NEVER** put service_role, secret, admin_token, or JWT signing secret here. Both share-write and share-read now send `apikey` and `Authorization: Bearer <anon JWT>`. Keep Edge Function Verify JWT enabled. If JWT missing, UI displays a configuration error. Update the entire ZIP root to the test repository; this is NOT for production V5.0.1.
