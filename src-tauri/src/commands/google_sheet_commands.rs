use crate::models::{InvoiceItem, ListInvoiceItems};
use crate::services::google_sheet_service;
use tauri::command;

#[command]
pub async fn init_google_sheet_command(json_path: String) -> bool {
    google_sheet_service::init_google_sheet(&json_path).await
}

#[command]
pub async fn get_invoices() -> Result<Vec<ListInvoiceItems>, String> {
    let r = google_sheet_service::get_invoices()
        .await
        .map_err(|e| e.to_string());
    r
}
