import type { AbstractIntlMessages } from 'next-intl';

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends AbstractIntlMessages {
    common: {
      welcome: string;
      description: string;
      create: string;
      cancel: string;
      save: string;
    };
    auth: {
      login: string;
      register: string;
      email: string;
      password: string;
      confirmPassword: string;
    };
    nav: {
      home: string;
      destinations: string;
      plans: string;
      schedule: string;
      groups: string;
      settings: string;
    };
    schedule: {
      createTrip: string;
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      visibility: string;
      public: string;
      private: string;
      titlePlaceholder: string;
      descriptionPlaceholder: string;
    };
  }
}
