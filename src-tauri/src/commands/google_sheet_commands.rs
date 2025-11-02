use std::ffi::CString;
use crate::models::{InvoiceExcel, ListInvoiceItems, ResponseCommand, SheetInfo, SheetStats};
use crate::services::google_sheet_service;
use tauri::command;

#[command]
pub async fn init_google_sheet_command(json_path: String) -> Result<Option<bool>, String> {
    let r = google_sheet_service::init_google_sheet(&json_path).await.map_err(|e| e.to_string());
    r
}

#[command]
pub async fn get_invoices(sheet_name: String, spreadsheet_id: String) -> Result<Vec<ListInvoiceItems>, String> {
    let r = google_sheet_service::get_invoices(sheet_name, spreadsheet_id)
        .await
        .map_err(|e| e.to_string());
    r
}

#[command]
pub async fn get_sheet_stats(sheet_name: String, spreadsheet_id: String) -> Result<SheetStats, String> {
    let r = google_sheet_service::get_sheet_stats(sheet_name, spreadsheet_id)
        .await
        .map_err(|e| e.to_string());
    r
}

#[command]
pub async fn set_invoices(sheet_name: String, spreadsheet_id: String, items: Vec<InvoiceExcel>) -> Result<ResponseCommand, String> {
    let r = google_sheet_service::set_invoices(sheet_name, spreadsheet_id, items)
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

