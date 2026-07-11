// assets
import { IconBug, IconBellRinging, IconPhoneCall, IconQuestionMark, IconShieldLock } from '@tabler/icons-react';
import { NavItemType } from 'types';

const icons = {
  IconBug,
  IconBellRinging,
  IconPhoneCall,
  IconQuestionMark,
  IconShieldLock
};

const pages: NavItemType = {
  id: 'pages',
  title: 'pages',
  caption: 'pages-caption',
  icon: icons.IconBellRinging,
  type: 'group',
  children: [
    {
      id: 'maintenance',
      title: 'maintenance',
      type: 'collapse',
      icon: icons.IconBug,
      children: [
        {
          id: 'error',
          title: 'error-404',
          type: 'item',
          url: '/pages/error',
          target: true
        },
        {
          id: '500',
          title: 'error-500',
          type: 'item',
          url: '/pages/500',
          target: true
        },
        {
          id: 'under-construction',
          title: 'under-construction',
          type: 'item',
          url: '/pages/under-construction',
          target: true
        }
      ]
    },
    {
      id: 'landing',
      title: 'landing',
      type: 'item',
      icon: icons.IconBellRinging,
      url: '/pages/landing',
      target: true
    },
    {
      id: 'contact-us',
      title: 'contact-us',
      type: 'item',
      icon: icons.IconPhoneCall,
      url: '/pages/contact-us',
      target: true
    },
    {
      id: 'faqs',
      title: 'faqs',
      type: 'item',
      icon: icons.IconQuestionMark,
      url: '/pages/faqs',
      target: true
    },
    {
      id: 'privacy-policy',
      title: 'privacy-policy',
      type: 'item',
      icon: icons.IconShieldLock,
      url: '/pages/privacy-policy',
      target: true
    }
  ]
};

export default pages;
