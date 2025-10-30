use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex;

use crate::services::BachHoaXanhService;

#[derive(Default)]
pub struct AppState {
    pub bhx_service: Arc<Mutex<BachHoaXanhService>>,
}
