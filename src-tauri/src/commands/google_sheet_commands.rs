use std::ffi::CString;
use crate::models::{InvoiceExcel, ListInvoiceItems, ResponseCommand, SheetInfo, SheetStats};
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

#[command]
pub async fn get_sheet_stats() -> Result<SheetStats, String> {
    let r = google_sheet_service::get_sheet_stats()
        .await
        .map_err(|e| e.to_string());
    r
}

#[command]
pub async fn set_invoices(items: Vec<InvoiceExcel>) -> Result<ResponseCommand, String> {
    let r = google_sheet_service::set_invoices(items)
        .await
        .map_err(|e| e.to_string());
    r
}

#[command]
pub async fn list_sheets(spreadsheet_id: String) -> Result<Vec<SheetInfo>, String> {
    let r = google_sheet_service::list_sheets(spreadsheet_id)
        .await
        .map_err(|e| e.to_string());
    r
}

