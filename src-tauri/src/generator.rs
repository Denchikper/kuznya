// Кузня — генератор паролей
// by Benovich · https://github.com/Denchikper/password_generator

use rand::rngs::OsRng;
use rand::seq::SliceRandom;
use rand::Rng;
use serde::Deserialize;

const LOWER: &str = "abcdefghijklmnopqrstuvwxyz";
const UPPER: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS: &str = "0123456789";
const SYMBOLS: &str = "!@#$%^&*()-_=+[]{};:,.<>?/~";
// Символы, которые легко перепутать на глаз: l/I/1, O/0, S/5, B/8.
const SIMILAR: &str = "lI1O0S5B8";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateOptions {
    pub length: usize,
    pub lower: bool,
    pub upper: bool,
    pub digits: bool,
    pub symbols: bool,
    pub exclude_similar: bool,
}

/// Генерирует пароль криптостойким RNG операционной системы (OsRng).
/// Гарантирует хотя бы один символ из каждого включённого набора,
/// затем перемешивает результат, чтобы позиции были непредсказуемы.
#[tauri::command]
pub fn generate_password(opts: GenerateOptions) -> Result<String, String> {
    let length = opts.length.clamp(4, 128);

    let filter = |set: &str| -> Vec<char> {
        set.chars()
            .filter(|c| !opts.exclude_similar || !SIMILAR.contains(*c))
            .collect()
    };

    let mut pools: Vec<Vec<char>> = Vec::new();
    if opts.lower {
        pools.push(filter(LOWER));
    }
    if opts.upper {
        pools.push(filter(UPPER));
    }
    if opts.digits {
        pools.push(filter(DIGITS));
    }
    if opts.symbols {
        pools.push(filter(SYMBOLS));
    }
    pools.retain(|p| !p.is_empty());

    if pools.is_empty() {
        return Err("Выберите хотя бы один набор символов".into());
    }
    if pools.len() > length {
        return Err("Длина меньше числа выбранных наборов".into());
    }

    let alphabet: Vec<char> = pools.iter().flatten().copied().collect();
    let mut rng = OsRng;
    let mut password: Vec<char> = Vec::with_capacity(length);

    // По одному символу из каждого набора — чтобы все выбранные категории
    // точно присутствовали в результате.
    for pool in &pools {
        password.push(pool[rng.gen_range(0..pool.len())]);
    }
    // Остальное — равномерно из общего алфавита.
    while password.len() < length {
        password.push(alphabet[rng.gen_range(0..alphabet.len())]);
    }

    password.shuffle(&mut rng);
    Ok(password.into_iter().collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn opts(length: usize) -> GenerateOptions {
        GenerateOptions {
            length,
            lower: true,
            upper: true,
            digits: true,
            symbols: true,
            exclude_similar: false,
        }
    }

    #[test]
    fn respects_length() {
        let p = generate_password(opts(16)).unwrap();
        assert_eq!(p.chars().count(), 16);
    }

    #[test]
    fn contains_every_enabled_set() {
        let p = generate_password(opts(8)).unwrap();
        assert!(p.chars().any(|c| LOWER.contains(c)));
        assert!(p.chars().any(|c| UPPER.contains(c)));
        assert!(p.chars().any(|c| DIGITS.contains(c)));
        assert!(p.chars().any(|c| SYMBOLS.contains(c)));
    }

    #[test]
    fn excludes_similar_chars() {
        let mut o = opts(64);
        o.exclude_similar = true;
        let p = generate_password(o).unwrap();
        assert!(!p.chars().any(|c| SIMILAR.contains(c)));
    }

    #[test]
    fn rejects_empty_selection() {
        let o = GenerateOptions {
            length: 16,
            lower: false,
            upper: false,
            digits: false,
            symbols: false,
            exclude_similar: false,
        };
        assert!(generate_password(o).is_err());
    }
}
