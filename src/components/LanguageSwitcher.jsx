import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-all duration-300 active:scale-95 cursor-pointer font-medium text-sm border border-gray-200"
      title={i18n.language === "en" ? "বাংলায় পরিবর্তন করুন" : "Switch to English"}
    >
      {i18n.language === "en" ? "BN" : "EN"}
    </button>
  );
};

export default LanguageSwitcher;
