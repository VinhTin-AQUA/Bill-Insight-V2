use std::collections::HashMap;
use std::fs;
// use std::path::PathBuf;
use std::sync::Arc;

// use cookie_store::Cookie;
use reqwest::{Client};
use reqwest_cookie_store::{CookieStoreMutex, CookieStore};

use regex::Regex;
use quick_xml::Reader;
// use quick_xml::events::Event;
use tokio::io::AsyncWriteExt;

use crate::models::{CookieModel,NBan,HHDVu,TToan};

pub struct BachHoaXanhService {
    client: Client,
    api_url: String,
    cookie_store: Arc<CookieStoreMutex>,
}

impl BachHoaXanhService {
    pub fn new() -> Self {
        let cookie_store = Arc::new(CookieStoreMutex::new(CookieStore::default()));
        let client = Client::builder()
            .cookie_provider(cookie_store.clone())
            .build()
            .unwrap();

        Self {
            client,
            api_url: "https://hddt.bachhoaxanh.com".to_string(),
            cookie_store,
        }
    }

    pub async fn get_captcha_and_asp_session(&self) -> anyhow::Result<Option<CookieModel>> {
        let (sv_id, prefix) = self.get_prefix_and_svid().await?;
        if sv_id.is_none() || prefix.is_none() {
            return Ok(None);
        }

        let sv_id = sv_id.unwrap();
        let prefix = prefix.unwrap();

        let url = format!("{}/home/getcaptchaimage?prefix={}", self.api_url, prefix);
        let bytes = self.client.get(&url)
            .header("cookie", format!("SvID={}", sv_id))
            .send()
            .await?
            .bytes()
            .await?;

        let captcha_path = std::env::temp_dir().join(format!("{}.jpeg", uuid::Uuid::new_v4()));
        let mut file = tokio::fs::File::create(&captcha_path).await?;
        file.write_all(&bytes).await?;

        // Lấy cookie ASP.NET_SessionId
        let asp_session = {
            let store = self.cookie_store.lock().unwrap();
            // Sao chép cookie ra Vec để tránh lifetime issue
            let cookies: Vec<_> = store.iter_any().map(|c| c.clone()).collect();

            cookies
                .into_iter()
                .find(|c| c.name() == "ASP.NET_SessionId")
                .map(|c| c.value().to_string())
                .unwrap_or_default()
        };

        Ok(Some(CookieModel {
            sv_id,
            aspnet_session_id: asp_session,
            captcha_path: captcha_path.to_string_lossy().to_string(),
        }))
    }

    pub async fn send_api(
        &self,
        sv_id: &str,
        asp_session: &str,
        captcha: &str,
        phone: &str,
        invoice_num: &str,
    ) -> anyhow::Result<(String, String, String)> {
        let url = format!("{}/Home/ListInvoice", self.api_url);
        let body = format!("phone={}&invoiceNum={}&captcha={}", phone, invoice_num, captcha);

        let resp = self.client.post(&url)
            .header("cookie", format!("SvID={}; ASP.NET_SessionId={}", sv_id, asp_session))
            .header("x-requested-with", "XMLHttpRequest")
            .header("content-type", "application/x-www-form-urlencoded; charset=UTF-8")
            .body(body)
            .send()
            .await?
            .text()
            .await?;

        Ok(Self::get_urls(&resp)?)
    }

    pub async fn download_xml_file(&self, xml_url: &str) -> anyhow::Result<String> {
        let bytes = self.client.get(xml_url).send().await?.bytes().await?;
        let file_path = std::env::temp_dir().join(format!("{}.xml", uuid::Uuid::new_v4()));
        fs::write(&file_path, &bytes)?;
        Ok(file_path.to_string_lossy().to_string())
    }

    // ⚙️ Tối giản, chỉ đọc dữ liệu XML demo
    pub async fn parse_xml_data(&self, xml_path: &str) -> anyhow::Result<(NBan, Vec<HHDVu>, TToan)> {
        let content = fs::read_to_string(xml_path)?;
        let mut reader = Reader::from_str(&content);
        reader.trim_text(true);

        // ⚠️ Ở đây bạn có thể dùng `serde_xml_rs` hoặc `quick-xml` chi tiết hơn để parse XML thành struct
        // Mình chỉ đặt placeholder cho phần này vì XML hoá đơn có cấu trúc khá phức tạp
        let nban = NBan {
            ten: "Demo".to_string(),
            mst: "0123456789".to_string(),
            d_chi: "HCM".to_string(),
            sdt: "0900000000".to_string(),
            tt_khac: vec![],
        };

        Ok((nban, vec![], TToan {
            t_httl_t_suat: vec![],
            tg_tc_thue: 0.0,
            tg_t_thue: 0.0,
            tg_tt_tb_so: 0.0,
            tg_tt_tb_chu: "".to_string(),
            tt_khac: vec![],
        }))
    }

    async fn get_prefix_and_svid(&self) -> anyhow::Result<(Option<String>, Option<String>)> {
        let resp = self.client.get(&self.api_url).send().await?;
        let cookies = resp.cookies().map(|c| (c.name().to_string(), c.value().to_string())).collect::<HashMap<_, _>>();
        let svid = cookies.get("SvID").cloned();
        let html = resp.text().await?;

        let re = Regex::new(r#"<img\s+[^>]*src="/home/getcaptchaimage\?prefix=(\d+)""#)?;
        let prefix = re.captures(&html).map(|c| c[1].to_string());

        Ok((svid, prefix))
    }

    fn get_urls(html: &str) -> anyhow::Result<(String, String, String)> {
        let re = Regex::new(r#"<a[^>]*href="([^"]+)"[^>]*>\s*(XEM|Tải HĐ chuyển đổi|TẢI XML)\s*</a>"#)?;
        let mut urls = vec![];
        for cap in re.captures_iter(html) {
            urls.push(cap[1].to_string());
        }

        if urls.len() < 3 {
            anyhow::bail!("Không đủ link trong HTML");
        }

        Ok((urls[0].clone(), urls[1].clone(), urls[2].clone()))
    }
}
