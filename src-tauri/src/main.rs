// Кузня — генератор паролей
// by Benovich · https://github.com/Denchikper/kuznya

// Не показывать консольное окно в релизных сборках под Windows.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    kuznya_lib::run()
}
