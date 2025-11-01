pub fn parse_vietnamese_number(input: &str) -> Option<f32> {
    // 39.200 đ -> 39200
    let cleaned = input
        .replace('.', "") // bỏ dấu chấm
        .replace("đ", "") // bỏ ký tự đ
        .replace(" ", ""); // bỏ khoảng trắng

    cleaned.parse::<f32>().ok()
}
