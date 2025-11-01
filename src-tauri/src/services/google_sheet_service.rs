use crate::helpers::parse_vietnamese_number;
use crate::models::{InvoiceExcel, InvoiceItem, ListInvoiceItems, ResponseCommand, SheetInfo, SheetStats, Spreadsheet};
use reqwest::Client;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::OnceCell;
use yup_oauth2::{read_service_account_key, ServiceAccountAuthenticator};
use urlencoding::encode;

pub struct GoogleSheetsService {
    pub client: Client,
    pub access_token: String,
}

static GOOGLE_SHEETS_SERVICE: OnceCell<Arc<GoogleSheetsService>> = OnceCell::const_new();

pub async fn init_google_sheet(json_path: &str) -> bool {
    if GOOGLE_SHEETS_SERVICE.get().is_some() {
        return true;
    }

    let key = match read_service_account_key(json_path).await {
        Ok(k) => k,
        Err(e) => {
            return false;
        }
    };

    let auth = match ServiceAccountAuthenticator::builder(key).build().await {
        Ok(a) => a,
        Err(e) => {
            return false;
        }
    };

    let token = match auth
        .token(&["https://www.googleapis.com/auth/spreadsheets"])
        .await
    {
        Ok(token) => token,
        Err(e) => {
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
    let service = GoogleSheetsService {
        client,
        access_token: access_token.to_string(),
    };

    let check = GOOGLE_SHEETS_SERVICE.set(Arc::new(service)).is_ok();

    check
}

pub async fn get_invoices(sheet_name: String, spreadsheet_id: String) -> Result<Vec<ListInvoiceItems>, Box<dyn std::error::Error>> {
    let service = GOOGLE_SHEETS_SERVICE
        .get()
        .expect("GOOGLE_SHEETS_SERVICE not initialized");

    // ----------- 🟢 ĐỌC DỮ LIỆU -----------
    let range = format!("{}!A:D", encode(sheet_name.as_str()));
    let read_url = format!(
        "https://sheets.googleapis.com/v4/spreadsheets/{}/values/{}",
        spreadsheet_id, range
    );

    let read_resp = service
        .client
        .get(&read_url)
        .bearer_auth(service.access_token.as_str())
        .send()
        .await?
        .json::<serde_json::Value>()
        .await?;

    let grouped = group_by_date(&read_resp);
    Ok(grouped)
}

pub async fn get_sheet_stats(sheet_name: String, spreadsheet_id: String) -> Result<SheetStats, Box<dyn std::error::Error>> {
    let service = GOOGLE_SHEETS_SERVICE
        .get()
        .expect("GOOGLE_SHEETS_SERVICE not initialized");

    let range = format!("{}!E2:K2", encode(sheet_name.as_str()));
    let read_url = format!(
        "https://sheets.googleapis.com/v4/spreadsheets/{}/values/{}",
        spreadsheet_id, range
    );

    let resp = service.client
        .get(&read_url)
        .bearer_auth(service.access_token.as_str())
        .send()
        .await?
        .json::<serde_json::Value>()
        .await?;

    let values = resp["values"][0]
        .as_array()
        .ok_or("Không tìm thấy dữ liệu trong Google Sheet")?;

    let stats = SheetStats {
        used_cash: parse_vietnamese_number(&values[0].as_str().unwrap_or("0")).unwrap_or(0.0),
        used_bank: parse_vietnamese_number(&values[1].as_str().unwrap_or("0")).unwrap_or(0.0),
        total_cash: parse_vietnamese_number(&values[2].as_str().unwrap_or("0")).unwrap_or(0.0),
        total_bank: parse_vietnamese_number(&values[3].as_str().unwrap_or("0")).unwrap_or(0.0),
        remaining_cash: parse_vietnamese_number(&values[4].as_str().unwrap_or("0")).unwrap_or(0.0),
        remaining_bank: parse_vietnamese_number(&values[5].as_str().unwrap_or("0")).unwrap_or(0.0),
        total_remaining: parse_vietnamese_number(&values[6].as_str().unwrap_or("0")).unwrap_or(0.0),
    };
    Ok(stats)
}

pub async fn set_invoices(sheet_name: String, spreadsheet_id: String, items: Vec<InvoiceExcel>) -> Result<ResponseCommand, Box<dyn std::error::Error>> {
    let service = GOOGLE_SHEETS_SERVICE
        .get()
        .expect("GOOGLE_SHEETS_SERVICE not initialized");

    // ----------- 🟣 GHI DỮ LIỆU -----------
    let write_range = format!("{}!A:D", encode(sheet_name.as_str()));
    let write_url = format!(
        "https://sheets.googleapis.com/v4/spreadsheets/{}/values/{}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS",
        spreadsheet_id, write_range
    );

    let values: Vec<Vec<serde_json::Value>> = items
        .iter()
        .map(|i| {
            vec![
                json!(i.invoice_date),
                json!(i.name),
                json!(i.cash),
                json!(i.bank),
            ]
        })
        .collect();

    let body = json!({
    "majorDimension": "ROWS",
        "values": values
    });

    _ = service.client
        .post(&write_url) // ✅ POST + :append = append thêm dòng
        .bearer_auth(service.access_token.as_str())
        .json(&body)
        .send()
        .await?
        .json::<serde_json::Value>()
        .await?;

    let response_command: ResponseCommand = ResponseCommand {
        message: "Ghi dữ liệu thành công!".to_string(),
        title: "Success".to_string(),
        is_success: true
    };
    Ok(response_command)
}

pub async fn list_sheets(spreadsheet_id: String) -> Result<Vec<SheetInfo>, Box<dyn std::error::Error>> {
    let service = GOOGLE_SHEETS_SERVICE
        .get()
        .expect("GOOGLE_SHEETS_SERVICE not initialized");

    let url = format!(
        "https://sheets.googleapis.com/v4/spreadsheets/{}?fields=sheets.properties(sheetId,title)",
        spreadsheet_id
    );

    let resp = service
        .client
        .get(&url)
        .bearer_auth(&service.access_token)
        .send()
        .await?
        .error_for_status()?
        .json::<Spreadsheet>()
        .await?;

    let sheets = resp
        .sheets
        .into_iter()
        .map(|s| SheetInfo {
            sheet_id: s.properties.sheet_id,
            title: s.properties.title,
        })
        .collect();

    Ok(sheets)
}

/* private methods */

fn group_by_date(value: &Value) -> Vec<ListInvoiceItems> {
    let mut map: HashMap<String, Vec<InvoiceItem>> = HashMap::new();
    let mut current_date = String::new();

    // Lấy mảng "values" trong JSON
    let Some(values_array) = value.get("values").and_then(|v| v.as_array()) else {
        return vec![];
    };

    // Bỏ qua dòng tiêu đề
    for row_value in values_array.iter().skip(1) {
        let Some(row) = row_value.as_array() else {
            continue;
        };
        if row.len() < 4 {
            continue;
        }

        // Lấy dữ liệu từng cột
        let date = row[0].as_str().unwrap_or("-").trim();
        let name = row[1].as_str().unwrap_or("").trim().to_string();
        let cash_price = parse_vietnamese_number(row[2].as_str().unwrap_or("0")).unwrap_or(0.0);
        let bank_price = parse_vietnamese_number(row[3].as_str().unwrap_or("0")).unwrap_or(0.0);

        // Cập nhật ngày hiện tại nếu có giá trị
        if date != "-" && !date.is_empty() {
            current_date = date.to_string();
        }

        // Bỏ qua nếu chưa có ngày hợp lệ
        if current_date.is_empty() {
            continue;
        }

        // Tạo item và thêm vào nhóm theo ngày
        let item = InvoiceItem {
            name,
            cash_price,
            bank_price,
        };

        map.entry(current_date.clone()).or_default().push(item);
    }

    // Chuyển HashMap -> Vec<ListInvoiceItems>
    let mut result: Vec<ListInvoiceItems> = map
        .into_iter()
        .map(|(date, items)| ListInvoiceItems { date, items })
        .collect();

    // Sắp xếp theo ngày (nếu muốn)
    result.sort_by(|a, b| a.date.cmp(&b.date));

    result
}
