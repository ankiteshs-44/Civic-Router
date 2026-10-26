import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
];

const TRANSLATIONS = {
  en: {
    'app.title': 'Navi Mumbai Civic Router',
    'app.tagline': 'Describe any civic issue in your own words — we route it to the right authority.',
    'home.heading': 'How can we help?',
    'home.description': 'Tell us what is happening. We identify the responsible municipal department, prepare a formal complaint letter, and plot your follow-up escalation timeline.',
    'home.privacy': 'Your complaint is saved on this device so you can access your letters anytime without an account.',
    'form.label': 'Describe the issue',
    'form.photoEvidence': 'Photo attached as evidence',
    'result.reportedIssue': 'Reported issue',
    'result.timelineEmpty': 'No timeline steps were provided.',
    'result.day': 'Day',
    'mine.localLabel': 'Saved on this device',
    'tabs.new': 'New Complaint',
    'tabs.mine': 'My Complaints',
    'form.placeholder': 'e.g. "Drain overflowing near Sector 4 market road since yesterday, water entering shops"',
    'form.attachPhoto': 'Attach Photo',
    'form.capture': 'Take Photo',
    'form.removePhoto': 'Remove photo',
    'form.voice': 'Voice Input',
    'form.listening': 'Listening… tap to finish',
    'form.submit': 'Route My Complaint',
    'form.submitting': 'Analyzing issue & routing authority…',
    'form.hint': 'Type in English, हिंदी, or मराठी. Voice and photo evidence are optional.',
    'form.presets': 'Quick 1-tap scenarios:',
    'preset.drainage': 'Drain overflowing in a residential area',
    'preset.pothole': 'Deep potholes on a busy road in the local area',
    'preset.streetlight': 'Streetlights off for several days in a public area',
    'preset.garbage': 'Garbage pile left in a public area near a market',
    'result.categoryLabel': 'Category',
    'result.urgencyLabel': 'Urgency',
    'result.locationLabel': 'Location & Ward',
    'result.authorityLabel': 'Responsible Authority',
    'result.callNow': 'Call Authority',
    'result.openPortal': 'Open Online Portal',
    'result.copyLetter': 'Copy Letter',
    'result.copied': 'Copied to Clipboard!',
    'result.copyFailed': 'Copy failed — please select and copy manually',
    'result.print': 'Print Letter',
    'result.officialDoc': 'Official Municipal Grievance Document',
    'result.letterTitle': 'Formal Complaint Letter',
    'result.followupTitle': 'Additional detail requested',
    'result.followupBody': 'Please provide the specific sector, landmark, or ward name to pinpoint routing.',
    'result.trustedEmergency': 'Immediate Emergency Helpline (NMMC Disaster Control)',
    'timeline.title': 'Follow-Up & Escalation Timeline',
    'timeline.today': 'Today',
    'timeline.downloadIcs': 'Add to Calendar (.ics)',
    'urgency.low': 'Standard (Low urgency)',
    'urgency.medium': 'Important (Medium urgency)',
    'urgency.high': 'Critical (High urgency)',
    'urgency.unknown': 'General Inquiry',
    'demo.badge': 'Demo Mode',
    'demo.tip': 'Connected via local intelligent router with verified NMMC directories.',
    'error.title': 'Unable to complete routing',
    'error.retry': 'Retry Routing',
    'error.short': 'Please describe the issue in at least 5 characters.',
    'mine.title': 'My Filed Complaints',
    'mine.empty': 'No complaints saved yet. Once you submit a civic issue, your generated letters and timelines will be stored here.',
    'mine.view': 'Open Details',
    'mine.delete': 'Delete',
    'mine.savedOn': 'Filed on',
    'common.clearAll': 'Clear all history',
    'footer.disclaimer': 'Navi Mumbai Civic Router — Public Service Portal. Verify helplines and portals prior to submission.',
    'offline.banner': 'You are currently offline. Full local demo routing remains active.',
    'offline.reconnected': 'Internet connection restored. Live router is online.',
    'a11y.skipToContent': 'Skip to main content',
    'theme.toggle': 'Toggle light / dark mode',
  },
  hi: {
    'app.title': 'नवी मुंबई नागरिक राउटर',
    'app.tagline': 'कोई भी समस्या अपनी भाषा में लिखें — हम उसे सही विभाग तक पहुँचाते हैं।',
    'home.heading': 'हम आपकी क्या सहायता कर सकते हैं?',
    'home.description': 'समस्या बताएं। हम सही नगर निगम विभाग पहचानेंगे, औपचारिक शिकायत पत्र तैयार करेंगे और निवारण समयरेखा प्रदान करेंगे।',
    'home.privacy': 'आपकी शिकायत इसी डिवाइस में सुरक्षित रहती है ताकि आप कभी भी पत्र देख सकें।',
    'form.label': 'समस्या का विवरण दें',
    'form.photoEvidence': 'साक्ष्य हेतु फोटो संलग्न',
    'result.reportedIssue': 'दर्ज की गई समस्या',
    'result.timelineEmpty': 'कोई समयरेखा उपलब्ध नहीं है।',
    'result.day': 'दिन',
    'mine.localLabel': 'इस डिवाइस पर सुरक्षित',
    'tabs.new': 'नई शिकायत',
    'tabs.mine': 'मेरी शिकायतें',
    'form.placeholder': 'जैसे: "सेक्टर 4 वाशी में नाले का गंदा पानी सड़क पर बह रहा है"',
    'form.attachPhoto': 'फोटो जोड़ें',
    'form.capture': 'फोटो खींचें',
    'form.removePhoto': 'फोटो हटाएं',
    'form.voice': 'बोलकर लिखें',
    'form.listening': 'सुन रहे हैं… पूरा करने के लिए छुएं',
    'form.submit': 'शिकायत दर्ज करें',
    'form.submitting': 'सही विभाग और पत्र तैयार किया जा रहा है…',
    'form.hint': 'हिंदी, मराठी या अंग्रेज़ी में लिखें। फोटो व आवाज़ वैकल्पिक हैं।',
    'form.presets': 'त्वरित उदाहरण (1-टैप):',
    'preset.drainage': 'आस-पास के क्षेत्र में नाला ओवरफ्लो हो रहा है',
    'preset.pothole': 'लोकल रोड पर गहरे गड्ढे हैं',
    'preset.streetlight': 'एक सार्वजनिक क्षेत्र में कई दिनों से स्ट्रीट लाइट बंद हैं',
    'preset.garbage': 'सार्वजनिक क्षेत्र में कचरे का ढेर लगा है',
    'result.categoryLabel': 'श्रेणी',
    'result.urgencyLabel': 'प्राथमिकता',
    'result.locationLabel': 'स्थान व वार्ड',
    'result.authorityLabel': 'संबंधित विभाग',
    'result.callNow': 'विभाग को कॉल करें',
    'result.openPortal': 'पोर्टल खोलें',
    'result.copyLetter': 'पत्र कॉपी करें',
    'result.copied': 'कॉपी हो गया!',
    'result.copyFailed': 'कॉपी विफल — कृपया स्वयं कॉपी करें',
    'result.print': 'पत्र प्रिंट करें',
    'result.officialDoc': 'आधिकारिक नगर निगम शिकायत प्रारूप',
    'result.letterTitle': 'औपचारिक शिकायत पत्र',
    'result.followupTitle': 'अतिरिक्त जानकारी आवश्यक',
    'result.followupBody': 'सटीक विभाग निर्धारण के लिए अपना सेक्टर या वार्ड बताएं।',
    'result.trustedEmergency': 'तत्काल आपातकालीन हेल्पलाइन (आपदा प्रबंधन)',
    'timeline.title': 'फॉलो-अप एवं निवारण समयरेखा',
    'timeline.today': 'आज',
    'timeline.downloadIcs': 'कैलेंडर में रिमाइंडर जोड़ें (.ics)',
    'urgency.low': 'सामान्य (कम तात्कालिकता)',
    'urgency.medium': 'महत्वपूर्ण (मध्यम तात्कालिकता)',
    'urgency.high': 'गंभीर (उच्च तात्कालिकता)',
    'urgency.unknown': 'सामान्य पूछताछ',
    'demo.badge': 'डेमो मोड',
    'demo.tip': 'सत्यापित एनएमएमसी डेटाबेस के साथ स्थानीय राउटर सक्रिय है।',
    'error.title': 'शिकायत आगे नहीं बढ़ सकी',
    'error.retry': 'पुनः प्रयास करें',
    'error.short': 'कृपया कम से कम 5 अक्षरों में समस्या लिखें।',
    'mine.title': 'मेरी दर्ज शिकायतें',
    'mine.empty': 'अभी कोई शिकायत नहीं है। दर्ज करने पर पत्र यहाँ दिखाई देंगे।',
    'mine.view': 'विवरण देखें',
    'mine.delete': 'हटाएं',
    'mine.savedOn': 'दर्ज दिनांक',
    'common.clearAll': 'सभी हटाएं',
    'footer.disclaimer': 'नवी मुंबई नागरिक राउटर — जनसेवा पहल। उपयोग से पहले नंबर सत्यापित करें।',
    'offline.banner': 'आप ऑफ़लाइन हैं। स्थानीय डेमो मोड सक्रिय है।',
    'offline.reconnected': 'इंटरनेट बहाल हो गया है। लाइव सेवा सक्रिय है।',
    'a11y.skipToContent': 'मुख्य सामग्री पर जाएं',
    'theme.toggle': 'थीम बदलें (लाइट / डार्क)',
  },
  mr: {
    'app.title': 'नवी मुंबई नागरिक राउटर',
    'app.tagline': 'कोणतीही नागरी समस्या स्वतःच्या भाषेत मांडा — आम्ही ती योग्य अधिकाऱ्यांपर्यंत पोहोचवतो.',
    'home.heading': 'आम्ही कशी मदत करू शकतो?',
    'home.description': 'समस्या सांगा. आम्ही महापालिकेचा योग्य विभाग शोधू, अधिकृत तक्रार पत्र तयार करू आणि पाठपुराव्याचे वेळापत्रक देऊ.',
    'home.privacy': 'तुमची तक्रार याच डिव्हाइसवर सुरक्षित राहते जेणेकरून तुम्ही कधीही पत्र पाहू शकता.',
    'form.label': 'समस्येचे वर्णन करा',
    'form.photoEvidence': 'पुराव्यासाठी फोटो जोडला आहे',
    'result.reportedIssue': 'नोंदवलेली समस्या',
    'result.timelineEmpty': 'कोणतेही वेळापत्रक उपलब्ध नाही.',
    'result.day': 'दिवस',
    'mine.localLabel': 'या डिव्हाइसवर साठवले',
    'tabs.new': 'नवीन तक्रार',
    'tabs.mine': 'माझ्या तक्रारी',
    'form.placeholder': 'उदा. "सेक्टर 4 वाशी येथील रस्त्यावरील गटार तुंबून पाणी दुकानात शिरत आहे"',
    'form.attachPhoto': 'फोटो जोडा',
    'form.capture': 'फोटो काढा',
    'form.removePhoto': 'फोटो काढा',
    'form.voice': 'बोलून लिहा',
    'form.listening': 'ऐकत आहोत… पूर्ण करण्यासाठी टॅप करा',
    'form.submit': 'तक्रार पाठवा',
    'form.submitting': 'योग्य विभाग व पत्र तयार करत आहोत…',
    'form.hint': 'मराठी, हिंदी किंवा इंग्रजीत लिहा. फोटो व आवाज ऐच्छिक आहेत.',
    'form.presets': 'झटपट उदाहरणे (१-टॅप):',
    'preset.drainage': 'सेक्टर 4 वाशीजवळ नाला ओसंडून वाहत आहे',
    'preset.pothole': 'सानपाडा पाम बीच रस्त्यावर मोठे खड्डे पडले आहेत',
    'preset.streetlight': 'नेरूळ सेक्टर 19 मध्ये 4 दिवसांपासून पथदिवे बंद आहेत',
    'preset.garbage': 'कोपरखैरणे स्थानकाबाहेर कचऱ्याचा मोठा ढीग साचला आहे',
    'result.categoryLabel': 'वर्गवारी',
    'result.urgencyLabel': 'निकड',
    'result.locationLabel': 'ठिकाण व प्रभाग',
    'result.authorityLabel': 'जबाबदार विभाग',
    'result.callNow': 'अधिकाऱ्यांना कॉल करा',
    'result.openPortal': 'पोर्टल उघडा',
    'result.copyLetter': 'पत्र कॉपी करा',
    'result.copied': 'पत्र कॉपी झाले!',
    'result.copyFailed': 'कॉपी अयशस्वी — कृपया हाताने कॉपी करा',
    'result.print': 'पत्र प्रिंट करा',
    'result.officialDoc': 'अधिकृत महापालिका तक्रार नमुना',
    'result.letterTitle': 'अधिकृत तक्रार पत्र',
    'result.followupTitle': 'अधिक माहिती हवी आहे',
    'result.followupBody': 'योग्य विभागाकडे पाठवण्यासाठी कृपया सेक्टर किंवा प्रभाग नमूद करा.',
    'result.trustedEmergency': 'तातडीची आपत्कालीन हेल्पलाइन (आपत्ती व्यवस्थापन कक्ष)',
    'timeline.title': 'पाठपुरावा व निवारण वेळापत्रक',
    'timeline.today': 'आज',
    'timeline.downloadIcs': 'कॅलेंडरमध्ये स्मरण जोडा (.ics)',
    'urgency.low': 'सर्वसाधारण (कमी निकड)',
    'urgency.medium': 'महत्त्वाची (मध्यम निकड)',
    'urgency.high': 'अतितातडीची (उच्च निकड)',
    'urgency.unknown': 'सर्वसाधारण विचारणा',
    'demo.badge': 'डेमो मोड',
    'demo.tip': 'एनएमएमसीच्या अधिकृत नोंदीसह स्थानिक स्मार्ट राउटर कार्यरत आहे.',
    'error.title': 'तक्रार पाठवता आली नाही',
    'error.retry': 'पुन्हा प्रयत्न करा',
    'error.short': 'कृपया किमान 5 अक्षरांत समस्येचे वर्णन करा.',
    'mine.title': 'माझ्या नोंदवलेल्या तक्रारी',
    'mine.empty': 'अद्याप तक्रारी नाहीत. तुम्ही समस्या नोंदवल्यावर तुमची पत्रे येथे दिसतील.',
    'mine.view': 'तपशील पहा',
    'mine.delete': 'हटवा',
    'mine.savedOn': 'नोंदवल्याची तारीख',
    'common.clearAll': 'सर्व हटवा',
    'footer.disclaimer': 'नवी मुंबई नागरिक राउटर — लोकसेवा उपक्रम. प्रत्यक्ष संपर्कापूर्वी तपशील तपासा.',
    'offline.banner': 'तुम्ही ऑफलाइन आहात. स्थानिक डेमो मोड सुरू आहे.',
    'offline.reconnected': 'इंटरनेट पूर्ववत झाले आहे. थेट सेवा सुरू आहे.',
    'a11y.skipToContent': 'मुख्य मजकुराकडे जा',
    'theme.toggle': 'थीम बदला (लाइट / डार्क)',
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

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((code) => {
    const next = TRANSLATIONS[code] ? code : 'en';
    setLanguageState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next;
    }
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
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