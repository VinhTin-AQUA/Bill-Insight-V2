use std::sync::Arc;
use yup_oauth2::{ServiceAccountAuthenticator, read_service_account_key};
use reqwest::Client;
use tokio::sync::OnceCell;

const SPREADSHEET_ID: &str = "1D4UeZBozLOjiIlhJ-YSuok-MqIJDCYicoI807K0tj1o"; // <-- Thay bằng ID sheet của bạn
const SHEET_NAME: &str = "Sheet2"; // <-- Thay bằng tên sheet nếu khác
const SHEET_PATH: &str = "/home/newtun/Desktop/Secrets/billinsight-0b2c14cec552.json";

pub struct GoogleSheetsService {
    pub client: Client,
    pub access_token: String,
}

static GOOGLE_SHEETS_SERVICE: OnceCell<Arc<GoogleSheetsService>> = OnceCell::const_new();

pub async fn init_google_sheet(json_path: &str) -> bool {
    if GOOGLE_SHEETS_SERVICE.get().is_some() {
        return true;
    }

    let key = match read_service_account_key(SHEET_PATH).await {
        Ok(k) => k,
        Err(e) => {
            eprintln!("Lỗi đọc file key: {:?}", e);
            return false;
        }
    };

    let auth = match ServiceAccountAuthenticator::builder(key).build().await {
        Ok(a) => a,
        Err(e) => {
            println!("{:?}", e.to_string());
            return false;
        }
    };

    let token = match auth.token(&["https://www.googleapis.com/auth/spreadsheets"]).await {
        Ok(token) => token,
        Err(e) => {
            println!("{:?}", e.to_string());
            return false;
        }
    };

    let token_opt = token.token();
    let has_token = token_opt.is_some();

    if !has_token {
       return false;
    }

    let access_token = token_opt.unwrap();
    let client = Client::new();
    let service = GoogleSheetsService { client ,access_token: access_token.to_string() };

    let check = GOOGLE_SHEETS_SERVICE.set(Arc::new(service)).is_ok();

    check
}
