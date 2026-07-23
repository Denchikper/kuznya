// Кузня — генератор паролей
// by Benovich · https://github.com/Denchikper/kuznya

mod generator;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![generator::generate_password])
        .run(tauri::generate_context!())
        .expect("ошибка запуска Кузни");
}
