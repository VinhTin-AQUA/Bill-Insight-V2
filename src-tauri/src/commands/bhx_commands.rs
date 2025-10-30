use std::sync::Arc;

use crate::models::{CookieModel, HHDVu, NBan, ReadXmlDataResult, TToan};
use crate::services::{BachHoaXanhService};
use tauri::{State, command};

#[command]
pub async fn get_captcha_and_asp_session(
    state: State<'_, Arc<BachHoaXanhService>>, folder: String
) -> Result<Option<CookieModel>, String> {
    let r = state
        .get_captcha_and_asp_session(folder)
        .await
        .map_err(|e| e.to_string());

    r
}

#[command]
pub async fn get_xml_invoice_data(state: State<'_, Arc<BachHoaXanhService>>,
                      sv_id: &str,
                      asp_session: &str,
                      captcha: &str,
                      phone: &str,
                      invoice_num: &str,
                      folder: &str
) -> Result<Option<ReadXmlDataResult>, String> {
    let r = state
        .get_xml_invoice_data(sv_id, asp_session, captcha, phone, invoice_num, folder)
        .await
        .map_err(|e| e.to_string());
    r
}
