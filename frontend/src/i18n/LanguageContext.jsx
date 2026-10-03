import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * LanguageContext.jsx
 *
 * A lightweight i18n setup: three languages (English / हिंदी / मराठी) and a
 * `t(key, fallback)` translator. No external dependency.
 */

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
];

const TRANSLATIONS = {
  en: {
    'app.title': 'Navi Mumbai Civic Router',
    'app.tagline': 'Describe any civic issue — we route it to the right authority.',
    'home.heading': 'How can we help?',
    'home.description': 'Tell us what is happening. We will identify the right department and prepare a complaint you can send.',
    'home.privacy': 'Your complaint is saved in this browser so you can return to the generated letter later.',
    'form.label': 'Describe the issue',
    'form.photoEvidence': 'Photo attached as evidence',
    'result.reportedIssue': 'Reported issue',
    'result.timelineEmpty': 'No timeline steps were provided.',
    'result.day': 'Day',
    'mine.localLabel': 'Saved on this device',
    'tabs.new': 'New Complaint',
    'tabs.mine': 'My Complaints',
    'form.placeholder': 'e.g. "drain overflowing near sector 4"',
    'form.attachPhoto': 'Attach Photo',
    'form.capture': 'Take Photo',
    'form.removePhoto': 'Remove',
    'form.voice': 'Voice Input',
    'form.listening': 'Listening…',
    'form.submit': 'Route My Complaint',
    'form.submitting': 'Finding the right department…',
    'form.hint': 'Works in English, हिंदी and मराठी. Photos & voice optional.',
    'result.categoryLabel': 'Category',
    'result.urgencyLabel': 'Urgency',
    'result.locationLabel': 'Location',
    'result.authorityLabel': 'Responsible authority',
    'result.callNow': 'Call Now',
    'result.openPortal': 'Open Portal',
    'result.copyLetter': 'Copy Letter',
    'result.copied': 'Copied!',
    'result.copyFailed': 'Copy failed',
    'result.letterTitle': 'Your complaint letter',
    'result.followupTitle': 'More information needed',
    'result.followupBody': 'Please reply with your sector / locality so we can route this correctly.',
    'result.trustedEmergency': 'Emergency helpline (Disaster Management)',
    'timeline.title': 'Escalation Timeline',
    'timeline.today': 'today',
    'timeline.downloadIcs': 'Add reminders to calendar (.ics)',
    'urgency.low': 'Low urgency',
    'urgency.medium': 'Medium urgency',
    'urgency.high': 'High urgency',
    'urgency.unknown': 'Urgency unknown',
    'demo.badge': 'Demo Mode',
    'demo.tip': 'Backend not reachable — showing a local demo response.',
    'error.title': 'Something went wrong',
    'error.retry': 'Try again',
    'error.short': 'Please describe the issue in at least 5 characters.',
    'mine.title': 'My Complaints',
    'mine.empty': 'No saved complaints yet. Your generated letters will appear here.',
    'mine.view': 'View',
    'mine.delete': 'Delete',
    'mine.savedOn': 'Saved',
    'common.clearAll': 'Clear all',
    'footer.disclaimer': 'Hackathon demo — verify phone numbers and portals before real use.',
  },
  hi: {
    'app.title': 'नवी मुंबई नागरिक राउटर',
    'app.tagline': 'कोई भी समस्या लिखें — हम उसे सही विभाग तक पहुँचाते हैं।',
    'home.heading': 'हम आपकी कैसे मदद कर सकते हैं?',
    'home.description': 'बताएं कि क्या समस्या है। हम सही विभाग पहचानकर भेजने के लिए शिकायत तैयार करेंगे।',
    'home.privacy': 'आपकी शिकायत इस ब्राउज़र में सेव रहती है ताकि आप बाद में पत्र देख सकें।',
    'form.label': 'समस्या का विवरण दें',
    'form.photoEvidence': 'फोटो साक्ष्य के रूप में जोड़ी गई',
    'result.reportedIssue': 'बताई गई समस्या',
    'result.timelineEmpty': 'कोई समयरेखा उपलब्ध नहीं है।',
    'result.day': 'दिन',
    'mine.localLabel': 'इस डिवाइस पर सेव',
    'tabs.new': 'नई शिकायत',
    'tabs.mine': 'मेरी शिकायतें',
    'form.placeholder': 'जैसे: "सेक्टर 4 के पास नाला ओवरफ़्लो हो रहा है"',
    'form.attachPhoto': 'फोटो जोड़ें',
    'form.capture': 'फोटो लें',
    'form.removePhoto': 'हटाएँ',
    'form.voice': 'बोलकर लिखें',
    'form.listening': 'सुन रहे हैं…',
    'form.submit': 'शिकायत भेजें',
    'form.submitting': 'सही विभाग खोज रहे हैं…',
    'form.hint': 'अंग्रेज़ी, हिंदी और मराठी में काम करता है। फोटो व आवाज़ वैकल्पिक हैं।',
    'result.categoryLabel': 'श्रेणी',
    'result.urgencyLabel': 'तात्कालिकता',
    'result.locationLabel': 'स्थान',
    'result.authorityLabel': 'जिम्मेदार विभाग',
    'result.callNow': 'अभी कॉल करें',
    'result.openPortal': 'पोर्टल खोलें',
    'result.copyLetter': 'पत्र कॉपी करें',
    'result.copied': 'कॉपी हो गया!',
    'result.copyFailed': 'कॉपी विफल',
    'result.letterTitle': 'आपका शिकायत पत्र',
    'result.followupTitle': 'अधिक जानकारी चाहिए',
    'result.followupBody': 'कृपया अपना सेक्टर / इलाका बताएं ताकि हम सही पते पर भेज सकें।',
    'result.trustedEmergency': 'आपातकालीन हेल्पलाइन (आपदा प्रबंधन)',
    'timeline.title': 'कार्रवाई समयरेखा',
    'timeline.today': 'आज',
    'timeline.downloadIcs': 'कैलेंडर में रिमाइंडर जोड़ें (.ics)',
    'urgency.low': 'कम तात्कालिकता',
    'urgency.medium': 'मध्यम तात्कालिकता',
    'urgency.high': 'उच्च तात्कालिकता',
    'urgency.unknown': 'तात्कालिकता अज्ञात',
    'demo.badge': 'डेमो मोड',
    'demo.tip': 'बैकएंड उपलब्ध नहीं — स्थानीय डेमो उत्तर दिखाया जा रहा है।',
    'error.title': 'कुछ गड़बड़ हो गई',
    'error.retry': 'फिर कोशिश करें',
    'error.short': 'कृपया कम से कम 5 अक्षरों में समस्या लिखें।',
    'mine.title': 'मेरी शिकायतें',
    'mine.empty': 'अभी कोई शिकायत सहेजी नहीं गई। आपके पत्र यहाँ दिखेंगे।',
    'mine.view': 'देखें',
    'mine.delete': 'हटाएँ',
    'mine.savedOn': 'सहेजा गया',
    'common.clearAll': 'सब हटाएँ',
    'footer.disclaimer': 'हैकाथॉन डेमो — असली उपयोग से पहले नंबर और पोर्टल जाँच लें।',
  },
  mr: {
    'app.title': 'नवी मुंबई नागरिक राउटर',
    'app.tagline': 'कोणतीही समस्या लिहा — आम्ही ती योग्य विभागाकडे पाठवतो.',
    'home.heading': 'आम्ही कशी मदत करू शकतो?',
    'home.description': 'काय घडत आहे ते सांगा. आम्ही योग्य विभाग शोधून पाठवण्यासाठी तक्रार तयार करू.',
    'home.privacy': 'तुमची तक्रार या ब्राउझरमध्ये जतन केली जाते, त्यामुळे पत्र नंतर पुन्हा पाहता येईल.',
    'form.label': 'समस्येचे वर्णन करा',
    'form.photoEvidence': 'फोटो पुरावा म्हणून जोडला',
    'result.reportedIssue': 'नोंदवलेली समस्या',
    'result.timelineEmpty': 'वेळापत्रकातील टप्पे उपलब्ध नाहीत.',
    'result.day': 'दिवस',
    'mine.localLabel': 'या उपकरणावर जतन',
    'tabs.new': 'नवीन तक्रार',
    'tabs.mine': 'माझ्या तक्रारी',
    'form.placeholder': 'उदा.: "सेक्टर 4 जवळ गटार ओव्हरफ्लो होत आहे"',
    'form.attachPhoto': 'फोटो जोडा',
    'form.capture': 'फोटो घ्या',
    'form.removePhoto': 'काढा',
    'form.voice': 'बोलून लिहा',
    'form.listening': 'ऐकत आहोत…',
    'form.submit': 'तक्रार पाठवा',
    'form.submitting': 'योग्य विभाग शोधत आहोत…',
    'form.hint': 'इंग्रजी, हिंदी आणि मराठीत चालते. फोटो व आवाज ऐच्छिक.',
    'result.categoryLabel': 'श्रेणी',
    'result.urgencyLabel': 'निकड',
    'result.locationLabel': 'ठिकाण',
    'result.authorityLabel': 'जबाबदार विभाग',
    'result.callNow': 'आता कॉल करा',
    'result.openPortal': 'पोर्टल उघडा',
    'result.copyLetter': 'पत्र कॉपी करा',
    'result.copied': 'कॉपी झाले!',
    'result.copyFailed': 'कॉपी अयशस्वी',
    'result.letterTitle': 'तुमचे तक्रार पत्र',
    'result.followupTitle': 'अधिक माहिती हवी',
    'result.followupBody': 'कृपया तुमचा सेक्टर / परिसर सांगा जेणेकरून योग्य ठिकाणी पाठवता येईल.',
    'result.trustedEmergency': 'आपत्कालीन हेल्पलाइन (आपत्ती व्यवस्थापन)',
    'timeline.title': 'कृती वेळापत्रक',
    'timeline.today': 'आज',
    'timeline.downloadIcs': 'कॅलेंडरमध्ये स्मरण जोडा (.ics)',
    'urgency.low': 'कमी निकड',
    'urgency.medium': 'मध्यम निकड',
    'urgency.high': 'उच्च निकड',
    'urgency.unknown': 'निकड अज्ञात',
    'demo.badge': 'डेमो मोड',
    'demo.tip': 'बॅकएंड उपलब्ध नाही — स्थानिक डेमो उत्तर दाखवत आहोत.',
    'error.title': 'काहीतरी चुकले',
    'error.retry': 'पुन्हा प्रयत्न करा',
    'error.short': 'कृपया किमान 5 अक्षरांत समस्या लिहा.',
    'mine.title': 'माझ्या तक्रारी',
    'mine.empty': 'अजून तक्रार साठवलेली नाही. तुमची पत्रे इथे दिसतील.',
    'mine.view': 'पहा',
    'mine.delete': 'हटवा',
    'mine.savedOn': 'साठवले',
    'common.clearAll': 'सर्व हटवा',
    'footer.disclaimer': 'हॅकाथॉन डेमो — खऱ्या वापरापूर्वी क्रमांक व पोर्टल तपासा.',
  },
};

const STORAGE_KEY = 'civic.language';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return TRANSLATIONS[stored] ? stored : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((code) => {
    const next = TRANSLATIONS[code] ? code : 'en';
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore private-mode storage errors */
    }
  }, []);

  const t = useCallback(
    (key, fallback) => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
      return dict[key] ?? TRANSLATIONS.en[key] ?? fallback ?? key;
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, languages: LANGUAGES }),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}