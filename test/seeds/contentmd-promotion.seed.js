import { v4 as uuidv4 } from 'uuid';
// *****************************************************************
// Seed the domains needed for the contentmd promotion testing
// *****************************************************************
export const domains = [
  {   
    name: 'default',
    base_url: '/default/blogurl',
    acct_id: 100
  },
  {   
    name: 'Dev',
    base_url: '/domain2/blogurl',
    acct_id: 100
  },
  {   
    name: 'Test',
    base_url: '/emptydomain/blogurl',
    acct_id: 100
  },
  {   
    name: 'Staging',
    base_url: '/emptydomain/blogurl',
    acct_id: 100
  },
  {   
    name: 'Prod',
    base_url: '/emptydomain/blogurl',
    acct_id: 100
  }  
];
// *****************************************************************
// Seed the contentmds 
// Note: contentmd
// *****************************************************************
// Create Images String Array
let imagesArrayString = JSON.stringify([
  {"src": "/blog/imag01", "alt": "image 01"},
  {"src": "/blog/imag02", "alt": "image 02"}
])

export const contentmds = [
  {   
    "acct_id": 100,
    "domain_name": "Dev",
    "domain_id": 2,
    "creator_id": uuidv4(),
    "content_id": "100/Dev/content-title-no1",
    "title": "content title no1",
    "base_url": "/blog/override",
    "slug": "content-title-no1",
    "excerpt": "this topic is is a must read",
    "images": imagesArrayString,
    "content_type": "post",
    "file_type": "md",
    "word_cnt":  382,
    "lang": "en"
  },
  // {   
  //   "acct_id": 100,
  //   "domain_name": "Test",
  //   "domain_id": 3,
  //   "creator_id": uuidv4(),
  //   "content_id": "100/Test",
  //   "title": "content title no2",
  //   "base_url": "/blog/override",
  //   "slug": "/content-title-no2",
  //   "excerpt": "this topic is is a must read",
  //   "images": imagesArrayString,
  //   "content_type": "post",
  //   "file_type": "md",
  //   "word_cnt":  530,
  //   "lang": "en"
  // },
  // {   
  //   "acct_id": 100,
  //   "domain_name": "Staging",
  //   "domain_id": 4,
  //   "creator_id": uuidv4(),
  //   "content_id": "100/Test",
  //   "title": "content title no3",
  //   "base_url": "/blog/override",
  //   "slug": "/content-title-no3",
  //   "excerpt": "this topic is is a must read",
  //   "images": imagesArrayString,
  //   "content_type": "post",
  //   "file_type": "md",
  //   "word_cnt":  680,
  //   "lang": "en"
  // },
  // {   
  //   "acct_id": 100,
  //   "domain_name": "Prod",
  //   "domain_id": 5,
  //   "creator_id": uuidv4(),
  //   "content_id": "100/Prod",
  //   "title": "content title no4",
  //   "base_url": "/blog/override",
  //   "slug": "/content-title-no4",
  //   "excerpt": "this topic is is a must read",
  //   "images": imagesArrayString,
  //   "content_type": "post",
  //   "file_type": "md",
  //   "word_cnt":  476,
  //   "lang": "en"
  // }
]