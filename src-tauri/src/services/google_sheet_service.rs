use crate::helpers::parse_vietnamese_number;
use crate::models::{
    InvoiceExcel, InvoiceItem, ListInvoiceItems, ResponseCommand, SheetInfo, SheetStats,
    Spreadsheet, UpdateSheetInfo,
};
use anyhow::anyhow;
use chrono::NaiveDate;
use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::cmp::Reverse;
use std::collections::HashMap;
use std::fs;
use std::string::ToString;
use std::time::{SystemTime, UNIX_EPOCH};

pub struct GoogleSheetsService {
    pub client: Client,
    pub access_token: String,
}

#[derive(Deserialize, Debug)]
struct ServiceAccount {
    client_email: String,
    private_key: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TokenResponse {
    access_token: String,
    expires_in: i64,
    token_type: String,
}

#[derive(Serialize)]
struct Claims<'a> {
    iss: &'a str,
    scope: &'a str,
    aud: &'a str,
    exp: usize,
    iat: usize,
}

impl GoogleSheetsService {
    const BASE_API: &'static str = "https://sheets.googleapis.com/v4/spreadsheets";
    const SCOPE: &'static str = "https://www.googleapis.com/auth/spreadsheets";
    const AUD_URL: &'static str = "https://oauth2.googleapis.com/token";

    pub fn new() -> Self {
        Self {
            client: Client::new(),
            access_token: String::new(),
        }
    }

    pub async fn init_google_service(
        &mut self,
        json_path: &str,
    ) -> anyhow::Result<Option<TokenResponse>> {
        let jwt = Self::get_jwt(json_path)?;
        let token = Self::get_token_response(&jwt).await?;

        let token = if let Some(token_value) = token {
            self.access_token = token_value.access_token.clone();
            Some(token_value)
        } else {
            return Err(anyhow!("Vui lòng đợi và thử lại trong vài giây"));
        };

        Ok(token)
    }

    pub async fn get_invoices(
        &mut self,
        sheet_name: String,
        spreadsheet_id: String,
    ) -> Result<Vec<ListInvoiceItems>, Box<dyn std::error::Error>> {
        // ----------- ĐỌC DỮ LIỆU -----------
        let range = format!("{}!A:D", urlencoding::encode(sheet_name.as_str()));
        let read_url = format!("{}/{}/values/{}", Self::BASE_API, spreadsheet_id, range);

        let res = self
            .client
            .get(read_url)
            .bearer_auth(self.access_token.as_str())
            .send()
            .await?
            .json::<Value>()
            .await?;

        let grouped = Self::group_by_date(&res);
        Ok(grouped)
    }

    pub async fn get_sheet_stats(
        &mut self,
        sheet_name: String,
        spreadsheet_id: String,
    ) -> Result<SheetStats, Box<dyn std::error::Error>> {
        let range = format!("{}!E2:K2", urlencoding::encode(sheet_name.as_str()));
        let read_url = format!("{}/{}/values/{}", Self::BASE_API, spreadsheet_id, range);

        let resp = self
            .client
            .get(&read_url)
            .bearer_auth(self.access_token.as_str())
            .send()
            .await?
            .json::<Value>()
            .await?;

        let values = resp["values"][0]
            .as_array()
            .ok_or("Không tìm thấy dữ liệu trong Google Sheet")?;

        let stats = SheetStats {
            used_cash: parse_vietnamese_number(&values[0].as_str().unwrap_or("0")).unwrap_or(0.0),
            used_bank: parse_vietnamese_number(&values[1].as_str().unwrap_or("0")).unwrap_or(0.0),
            total_cash: parse_vietnamese_number(&values[2].as_str().unwrap_or("0")).unwrap_or(0.0),
            total_bank: parse_vietnamese_number(&values[3].as_str().unwrap_or("0")).unwrap_or(0.0),
            remaining_cash: parse_vietnamese_number(&values[4].as_str().unwrap_or("0"))
                .unwrap_or(0.0),
            remaining_bank: parse_vietnamese_number(&values[5].as_str().unwrap_or("0"))
                .unwrap_or(0.0),
            total_remaining: parse_vietnamese_number(&values[6].as_str().unwrap_or("0"))
                .unwrap_or(0.0),
        };
        Ok(stats)
    }

