import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create UK media outlets
  const outlets = await Promise.all([
    prisma.mediaOutlet.upsert({
      where: { id: 'bbc-tv' },
      update: {},
      create: {
        id: 'bbc-tv',
        name: 'BBC Television',
        type: 'tv',
        complaintEmail: 'complaints@bbc.co.uk',
        complaintUrl: 'https://www.bbc.co.uk/contact/complaints',
        notes: 'BBC complaints process - response within 10 working days'
      }
    }),
    prisma.mediaOutlet.upsert({
      where: { id: 'bbc-radio' },
      update: {},
      create: {
        id: 'bbc-radio',
        name: 'BBC Radio',
        type: 'radio',
        complaintEmail: 'complaints@bbc.co.uk',
        complaintUrl: 'https://www.bbc.co.uk/contact/complaints',
        notes: 'BBC complaints process - response within 10 working days'
      }
    }),
    prisma.mediaOutlet.upsert({
      where: { id: 'itv' },
      update: {},
      create: {
        id: 'itv',
        name: 'ITV',
        type: 'tv',
        complaintEmail: 'viewerservices@itv.com',
        complaintUrl: 'https://www.itv.com/contact',
        notes: 'ITV viewer services'
      }
    }),
    prisma.mediaOutlet.upsert({
      where: { id: 'channel4' },
      update: {},
      create: {
        id: 'channel4',
        name: 'Channel 4',
        type: 'tv',
        complaintEmail: 'viewerenquiries@channel4.co.uk',
        complaintUrl: 'https://www.channel4.com/4viewers/contact-us',
        notes: 'Channel 4 viewer enquiries'
      }
    }),
    prisma.mediaOutlet.upsert({
      where: { id: 'sky-news' },
      update: {},
      create: {
        id: 'sky-news',
        name: 'Sky News',
        type: 'tv',
        complaintEmail: 'news@sky.com',
        complaintUrl: 'https://www.sky.com/help/articles/sky-news-complaints',
        notes: 'Sky News editorial complaints'
      }
    }),
    prisma.mediaOutlet.upsert({
      where: { id: 'guardian' },
      update: {},
      create: {
        id: 'guardian',
        name: 'The Guardian',
        type: 'print',
        complaintEmail: 'corrections@theguardian.com',
        complaintUrl: 'https://www.theguardian.com/info/2014/sep/12/corrections-and-clarifications',
        notes: 'Guardian corrections and clarifications'
      }
    }),
    prisma.mediaOutlet.upsert({
      where: { id: 'telegraph' },
      update: {},
      create: {
        id: 'telegraph',
        name: 'The Telegraph',
        type: 'print',
        complaintEmail: 'letters@telegraph.co.uk',
        complaintUrl: 'https://www.telegraph.co.uk/contact-us/editorial/',
        notes: 'Telegraph editorial contact'
      }
    }),
    prisma.mediaOutlet.upsert({
      where: { id: 'times' },
      update: {},
      create: {
        id: 'times',
        name: 'The Times',
        type: 'print',
        complaintEmail: 'feedback@thetimes.co.uk',
        complaintUrl: 'https://www.thetimes.co.uk/static/contact-us/',
        notes: 'Times editorial feedback'
      }
    }),
    prisma.mediaOutlet.upsert({
      where: { id: 'ft' },
      update: {},
      create: {
        id: 'ft',
        name: 'Financial Times',
        type: 'print',
        complaintEmail: 'letters.editor@ft.com',
        complaintUrl: 'https://help.ft.com/help/contact-us/',
        notes: 'FT letters to the editor'
      }
    }),
    prisma.mediaOutlet.upsert({
      where: { id: 'lbc' },
      update: {},
      create: {
        id: 'lbc',
        name: 'LBC Radio',
        type: 'radio',
        complaintEmail: 'feedback@lbc.co.uk',
        complaintUrl: 'https://www.lbc.co.uk/contact/',
        notes: 'LBC listener feedback'
      }
    })
  ]);

  console.log(`Created ${outlets.length} media outlets`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
