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