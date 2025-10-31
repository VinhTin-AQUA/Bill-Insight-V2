use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseCommand {
    pub title: String,
    pub description: String,
    pub is_success: bool
}
