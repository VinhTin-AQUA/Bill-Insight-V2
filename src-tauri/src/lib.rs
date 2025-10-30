use std::sync::Arc;

mod commands;
mod helpers;
mod models;
mod services;

use commands::*;
use services::{BachHoaXanhService};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Khởi tạo service
    let service = Arc::new(BachHoaXanhService::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .manage(service)
        .invoke_handler(tauri::generate_handler![
            init_google_sheet_command,
            get_invoices,
            get_sheet_stats,
            get_captcha_and_asp_session,
            get_xml_invoice_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
