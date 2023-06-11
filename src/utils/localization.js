import en from '../localization/en.json';
import ru from '../localization/ru.json';
import uk from '../localization/uk.json';
const languages = { en, ru, uk };

export function translator(language) {
	return (key, ...replacers) => (languages[language?.split('-')[0]] ?? ru).replies[key].replace(/\{(.+?)\}/g, (m, k) => replacers[k] ?? m);
}