    pub async fn set_invoices(
        &mut self,
        sheet_name: String,
        spreadsheet_id: String,
        items: Vec<InvoiceExcel>,
    ) -> Result<ResponseCommand, Box<dyn std::error::Error>> {
        // ----------- GHI DỮ LIỆU -----------
        let write_range = format!("{}!A:D", urlencoding::encode(sheet_name.as_str()));
        let write_url = format!(
            "{}/{}/values/{}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS",
            Self::BASE_API,
            spreadsheet_id,
            write_range
        );

        let values: Vec<Vec<Value>> = items
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

        _ = self
            .client
            .post(&write_url) // ✅ POST + :append = append thêm dòng
            .bearer_auth(self.access_token.as_str())
            .json(&body)
            .send()
            .await?
            .json::<Value>()
            .await?;

        let response_command: ResponseCommand = ResponseCommand {
            message: "Ghi dữ liệu thành công!".to_string(),
            title: "Success".to_string(),
            is_success: true,
        };
        Ok(response_command)
    }

    pub async fn list_sheets(
        &mut self,
        spreadsheet_id: String,
    ) -> Result<Vec<SheetInfo>, Box<dyn std::error::Error>> {
        let url = format!(
            "{}/{}?fields=sheets.properties(sheetId,title)",
            Self::BASE_API,
            spreadsheet_id
        );

        let resp = self
            .client
            .get(&url)
            .bearer_auth(&self.access_token.as_str())
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

    pub async fn update_sheet_name(
        &mut self,
        request: UpdateSheetInfo,
        spreadsheet_id: String,
    ) -> anyhow::Result<Option<bool>> {
        // JSON body để đổi tên sheet
        let body = json!({
            "requests": [
                {
                    "updateSheetProperties": {
                        "properties": {
                            "sheetId": request.sheet_id,
                            "title": request.title
                        },
                        "fields": "title"
                    }
                }
            ]
        });

        let url = format!(
            "https://sheets.googleapis.com/v4/spreadsheets/{}:batchUpdate",
            spreadsheet_id
        );

        let res = self
            .client
            .post(&url)
            .bearer_auth(self.access_token.as_str())
            .json(&body)
            .send()
            .await?;

        Ok(Some(res.status().is_success()))
    }

    /* private methods */

    fn get_jwt(json_path: &str) -> anyhow::Result<String> {
        // Đọc file service_account.json
        let data = fs::read_to_string(json_path)?; // file json được tải ở bước trước trong google console
        let json: ServiceAccount = serde_json::from_str(&data)?;

        // hoặc khởi tạo trực tiếp mà không cần load file json
        // let json = ServiceAccount {
        //     client_email: "billinsight@billinsight.iam.gserviceaccount.com".to_string(),
        //     private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC/zBb37askdccq\nH83cFmVOhNauYixV7UFLks28H1x7CQypw9ZhdbONwVFr5++3vMynsId/E898A1VD\nWVXjjQE5pP2IPrO7CtvNYTLzNHwRgwLbS1NonRiHKoMJEWF3V9BNP7chcYtvd9cl\nJgln0EKK4gQ4j0NHLFPrKcYW7+T7bFSmo0ewxUNyFB+eSYB3xB9UVUvudsy3DC4D\nlpeD6paur+OlZZ1HPAz+Cp/nhDk6qSa7Cvbkt+umDzWahAySgFUJ2CNKPlzCl4Hz\n/BK80ZWOcE5w9cNi9zLs7ydrgoqfdhK0v7MwnkD/6ols9tBLa+oXi/o2xOoqFJRf\nQdxeMnwZAgMBAAECggEAStVUHt8mF982Wsq29Qjt9RFie/7FAq/D+rsoN57a5Ax3\nWuOUyUj1yjjjzmDcCMoK5eC8NUpi+aWJRnJcTyEMmdO0skyYrsGBWmRyzy6qu+Bs\npGiC/j3RPKfLIaYc68Yg+YsDJnLZbyAImy94mv9If0zJTdIj82ipw4b0ia2HH8uK\ndslLmC6uGfyEM+dWysmVX9DDnud5Tgd7+It1e7wqlZW8Fkm8YigvWBl60R2o4gyx\nxqNqmJXzvajGm+Gj6PVvg7rlazekHIUOnG5wGkM6AMGlKAVpaExgRobyQYIIE68J\nQoaa2urBaRdjXWXSL6Ck2vQAX2rdGtWg3xNPoGNnwwKBgQD1hE4pmhQKRaJllRRO\n37Eu/QBe3Kkssx/QTpZITKodNhxQmiFHfQyvtNfwDFQAZ+UPSNyiLN3HVPgXIZlj\n7DY2Qc3fQ+UmPj7aibPZMTf3ny0rCIZg8wD4T7hDQ99L1FwBYZEGsPyI+l9GQFQQ\nr5+bz315YVwUuFtRjbooAEAtNwKBgQDH/JYeXoMlvAslh9fiXdFuhcYcs+dxViUp\nV2YoEZti1RhKZSMj4Nr/RlYiNP9Ba8569RW8OPC9WNQ9QZhrza+8063thiPg0lWh\nEWYy8NGDgRvdKlPtuIM5x3S0Yp9uFzkxsQ1FgnlQYj4p+4MkJmO0lqDtwUTY2ebB\nofA87WbJLwKBgDvm+gMger8+2i6avwe3gE2MoSiEAirL0XlLk1M0kVTrPOFVmcUN\nd6jvILiK6Xvn3XVrO5m+BKZ7zsQmCHzexyNZztcog6JfEYrUijL11UfvaF/VhqPk\n5lmvaa/PwY2I1KHpoi7Vw+fP3qsPSvN/RhwH9f9Fh+fuSymMwNy9ourlAoGBAK0s\nThnyIYKVeNmA7jI4p1gbQtgr+OgtfnR0GCPuSy2j9SrGtU0mMr0GfSOV3MsbvWq/\nu5iHff+YYgDBQmlnbRwH+P5LP9o4iKm21VabLfG/5Q74zkB1nDx2ONrS49eDCKW8\n+Q8N0lsHF2lnP8IX9BK2tJfs2d8loSpfPhakRHNFAoGBAMAAVCv26gSPZNn8X4D/\nQx28Cdz2nhul75RdQ4JnGBKEc2OrwlxLiZgBIlen4lK4u2iILOTFfcz072SYQJTi\nOON31ihd+bJ7XUxatsHPHYP370n72Jn24mXwIaKAtqMg2hbV0laL3/t7Iomb6wv7\ndHfPlk2T7q9HP/0TvbryWdlW\n-----END PRIVATE KEY-----\n".to_string(),
        // };

        let now = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();
        let exp = now + 3600; // 1h

        let claims = Claims {
            iss: &json.client_email,
            scope: Self::SCOPE,
            aud: Self::AUD_URL,
            exp: exp as usize,
            iat: now as usize,
        };

        let key = EncodingKey::from_rsa_pem(json.private_key.as_bytes())?;
        let jwt = encode(&Header::new(Algorithm::RS256), &claims, &key)?;
        Ok(jwt)
    }

    async fn get_token_response(jwt: &str) -> anyhow::Result<Option<TokenResponse>> {
        let client = Client::new();

        let params = [
            ("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer"),
            ("assertion", jwt),
        ];

        let res = client
            .post(Self::AUD_URL)
            .form(&params)
            .send()
            .await?
            .error_for_status()?;

        let token: TokenResponse = res.json().await?;
        Ok(Some(token))
    }

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

        result.sort_by_key(|item| {
            let d = NaiveDate::parse_from_str(item.date.trim(), "%d/%m/%Y")
                .unwrap_or_else(|_| NaiveDate::from_ymd_opt(0, 1, 1).unwrap());
            Reverse(d)
        });

        result
    }
}
