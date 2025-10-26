use tauri::command;
use crate::services::{google_sheet_service};

#[command]
pub async fn init_google_sheet_command(json_path: String) -> bool {
    google_sheet_service::init_google_sheet(&json_path).await
}
