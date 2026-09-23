import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', speechCode: 'es-ES', flag: '🇪🇸' },
];

const translations = {
  en: {
    // Nav & Common
    app_title: 'LawShield',
    app_subtitle: 'Digital Legal Counsel & Protection',
    home: 'Home',
    case_intelligence: 'Case Dossiers',
    ai_assistant: 'Statutory Guidance',
    lawyers: 'Consult Advocates',
    consultations: 'My Consultations',
    documents: 'Legal Drafts & FIRs',
    evidence: 'Evidence Locker (Sec 65B)',
    radar: 'Emergency Radar',
    rights: 'Statutory Rights',
    voice_dictate: 'Voice Intake',
    emergency_hotlines: '24/7 National Emergency Hotlines:',
    police: 'Police',
    women_helpline: 'Women Helpline',
    ncw_cell: 'NCW Cell',
    cyber_crime: 'Cyber Crime',
    emergency_sos: 'Emergency SOS',
    open_case_intel: 'Open Case Dossier',

    // Hero & Legal Intake
    hero_badge: 'Bar Council Compliant Information Architecture • Constitutional Legal Aid',
    hero_title_1: 'Institutional Legal Guidance.',
    hero_title_2: 'Accessible to Every Citizen.',
    hero_title_3: '',
    hero_desc: 'Instant statutory guidance, attorney-ready case briefing, empanelled Bar Council advocate consultations, and confidential citizen protection.',
    quick_search_placeholder: 'Describe your legal matter, dispute, or statutory question...',
    diagnose: 'Review Matter',
    try_asking: 'Common Practice Areas:',

    // Practice Areas Hub
    simple_hub_title: 'Practice Areas & Digital Legal Services',
    simple_hub_subtitle: 'Select an area of legal service below or dictate your matter securely:',
    action_speak_title: 'Confidential Voice Intake',
    action_speak_desc: 'Dictate your statement in Hindi, English, Bengali, or your native language.',
    action_speak_btn: 'Begin Voice Intake',
    action_ai_title: 'Statutory Legal Advisory',
    action_ai_desc: 'Instant statutory breakdown, rights checklist, and applicable legal codes.',
    action_ai_btn: 'Consult Advisory',
    action_case_title: 'Case Preparation & Briefs',
    action_case_desc: 'Systematic evidence vault, chronological timeline, and attorney-ready brief.',
    action_case_btn: 'Open Case Workspace',
    action_sos_title: 'Emergency Safety Radar',
    action_sos_desc: 'Direct statutory distress broadcast, GPS beacon, and immediate hotlines.',
    action_sos_btn: 'Emergency Help',

    // Case Intelligence
    case_intel_title: 'Case Preparation & Intelligence Dossier',
    case_intel_desc: 'Systematically organize incident facts, evaluate evidence strength, identify missing records, and generate an attorney-ready dossier.',
    statutory_disclaimer: 'LawShield provides technology-assisted legal information and case organization. It does not predict judicial outcomes or replace advice from a qualified advocate.',

    // Voice Modal
    voice_modal_title: 'Confidential Voice Legal Intake',
    voice_modal_subtitle: 'Dictate your statement in your preferred language. LawShield generates a real-time transcript for your legal brief.',
    listening: 'Recording statement... speak clearly into your microphone',
    click_to_start: 'Click "Start Recording" to begin intake',
    start_recording: 'Start Recording',
    stop_recording: 'Complete Recording',
    transcript_label: 'Legal Statement Transcript',
    words_count: 'Words',
    copy_text: 'Copy Statement',
    send_to_ai: 'Submit to Advisory',
    create_case_from_voice: 'Create Case from Statement',
    clear_text: 'Clear',
    close: 'Close',
    speech_not_supported: 'Speech recognition is not supported in this browser. Please try Chrome or Edge.',
    copied_toast: 'Statement copied to clipboard!',
  },

  hi: {
    // Nav & Common
    app_title: 'लॉशील्ड (LawShield)',
    app_subtitle: 'डिजिटल कानूनी सलाह एवं नागरिक सुरक्षा मंच',
    home: 'होम',
    case_intelligence: 'केस डॉसियर',
    ai_assistant: 'वैधानिक मार्गदर्शन',
    lawyers: 'अधिवक्ता परामर्श',
    consultations: 'मेरे परामर्श',
    documents: 'कानूनी ड्राफ्ट व प्राथमिकी',
    evidence: 'साक्ष्य लॉकर (Sec 65B)',
    radar: 'आपातकालीन रडार',
    rights: 'वैधानिक अधिकार',
    voice_dictate: 'वॉइस इनटेक',
    emergency_hotlines: '24/7 राष्ट्रीय आपातकालीन हेल्पलाइन:',
    police: 'पुलिस',
    women_helpline: 'महिला हेल्पलाइन',
    ncw_cell: 'राष्ट्रीय महिला आयोग',
    cyber_crime: 'साइबर क्राइम',
    emergency_sos: 'आपातकालीन SOS',
    open_case_intel: 'केस डॉसियर खोलें',

    // Hero & Legal Intake
    hero_badge: 'बार काउंसिल अनुपालक सूचना वास्तुकला • संवैधानिक कानूनी सहायता',
    hero_title_1: 'संस्थागत कानूनी मार्गदर्शन।',
    hero_title_2: 'प्रत्येक नागरिक के लिए सुलभ।',
    hero_title_3: '',
    hero_desc: 'त्वरित वैधानिक मार्गदर्शन, वकील-स्तरीय केस ब्रीफिंग, बार काउंसिल अधिवक्ताओं से परामर्श, और गोपनीय नागरिक सुरक्षा।',
    quick_search_placeholder: 'अपने कानूनी मामले, विवाद या प्रश्न का विवरण लिखें...',
    diagnose: 'मामला जांचें',
    try_asking: 'प्रमुख कानूनी क्षेत्र:',

    // Practice Areas Hub
    simple_hub_title: 'कानूनी सेवाएं एवं कार्यक्षेत्र',
    simple_hub_subtitle: 'त्वरित कानूनी सेवा के लिए नीचे दिए गए विकल्प चुनें या अपनी बात बोलें:',
    action_speak_title: 'गोपनीय वॉइस इनटेक',
    action_speak_desc: 'हिंदी, अंग्रेजी या अपनी मातृभाषा में अपना कानूनी बयान बोलें।',
    action_speak_btn: 'बोलना शुरू करें',
    action_ai_title: 'वैधानिक कानूनी परामर्श',
    action_ai_desc: 'तत्काल कानूनी धाराएं (BNS/IPC), अधिकारों की सूची और वैधानिक विश्लेषण।',
    action_ai_btn: 'सलाह लें',
    action_case_title: 'केस डॉसियर व तैयारी',
    action_case_desc: 'अपने सबूत, समयरेखा और अधिवक्ता के लिए औपचारिक ब्रीफ तैयार करें।',
    action_case_btn: 'केस खोलें',
    action_sos_title: 'आपातकालीन सुरक्षा रडार',
    action_sos_desc: 'तत्काल जीपीएस स्थान, सायरन और आपातकालीन हेल्पलाइन संपर्क।',
    action_sos_btn: 'SOS भेजें',

    // Case Intelligence
    case_intel_title: 'केस तैयारी एवं इंटेलिजेंस डॉसियर',
    case_intel_desc: 'मामले के तथ्यों को व्यवस्थित करें, सबूतों की ताकत मापें, कमियों को पहचानें और वकील के लिए ब्रीफ तैयार करें।',
    statutory_disclaimer: 'लॉशील्ड तकनीक-सहायता प्राप्त कानूनी जानकारी और केस संगठन प्रदान करता है। यह अदालती परिणामों की भविष्यवाणी नहीं करता और न ही किसी योग्य वकील की सलाह का विकल्प है।',

    // Voice Modal
    voice_modal_title: 'गोपनीय वॉइस कानूनी इनटेक',
    voice_modal_subtitle: 'अपनी भाषा में अपना बयान दर्ज करें। लॉशील्ड आपके शब्दों का कानूनी ड्राफ्ट तैयार करता है।',
    listening: 'बयान रिकॉर्ड हो रहा है... कृपया माइक में स्पष्ट बोलें',
    click_to_start: 'शुरू करने के लिए "रिकॉर्डिंग शुरू करें" दबाएं',
    start_recording: 'रिकॉर्डिंग शुरू करें',
    stop_recording: 'रिकॉर्डिंग समाप्त करें',
    transcript_label: 'कानूनी बयान ट्रांसक्रिप्ट',
    words_count: 'शब्द',
    copy_text: 'बयान कॉपी करें',
    send_to_ai: 'परामर्श में भेजें',
    create_case_from_voice: 'इस बयान से केस बनाएं',
    clear_text: 'साफ़ करें',
    close: 'बंद करें',
    speech_not_supported: 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। Chrome या Edge का उपयोग करें।',
    copied_toast: 'बयान कॉपी हो गया!',
  },

  bn: {
    // Nav & Common
    app_title: 'ল শিল্ড (LawShield)',
    app_subtitle: 'ডিজিটাল আইনি পরামর্শ ও নাগরিক সুরক্ষা প্ল্যাটফর্ম',
    home: 'হোম',
    case_intelligence: 'কেস ডসিয়ার',
    ai_assistant: 'সংবিধিবদ্ধ পরামর্শ',
    lawyers: 'আইনজীবী পরামর্শ',
    consultations: 'আমার পরামর্শ',
    documents: 'আইনি ড্রাফট ও এফআইআর',
    evidence: 'প্রমাণ লকার (Sec 65B)',
    radar: 'জরুরী রাডার',
    rights: 'সংবিধিবদ্ধ অধিকার',
    voice_dictate: 'ভয়েস ইনটেক',
    emergency_hotlines: '২৪/৭ জাতীয় জরুরী হেল্পলাইন:',
    police: 'পুলিশ',
    women_helpline: 'মহিলা হেল্পলাইন',
    ncw_cell: 'জাতীয় মহিলা কমিশন',
    cyber_crime: 'সাইবার ক্রাইম',
    emergency_sos: 'জরুরী এসওএস',
    open_case_intel: 'কেস ডসিয়ার খুলুন',

    // Hero & Legal Intake
    hero_badge: 'বার কাউন্সিল মান্য তথ্য পরিকাঠামো • সাংবিধানিক আইনি সহায়তা',
    hero_title_1: 'প্রাতিষ্ঠানিক আইনি সহায়তা।',
    hero_title_2: 'প্রত্যেক নাগরিকের অধিকারে।',
    hero_title_3: '',
    hero_desc: 'তাৎক্ষণিক সংবিধিবদ্ধ দিকনির্দেশনা, আইনজীবী-প্রস্তুত কেস ব্রিফিং, বার কাউন্সিল আইনজীবীদের পরামর্শ এবং নাগরিক সুরক্ষা।',
    quick_search_placeholder: 'আপনার আইনি সমস্যা, বিরোধ বা প্রশ্ন লিখুন...',
    diagnose: 'পর্যালোচনা করুন',
    try_asking: 'সাধারণ আইনি ক্ষেত্রসমূহ:',

    // Practice Areas Hub
    simple_hub_title: 'আইনি অনুশীলন ও ডিজিটাল পরিষেবাসমূহ',
    simple_hub_subtitle: 'তাৎক্ষণিক আইনি পরিষেবার জন্য নিচের বিকল্প নির্বাচন করুন বা মুখে বলুন:',
    action_speak_title: 'গোপনীয় ভয়েস ইনটেক',
    action_speak_desc: 'বাংলা বা ইংরেজিতে আপনার আইনি বক্তব্য রেকর্ড করুন।',
    action_speak_btn: 'কথা বলা শুরু করুন',
    action_ai_title: 'সংবিধিবদ্ধ আইনি পরামর্শ',
    action_ai_desc: 'প্রযোজ্য ধারা, অধিকারের তালিকা এবং আইনি ঝুঁকি মূল্যায়ন।',
    action_ai_btn: 'পরামর্শ নিন',
    action_case_title: 'কেস প্রস্তুতি ও ডসিয়ার',
    action_case_desc: 'আপনার প্রমাণ ও টাইমলাইন সাজিয়ে আইনজীবীর জন্য ফাইল প্রস্তুত করুন।',
    action_case_btn: 'কেস খুলুন',
    action_sos_title: 'জরুরী নিরাপত্তা রাডার',
    action_sos_desc: 'তাৎক্ষণিক জিপিএস অবস্থান, সাইরেন এবং হেল্পলাইন সতর্কতা।',
    action_sos_btn: 'এসওএস পাঠান',

    // Case Intelligence
    case_intel_title: 'কেস প্রস্তুতি ও ইন্টেলিজেন্স ডসিয়ার',
    case_intel_desc: 'আপনার কেসের প্রমাণ সংগঠিত করুন, রেকর্ড মূল্যায়ন করুন এবং আইনজীবীর পরামর্শের জন্য পূর্ণাঙ্গ ফাইল প্রস্তুত করুন।',
    statutory_disclaimer: 'ল শিল্ড প্রযুক্তি-সহায়তাপুষ্ট আইনি তথ্য প্রদান করে। এটি আদালতের রায়ের ভবিষ্যদ্বাণী করে না বা আইনজীবীর বিকল্প নয়।',

    // Voice Modal
    voice_modal_title: 'গোপনীয় ভয়েস আইনি ইনটেক',
    voice_modal_subtitle: 'আপনার ভাষায় বক্তব্য দিন। ল শিল্ড তাৎক্ষণিক রূপান্তর করবে।',
    listening: 'বক্তব্য রেকর্ড হচ্ছে... মাইক্রোফোনে স্পষ্ট বলুন',
    click_to_start: 'শুরু করতে "রেকর্ডিং শুরু করুন" বাটনে চাপুন',
    start_recording: 'রেকর্ডিং শুরু করুন',
    stop_recording: 'রেকর্ডিং সমাপ্ত করুন',
    transcript_label: 'আইনি বিবৃতির প্রতিলিপি',
    words_count: 'শব্দ',
    copy_text: 'কপি করুন',
    send_to_ai: 'পরামর্শে পাঠান',
    create_case_from_voice: 'কেস ফাইল তৈরি করুন',
    clear_text: 'মুছে ফেলুন',
    close: 'বন্ধ করুন',
    speech_not_supported: 'এই ব্রাউজারে স্পিচ রিকগনিশন কাজ করে না। Chrome বা Edge ব্যবহার করুন।',
    copied_toast: 'বিবৃতি কপি হয়েছে!',
  },

  mr: {
    // Nav & Common
    app_title: 'लॉशील्ड (LawShield)',
    app_subtitle: 'डिजिटल कायदेशीर सल्ला व नागरिक संरक्षण मंच',
    home: 'मुख्यपृष्ठ',
    case_intelligence: 'केस डॉसियर',
    ai_assistant: 'वैधानिक सल्ला',
    lawyers: 'अधिवक्ता सल्ला',
    consultations: 'माझे सल्लामसलत',
    documents: 'कायदेशीर मसुदे व एफआयआर',
    evidence: 'पुरावा लॉकर (Sec 65B)',
    radar: 'आपत्कालीन रडार',
    rights: 'वैधानिक हक्क',
    voice_dictate: 'व्हॉइस इनटेक',
    emergency_hotlines: '24/7 राष्ट्रीय आपत्कालीन हेल्पलाइन:',
    police: 'पोलीस',
    women_helpline: 'महिला हेल्पलाइन',
    ncw_cell: 'राष्ट्रीय महिला आयोग',
    cyber_crime: 'सायबर गुन्हे',
    emergency_sos: 'आपत्कालीन SOS',
    open_case_intel: 'केस डॉसियर उघडा',

    // Hero & Legal Intake
    hero_badge: 'बार कौन्सिल अनुपालक माहिती प्रणाली • घटनात्मक कायदेशीर मदत',
    hero_title_1: 'संस्थात्मक कायदेशीर मार्गदर्शन.',
    hero_title_2: 'प्रत्येक नागरिकासाठी उपलब्ध.',
    hero_title_3: '',
    hero_desc: 'झटपट कायदेशीर मार्गदर्शन, वकिलांसाठी केस मसुदा, बार कौन्सिल वकिलांचा सल्ला आणि नागरिक संरक्षण.',
    quick_search_placeholder: 'आपली कायदेशीर समस्या किंवा प्रश्न लिहा...',
    diagnose: 'तपासा',
    try_asking: 'प्रमुख कायदेशीर क्षेत्रे:',

    // Practice Areas Hub
    simple_hub_title: 'कायदेशीर सेवा व कार्यक्षेत्र',
    simple_hub_subtitle: 'त्वरित मदतीसाठी खालील सेवा निवडा किंवा आपले म्हणणे बोला:',
    action_speak_title: 'गोपनीय व्हॉइस इनटेक',
    action_speak_desc: 'मराठी किंवा इंग्रजीत आपले कायदेशीर विधान नोंदवा.',
    action_speak_btn: 'नोंदणी सुरू करा',
    action_ai_title: 'वैधानिक कायदेशीर सल्ला',
    action_ai_desc: 'लागू कायदे (BNS/IPC), हक्कांची यादी आणि कायदेशीर विश्लेषण.',
    action_ai_btn: 'सल्ला घ्या',
    action_case_title: 'केस तयारी व डॉसियर',
    action_case_desc: 'पुरावे, टाइमलाइन व्यवस्थित करा आणि वकिलांसाठी ब्रीफ बनवा.',
    action_case_btn: 'केस उघडा',
    action_sos_title: 'आपत्कालीन सुरक्षा रडार',
    action_sos_desc: 'थेट जीपीएस स्थान, सायरन आणि राष्ट्रीय हेल्पलाइन संपर्क.',
    action_sos_btn: 'SOS पाठवा',

    // Case Intelligence
    case_intel_title: 'केस तयारी व इंटेलिजन्स डॉसियर',
    case_intel_desc: 'आपल्या प्रकरणाचे विश्लेषण करा, पुरावे गोळा करा आणि वकिलांच्या सल्ल्यासाठी कागदपत्रे तयार करा.',
    statutory_disclaimer: 'लॉशील्ड तंत्रज्ञान-सहाय्यित कायदेशीर माहिती प्रदान करते. हे न्यायालयाच्या निकालांचा अंदाज लावत नाही किंवा वकिलाच्या सल्ल्याची जागा घेत नाही.',

    // Voice Modal
    voice_modal_title: 'गोपनीय व्हॉइस कायदेशीर इनटेक',
    voice_modal_subtitle: 'आपल्या भाषेत विधान नोंदवा. लॉशील्ड आपले शब्द मजकुरात रुपांतरित करेल.',
    listening: 'नोंद होत आहे... स्पष्ट बोला',
    click_to_start: 'सुरू करण्यासाठी "रेकॉर्डिंग सुरू करा" दाबा',
    start_recording: 'रेकॉर्डिंग सुरू करा',
    stop_recording: 'रेकॉर्डिंग समाप्त करा',
    transcript_label: 'कायदेशीर विधानाचा मजकूर',
    words_count: 'शब्द',
    copy_text: 'कॉपी करा',
    send_to_ai: 'सल्ल्याकडे पाठवा',
    create_case_from_voice: 'केस बनवा',
    clear_text: 'साफ करा',
    close: 'बंद करा',
    speech_not_supported: 'या ब्राउझरमध्ये स्पीच रेकग्निशन समर्थित नाही. Chrome किंवा Edge वापरा.',
    copied_toast: 'विधान कॉपी झाले!',
  },

  ta: {
    // Nav & Common
    app_title: 'லாஷீல்ட் (LawShield)',
    app_subtitle: 'டிஜிட்டல் சட்ட ஆலோசனை & குடிமக்கள் பாதுகாப்பு தளம்',
    home: 'முகப்பு',
    case_intelligence: 'வழக்கு ஆவணங்கள்',
    ai_assistant: 'சட்ட வழிகாட்டுதல்',
    lawyers: 'வழக்கறிஞர் ஆலோசனை',
    consultations: 'எனது ஆலோசனைகள்',
    documents: 'சட்ட வரைவுகள் & புகார்கள்',
    evidence: 'ஆதார லாக்கர் (Sec 65B)',
    radar: 'அவசர ரேடார்',
    rights: 'சட்டப்பூர்வ உரிமைகள்',
    voice_dictate: 'குரல் பதிவு',
    emergency_hotlines: '24/7 தேசிய அவசர உதவி எண்கள்:',
    police: 'காவல்துறை',
    women_helpline: 'பெண்கள் உதவி எண்',
    ncw_cell: 'மகளிர் ஆணையம்',
    cyber_crime: 'சைபர் கிரைம்',
    emergency_sos: 'அவசர SOS',
    open_case_intel: 'வழக்கு ஆவணங்களை திற',

    // Hero & Legal Intake
    hero_badge: 'பார் கவுன்சில் அங்கீகரித்த தகவல் கட்டமைப்பு • அரசியலமைப்பு சட்ட உதவி',
    hero_title_1: 'நம்பகமான சட்ட வழிகாட்டுதல்.',
    hero_title_2: 'அனைத்து குடிமக்களுக்கும் உரித்தானது.',
    hero_title_3: '',
    hero_desc: 'உடனடி சட்ட ஆலோசனை, வழக்கறிஞர் ஆய்வுக்கான குறிப்புகள், வழக்கறிஞர்கள் கலந்தாய்வு மற்றும் குடிமக்கள் பாதுகாப்பு.',
    quick_search_placeholder: 'உங்கள் சட்டப் பிரச்சனை அல்லது கேள்வியை விளக்குங்கள்...',
    diagnose: 'ஆராய்க',
    try_asking: 'முக்கிய சட்டப் பிரிவுகள்:',

    // Practice Areas Hub
    simple_hub_title: 'சட்ட நடைமுறை மற்றும் டிஜிட்டல் சேவைகள்',
    simple_hub_subtitle: 'விரைவான சட்ட சேவைக்கு கீழே உள்ளவற்றை தேர்வு செய்யவும் அல்லது குரல் மூலம் பேசவும்:',
    action_speak_title: 'ரகசிய குரல் பதிவு',
    action_speak_desc: 'தமிழ் அல்லது ஆங்கிலத்தில் உங்கள் சட்ட வாக்குமூலத்தை பதிவு செய்யுங்கள்.',
    action_speak_btn: 'பதிவைத் தொடங்குங்கள்',
    action_ai_title: 'சட்ட ஆலோசனை மையம்',
    action_ai_desc: 'பொருந்தக்கூடிய சட்டப்பிரிவுகள், உரிமைகள் மற்றும் வழிகாட்டுதல்.',
    action_ai_btn: 'ஆலோசனை பெறுங்கள்',
    action_case_title: 'வழக்கு ஆவணங்கள் & தயாரிப்பு',
    action_case_desc: 'ஆதாரங்கள், நிகழ்வுகளை ஒழுங்கமைத்து வழக்கறிஞர் குறிப்பை உருவாக்குங்கள்.',
    action_case_btn: 'வழக்கைத் திற',
    action_sos_title: 'அவசர பாதுகாப்பு ரேடார்',
    action_sos_desc: 'உடனடி ஜிபிஎஸ் இருப்பிடம் மற்றும் அவசர உதவி எண்கள் தொடர்பு.',
    action_sos_btn: 'SOS அனுப்பு',

    // Case Intelligence
    case_intel_title: 'வழக்கு தயாரிப்பு மற்றும் ஆவணக் களஞ்சியம்',
    case_intel_desc: 'உங்கள் வழக்கின் நிகழ்வுகளை ஒழுங்கமைக்கவும், ஆதாரங்களை ஆய்வு செய்யவும் மற்றும் வழக்கறிஞர் ஆலோசனைக்கு தயாராகவும்.',
    statutory_disclaimer: 'லாஷீல்ட் தொழில்நுட்பம் சார்ந்த சட்ட தகவல்களை வழங்குகிறது. இது நீதிமன்ற முடிவுகளை கணிக்காது அல்லது வழக்கறிஞருக்கு மாற்றாகாது.',

    // Voice Modal
    voice_modal_title: 'ரகசிய குரல் வழி சட்ட வாக்குமூலம்',
    voice_modal_subtitle: 'உங்கள் மொழியில் பேசுங்கள். லாஷீல்ட் உடனடியாக எழுத்து வடிவம் தரும்.',
    listening: 'பதிவாகிறது... தெளிவாக பேசவும்',
    click_to_start: 'பேச "பதிவைத் தொடங்கு" என்பதை அழுத்தவும்',
    start_recording: 'பதிவைத் தொடங்கு',
    stop_recording: 'பதிவை முடிக்கவும்',
    transcript_label: 'சட்ட வாக்குமூல உரை',
    words_count: 'சொற்கள்',
    copy_text: 'நகலெடு',
    send_to_ai: 'ஆலோசனைக்கு அனுப்பு',
    create_case_from_voice: 'வழக்கை உருவாக்கு',
    clear_text: 'அழி',
    close: 'மூடு',
    speech_not_supported: 'இந்த உலாவியில் பேச்சு அங்கீகாரம் இல்லை. Chrome அல்லது Edge பயன்படுத்தவும்.',
    copied_toast: 'வாக்குமூலம் நகலெடுக்கப்பட்டது!',
  },

  es: {
    // Nav & Common
    app_title: 'LawShield',
    app_subtitle: 'Asesoría Jurídica y Protección Digital',
    home: 'Inicio',
    case_intelligence: 'Expediente del Caso',
    ai_assistant: 'Orientación Jurídica',
    lawyers: 'Consultar Abogados',
    consultations: 'Mis Consultas',
    documents: 'Notificaciones y Escritos',
    evidence: 'Bóveda de Evidencias (Sec 65B)',
    radar: 'Radar de Emergencia',
    rights: 'Derechos Estatutarios',
    voice_dictate: 'Registro por Voz',
    emergency_hotlines: 'Líneas Nacionales de Emergencia 24/7:',
    police: 'Policía',
    women_helpline: 'Línea de la Mujer',
    ncw_cell: 'Atención a la Mujer',
    cyber_crime: 'Delitos Cibernéticos',
    emergency_sos: 'SOS de Emergencia',
    open_case_intel: 'Abrir Expediente',

    // Hero & Legal Intake
    hero_badge: 'Arquitectura de Información Conforme al Colegio de Abogados • Asistencia Jurídica',
    hero_title_1: 'Asesoría Jurídica Institucional.',
    hero_title_2: 'Accesible para Cada Ciudadano.',
    hero_title_3: '',
    hero_desc: 'Orientación legal estatutaria, preparación de expedientes para abogados, consulta con colegiados y protección ciudadana.',
    quick_search_placeholder: 'Describa su situación jurídica o consulta legal...',
    diagnose: 'Evaluar Asunto',
    try_asking: 'Áreas de Práctica:',

    // Practice Areas Hub
    simple_hub_title: 'Áreas de Práctica y Servicios Jurídicos',
    simple_hub_subtitle: 'Seleccione un área de servicio legal a continuación o dicte su asunto:',
    action_speak_title: 'Registro Confidencial por Voz',
    action_speak_desc: 'Dicte su declaración en español, inglés u otro idioma con transcripción inmediata.',
    action_speak_btn: 'Iniciar Registro',
    action_ai_title: 'Asesoría Jurídica Estatutaria',
    action_ai_desc: 'Desglose inmediato de leyes aplicables, catálogo de derechos y análisis legal.',
    action_ai_btn: 'Consultar Asesoría',
    action_case_title: 'Preparación de Expedientes',
    action_case_desc: 'Bóveda de pruebas, cronología de hechos y elaboración de informe para abogado.',
    action_case_btn: 'Abrir Expediente',
    action_sos_title: 'Radar de Seguridad y Emergencia',
    action_sos_desc: 'Transmisión inmediata de auxilio, coordenadas GPS y líneas directas.',
    action_sos_btn: 'Auxilio SOS',

    // Case Intelligence
    case_intel_title: 'Preparación y Expediente Jurídico del Caso',
    case_intel_desc: 'Organice sistemáticamente los hechos, evalúe la solidez de las pruebas y genere un informe apto para consulta con abogado.',
    statutory_disclaimer: 'LawShield proporciona información legal asistida por tecnología y organización del caso. No predice resultados judiciales ni sustituye a un abogado colegiado.',

    // Voice Modal
    voice_modal_title: 'Registro Jurídico Confidencial por Voz',
    voice_modal_subtitle: 'Hable con naturalidad en su idioma. LawShield transcribe su declaración en tiempo real para el expediente.',
    listening: 'Grabando declaración... hable con claridad al micrófono',
    click_to_start: 'Haga clic en "Iniciar Grabación" para comenzar',
    start_recording: 'Iniciar Grabación',
    stop_recording: 'Finalizar Grabación',
    transcript_label: 'Transcripción de la Declaración',
    words_count: 'Palabras',
    copy_text: 'Copiar Declaración',
    send_to_ai: 'Enviar a Asesoría',
    create_case_from_voice: 'Crear Caso desde Declaración',
    clear_text: 'Limpiar',
    close: 'Cerrar',
    speech_not_supported: 'Reconocimiento de voz no compatible en este navegador. Use Chrome o Edge.',
    copied_toast: '¡Declaración copiada al portapapeles!',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('lawshield_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lawshield_lang', language);
  }, [language]);

  const currentLangConfig = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (key) => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLangConfig,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
