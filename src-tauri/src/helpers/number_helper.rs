pub fn parse_vietnamese_number(input: &str) -> Option<f32> {
    // Bước 1: loại bỏ ký tự không cần thiết (chữ, khoảng trắng, ký hiệu tiền)
    let cleaned = input
        .chars()
        .filter(|c| c.is_digit(10) || *c == '.' || *c == ',')
        .collect::<String>();

    // Bước 2: thay dấu . (phân tách nghìn) bằng rỗng
    // và thay dấu , (phân tách thập phân) bằng .
    let normalized = cleaned.replace('.', "").replace(',', ".");

    // Bước 3: parse sang f64
    normalized.parse::<f32>().ok()
}