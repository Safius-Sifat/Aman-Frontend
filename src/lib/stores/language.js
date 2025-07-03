import { writable } from 'svelte/store';

/**
 * Language store for managing multi-language support
 */
function createLanguageStore() {
  const { subscribe, set, update } = writable('en');

  return {
    subscribe,
    set,
    update,
    
    /**
     * Set language and persist to localStorage
     * @param {string} lang - Language code
     */
    setLanguage: (lang) => {
      set(lang);
      
      // Store in localStorage for persistence
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('language', lang);
      }
      
      // Update document direction for RTL languages
      if (typeof document !== 'undefined') {
        document.dir = ['ar', 'he', 'fa', 'ur'].includes(lang) ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
      }
    },
    
    /**
     * Load language from localStorage or browser preference
     */
    loadFromStorage: () => {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('language');
        if (stored) {
          set(stored);
          return stored;
        }
      }
      
      // Fallback to browser language
      if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language.split('-')[0];
        set(browserLang);
        return browserLang;
      }
      
      return 'en';
    },
    
    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage: () => {
      let currentLang = 'en';
      subscribe(lang => {
        currentLang = lang;
      })();
      return currentLang;
    },
    
    /**
     * Check if current language is RTL
     * @returns {boolean} RTL status
     */
    isRtl: () => {
      let isRtl = false;
      subscribe(lang => {
        isRtl = ['ar', 'he', 'fa', 'ur'].includes(lang);
      })();
      return isRtl;
    }
  };
}

export const language = createLanguageStore();

/**
 * Translation helper functions
 */
export const translations = {
  /**
   * Get translation for key
   * @param {string} key - Translation key
   * @param {string} lang - Language code
   * @param {Object} translationData - Translation data object
   * @returns {string} Translated text
   */
  get(key, lang, translationData) {
    if (!translationData || !translationData[lang]) {
      return key;
    }
    
    const keys = key.split('.');
    let value = translationData[lang];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  },
  
  /**
   * Get translation with variable interpolation
   * @param {string} key - Translation key
   * @param {string} lang - Language code
   * @param {Object} translationData - Translation data object
   * @param {Object} variables - Variables to interpolate
   * @returns {string} Translated text with variables
   */
  getWithVars(key, lang, translationData, variables = {}) {
    let text = this.get(key, lang, translationData);
    
    // Replace variables in the format {{variableName}}
    for (const [varName, varValue] of Object.entries(variables)) {
      const regex = new RegExp(`{{${varName}}}`, 'g');
      text = text.replace(regex, varValue);
    }
    
    return text;
  },
  
  /**
   * Get pluralized translation
   * @param {string} key - Translation key
   * @param {number} count - Count for pluralization
   * @param {string} lang - Language code
   * @param {Object} translationData - Translation data object
   * @returns {string} Pluralized translated text
   */
  getPlural(key, count, lang, translationData) {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
    return this.get(pluralKey, lang, translationData);
  }
};

/**
 * Common translation data for the application
 */
export const commonTranslations = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      settings: 'Settings',
      help: 'Help',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      profile: 'Profile',
      dashboard: 'Dashboard',
      home: 'Home',
      contact: 'Contact',
      about: 'About',
      privacy: 'Privacy',
      terms: 'Terms',
      required: 'Required',
      optional: 'Optional',
      yes: 'Yes',
      no: 'No',
      confirm: 'Confirm',
      warning: 'Warning',
      info: 'Information',
      notification: 'Notification',
      notifications: 'Notifications',
      date: 'Date',
      time: 'Time',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      location: 'Location',
      language: 'Language',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived'
    },
    errors: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      password: 'Password must be at least 8 characters',
      passwordMismatch: 'Passwords do not match',
      network: 'Network error. Please check your connection.',
      server: 'Server error. Please try again later.',
      notFound: 'Resource not found',
      unauthorized: 'You are not authorized to perform this action',
      forbidden: 'Access forbidden',
      timeout: 'Request timeout. Please try again.',
      unknown: 'An unknown error occurred'
    }
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      submit: 'Enviar',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      settings: 'Configuración',
      help: 'Ayuda',
      logout: 'Cerrar Sesión',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      profile: 'Perfil',
      dashboard: 'Panel',
      home: 'Inicio',
      contact: 'Contacto',
      about: 'Acerca de',
      privacy: 'Privacidad',
      terms: 'Términos',
      required: 'Obligatorio',
      optional: 'Opcional',
      yes: 'Sí',
      no: 'No',
      confirm: 'Confirmar',
      warning: 'Advertencia',
      info: 'Información',
      notification: 'Notificación',
      notifications: 'Notificaciones',
      date: 'Fecha',
      time: 'Hora',
      name: 'Nombre',
      email: 'Correo',
      phone: 'Teléfono',
      address: 'Dirección',
      location: 'Ubicación',
      language: 'Idioma',
      status: 'Estado',
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      draft: 'Borrador',
      published: 'Publicado',
      archived: 'Archivado'
    },
    errors: {
      required: 'Este campo es obligatorio',
      email: 'Por favor ingrese una dirección de correo válida',
      password: 'La contraseña debe tener al menos 8 caracteres',
      passwordMismatch: 'Las contraseñas no coinciden',
      network: 'Error de red. Por favor verifique su conexión.',
      server: 'Error del servidor. Por favor intente más tarde.',
      notFound: 'Recurso no encontrado',
      unauthorized: 'No está autorizado para realizar esta acción',
      forbidden: 'Acceso prohibido',
      timeout: 'Tiempo de espera agotado. Por favor intente de nuevo.',
      unknown: 'Ocurrió un error desconocido'
    }
  },
  ar: {
    common: {
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تحرير',
      close: 'إغلاق',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      submit: 'إرسال',
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      settings: 'الإعدادات',
      help: 'مساعدة',
      logout: 'تسجيل الخروج',
      login: 'تسجيل الدخول',
      register: 'التسجيل',
      profile: 'الملف الشخصي',
      dashboard: 'لوحة التحكم',
      home: 'الرئيسية',
      contact: 'اتصل بنا',
      about: 'حول',
      privacy: 'الخصوصية',
      terms: 'الشروط',
      required: 'مطلوب',
      optional: 'اختياري',
      yes: 'نعم',
      no: 'لا',
      confirm: 'تأكيد',
      warning: 'تحذير',
      info: 'معلومات',
      notification: 'إشعار',
      notifications: 'الإشعارات',
      date: 'التاريخ',
      time: 'الوقت',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      address: 'العنوان',
      location: 'الموقع',
      language: 'اللغة',
      status: 'الحالة',
      active: 'نشط',
      inactive: 'غير نشط',
      pending: 'معلق',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      draft: 'مسودة',
      published: 'منشور',
      archived: 'مؤرشف'
    },
    errors: {
      required: 'هذا الحقل مطلوب',
      email: 'يرجى إدخال عنوان بريد إلكتروني صالح',
      password: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      network: 'خطأ في الشبكة. يرجى التحقق من الاتصال.',
      server: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
      notFound: 'المورد غير موجود',
      unauthorized: 'غير مخول لك القيام بهذا الإجراء',
      forbidden: 'الوصول محظور',
      timeout: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
      unknown: 'حدث خطأ غير معروف'
    }
  }
};

export default language;
