use std::sync::Arc;

use crate::models::{CookieModel};
use crate::services::{BachHoaXanhService};
use tauri::{State, command};

#[command]
pub async fn get_captcha_and_asp_session(
    state: State<'_, Arc<BachHoaXanhService>>,
) -> Result<Option<CookieModel>, String> {
    state
        .get_captcha_and_asp_session()
        .await
        .map_err(|e| e.to_string())
}