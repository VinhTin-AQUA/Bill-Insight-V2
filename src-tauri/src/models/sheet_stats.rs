use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SheetStats {
    pub used_cash: String,
    pub used_bank: String,
    pub total_cash: String,
    pub total_bank: String,
    pub remaining_cash: String,
    pub remaining_bank: String,
    pub total_remaining: String,
}

#[derive(Deserialize, Debug)]
pub struct Spreadsheet {
    pub sheets: Vec<Sheet>,
}

#[derive(Deserialize, Debug)]
pub struct Sheet {
    pub properties: SheetProperties,
}

#[derive(Deserialize, Debug)]
pub struct SheetProperties {
    #[serde(rename = "sheetId")]
    pub sheet_id: i64,  // ánh xạ với "sheetId" trong JSON
    pub title: String,
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SheetInfo {
    pub sheet_id: i64,
    pub title: String,
}