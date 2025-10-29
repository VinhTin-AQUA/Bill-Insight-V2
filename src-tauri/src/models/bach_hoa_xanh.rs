use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CookieModel {
    pub sv_id: String,
    pub aspnet_session_id: String,
    pub captcha_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TTKhac {
    pub t_truong: String,
    pub k_d_lieu: String,
    pub d_lieu: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBan {
    pub ten: String,
    pub mst: String,
    pub d_chi: String,
    pub sdt: String,
    pub tt_khac: Vec<TTKhac>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HHDVu {
    pub mhhdvu: String,
    pub thhdvu: String,
    pub dv_tinh: String,
    pub sluong: i32,
    pub d_gia: f64,
    pub th_tien: f64,
    pub t_suat: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LTSuat {
    pub t_suat: String,
    pub th_tien: f64,
    pub t_thue: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TToan {
    pub t_httl_t_suat: Vec<LTSuat>,
    pub tg_tc_thue: f64,
    pub tg_t_thue: f64,
    pub tg_tt_tb_so: f64,
    pub tg_tt_tb_chu: String,
    pub tt_khac: Vec<TTKhac>,
}
